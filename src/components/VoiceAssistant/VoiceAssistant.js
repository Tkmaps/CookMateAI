import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Text,
  Heading,
  Icon,
  HStack,
  VStack,
  Image,
  Pressable,
  Button,
  ButtonText,
  ScrollView,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  CloseIcon,
  Spinner,
  Input,
  InputField,
  InputSlot,
  InputIcon,
  AlertCircleIcon,
} from '@gluestack-ui/themed';
import { MicIcon, SendIcon, StopIcon, SpeakerIcon, SpeakerOffIcon } from '@gluestack-ui/themed';
import Voice from '@react-native-voice/voice';
import * as Speech from 'expo-speech';
import { chatWithGemini, createCookingAssistantPrompt } from '../../services/GeminiService';
import { Platform } from 'react-native';

export default function VoiceAssistant({ isVisible, onClose }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(true);
  const [isSpeechPlaying, setIsSpeechPlaying] = useState(false);
  
  const scrollViewRef = useRef();

  // Initialize voice recognition
  useEffect(() => {
    // Voice recognition event handlers
    Voice.onSpeechStart = () => setIsListening(true);
    Voice.onSpeechEnd = () => setIsListening(false);
    Voice.onSpeechResults = (e) => {
      if (e.value && e.value.length > 0) {
        setTranscript(e.value[0]);
      }
    };
    Voice.onSpeechError = (e) => {
      setError(e.error ? e.error.message : 'Error during speech recognition');
      setIsListening(false);
    };

    return () => {
      // Clean up
      stopListening();
      stopSpeaking();
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  // Process the recorded transcript when speech ends
  useEffect(() => {
    if (!isListening && transcript) {
      processQuery(transcript);
    }
  }, [isListening, transcript]);

  // Auto-scroll to the bottom of the conversation
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatHistory]);

  // Clear the state when modal closes
  useEffect(() => {
    if (!isVisible) {
      resetAssistant();
    } else {
      // Check if speech synthesis is available
      checkSpeechAvailability();
    }
  }, [isVisible]);

  const checkSpeechAvailability = async () => {
    try {
      const available = await Speech.isSpeakingAsync();
      console.log('Speech synthesis available:', available);
    } catch (e) {
      console.error('Error checking speech availability:', e);
    }
  };

  const resetAssistant = () => {
    setTranscript('');
    setResponse('');
    setError('');
    setIsProcessing(false);
    setIsListening(false);
    setInputText('');
    stopSpeaking();
  };

  const startListening = async () => {
    setError('');
    setTranscript('');
    try {
      stopSpeaking();
      await Voice.start('en-US');
    } catch (e) {
      setError(`Error starting voice recognition: ${e.message}`);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      console.error('Error stopping voice recognition:', e);
    }
  };

  const processQuery = async (query) => {
    if (!query.trim()) return;

    // Add the user's query to chat history
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      message: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatHistory(prev => [...prev, userMessage]);

    // Clear for next input
    setTranscript('');
    setInputText('');
    
    // Process with AI
    setIsProcessing(true);
    try {
      const formattedHistory = chatHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.message }]
      }));

      const systemPrompt = createCookingAssistantPrompt();
      const result = await chatWithGemini(query, formattedHistory);
      
      // Add AI response to chat history
      const assistantMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        message: result.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory(prev => [...prev, assistantMessage]);
      
      // Set the response for potential speech synthesis
      setResponse(result.text);
      
      // Automatically speak the response if enabled
      if (isSpeaking) {
        speakResponse(result.text);
      }
    } catch (e) {
      setError(`Error processing your request: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = (text) => {
    try {
      stopSpeaking();
      setIsSpeechPlaying(true);
      
      Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
        onStart: () => setIsSpeechPlaying(true),
        onDone: () => setIsSpeechPlaying(false),
        onStopped: () => setIsSpeechPlaying(false),
        onError: (error) => {
          console.error('Speech synthesis error:', error);
          setIsSpeechPlaying(false);
        }
      });
    } catch (e) {
      console.error('Error during speech synthesis:', e);
      setIsSpeechPlaying(false);
    }
  };

  const stopSpeaking = () => {
    if (isSpeechPlaying) {
      Speech.stop();
      setIsSpeechPlaying(false);
    }
  };

  const toggleSpeaking = () => {
    if (isSpeechPlaying) {
      stopSpeaking();
    }
    setIsSpeaking(!isSpeaking);
  };

  const handleSendTextInput = () => {
    if (inputText.trim()) {
      processQuery(inputText);
    }
  };

  return (
    <Modal isOpen={isVisible} onClose={onClose} size="full">
      <ModalBackdrop />
      <ModalContent bg="$backgroundLight50">
        <ModalHeader borderBottomWidth={1} borderBottomColor="$gray200">
          <HStack alignItems="center" justifyContent="space-between" width="100%">
            <Heading size="lg">Voice Assistant</Heading>
            <ModalCloseButton>
              <Icon as={CloseIcon} size="lg" color="$gray600" />
            </ModalCloseButton>
          </HStack>
        </ModalHeader>

        <ModalBody flex={1}>
          {/* Chat history */}
          <ScrollView flex={1} ref={scrollViewRef}>
            {chatHistory.length === 0 ? (
              <VStack space="md" alignItems="center" justifyContent="center" mt="$12">
                <Box 
                  h={150}
                  w={150}
                  borderRadius={75}
                  bg="$purple100"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={MicIcon} size="6xl" color="$purple600" />
                </Box>
                <Text fontSize="$lg" textAlign="center" color="$gray600" px="$8" mt="$4">
                  Ask me anything about cooking, recipes, or ingredients!
                </Text>
              </VStack>
            ) : (
              <VStack space="md" p="$3">
                {chatHistory.map((message) => (
                  <Box 
                    key={message.id} 
                    alignSelf={message.sender === 'user' ? 'flex-end' : 'flex-start'}
                    maxWidth="80%"
                    mb="$4"
                  >
                    <Box 
                      bg={message.sender === 'user' ? '$purple100' : '$blue100'} 
                      borderRadius="$xl"
                      px="$4" 
                      py="$3"
                    >
                      <Text 
                        color={message.sender === 'user' ? '$purple700' : '$blue700'}
                        fontWeight="$medium"
                      >
                        {message.message}
                      </Text>
                    </Box>
                    <Text fontSize="$xs" color="$gray500" mt="$1" ml={message.sender === 'user' ? 'auto' : '$2'}>
                      {message.timestamp}
                    </Text>
                    {message.sender === 'assistant' && isSpeaking && (
                      <Pressable 
                        onPress={() => speakResponse(message.message)}
                        ml="$2"
                        mt="$1"
                      >
                        <Text fontSize="$xs" color="$blue600">
                          Tap to hear again
                        </Text>
                      </Pressable>
                    )}
                  </Box>
                ))}
                
                {isProcessing && (
                  <Box alignSelf="flex-start" maxWidth="80%" mb="$4">
                    <Box bg="$blue100" borderRadius="$xl" px="$4" py="$3">
                      <HStack alignItems="center" space="sm">
                        <Spinner size="small" color="$blue600" />
                        <Text color="$blue700">Thinking...</Text>
                      </HStack>
                    </Box>
                  </Box>
                )}
                
                {isSpeechPlaying && (
                  <Box alignSelf="flex-start" maxWidth="80%" mb="$4">
                    <Box bg="$purple100" borderRadius="$xl" px="$4" py="$3">
                      <HStack alignItems="center" space="sm">
                        <Spinner size="small" color="$purple600" />
                        <Text color="$purple700">Speaking...</Text>
                      </HStack>
                    </Box>
                  </Box>
                )}
              </VStack>
            )}
          </ScrollView>

          {/* Error message if any */}
          {error ? (
            <Box bg="$red100" p="$3" borderRadius="$lg" mb="$3">
              <HStack space="sm" alignItems="center">
                <Icon as={AlertCircleIcon} color="$red500" />
                <Text color="$red700">{error}</Text>
              </HStack>
            </Box>
          ) : null}

          {/* Transcript display */}
          {transcript ? (
            <Box bg="$gray100" p="$3" borderRadius="$lg" mb="$3">
              <Text color="$gray700" fontStyle="italic">"{transcript}"</Text>
            </Box>
          ) : null}

          {/* Input area */}
          <HStack space="sm" p="$3" alignItems="center">
            <Pressable
              p="$3.5"
              borderRadius="$full"
              bg={isListening ? "$red500" : "$primary500"}
              onPress={isListening ? stopListening : startListening}
            >
              <Icon as={isListening ? StopIcon : MicIcon} size="md" color="$white" />
            </Pressable>
            
            <Input
              flex={1}
              borderRadius="$full"
              bg="$backgroundLight50"
              borderColor="$gray300"
              isDisabled={isListening || isProcessing}
            >
              <InputField
                placeholder="Type your question..."
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSendTextInput}
              />
              {inputText ? (
                <InputSlot pr="$3">
                  <Pressable onPress={handleSendTextInput}>
                    <InputIcon as={SendIcon} color="$primary500" />
                  </Pressable>
                </InputSlot>
              ) : null}
            </Input>
            
            <Pressable
              p="$3.5"
              borderRadius="$full"
              bg={isSpeechPlaying ? "$red500" : "$gray200"}
              onPress={isSpeechPlaying ? stopSpeaking : toggleSpeaking}
            >
              <Icon 
                as={isSpeechPlaying ? StopIcon : (isSpeaking ? SpeakerIcon : SpeakerOffIcon)} 
                size="md" 
                color={isSpeaking ? "$primary500" : "$gray600"} 
              />
            </Pressable>
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 