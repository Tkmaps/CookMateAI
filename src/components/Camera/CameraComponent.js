import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as ImageManipulator from 'expo-image-manipulator';
import { Box, Center, Icon, Spinner, Text } from '@gluestack-ui/themed';
import { AlertCircleIcon, CameraIcon, FlipCameraIcon, ImageIcon } from '@gluestack-ui/themed';

export default function CameraComponent({ onPhotoTaken, onClose }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(
        cameraStatus === 'granted' && mediaStatus === 'granted'
      );
    })();
  }, []);

  const onCameraReady = () => {
    setIsCameraReady(true);
  };

  const flipCamera = () => {
    setCameraType(
      cameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  const takePicture = async () => {
    if (cameraRef.current && isCameraReady) {
      setIsProcessing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
        });

        // Process image for better OCR
        const processedImage = await ImageManipulator.manipulateAsync(
          photo.uri,
          [
            { resize: { width: 1000 } },
            { contrast: 1.2 },
            { brightness: 1.1 },
          ],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );

        // Save to media library
        await MediaLibrary.saveToLibraryAsync(processedImage.uri);
        
        // Return processed image to parent component
        onPhotoTaken(processedImage.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if (hasPermission === null) {
    return (
      <Center flex={1} bg="$background800">
        <Spinner size="large" color="$primary500" />
        <Text color="$white" mt="$2">Requesting camera permissions...</Text>
      </Center>
    );
  }

  if (hasPermission === false) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" bg="$background800">
        <AlertCircleIcon size="xl" color="$red500" />
        <Text color="$white" mt="$2" textAlign="center">
          Camera access denied. Please enable camera access in your device settings.
        </Text>
      </Box>
    );
  }

  return (
    <Box flex={1}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={cameraType}
        onCameraReady={onCameraReady}
        ratio="4:3"
      >
        {isProcessing ? (
          <Box flex={1} justifyContent="center" alignItems="center" bg="rgba(0,0,0,0.5)">
            <Spinner size="large" color="$white" />
            <Text color="$white" mt="$2">Processing image...</Text>
          </Box>
        ) : (
          <Box flex={1} justifyContent="flex-end" pb="$8">
            <Box
              flexDirection="row"
              justifyContent="space-around"
              alignItems="center"
              width="100%"
              py="$4"
            >
              <TouchableOpacity onPress={onClose}>
                <Box p="$3" borderRadius="$full" bg="rgba(0,0,0,0.5)">
                  <Icon as={ImageIcon} size="lg" color="$white" />
                </Box>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={takePicture} disabled={!isCameraReady}>
                <Box
                  p="$4"
                  borderRadius="$full"
                  bg="$white"
                  borderWidth={2}
                  borderColor="$primary500"
                >
                  <Icon as={CameraIcon} size="xl" color="$primary500" />
                </Box>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={flipCamera}>
                <Box p="$3" borderRadius="$full" bg="rgba(0,0,0,0.5)">
                  <Icon as={FlipCameraIcon} size="lg" color="$white" />
                </Box>
              </TouchableOpacity>
            </Box>
          </Box>
        )}
      </Camera>
    </Box>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
}); 