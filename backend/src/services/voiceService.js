const speech = require('@google-cloud/speech');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { aiConfig } = require('../config');
const { AppError } = require('../middleware/errorHandler');

class VoiceService {
  constructor() {
    this.sttClient = null;
    this.initializeSTT();
  }

  initializeSTT() {
    if (aiConfig.speechToText.provider === 'google' && aiConfig.speechToText.googleCredentials) {
      try {
        this.sttClient = new speech.SpeechClient({
          keyFilename: aiConfig.speechToText.googleCredentials
        });
      } catch (error) {
        console.warn('Failed to initialize Google Speech-to-Text:', error.message);
      }
    }
  }

  // Speech-to-Text functionality
  async transcribeAudio(audioBuffer, options = {}) {
    const {
      encoding = 'WEBM_OPUS',
      sampleRateHertz = 48000,
      languageCode = 'en-US',
      enableAutomaticPunctuation = true,
      enableWordTimeOffsets = false
    } = options;

    try {
      if (this.sttClient) {
        return await this.transcribeWithGoogle(audioBuffer, {
          encoding,
          sampleRateHertz,
          languageCode,
          enableAutomaticPunctuation,
          enableWordTimeOffsets
        });
      } else {
        // Fallback to Vosk or other offline solution
        return await this.transcribeWithVosk(audioBuffer);
      }
    } catch (error) {
      throw new AppError(`Speech transcription failed: ${error.message}`, 500);
    }
  }

  async transcribeWithGoogle(audioBuffer, config) {
    const request = {
      audio: {
        content: audioBuffer.toString('base64')
      },
      config: {
        encoding: config.encoding,
        sampleRateHertz: config.sampleRateHertz,
        languageCode: config.languageCode,
        enableAutomaticPunctuation: config.enableAutomaticPunctuation,
        enableWordTimeOffsets: config.enableWordTimeOffsets,
        model: 'latest_long',
        useEnhanced: true
      }
    };

    const [response] = await this.sttClient.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    return {
      transcript: transcription,
      confidence: response.results[0]?.alternatives[0]?.confidence || 0,
      words: response.results[0]?.alternatives[0]?.words || [],
      provider: 'google'
    };
  }

  async transcribeWithVosk(audioBuffer) {
    // Placeholder for Vosk implementation
    // This would require setting up Vosk server or using vosk-api
    throw new AppError('Vosk transcription not implemented yet', 501);
  }

  // Streaming Speech-to-Text
  createStreamingRecognition(options = {}) {
    if (!this.sttClient) {
      throw new AppError('Google Speech-to-Text not available', 503);
    }

    const {
      encoding = 'WEBM_OPUS',
      sampleRateHertz = 48000,
      languageCode = 'en-US',
      enableAutomaticPunctuation = true
    } = options;

    const request = {
      config: {
        encoding,
        sampleRateHertz,
        languageCode,
        enableAutomaticPunctuation,
        model: 'latest_short'
      },
      interimResults: true
    };

    return this.sttClient.streamingRecognize(request);
  }

  // Text-to-Speech functionality
  async synthesizeSpeech(text, options = {}) {
    const {
      voice = 'default',
      speed = 'normal',
      format = 'mp3'
    } = options;

    try {
      if (aiConfig.textToSpeech.provider === 'playht') {
        return await this.synthesizeWithPlayHT(text, { voice, speed, format });
      } else {
        // Fallback to Mozilla TTS or other solution
        return await this.synthesizeWithMozilla(text, { voice, speed, format });
      }
    } catch (error) {
      throw new AppError(`Speech synthesis failed: ${error.message}`, 500);
    }
  }

