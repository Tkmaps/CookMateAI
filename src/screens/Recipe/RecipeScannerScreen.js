import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Text,
  Heading,
  Icon,
  HStack,
  Image,
  ScrollView,
  Pressable,
  VStack,
} from '@gluestack-ui/themed';
import { ArrowLeftIcon, CameraIcon, PencilIcon } from '@gluestack-ui/themed';
import CameraComponent from '../../components/Camera/CameraComponent';

export default function RecipeScannerScreen({ navigation }) {
  const [showCamera, setShowCamera] = useState(false);
  const [ingredients, setIngredients] = useState([
    { id: 1, name: 'Green Chili', image: 'https://source.unsplash.com/random/100x100/?greenchili' },
    { id: 2, name: 'Tomato', image: 'https://source.unsplash.com/random/100x100/?tomato' },
    { id: 3, name: 'Egg', image: 'https://source.unsplash.com/random/100x100/?egg' },
    { id: 4, name: 'Mushroom', image: 'https://source.unsplash.com/random/100x100/?mushroom' },
    { id: 5, name: 'Leek', image: 'https://source.unsplash.com/random/100x100/?leek' },
  ]);

  const handlePhotoTaken = (photoUri) => {
    // Here you would normally process the photo with AI/ML to identify ingredients
    // For now, we'll just add a dummy ingredient
    setShowCamera(false);
    
    // Mock adding a new ingredient (would normally be identified by AI)
    const newIngredient = {
      id: ingredients.length + 1,
      name: 'New Ingredient',
      image: photoUri
    };
    
    setIngredients([...ingredients, newIngredient]);
  };

  const generateRecipes = () => {
    // Navigate to the results screen with the current ingredients
    navigation.navigate('RecipeResults', { ingredients });
  };

  return (
    <Box flex={1} bg="#f8f9fa">
      {showCamera ? (
        <CameraComponent 
          onPhotoTaken={handlePhotoTaken} 
          onClose={() => setShowCamera(false)}
        />
      ) : (
        <>
          {/* Header */}
          <HStack 
            bg="white" 
            p="$4" 
            justifyContent="space-between" 
            alignItems="center"
            borderBottomWidth={1}
            borderBottomColor="$gray200"
          >
            <Pressable onPress={() => navigation.goBack()}>
              <Icon as={ArrowLeftIcon} size="md" color="$gray700" />
            </Pressable>
            <Heading size="md">Recipe Scanner</Heading>
            <Pressable>
              <Icon as={PencilIcon} size="md" color="$primary500" />
            </Pressable>
          </HStack>

          {/* Main content */}
          <Box flex={1} p="$4">
            <ScrollView>
              <Box 
                alignItems="center" 
                justifyContent="center" 
                mb="$4"
              >
                <Image
                  source={{ uri: 'https://source.unsplash.com/random/350x300/?vegetables' }}
                  alt="Ingredients"
                  w="100%"
                  h={300}
                  borderRadius="$lg"
                />
              </Box>

              {/* Ingredients grid */}
              <Box flexDirection="row" flexWrap="wrap" justifyContent="center">
                {ingredients.map((ingredient) => (
                  <Pressable 
                    key={ingredient.id}
                    m="$2"
                  >
                    <VStack alignItems="center">
                      <Box 
                        w={80} 
                        h={80} 
                        borderRadius={40} 
                        bg="#f0f0f0"
                        overflow="hidden"
                        alignItems="center"
                        justifyContent="center"
                        borderWidth={1}
                        borderColor="$gray200"
                      >
                        <Image 
                          source={{ uri: ingredient.image }} 
                          alt={ingredient.name} 
                          w="100%" 
                          h="100%"
                        />
                      </Box>
                      <Text mt="$2" fontSize="$sm" textAlign="center">{ingredient.name}</Text>
                    </VStack>
                  </Pressable>
                ))}
              </Box>
            </ScrollView>
          </Box>

          {/* Footer with camera button */}
          <HStack 
            bg="white" 
            p="$4" 
            justifyContent="center" 
            borderTopWidth={1}
            borderTopColor="$gray200"
          >
            <Pressable 
              onPress={() => setShowCamera(true)}
              w={60}
              h={60}
              borderRadius={30}
              bg="white"
              alignItems="center"
              justifyContent="center"
              borderWidth={2}
              borderColor="$gray200"
            >
              <Icon as={CameraIcon} size="xl" color="$primary500" />
            </Pressable>
          </HStack>

          {/* Generate recipes floating button */}
          <Pressable
            position="absolute"
            bottom="$20"
            right="$4"
            bg="$yellow400"
            w={60}
            h={60}
            borderRadius={30}
            alignItems="center"
            justifyContent="center"
            shadowColor="$gray900"
            shadowOpacity={0.3}
            shadowRadius={5}
            elevation={5}
            onPress={generateRecipes}
          >
            <Icon as={PencilIcon} size="lg" color="$gray800" />
          </Pressable>
        </>
      )}
    </Box>
  );
} 