import React, { useState, useEffect } from 'react';
import AppContainer from './src/navigations/AppNavigation';
import { ThemeProvider } from './src/components/ui/theme-provider';
import { useColorScheme, Platform, Alert } from 'react-native';
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';
import Voice from '@react-native-voice/voice';

export default function App() {
  const colorScheme = useColorScheme();
  const [colorMode, setColorMode] = useState(colorScheme || 'light');
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  useEffect(() => {
    // Request permissions when app starts
    (async () => {
      try {
        const cameraPermission = await Camera.requestCameraPermissionsAsync();
        
        let microphonePermission;
        if (Platform.OS === 'ios') {
          microphonePermission = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
        } else {
          // On Android, Voice API handles the permission request
          try {
            await Voice.isAvailable();
            microphonePermission = { granted: true };
          } catch (e) {
            console.error('Voice recognition not available:', e);
            microphonePermission = { granted: false };
          }
        }

        setPermissionsGranted(
          cameraPermission.granted && 
          microphonePermission.granted
        );

        if (!cameraPermission.granted || !microphonePermission.granted) {
          Alert.alert(
            "Permission Required",
            "CookMate AI needs camera and microphone permissions to provide all features. Please enable them in your device settings.",
            [{ text: "OK" }]
          );
        }
      } catch (error) {
        console.error('Error requesting permissions:', error);
      }
    })();
  }, []);

  return (
    <ThemeProvider colorMode={colorMode}>
      <AppContainer />
    </ThemeProvider>
  );
}
