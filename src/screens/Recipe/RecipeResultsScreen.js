import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Heading,
  Icon,
  HStack,
  VStack,
  Image,
  ScrollView,
  Pressable,
  Card,
  CardBody,
  Badge,
  BadgeText,
  Toast,
  ToastTitle,
  useToast,
  CheckIcon,
  BookmarkIcon,
  BookmarkFilledIcon,
} from '@gluestack-ui/themed';
import { ArrowLeftIcon, ChatIcon, SaveIcon } from '@gluestack-ui/themed';
import { saveRecipe, isRecipeSaved } from '../../services/RecipeService';

export default function RecipeResultsScreen({ navigation, route }) {
  const { ingredients = [] } = route.params || {};
  const [generatedRecipes, setGeneratedRecipes] = useState([]);
  const [savedRecipeIds, setSavedRecipeIds] = useState({});
  const toast = useToast();

  useEffect(() => {
    // Mock API call to generate recipes based on ingredients
    // In a real app, this would call an API with the ingredients for AI processing
    const mockGeneratedRecipes = [
      {
        id: 1,
        title: 'Bread & Egg Morning Casserole',
        image: 'https://source.unsplash.com/random/300x200/?eggsandwich',
        ingredients: 'Egg, leek, tomato, mushroom, green chili',
        tags: 'garlic clove, medium onion, lemon juice, tomato',
      },
      {
        id: 2,
        title: 'Thailand Chicken and Egg Omelette',
        image: 'https://source.unsplash.com/random/300x200/?thaiomelette',
        ingredients: 'Egg, tomato, medium onion, lemon juice, green chili, paprika',
        tags: 'egg, tomato, medium onion, lemon juice, green chili, paprika',
      },
      {
        id: 3,
        title: 'Green Chili Fried Rice with Egg & Cucumber',
        image: 'https://source.unsplash.com/random/300x200/?friedrice',
        ingredients: 'Rice, egg, cucumber, green chili, tomato',
        tags: 'rice, cucumber, tomato, olive oil, egg',
      },
      {
        id: 4,
        title: 'Spicy Mushroom Omelette',
        image: 'https://source.unsplash.com/random/300x200/?mushroomomelette',
        ingredients: 'Egg, mushroom, green chili, tomato',
        tags: 'egg, mushroom, medium onion, green chili, vegetable oil',
      },
      {
        id: 5,
        title: 'Tomato & Egg Breakfast Tacos',
        image: 'https://source.unsplash.com/random/300x200/?breakfasttacos',
        ingredients: 'Tortilla, egg, tomato, green chili',
        tags: 'tortilla, egg, tomato, avocado, lime juice',
      },
      {
        id: 6,
        title: 'Mushroom & Leek Frittata',
        image: 'https://source.unsplash.com/random/300x200/?frittata',
        ingredients: 'Egg, mushroom, leek, cream',
        tags: 'egg, mushroom, leek, heavy cream, parmesan',
      },
      {
        id: 7,
        title: 'Green Chili Egg Drop Soup',
        image: 'https://source.unsplash.com/random/300x200/?eggsoup',
        ingredients: 'Chicken broth, egg, green chili, leek',
        tags: 'chicken broth, egg, green onion, sesame oil',
      },
      {
        id: 8,
        title: 'Tomato & Egg Stir Fry',
        image: 'https://source.unsplash.com/random/300x200/?stirfry',
        ingredients: 'Egg, tomato, green chili, soy sauce',
        tags: 'egg, tomato, sugar, soy sauce, white pepper',
      },
    ];
    
    setGeneratedRecipes(mockGeneratedRecipes);
    checkSavedRecipes(mockGeneratedRecipes);
  }, [ingredients]);

  const checkSavedRecipes = async (recipes) => {
    const savedStatus = {};
    for (const recipe of recipes) {
      savedStatus[recipe.id] = await isRecipeSaved(recipe.id);
    }
    setSavedRecipeIds(savedStatus);
  };

  const handleSaveRecipe = async (recipe) => {
    // Format recipe for storage
    const recipeToSave = {
      recipeId: recipe.id,
      title: recipe.title,
      photo_url: recipe.image,
      ingredients: recipe.ingredients,
      tags: recipe.tags,
      description: `A recipe created with ${ingredients.map(i => i.name).join(', ')}`,
    };

    const saved = await saveRecipe(recipeToSave);
    
    if (saved) {
      // Update UI
      setSavedRecipeIds(prev => ({
        ...prev,
        [recipe.id]: true
      }));
      
      // Show success toast
      toast.show({
        placement: "top",
        render: ({ id }) => {
          return (
            <Toast action="success" variant="solid" id={id}>
              <HStack alignItems="center" space="sm">
                <Icon as={CheckIcon} color="$white" />
                <ToastTitle>Recipe saved successfully</ToastTitle>
              </HStack>
            </Toast>
          )
        }
      });
    }
  };

  const navigateToRecipe = (recipe) => {
    navigation.navigate('Recipe', { 
      item: {
        recipeId: recipe.id,
        title: recipe.title,
        photo_url: recipe.image,
        description: "A delicious recipe using your scanned ingredients",
      }
    });
  };

  const navigateToSavedRecipes = () => {
    navigation.navigate('Home', { 
      showSavedRecipes: true 
    });
  };

  const getIngredientString = () => {
    return ingredients
      .map(ingredient => ingredient.name)
      .join(', ');
  };

  return (
    <Box flex={1} bg="$background50">
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
        <Pressable onPress={navigateToSavedRecipes}>
          <Icon as={BookmarkFilledIcon} size="md" color="$primary600" />
        </Pressable>
      </HStack>

      {/* Content */}
      <ScrollView>
        <VStack p="$4" space="lg">
          <Box 
            bg="white" 
            p="$4" 
            borderRadius="$lg"
            shadowColor="$gray400"
            shadowOpacity={0.1}
            shadowRadius={2}
            elevation={2}
          >
            <Heading size="md" textAlign="center">{generatedRecipes.length} Recipes are Generated</Heading>
            <Text fontSize="$sm" color="$gray600" textAlign="center" mt="$2">
              {getIngredientString()}
            </Text>
          </Box>
          
          <VStack space="md">
            {generatedRecipes.map((recipe) => (
              <Card
                key={recipe.id}
                borderRadius="$lg"
                overflow="hidden"
                mb="$2"
              >
                <HStack>
                  <Pressable onPress={() => navigateToRecipe(recipe)}>
                    <Image 
                      source={{ uri: recipe.image }} 
                      alt={recipe.title}
                      w={100}
                      h={100}
                    />
                  </Pressable>
                  <CardBody flex={1} p="$3">
                    <HStack alignItems="flex-start" justifyContent="space-between">
                      <Pressable flex={1} onPress={() => navigateToRecipe(recipe)}>
                        <VStack>
                          <Text fontWeight="$bold" fontSize="$md">{recipe.title}</Text>
                          <Box>
                            <Text fontSize="$xs" mt="$1">
                              <Text fontWeight="$semibold">Tags: </Text>
                              <Text color="$gray600">{recipe.tags.split(',')[0]}, {recipe.tags.split(',')[1]}, 
                                {recipe.tags.split(',')[2]}...</Text>
                            </Text>
                          </Box>
                        </VStack>
                      </Pressable>
                      <Pressable 
                        p="$2"
                        onPress={() => !savedRecipeIds[recipe.id] && handleSaveRecipe(recipe)}
                      >
                        <Icon 
                          as={savedRecipeIds[recipe.id] ? BookmarkFilledIcon : BookmarkIcon} 
                          size="lg" 
                          color={savedRecipeIds[recipe.id] ? "$primary600" : "$gray400"} 
                        />
                      </Pressable>
                    </HStack>
                  </CardBody>
                </HStack>
              </Card>
            ))}
          </VStack>
        </VStack>
      </ScrollView>

      {/* Chat button */}
      <Pressable
        position="absolute"
        bottom="$6"
        right="$6"
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
      >
        <Icon as={ChatIcon} size="lg" color="$gray800" />
      </Pressable>
    </Box>
  );
} 