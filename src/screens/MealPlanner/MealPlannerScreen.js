import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  ButtonText,
  ScrollView,
  Image,
  HStack,
  Divider,
  Pressable,
  Icon,
  FlatList,
  Center,
  Spinner,
  IconButton,
  CloseIcon,
  AddIcon,
  Input,
  InputField,
  Modal,
} from "@gluestack-ui/themed";
import { LinearGradient } from "../../components/ui/linear-gradient";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@gluestack-ui/themed";
import { TouchableOpacity, useWindowDimensions } from "react-native";
import * as mealDbService from "../../services/mealDbService";

// Helper function to get date details
const getDateDetails = (date) => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  return {
    day: days[date.getDay()],
    date: date.getDate(),
    month: months[date.getMonth()],
    year: date.getFullYear(),
    dateString: date.toISOString().split('T')[0], // YYYY-MM-DD
  };
};

// A simple meal plan storage (in a real app, this would be stored in a database)
const mealPlanStore = {
  plans: {},
  
  getMealPlan(dateString) {
    return this.plans[dateString] || { breakfast: null, lunch: null, dinner: null };
  },
  
  saveMeal(dateString, mealType, meal) {
    if (!this.plans[dateString]) {
      this.plans[dateString] = { breakfast: null, lunch: null, dinner: null };
    }
    this.plans[dateString][mealType] = meal;
  },
  
  removeMeal(dateString, mealType) {
    if (this.plans[dateString]) {
      this.plans[dateString][mealType] = null;
    }
  }
};

