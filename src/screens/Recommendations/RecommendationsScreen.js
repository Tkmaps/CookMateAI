import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  ScrollView,
  Image,
  HStack,
  Pressable,
  Center,
  Spinner,
  Button,
  ButtonText,
  FlatList,
} from "@gluestack-ui/themed";
import { LinearGradient } from "../../components/ui/linear-gradient";
import { useWindowDimensions } from "react-native";
import * as recommendationService from "../../services/recommendationService";
import * as mealDbService from "../../services/mealDbService";

// Mock user preferences (in a real app, this would come from a database or state management)
const mockUserPreferences = {
  selectedDiet: "none",
  allergies: {
    nuts: true,
    dairy: false,
    gluten: false,
    shellfish: true,
  },
  favorites: {
    italian: true,
    asian: true,
    mexican: false,
    american: true,
  },
};

// Mock grocery items (in a real app, this would come from a database)
const mockGroceryItems = [
  { id: 1, name: "Chicken", isConfirmed: true },
  { id: 2, name: "Rice", isConfirmed: true },
  { id: 3, name: "Tomatoes", isConfirmed: true },
  { id: 4, name: "Garlic", isConfirmed: true },
  { id: 5, name: "Olive Oil", isConfirmed: true },
];

export default function RecommendationsScreen({ navigation }) {
  const [mealOfTheDay, setMealOfTheDay] = useState(null);
  const [recommendedMeals, setRecommendedMeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryMeals, setCategoryMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);

  const { width } = useWindowDimensions();

  useEffect(() => {
    // Load data when the component mounts
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load meal of the day
        const mealDay = await recommendationService.getMealOfTheDay(mockUserPreferences);
        setMealOfTheDay(mealDay);
        
        // Load recommended meals based on user preferences and grocery items
        const recommendations = await recommendationService.getRecommendedMeals(
          mockUserPreferences,
          mockGroceryItems
        );
        setRecommendedMeals(recommendations);
        
        // Load meal categories
        const allCategories = await mealDbService.getAllCategories();
        setCategories(allCategories);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading recommendation data:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Load meals when a category is selected
  useEffect(() => {
    const loadCategoryMeals = async () => {
      if (!selectedCategory) return;
      
      try {
        setIsLoadingCategory(true);
        const meals = await recommendationService.getMealsByCategory(selectedCategory);
        setCategoryMeals(meals);
        setIsLoadingCategory(false);
      } catch (error) {
        console.error('Error loading category meals:', error);
        setIsLoadingCategory(false);
      }
    };
    
    loadCategoryMeals();
  }, [selectedCategory]);

  // Handle meal selection
  const handleSelectMeal = (meal) => {
    navigation.navigate("Recipe", { item: { 
      recipeId: meal.idMeal,
      title: meal.strMeal,
      photo_url: meal.strMealThumb,
      photosArray: [meal.strMealThumb],
      time: '30 minutes', // This is mock data
      ingredients: [], // We'll load this from the API in the Recipe screen
      description: meal.strInstructions || 'No description available',
    }});
  };

  // Select a category
  const handleSelectCategory = (categoryName) => {
    setSelectedCategory(categoryName);
  };

  // Render a meal card
  const renderMealCard = (meal, size = 'large') => {
    if (!meal) return null;
    
    const cardWidth = size === 'large' ? width - 32 : width / 2 - 24;
    const imageHeight = size === 'large' ? 200 : 120;
    
    return (
      <Pressable onPress={() => handleSelectMeal(meal)}>
        <Box
          w={cardWidth}
          borderRadius="$lg"
          overflow="hidden"
          bg="$white"
          mb="$4"
          shadowColor="$gray400"
          shadowOpacity={0.2}
          shadowRadius={3}
          elevation={3}
        >
          <Image
            source={{ uri: meal.strMealThumb }}
            alt={meal.strMeal}
            h={imageHeight}
            w="100%"
          />
          <LinearGradient
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            height={80}
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          <Box p="$3">
            <Text fontWeight="$bold" fontSize={size === 'large' ? '$lg' : '$md'} numberOfLines={2}>
              {meal.strMeal}
            </Text>
            <Text fontSize="$xs" color="$gray600">
              {meal.strArea || 'International'} • {meal.strCategory || 'Various'}
            </Text>
          </Box>
        </Box>
      </Pressable>
    );
  };

  // Render loading state
  if (isLoading) {
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
              Recommendations
            </Heading>
            <Text color="$white" opacity={0.8}>
              Personalized meal suggestions
            </Text>
          </Box>
        </LinearGradient>
        <Center flex={1}>
          <Spinner size="large" color="$primary500" />
          <Text mt="$2">Loading recommendations...</Text>
        </Center>
      </Box>
    );
  }

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
            Recommendations
          </Heading>
          <Text color="$white" opacity={0.8}>
            Personalized meal suggestions
          </Text>
        </Box>
      </LinearGradient>

      <ScrollView flex={1}>
        <VStack space="md" width="100%" p="$4">
          {/* Meal of the Day */}
          {mealOfTheDay && (
            <Box>
              <Heading size="lg" mb="$2">Meal of the Day</Heading>
              {renderMealCard(mealOfTheDay, 'large')}
            </Box>
          )}

          {/* Recommended for You */}
          {recommendedMeals.length > 0 && (
            <Box>
              <Heading size="lg" mb="$2">Recommended for You</Heading>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} mb="$4">
                <HStack space="md">
                  {recommendedMeals.map((meal) => (
                    <Box key={meal.idMeal} w={width / 2 - 24}>
                      {renderMealCard(meal, 'small')}
                    </Box>
                  ))}
                </HStack>
              </ScrollView>
            </Box>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <Box>
              <Heading size="lg" mb="$2">Browse Categories</Heading>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} mb="$4">
                <HStack space="md">
                  {categories.map((category) => (
                    <Pressable 
                      key={category.idCategory} 
                      onPress={() => handleSelectCategory(category.strCategory)}
                    >
                      <Box 
                        p="$2" 
                        bg={selectedCategory === category.strCategory ? "$primary500" : "$white"}
                        borderRadius="$lg"
                        minWidth={100}
                        alignItems="center"
                        shadowColor="$gray400"
                        shadowOpacity={0.2}
                        shadowRadius={3}
                        elevation={2}
                      >
                        <Image
                          source={{ uri: category.strCategoryThumb }}
                          alt={category.strCategory}
                          h={50}
                          w={50}
                          borderRadius="$full"
                        />
                        <Text 
                          fontWeight="$medium" 
                          mt="$1"
                          color={selectedCategory === category.strCategory ? "$white" : "$gray800"}
                        >
                          {category.strCategory}
                        </Text>
                      </Box>
                    </Pressable>
                  ))}
                </HStack>
              </ScrollView>
            </Box>
          )}

          {/* Category Meals */}
          {selectedCategory && (
            <Box>
              <Heading size="lg" mb="$2">{selectedCategory} Recipes</Heading>
              {isLoadingCategory ? (
                <Center h={200}>
                  <Spinner size="large" color="$primary500" />
                  <Text mt="$2">Loading {selectedCategory} recipes...</Text>
                </Center>
              ) : categoryMeals.length > 0 ? (
                <VStack space="md">
                  {categoryMeals.map((meal) => (
                    <Pressable key={meal.idMeal} onPress={() => handleSelectMeal(meal)}>
                      <HStack space="md" bg="$white" p="$3" borderRadius="$lg" shadowColor="$gray400" shadowOpacity={0.2} shadowRadius={3} elevation={2}>
                        <Image
                          source={{ uri: meal.strMealThumb }}
                          alt={meal.strMeal}
                          h={70}
                          w={70}
                          borderRadius="$md"
                        />
                        <VStack flex={1} justifyContent="center">
                          <Text fontWeight="$bold">{meal.strMeal}</Text>
                          <Text fontSize="$xs" color="$gray600">{meal.strArea || 'International'} cuisine</Text>
                        </VStack>
                      </HStack>
                    </Pressable>
                  ))}
                </VStack>
              ) : (
                <Center h={200}>
                  <Text>No {selectedCategory} recipes found</Text>
                </Center>
              )}
            </Box>
          )}
        </VStack>
      </ScrollView>
    </Box>
  );
} 