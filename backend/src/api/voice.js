const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const voiceService = require('../services/voiceService');
const { AppError, catchAsync } = require('../middleware/errorHandler');
const { protect } = require('../middleware/auth');
const { voiceRateLimiter } = require('../middleware/rateLimiter');
const { voiceLogger } = require('../middleware/logger');

const router = express.Router();

// Configure multer for audio file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/') || 
        file.mimetype === 'application/octet-stream') {
      cb(null, true);
    } else {
      cb(new AppError('Only audio files are allowed', 400), false);
    }
  }
});

// Apply middleware
router.use(protect);
router.use(voiceRateLimiter);

// Validation rules
const transcribeValidation = [
  body('sessionId').optional().isUUID().withMessage('Session ID must be a valid UUID'),
  body('language').optional().isIn(['en-US', 'en-GB', 'es-ES', 'fr-FR']).withMessage('Unsupported language'),
  body('enableWordTimestamps').optional().isBoolean().withMessage('enableWordTimestamps must be boolean')
];

const synthesizeValidation = [
  body('text').notEmpty().withMessage('Text is required'),
  body('voice').optional().isIn(['default', 'male', 'female', 'friendly']).withMessage('Invalid voice option'),
  body('speed').optional().isIn(['slow', 'normal', 'fast']).withMessage('Invalid speed option'),
  body('format').optional().isIn(['mp3', 'wav', 'ogg']).withMessage('Invalid audio format')
];

// Check validation results
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Transcribe audio to text
router.post('/transcribe', upload.single('audio'), transcribeValidation, checkValidation, catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No audio file provided', 400));
  }

  const startTime = Date.now();
  const { sessionId, language = 'en-US', enableWordTimestamps = false } = req.body;

  try {
    // Validate audio format
    voiceService.validateAudioFormat(req.file.buffer);

    // Transcribe audio
    const result = await voiceService.transcribeAudio(req.file.buffer, {
      languageCode: language,
      enableWordTimeOffsets: enableWordTimestamps
    });

    const duration = Date.now() - startTime;

    // Log the interaction
    voiceLogger({
      sessionId,
      userId: req.user.id,
      type: 'transcription',
      duration,
      success: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        transcript: result.transcript,
        confidence: result.confidence,
        words: enableWordTimestamps ? result.words : undefined,
        provider: result.provider,
        processingTime: duration
      }
    });
  } catch (error) {
    voiceLogger({
      sessionId,
      userId: req.user.id,
      type: 'transcription',
      duration: Date.now() - startTime,
      success: false
    });
    throw error;
  }
}));

// Process voice command (transcribe + analyze)
router.post('/process', upload.single('audio'), transcribeValidation, checkValidation, catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No audio file provided', 400));
  }

  const startTime = Date.now();
  const { sessionId } = req.body;

  try {
    // Process voice command
    const result = await voiceService.processVoiceCommand(req.file.buffer, {
      sessionId,
      userId: req.user.id
    });

    const duration = Date.now() - startTime;

    // Log the interaction
    voiceLogger({
      sessionId,
      userId: req.user.id,
      type: 'voice_command',
      duration,
      success: result.success
    });

    if (!result.success) {
      return res.status(400).json({
        status: 'fail',
        message: result.error,
        data: {
          transcript: result.transcript
        }
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        transcript: result.transcript,
        confidence: result.confidence,
        command: result.command,
        provider: result.provider,
        processingTime: duration
      }
    });
  } catch (error) {
    voiceLogger({
      sessionId,
      userId: req.user.id,
      type: 'voice_command',
      duration: Date.now() - startTime,
      success: false
    });
    throw error;
  }
}));

// Synthesize text to speech
router.post('/synthesize', synthesizeValidation, checkValidation, catchAsync(async (req, res, next) => {
  const { text, voice = 'default', speed = 'normal', format = 'mp3' } = req.body;
  const startTime = Date.now();

  try {
    const result = await voiceService.synthesizeSpeech(text, {
      voice,
      speed,
      format
    });

    const duration = Date.now() - startTime;

    // Log the interaction
    voiceLogger({
      userId: req.user.id,
      type: 'synthesis',
      duration,
      success: true
    });

    if (result.audioUrl) {
      // PlayHT returns URL
      res.status(200).json({
        status: 'success',
        data: {
          audioUrl: result.audioUrl,
          duration: result.duration,
          provider: result.provider,
          processingTime: duration
        }
      });
    } else if (result.audioBuffer) {
      // Direct audio buffer
      res.set({
        'Content-Type': `audio/${format}`,
        'Content-Length': result.audioBuffer.length,
        'Cache-Control': 'public, max-age=3600'
      });
      res.send(result.audioBuffer);
    } else {
      throw new AppError('No audio output generated', 500);
    }
  } catch (error) {
    voiceLogger({
      userId: req.user.id,
      type: 'synthesis',
      duration: Date.now() - startTime,
      success: false
    });
    throw error;
  }
}));

// Get available voices
router.get('/voices', catchAsync(async (req, res, next) => {
  const voices = voiceService.getAvailableVoices();

  res.status(200).json({
    status: 'success',
    data: {
      voices
    }
  });
}));

// Stream audio transcription (WebSocket endpoint would be better)
router.post('/stream/start', catchAsync(async (req, res, next) => {
  const { sessionId, language = 'en-US' } = req.body;

  try {
    // This would typically be handled via WebSocket
    // For now, return configuration for client-side streaming
    res.status(200).json({
      status: 'success',
      message: 'Streaming configuration',
      data: {
        sessionId,
        language,
        sampleRate: 48000,
        encoding: 'WEBM_OPUS',
        interimResults: true
      }
    });
  } catch (error) {
    throw error;
  }
}));

// Health check for voice services
router.get('/health', catchAsync(async (req, res, next) => {
  const health = {
    speechToText: {
      google: !!voiceService.sttClient,
      vosk: false // Would check Vosk availability
    },
    textToSpeech: {
      playht: !!process.env.PLAYHT_API_KEY,
      mozilla: false // Would check Mozilla TTS availability
    }
  };

  const isHealthy = Object.values(health.speechToText).some(Boolean) && 
                   Object.values(health.textToSpeech).some(Boolean);

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    data: health
  });
}));

module.exports = router;