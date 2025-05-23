import React, { useEffect } from "react";
import { Box, Center, Image, Heading, Text, VStack } from "@gluestack-ui/themed";
import { LinearGradient } from "../../components/ui/linear-gradient";

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('TabHome');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <Box flex={1}>
      <LinearGradient 
        flex={1}
        colors={['#14b8a6', '#0f766e']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Center flex={1}>
          <VStack space={4} alignItems="center">
            <Image 
              source={require("../../../assets/icons/cookie100.png")} 
              alt="App Logo"
              size="2xl"
            />
            <Heading color="white" size="2xl">CookMate AI</Heading>
            <Text color="white" opacity={0.8}>Your Personal Cooking Assistant</Text>
          </VStack>
        </Center>
      </LinearGradient>
    </Box>
  );
}
