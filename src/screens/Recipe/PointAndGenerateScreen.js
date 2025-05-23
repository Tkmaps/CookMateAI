import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Text,
  Heading,
  Icon,
  HStack,
  Image,
  Pressable,
  VStack,
  Spinner,
  Button,
  ButtonText,
  ScrollView,
  Badge,
  BadgeText,
} from '@gluestack-ui/themed';
import { ArrowLeftIcon, CameraIcon, CheckIcon, FlashIcon, RefreshIcon } from '@gluestack-ui/themed';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { StyleSheet, View, TouchableOpacity } from 'react-native';

export default function PointAndGenerateScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  const [detectedIngredients, setDetectedIngredients] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const cameraRef = useRef(null);
  
  // Mock detection interval for demonstration
  const [isDetecting, setIsDetecting] = useState(false);
  const detectionIntervalRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(
        cameraStatus === 'granted' && mediaStatus === 'granted'
      );
    })();

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  // Mock ingredient detection
  const startContinuousDetection = () => {
    setIsDetecting(true);
    
    // Example ingredients that might be detected (simulation)
    const possibleIngredients = [
      { id: 1, name: 'Tomato', confidence: 0.92 },
      { id: 2, name: 'Onion', confidence: 0.89 },
      { id: 3, name: 'Garlic', confidence: 0.78 },
      { id: 4, name: 'Bell Pepper', confidence: 0.85 },
      { id: 5, name: 'Chicken', confidence: 0.91 },
      { id: 6, name: 'Avocado', confidence: 0.88 },
      { id: 7, name: 'Cilantro', confidence: 0.76 },
      { id: 8, name: 'Lemon', confidence: 0.82 },
      { id: 9, name: 'Egg', confidence: 0.90 },
    ];
    
    // Simulate live detection by adding ingredients every few seconds
    detectionIntervalRef.current = setInterval(() => {
      if (detectedIngredients.length < 5) {
        const availableIngredients = possibleIngredients.filter(
          ingredient => !detectedIngredients.some(i => i.id === ingredient.id)
        );
        
        if (availableIngredients.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableIngredients.length);
          const newIngredient = availableIngredients[randomIndex];
          
          setDetectedIngredients(prev => [...prev, newIngredient]);
        } else {
          // All ingredients have been detected
          clearInterval(detectionIntervalRef.current);
        }
      } else {
        // Enough ingredients detected
        clearInterval(detectionIntervalRef.current);
      }
    }, 2000); // Detect a new ingredient every 2 seconds
  };

  const stopContinuousDetection = () => {
    setIsDetecting(false);
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
  };

  const toggleDetection = () => {
    if (isDetecting) {
      stopContinuousDetection();
    } else {
      startContinuousDetection();
    }
  };

  const onCameraReady = () => {
    setIsCameraReady(true);
  };

  const toggleFlash = () => {
    setFlashMode(
      flashMode === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.torch
        : Camera.Constants.FlashMode.off
    );
  };

  const clearDetectedIngredients = () => {
    setDetectedIngredients([]);
  };

  const generateRecipes = () => {
    if (detectedIngredients.length === 0) return;
    
    setIsGenerating(true);
    // Simulate API call delay
    setTimeout(() => {
      setIsGenerating(false);
      navigation.navigate('RecipeResults', { 
        ingredients: detectedIngredients.map(i => ({
          id: i.id,
          name: i.name,
          image: `https://source.unsplash.com/random/100x100/?${i.name.toLowerCase().replace(' ', '')}`
        })) 
      });
    }, 2000);
  };

  if (hasPermission === null) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" bg="$background800">
        <Spinner size="large" color="$primary500" />
        <Text color="$white" mt="$2">Requesting camera permissions...</Text>
      </Box>
    );
  }

  if (hasPermission === false) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" bg="$background800">
        <Text color="$white" mt="$2" textAlign="center">
          Camera access denied. Please enable camera access in your device settings.
        </Text>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="#000000">
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={cameraType}
        onCameraReady={onCameraReady}
        flashMode={flashMode}
        ratio="16:9"
      >
        {/* Header UI */}
        <Box 
          position="absolute" 
          top={0} 
          left={0} 
          right={0}
          p="$4"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          bg="rgba(0,0,0,0.5)"
        >
          <Pressable onPress={() => navigation.goBack()}>
            <Box p="$2" borderRadius="$full" bg="rgba(0,0,0,0.5)">
              <Icon as={ArrowLeftIcon} size="md" color="$white" />
            </Box>
          </Pressable>
          
          <Heading size="md" color="$white">Point & Generate</Heading>
          
          <Pressable onPress={toggleFlash}>
            <Box p="$2" borderRadius="$full" bg={flashMode === Camera.Constants.FlashMode.torch ? "$yellow400" : "rgba(0,0,0,0.5)"}>
              <Icon as={FlashIcon} size="md" color="$white" />
            </Box>
          </Pressable>
        </Box>
        
        {/* Detected Ingredients Pills */}
        <ScrollView 
          horizontal 
          position="absolute"
          top="$16"
          left={0}
          right={0}
          px="$4"
          showsHorizontalScrollIndicator={false}
        >
          <HStack space="sm" alignItems="center">
            {detectedIngredients.map((ingredient) => (
              <Badge 
                key={ingredient.id} 
                bg="rgba(255,255,255,0.8)"
                px="$3" 
                py="$1"
                borderRadius="$full"
              >
                <BadgeText color="$gray800">{ingredient.name} ({(ingredient.confidence * 100).toFixed(0)}%)</BadgeText>
              </Badge>
            ))}
            {detectedIngredients.length > 0 && (
              <Pressable onPress={clearDetectedIngredients}>
                <Box p="$2" borderRadius="$full" bg="rgba(0,0,0,0.5)">
                  <Icon as={RefreshIcon} size="sm" color="$white" />
                </Box>
              </Pressable>
            )}
          </HStack>
        </ScrollView>
        
        {/* Viewfinder overlay */}
        <Box 
          position="absolute" 
          top={0} 
          left={0} 
          right={0} 
          bottom={0} 
          borderWidth={2} 
          borderColor={isDetecting ? "$yellow400" : "transparent"}
          m="$16"
          borderRadius="$lg"
        />
        
        {/* Footer UI */}
        <Box 
          position="absolute" 
          bottom={0} 
          left={0} 
          right={0}
          p="$6"
          bg="rgba(0,0,0,0.5)"
        >
          <VStack space="lg" alignItems="center">
            {/* Detection status */}
            {isDetecting && (
              <HStack alignItems="center" space="sm">
                <Spinner size="small" color="$white" />
                <Text color="$white">Detecting ingredients...</Text>
              </HStack>
            )}
            
            {/* Control buttons */}
            <HStack space="lg" alignItems="center" justifyContent="center">
              <Pressable onPress={toggleDetection}>
                <Box
                  p="$4"
                  borderRadius="$full"
                  bg={isDetecting ? "$red500" : "$yellow400"}
                >
                  <Icon as={isDetecting ? CameraIcon : CameraIcon} size="xl" color="$white" />
                </Box>
              </Pressable>
              
              {detectedIngredients.length > 0 && (
                <Pressable 
                  onPress={generateRecipes}
                  disabled={isGenerating}
                >
                  <Box
                    p="$4"
                    borderRadius="$full"
                    bg="$primary500"
                  >
                    <Icon as={CheckIcon} size="xl" color="$white" />
                  </Box>
                </Pressable>
              )}
            </HStack>
            
            {/* Generate recipes button */}
            {detectedIngredients.length > 0 && (
              <Button
                size="lg"
                variant="solid"
                bg="$yellow400"
                w="80%"
                borderRadius="$full"
                onPress={generateRecipes}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <HStack space="sm" alignItems="center">
                    <Spinner size="small" color="$gray800" />
                    <ButtonText color="$gray800">Generating Recipes...</ButtonText>
                  </HStack>
                ) : (
                  <ButtonText color="$gray800">Generate Recipes ({detectedIngredients.length})</ButtonText>
                )}
              </Button>
            )}
          </VStack>
        </Box>
      </Camera>
    </Box>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
}); 