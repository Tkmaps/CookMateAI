import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Input,
  InputField,
  InputSlot,
  InputIcon,
  Icon,
  Pressable,
  ScrollView,
  Badge,
  BadgeText,
  CloseIcon,
  MicIcon,
  AddIcon,
  Button,
  ButtonText,
  Spinner,
  AlertCircleIcon,
} from '@gluestack-ui/themed';
import { Modal } from 'react-native';
import { chatWithGemini, formatChatHistory } from '../../services/GeminiService';
import Voice from '@react-native-community/voice';
import Tts from 'react-native-tts';

const suggestedPrompts = [
  { id: 1, name: 'Meal plan for the week', color: 'blue' },
  { id: 2, name: 'Recipe substitution tips', color: 'purple' },
  { id: 3, name: 'Kitchen basics guide', color: 'green' },
  { id: 4, name: 'Quick healthy meals', color: 'lightgreen' },
  { id: 5, name: 'Ingredient substitutions', color: 'orange' },
  { id: 6, name: 'Cooking time suggestions', color: 'lightblue' },
];

const ChatAssistant = ({ isVisible, onClose, userName = "John Jonson" }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      message: `Hi ${userName}, I'm your CookMate AI assistant. I can help with recipes, cooking techniques, meal planning, and more. What can I help you with today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState('');
  const [recordingError, setRecordingError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!isVisible) {
      // Keep messages, but reset other states
      setInput('');
      setError('');
      setIsLoading(false);
    }
  }, [isVisible]);

  useEffect(() => {
    // Voice listeners
    Voice.onSpeechResults = (e) => {
      if (e.value && e.value.length > 0) {
        setRecordedText(e.value[0]);
        setInput(e.value[0]); // Also set the main input state
        setIsRecording(false); // Stop recording automatically after result
      }
    };
    Voice.onSpeechError = (e) => {
      setRecordingError(e.error ? JSON.stringify(e.error) : 'An error occurred during recording.');
      setIsRecording(false); // Stop recording on error
    };
    Voice.onSpeechEnd = (e) => {
      setIsRecording(false); // Ensure recording state is false when speech ends
    };

    // Tts listeners
    Tts.addEventListener('tts-start', (event) => setIsSpeaking(true));
    Tts.addEventListener('tts-finish', (event) => setIsSpeaking(false));
    Tts.addEventListener('tts-cancel', (event) => setIsSpeaking(false));
    Tts.addEventListener('tts-error', (event) => {
      console.error('TTS Error:', event);
      setIsSpeaking(false);
      // Optionally display a TTS error to the user
    });

    // Clean up listeners on component unmount
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      Tts.removeEventListener('tts-start');
      Tts.removeEventListener('tts-finish');
      Tts.removeEventListener('tts-cancel');
      Tts.removeEventListener('tts-error');
    };
  }, []); // Empty dependency array to run effect only once on mount

  const speakText = (text) => {
    Tts.speak(text);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Add user message to UI
    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      message: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    setError('');
    
    try {
      // Format chat history for the AI
      const formattedHistory = formatChatHistory(messages);
      
      // Send to Gemini API
      const result = await chatWithGemini(currentInput, formattedHistory);
      
      // Add AI response to messages
      const assistantMessage = {
        id: messages.length + 2,
        sender: 'assistant',
        message: result.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      speakText(result.text); // Speak the assistant's response
      
      // Update chat history for context
      setChatHistory(result.history);
    } catch (err) {
      console.error('Error sending message to Gemini:', err);
      setError('Sorry, I had trouble processing your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedPrompt = (prompt) => {
    setInput(prompt);
  };

  const getBadgeColor = (color) => {
    const colorMap = {
      blue: { bg: '$blue100', text: '$blue600' },
      purple: { bg: '$purple100', text: '$purple600' },
      green: { bg: '$green100', text: '$green600' },
      lightgreen: { bg: '$lime100', text: '$lime600' },
      orange: { bg: '$orange100', text: '$orange600' },
      lightblue: { bg: '$sky100', text: '$sky600' },
    };
    return colorMap[color] || { bg: '$gray100', text: '$gray600' };
  };

  const toggleRecording = async () => {
    try {
      if (isRecording) {
        // Stop recording
        await Voice.stop();
        setIsRecording(false);
      } else {
        // Start recording
        setRecordedText(''); // Clear previous recorded text
        setRecordingError(''); // Clear previous error
        await Voice.start('en-US'); // Or the appropriate locale
        setIsRecording(true);
      }
    } catch (err) {
      console.error('Error toggling recording:', err);
      setRecordingError('Sorry, I had trouble with the microphone. Please try again.');
      setIsRecording(false); // Ensure recording state is false on error
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <Box flex={1} bg="$white">
        {/* Header */}
        <Box 
          py="$4" 
          px="$5" 
          bg="$backgroundLight50" 
          borderBottomWidth={1} 
          borderBottomColor="$gray200"
        >
          <HStack justifyContent="space-between" alignItems="center">
            <Pressable onPress={onClose} p="$2">
              <Icon as={CloseIcon} size="md" color="$gray600" />
            </Pressable>
            <Box>
              <Heading size="md" textAlign="center">CookMate AI</Heading>
            </Box>
            <Box w={30} /> {/* Empty box for layout balance */}
          </HStack>
        </Box>

        {/* User info */}
        <Box px="$5" py="$4" bg="$backgroundLight50">
          <Heading size="md">Hello</Heading>
          <Heading size="lg" color="$gray800">{userName}</Heading>
          
          <HStack space="md" mt="$4">
            <Pressable 
              bg="$blue100" 
              px="$3" 
              py="$2"
              borderRadius="$lg" 
              flex={1} 
              alignItems="center"
            >
              <Text color="$blue600" fontWeight="$medium">Saved Recipes</Text>
            </Pressable>
            <Pressable 
              bg="$purple100" 
              px="$3" 
              py="$2"
              borderRadius="$lg" 
              flex={1} 
              alignItems="center"
            >
              <Text color="$purple600" fontWeight="$medium">Meal Plans</Text>
            </Pressable>
          </HStack>
        </Box>

        {/* Chat messages */}
        <ScrollView 
          flex={1} 
          px="$4" 
          bg="$backgroundLight50"
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 16,
          }}
        >
          {messages.map((message) => (
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
            </Box>
          ))}
          
          {isLoading && (
            <Box alignSelf="flex-start" maxWidth="80%" mb="$4">
              <Box bg="$blue100" borderRadius="$xl" px="$4" py="$3">
                <HStack alignItems="center" space="sm">
                  <Spinner size="small" color="$blue600" />
                  <Text color="$blue700">Thinking...</Text>
                </HStack>
              </Box>
            </Box>
          )}
          
          {error ? (
            <Box bg="$red100" p="$3" borderRadius="$lg" mb="$3" alignSelf="center">
              <HStack space="sm" alignItems="center">
                <Icon as={AlertCircleIcon} color="$red500" />
                <Text color="$red700">{error}</Text>
              </HStack>
            </Box>
          ) : null}
        </ScrollView>

        {/* Suggested prompts */}
        <Box p="$4" borderTopWidth={1} borderTopColor="$gray100">
          <Text fontSize="$xs" color="$gray500" mb="$2">
            Try these suggestions
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingRight: 20,
            }}
          >
            <HStack space="sm">
              {suggestedPrompts.map((prompt) => {
                const colors = getBadgeColor(prompt.color);
                return (
                  <Pressable 
                    key={prompt.id} 
                    onPress={() => handleSuggestedPrompt(prompt.name)}
                  >
                    <Badge 
                      bg={colors.bg} 
                      borderRadius="$md"
                      px="$3" 
                      py="$1"
                    >
                      <BadgeText color={colors.text}>{prompt.name}</BadgeText>
                    </Badge>
                  </Pressable>
                );
              })}
            </HStack>
          </ScrollView>
        </Box>

        {/* Input field */}
        <Box p="$3" borderTopWidth={1} borderTopColor="$gray200">
          <HStack space="sm" alignItems="center">
            <Input
              flex={1}
              size="md"
              borderRadius="$full"
              borderColor="$gray300"
              bg="$backgroundLight50"
              isDisabled={isLoading}
            >
              <InputField
                placeholder="Ask me anything..."
                value={input}
                onChangeText={setInput}
                onSubmitEditing={handleSend}
              />
            </Input>
            <Pressable
              p="$2.5"
              borderRadius="$full"
              bg={input.trim() || isRecording ? "$primary500" : "$gray300"}
              onPress={input.trim() ? handleSend : toggleRecording}
              disabled={isLoading}
              opacity={isLoading ? 0.5 : 1}
            >
              <Icon 
                as={input.trim() || isRecording ? AddIcon : MicIcon} 
                size="md" 
                color="$white" 
              />
            </Pressable>
          </HStack>
        </Box>
      </Box>
    </Modal>
  );
};

export default ChatAssistant; 