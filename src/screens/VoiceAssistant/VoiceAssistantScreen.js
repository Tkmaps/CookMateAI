import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Center,
  Icon,
  HStack,
  Pressable,
  Circle,
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectItem,
  ChevronDownIcon
} from "@gluestack-ui/themed";
import { LinearGradient } from "../../components/ui/linear-gradient";
import { 
  MicIcon, 
  PauseIcon,
  StopCircleIcon,
  AlarmClockIcon,
  HelpCircleIcon
} from "@gluestack-ui/themed";
import Voice from '@react-native-community/voice';
import Tts from 'react-native-tts';

const exampleCommands = [
  { icon: AlarmClockIcon, text: "Set timer for 30 minutes" },
  { icon: HelpCircleIcon, text: "What's the next step?" },
  { icon: HelpCircleIcon, text: "How do I chop an onion?" },
  { icon: HelpCircleIcon, text: "Convert 3 cups to milliliters" },
];

export default function VoiceAssistantScreen({ navigation }) {
  const [isListening, setIsListening] = useState(true);
  const [pulseAnimation, setPulseAnimation] = useState(true);
  const [recognizedText, setRecognizedText] = useState('');
  const [error, setError] = useState('');
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  useEffect(() => {
    Tts.getVoices().then(availableVoices => {
      const filteredVoices = availableVoices.filter(v => !v.notInstalled && v.quality === 'improved' || v.quality === 'default');
      setVoices(filteredVoices);
      if (filteredVoices.length > 0) {
        setSelectedVoice(filteredVoices[0].id);
      }
    });

    Voice.onSpeechResults = (e) => {
      if (e.value && e.value.length > 0) {
        setRecognizedText(e.value[0]);
      }
    };
    Voice.onSpeechError = (e) => {
      setError(e.error ? JSON.stringify(e.error) : 'An error occurred');
    };

    if (isListening) {
      Voice.start('en-US'); // Or the appropriate locale
    } else {
      Voice.stop();
    }

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [isListening]);

  useEffect(() => {
    if (recognizedText) {
      speakText(`You said: ${recognizedText}`);
    }
  }, [recognizedText]);

  const speakText = (text) => {
    if (selectedVoice) {
      Tts.setDefaultVoice(selectedVoice);
    }
    Tts.speak(text);
  };

  return (
    <Box flex={1} bg="$background50">
      <LinearGradient
        h={150}
        colors={["#14b8a6", "#0f766e"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Box p="$4" justifyContent="flex-end" h="100%">
          <Heading color="$white" size="xl">
            Voice Assistant
          </Heading>
          <Text color="$white" opacity={0.8}>
            Ask me anything about cooking
          </Text>
        </Box>
      </LinearGradient>

      <Center flex={1} px="$4">
        <Box mb="$10">
          {/* Audio Visualization */}
          <Center>
            <Box 
              position="relative"
              h={200} 
              w={200} 
              alignItems="center" 
              justifyContent="center"
            >
              {/* Pulsing rings */}
              {isListening && pulseAnimation && (
                <>
                  <Circle 
                    position="absolute" 
                    bg="$primary50" 
                    size={200} 
                    opacity={0.3}
                    style={{ transform: [{ scale: 1 }] }}
                  />
                  <Circle 
                    position="absolute" 
                    bg="$primary100" 
                    size={150} 
                    opacity={0.5}
                    style={{ transform: [{ scale: 1 }] }}
                  />
                  <Circle 
                    position="absolute" 
                    bg="$primary200" 
                    size={100} 
                    opacity={0.7}
                    style={{ transform: [{ scale: 1 }] }}
                  />
                </>
              )}
              
              {/* Mic button */}
              <Pressable onPress={toggleListening}>
                <Circle 
                  bg={isListening ? "$primary500" : "$gray400"} 
                  size={80}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon 
                    as={isListening ? MicIcon : PauseIcon} 
                    color="$white" 
                    size="xl" 
                  />
                </Circle>
              </Pressable>
            </Box>
          </Center>

          {/* Status Text */}
          <Center mt="$4">
            <Heading size="lg" color={isListening ? "$primary500" : "$gray700"}>
              {isListening ? "Listening..." : "Paused"}
            </Heading>
            <Text color="$gray600" mt="$2" textAlign="center">
              {isListening 
                ? "Speak now. I'm ready to help with your cooking questions." 
                : "Tap the mic to start listening again."}
            </Text>
            {recognizedText ? (
              <Text color="$blue500" mt="$2" textAlign="center">
                Recognized: {recognizedText}
              </Text>
            ) : null}
            {error ? (
              <Text color="$red500" mt="$2" textAlign="center">
                Error: {error}
              </Text>
            ) : null}
          </Center>
        </Box>

        {/* Voice Selection */}
        {voices.length > 0 && (
          <Box width="100%" mb="$5">
            <Text color="$gray700" mb="$2">Select Voice:</Text>
            <Select 
              selectedValue={selectedVoice}
              onValueChange={(itemValue) => {
                setSelectedVoice(itemValue);
                Tts.requestInstallData(); // Prompt to install voice data if needed
              }}
            >
              <SelectTrigger variant="outline" size="md" >
                <SelectInput placeholder="Choose Voice" />
                <SelectIcon mr="$3">
                  <Icon as={ChevronDownIcon} />
                </SelectIcon>
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  {voices.map(voice => (
                    <SelectItem key={voice.id} label={`${voice.name} (${voice.language})`} value={voice.id} />
                  ))}
                </SelectContent>
              </SelectPortal>
            </Select>
          </Box>
        )}

        {/* Example Commands */}
        <Box width="100%">
          <Heading size="sm" color="$gray700" mb="$4">Try saying:</Heading>
          <VStack space="md">
            {exampleCommands.map((command, index) => (
              <HStack 
                key={index} 
                bg="$white" 
                p="$3" 
                borderRadius="$lg" 
                alignItems="center"
                space="md"
                shadowColor="$gray400"
                shadowOpacity={0.2}
                shadowRadius={3}
                elevation={2}
              >
                <Box p="$2" borderRadius="$md" bg="$primary100">
                  <Icon as={command.icon} color="$primary500" size="sm" />
                </Box>
                <Text fontWeight="$medium">{command.text}</Text>
              </HStack>
            ))}
          </VStack>
        </Box>
      </Center>

      {/* Stop Button */}
      {isListening && (
        <Box position="absolute" bottom={20} alignSelf="center">
          <Pressable onPress={() => setIsListening(false)}>
            <HStack 
              bg="$red500" 
              px="$4" 
              py="$2" 
              borderRadius="$full" 
              alignItems="center"
              space="xs"
            >
              <Icon as={StopCircleIcon} color="$white" size="sm" />
              <Text color="$white" fontWeight="$medium">Stop Listening</Text>
            </HStack>
          </Pressable>
        </Box>
      )}
    </Box>
  );
} 