  async synthesizeWithPlayHT(text, options) {
    if (!aiConfig.textToSpeech.playhtApiKey) {
      throw new AppError('PlayHT API key not configured', 503);
    }

    const voiceMap = {
      'default': 'en-US-JennyNeural',
      'male': 'en-US-GuyNeural',
      'female': 'en-US-JennyNeural',
      'friendly': 'en-US-AriaNeural'
    };

    const speedMap = {
      'slow': '0.8',
      'normal': '1.0',
      'fast': '1.2'
    };

    try {
      const response = await axios.post('https://play.ht/api/v2/tts', {
        text,
        voice: voiceMap[options.voice] || voiceMap.default,
        speed: speedMap[options.speed] || speedMap.normal,
        output_format: options.format
      }, {
        headers: {
          'Authorization': `Bearer ${aiConfig.textToSpeech.playhtApiKey}`,
          'X-User-ID': aiConfig.textToSpeech.playhtUserId,
          'Content-Type': 'application/json'
        }
      });

      return {
        audioUrl: response.data.url,
        audioBuffer: null, // PlayHT returns URL, not buffer
        duration: response.data.duration,
        provider: 'playht'
      };
    } catch (error) {
      throw new AppError(`PlayHT synthesis failed: ${error.response?.data?.message || error.message}`, 500);
    }
  }

  async synthesizeWithMozilla(text, options) {
    // Placeholder for Mozilla TTS implementation
    // This would require setting up Mozilla TTS server
    throw new AppError('Mozilla TTS not implemented yet', 501);
  }

  // Voice processing utilities
  async processVoiceCommand(audioBuffer, sessionContext) {
    try {
      // Transcribe the audio
      const transcription = await this.transcribeAudio(audioBuffer);
      
      if (!transcription.transcript || transcription.transcript.trim().length === 0) {
        return {
          success: false,
          error: 'No speech detected',
          transcript: ''
        };
      }

      // Analyze the command
      const command = this.analyzeVoiceCommand(transcription.transcript);
      
      return {
        success: true,
        transcript: transcription.transcript,
        confidence: transcription.confidence,
        command,
        provider: transcription.provider
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        transcript: ''
      };
    }
  }

  analyzeVoiceCommand(transcript) {
    const text = transcript.toLowerCase().trim();
    
    // Command patterns
    const patterns = {
      next: /\b(next|continue|proceed|move on)\b/,
      previous: /\b(previous|back|go back|last step)\b/,
      repeat: /\b(repeat|say again|what was that)\b/,
      pause: /\b(pause|stop|wait)\b/,
      help: /\b(help|what do i do|how do i|explain)\b/,
      timer: /\b(timer|set timer|start timer|(\d+)\s*(minute|second))\b/,
      question: /\b(what|how|why|when|where|can i|should i)\b/,
      substitution: /\b(substitute|replace|instead of|alternative)\b/,
      done: /\b(done|finished|complete|ready)\b/
    };

    for (const [commandType, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        return {
          type: commandType,
          text: transcript,
          confidence: this.calculateCommandConfidence(text, pattern)
        };
      }
    }

    // Default to question if no specific command detected
    return {
      type: 'question',
      text: transcript,
      confidence: 0.5
    };
  }

  calculateCommandConfidence(text, pattern) {
    const matches = text.match(pattern);
    if (!matches) return 0;
    
    // Simple confidence based on match length vs text length
    const matchLength = matches[0].length;
    const textLength = text.length;
    return Math.min(1, matchLength / textLength + 0.3);
  }

  // Audio format validation
  validateAudioFormat(buffer) {
    if (!buffer || buffer.length === 0) {
      throw new AppError('Empty audio buffer', 400);
    }

    // Check for common audio file headers
    const header = buffer.slice(0, 12);
    const isWebM = header.includes(Buffer.from('webm'));
    const isOgg = header.slice(0, 4).equals(Buffer.from('OggS'));
    const isWav = header.slice(0, 4).equals(Buffer.from('RIFF'));
    const isMp3 = header.slice(0, 3).equals(Buffer.from('ID3')) || 
                  header.slice(0, 2).equals(Buffer.from([0xFF, 0xFB]));

    if (!isWebM && !isOgg && !isWav && !isMp3) {
      throw new AppError('Unsupported audio format', 400);
    }

    return true;
  }

  // Get available voices
  getAvailableVoices() {
    return {
      playht: [
        { id: 'default', name: 'Jenny (Default)', gender: 'female', language: 'en-US' },
        { id: 'male', name: 'Guy', gender: 'male', language: 'en-US' },
        { id: 'friendly', name: 'Aria (Friendly)', gender: 'female', language: 'en-US' }
      ],
      mozilla: [
        { id: 'default', name: 'Default Voice', gender: 'neutral', language: 'en-US' }
      ]
    };
  }
}

module.exports = new VoiceService();