export default function MealPlannerScreen({ navigation }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateDetails, setDateDetails] = useState(getDateDetails(currentDate));
  const [mealPlan, setMealPlan] = useState({ breakfast: null, lunch: null, dinner: null });
  const [isMealSelectorOpen, setIsMealSelectorOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [weekDates, setWeekDates] = useState([]);

  const { width } = useWindowDimensions();

  // Generate dates for the week
  useEffect(() => {
    const dates = [];
    const currentDay = currentDate.getDay(); // 0-6 (Sunday-Saturday)
    
    // Generate dates for the current week (Sunday to Saturday)
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() - currentDay + i);
      dates.push({
        ...getDateDetails(date),
        isToday: date.toDateString() === new Date().toDateString(),
        isSelected: date.toDateString() === currentDate.toDateString(),
      });
    }
    
    setWeekDates(dates);
  }, [currentDate]);

  // Load meal plan for the selected date
  useEffect(() => {
    const plan = mealPlanStore.getMealPlan(dateDetails.dateString);
    setMealPlan(plan);
  }, [dateDetails]);

  // Navigate to previous or next week
  const changeWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
    setDateDetails(getDateDetails(newDate));
  };

  // Select a specific date
  const selectDate = (date) => {
    const [year, month, day] = date.dateString.split('-');
    const newDate = new Date(year, month - 1, day);
    setCurrentDate(newDate);
    setDateDetails(getDateDetails(newDate));
  };

  // Open meal selector
  const openMealSelector = (mealType) => {
    setSelectedMealType(mealType);
    setIsMealSelectorOpen(true);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Search for meals
  const searchMeals = async () => {
    if (searchQuery.length < 2) return;
    
    setIsLoading(true);
    try {
      const results = await mealDbService.searchMealByName(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching meals:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Select a meal for the plan
  const selectMeal = (meal) => {
    mealPlanStore.saveMeal(dateDetails.dateString, selectedMealType, meal);
    setMealPlan({ ...mealPlan, [selectedMealType]: meal });
    setIsMealSelectorOpen(false);
  };

  // Remove a meal from the plan
  const removeMeal = (mealType) => {
    mealPlanStore.removeMeal(dateDetails.dateString, mealType);
    setMealPlan({ ...mealPlan, [mealType]: null });
  };

  // View meal details
  const viewMealDetails = (meal) => {
    if (meal) {
      navigation.navigate("Recipe", { item: { 
        recipeId: meal.idMeal,
        title: meal.strMeal,
        photo_url: meal.strMealThumb,
        photosArray: [meal.strMealThumb],
        time: '30 minutes', // This is mock data
        ingredients: [], // We'll load this from the API in the Recipe screen
        description: meal.strInstructions || 'No description available',
      }});
    }
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
            Meal Planner
          </Heading>
          <Text color="$white" opacity={0.8}>
            Plan your meals for the week
          </Text>
        </Box>
      </LinearGradient>

      <ScrollView flex={1}>
        <VStack space="md" width="100%" p="$4">
          {/* Weekly Calendar */}
          <Box bg="$white" p="$4" borderRadius="$lg" shadowColor="$gray400" shadowOpacity={0.2} shadowRadius={3} elevation={3}>
            <HStack justifyContent="space-between" alignItems="center" mb="$2">
              <IconButton
                icon={<ChevronLeftIcon size="sm" />}
                onPress={() => changeWeek(-1)}
              />
              <Text fontWeight="$bold">
                {`${weekDates[0]?.month} ${weekDates[0]?.date} - ${weekDates[6]?.month} ${weekDates[6]?.date}, ${weekDates[0]?.year}`}
              </Text>
              <IconButton
                icon={<ChevronRightIcon size="sm" />}
                onPress={() => changeWeek(1)}
              />
            </HStack>
            
            <HStack justifyContent="space-between" mt="$4">
              {weekDates.map((date) => (
                <Pressable 
                  key={date.dateString}
                  onPress={() => selectDate(date)}
                  flex={1}
                  alignItems="center"
                >
                  <Text fontSize="$xs" color="$gray600">{date.day.slice(0, 3)}</Text>
                  <Box 
                    my="$1" 
                    p="$2" 
                    borderRadius="$full" 
                    bg={date.isSelected ? "$primary500" : date.isToday ? "$primary100" : "transparent"}
                    alignItems="center"
                    justifyContent="center"
                    h={36}
                    w={36}
                  >
                    <Text 
                      fontSize="$md" 
                      fontWeight={date.isToday || date.isSelected ? "$bold" : "$normal"}
                      color={date.isSelected ? "$white" : "$gray800"}
                    >
                      {date.date}
                    </Text>
                  </Box>
                </Pressable>
              ))}
            </HStack>
          </Box>

          {/* Date Header */}
          <Box alignItems="center" my="$2">
            <Heading size="lg">{`${dateDetails.day}, ${dateDetails.month} ${dateDetails.date}`}</Heading>
          </Box>

          {/* Meal Plan */}
          <Box bg="$white" p="$4" borderRadius="$lg" shadowColor="$gray400" shadowOpacity={0.2} shadowRadius={3} elevation={3}>
            <VStack space="md">
              {/* Breakfast */}
              <VStack>
                <HStack justifyContent="space-between" alignItems="center">
                  <Heading size="sm" color="$gray800">Breakfast</Heading>
                  <IconButton
                    icon={<PlusIcon size="sm" />}
                    onPress={() => openMealSelector('breakfast')}
                  />
                </HStack>
                {mealPlan.breakfast ? (
                  <Pressable onPress={() => viewMealDetails(mealPlan.breakfast)}>
                    <HStack space="md" mt="$2" alignItems="center">
                      <Image 
                        source={{ uri: mealPlan.breakfast.strMealThumb }} 
                        alt={mealPlan.breakfast.strMeal}
                        h={60}
                        w={60}
                        borderRadius="$md"
                      />
                      <VStack flex={1}>
                        <Text fontWeight="$bold">{mealPlan.breakfast.strMeal}</Text>
                        <Text fontSize="$xs" color="$gray600">{mealPlan.breakfast.strArea || 'International'} cuisine</Text>
                      </VStack>
                      <IconButton
                        icon={<CloseIcon size="xs" />}
                        onPress={() => removeMeal('breakfast')}
                      />
                    </HStack>
                  </Pressable>
                ) : (
                  <Pressable onPress={() => openMealSelector('breakfast')}>
                    <HStack h={60} alignItems="center" justifyContent="center" bg="$gray100" borderRadius="$md" mt="$2">
                      <Text color="$gray500">Add breakfast</Text>
                    </HStack>
                  </Pressable>
                )}
              </VStack>
              
              <Divider />
              
              {/* Lunch */}
              <VStack>
                <HStack justifyContent="space-between" alignItems="center">
                  <Heading size="sm" color="$gray800">Lunch</Heading>
                  <IconButton
                    icon={<PlusIcon size="sm" />}
                    onPress={() => openMealSelector('lunch')}
                  />
                </HStack>
                {mealPlan.lunch ? (
                  <Pressable onPress={() => viewMealDetails(mealPlan.lunch)}>
                    <HStack space="md" mt="$2" alignItems="center">
                      <Image 
                        source={{ uri: mealPlan.lunch.strMealThumb }} 
                        alt={mealPlan.lunch.strMeal}
                        h={60}
                        w={60}
                        borderRadius="$md"
                      />
                      <VStack flex={1}>
                        <Text fontWeight="$bold">{mealPlan.lunch.strMeal}</Text>
                        <Text fontSize="$xs" color="$gray600">{mealPlan.lunch.strArea || 'International'} cuisine</Text>
                      </VStack>
                      <IconButton
                        icon={<CloseIcon size="xs" />}
                        onPress={() => removeMeal('lunch')}
                      />
                    </HStack>
                  </Pressable>
                ) : (
                  <Pressable onPress={() => openMealSelector('lunch')}>
                    <HStack h={60} alignItems="center" justifyContent="center" bg="$gray100" borderRadius="$md" mt="$2">
                      <Text color="$gray500">Add lunch</Text>
                    </HStack>
                  </Pressable>
                )}
              </VStack>
              
              <Divider />
              
              {/* Dinner */}
              <VStack>
                <HStack justifyContent="space-between" alignItems="center">
                  <Heading size="sm" color="$gray800">Dinner</Heading>
                  <IconButton
                    icon={<PlusIcon size="sm" />}
                    onPress={() => openMealSelector('dinner')}
                  />
                </HStack>
                {mealPlan.dinner ? (
                  <Pressable onPress={() => viewMealDetails(mealPlan.dinner)}>
                    <HStack space="md" mt="$2" alignItems="center">
                      <Image 
                        source={{ uri: mealPlan.dinner.strMealThumb }} 
                        alt={mealPlan.dinner.strMeal}
                        h={60}
                        w={60}
                        borderRadius="$md"
                      />
                      <VStack flex={1}>
                        <Text fontWeight="$bold">{mealPlan.dinner.strMeal}</Text>
                        <Text fontSize="$xs" color="$gray600">{mealPlan.dinner.strArea || 'International'} cuisine</Text>
                      </VStack>
                      <IconButton
                        icon={<CloseIcon size="xs" />}
                        onPress={() => removeMeal('dinner')}
                      />
                    </HStack>
                  </Pressable>
                ) : (
                  <Pressable onPress={() => openMealSelector('dinner')}>
                    <HStack h={60} alignItems="center" justifyContent="center" bg="$gray100" borderRadius="$md" mt="$2">
                      <Text color="$gray500">Add dinner</Text>
                    </HStack>
                  </Pressable>
                )}
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </ScrollView>

      {/* Meal Selector Modal */}
      <Modal
        isOpen={isMealSelectorOpen}
        onClose={() => setIsMealSelectorOpen(false)}
      >
        <Box
          bg="$white"
          w="100%"
          h="80%"
          borderTopLeftRadius="$2xl"
          borderTopRightRadius="$2xl"
          p="$4"
        >
          <VStack space="md" flex={1}>
            <Heading size="md" textTransform="capitalize">{`Select ${selectedMealType}`}</Heading>
            
            <HStack space="md" alignItems="center">
              <Input flex={1}>
                <InputField
                  placeholder="Search for meals..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={searchMeals}
                />
              </Input>
              <Button onPress={searchMeals} bg="$primary500">
                <ButtonText>Search</ButtonText>
              </Button>
            </HStack>
            
            {isLoading ? (
              <Center flex={1}>
                <Spinner size="large" color="$primary500" />
                <Text mt="$2">Searching meals...</Text>
              </Center>
            ) : searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.idMeal}
                renderItem={({ item }) => (
                  <Pressable onPress={() => selectMeal(item)} mb="$3">
                    <HStack space="md" alignItems="center">
                      <Image
                        source={{ uri: item.strMealThumb }}
                        alt={item.strMeal}
                        h={60}
                        w={60}
                        borderRadius="$md"
                      />
                      <VStack flex={1}>
                        <Text fontWeight="$bold">{item.strMeal}</Text>
                        <Text fontSize="$xs" color="$gray600">{item.strArea || 'International'} cuisine</Text>
                      </VStack>
                    </HStack>
                  </Pressable>
                )}
                showsVerticalScrollIndicator={false}
              />
            ) : searchQuery ? (
              <Center flex={1}>
                <Text>No meals found. Try a different search term.</Text>
              </Center>
            ) : (
              <Center flex={1}>
                <Text>Search for meals to add to your plan.</Text>
              </Center>
            )}
            
            <Button
              onPress={() => setIsMealSelectorOpen(false)}
              variant="outline"
              borderColor="$primary500"
              mb="$4"
            >
              <ButtonText color="$primary500">Cancel</ButtonText>
            </Button>
          </VStack>
        </Box>
      </Modal>
    </Box>
  );
} 