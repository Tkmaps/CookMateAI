import React, { useLayoutEffect, useState, useEffect } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Image,
  HStack,
  Pressable,
  Input,
  InputField,
  InputIcon,
  InputSlot,
  Icon,
  ScrollView,
  Card,
  CardBody,
  Rating,
  RatingGroup,
  RatingStar,
  RatingStarIcon,
  RatingStarFillIcon,
} from "@gluestack-ui/themed";
import { LinearGradient } from "../../components/ui/linear-gradient";
import { 
  SearchIcon, 
  CalendarIcon, 
  ShoppingCartIcon, 
  HeartIcon,
  MicIcon,
  InfoIcon,
  ClockIcon,
  StarIcon,
  ChevronRightIcon,
  CameraIcon,
  BookmarkIcon,
  ChatIcon,
} from "@gluestack-ui/themed";
import MenuImage from "../../components/MenuImage/MenuImage";
import ChatAssistant from "../../components/ChatAssistant/ChatAssistant";
import SavedRecipesScreen from "../Recipe/SavedRecipesScreen";
import VoiceAssistant from "../../components/VoiceAssistant/VoiceAssistant";

export default function HomeScreen({ navigation, route }) {
  const [isChatAssistantVisible, setIsChatAssistantVisible] = useState(false);
  const [isSavedRecipesVisible, setIsSavedRecipesVisible] = useState(false);
  const [isVoiceAssistantVisible, setIsVoiceAssistantVisible] = useState(false);
  const userName = "Jenifer"; // This would come from user profile in a real app

  useEffect(() => {
    // Check if we should show the saved recipes screen
    if (route.params?.showSavedRecipes) {
      setIsSavedRecipesVisible(true);
      // Reset the param to avoid reopening when navigating back
      navigation.setParams({ showSavedRecipes: false });
    }
  }, [route.params]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <MenuImage
          onPress={() => {
            navigation.openDrawer();
          }}
        />
      ),
      headerTitle: () => (
        <Heading size="md" color="$primary800">CookMate AI</Heading>
      ),
      headerRight: () => (
        <HStack space="md" alignItems="center">
          <Pressable mr="$2" onPress={() => setIsSavedRecipesVisible(true)}>
            <Icon as={BookmarkIcon} size="lg" color="$primary600" />
          </Pressable>
          <Pressable mr="$3" onPress={() => navigation.navigate("Profile")}>
            <Image
              source={require("../../../assets/icons/user-avatar.png")}
              alt="User Avatar"
              h={35}
              w={35}
              borderRadius="$full"
            />
          </Pressable>
        </HStack>
      ),
    });
  }, [navigation]);

  // Mock recipe data
  const todaysPicks = [
    {
      id: 1,
      title: "Bread & Egg Morning Casserole",
      image: "https://source.unsplash.com/random/300x200/?casserole",
      time: "35 min",
      rating: 4.5,
      tags: "garlic clove, medium onion, lemon juice, tomato",
      reviews: 128,
    },
    {
      id: 2,
      title: "Thai Chicken and Vegetables",
      image: "https://source.unsplash.com/random/300x200/?thaiFood",
      time: "45 min",
      rating: 4.8,
      tags: "chicken, bell pepper, onion, spices",
      reviews: 94,
    },
  ];

  const recentRecipes = [
    {
      id: 3,
      title: "Creamy Garlic Pasta",
      image: "https://source.unsplash.com/random/300x200/?pasta",
      time: "20 min",
    },
    {
      id: 4,
      title: "Mediterranean Quinoa Salad",
      image: "https://source.unsplash.com/random/300x200/?quinoa",
      time: "15 min",
    },
    {
      id: 5,
      title: "Classic Avocado Toast",
      image: "https://source.unsplash.com/random/300x200/?avocado",
      time: "10 min",
    },
  ];

  const navigateToSearch = () => {
    navigation.navigate("Search");
  };

  const navigateToRecipe = (recipe) => {
    navigation.navigate("Recipe", { 
      item: {
        recipeId: recipe.id,
        title: recipe.title,
        photo_url: recipe.image,
        time: recipe.time,
        description: "A delicious recipe that's easy to prepare",
      }
    });
  };

  const openChatAssistant = () => {
    setIsChatAssistantVisible(true);
  };

  const closeChatAssistant = () => {
    setIsChatAssistantVisible(false);
  };

  const navigateToRecipeScanner = () => {
    navigation.navigate("RecipeScanner");
  };

  const navigateToPointAndGenerate = () => {
    navigation.navigate("PointAndGenerate");
  };

  const closeSavedRecipes = () => {
    setIsSavedRecipesVisible(false);
  };

  const openVoiceAssistant = () => {
    setIsVoiceAssistantVisible(true);
  };

  const closeVoiceAssistant = () => {
    setIsVoiceAssistantVisible(false);
  };

  return (
    <Box flex={1} bg="$background50">
      <ScrollView>
        <VStack space="lg" pb="$8" px="$4">
          {/* User Greeting */}
          <HStack pt="$4" alignItems="center" justifyContent="space-between">
            <Heading size="lg">Hello, {userName}!</Heading>
            <Pressable onPress={openVoiceAssistant}>
              <Icon as={MicIcon} size="lg" color="$primary600" />
            </Pressable>
          </HStack>

          {/* Food Scanner Card */}
          <Card bg="$primary900" borderRadius="$xl" p="$0" mt="$2">
            <HStack p="$4" alignItems="center">
              <VStack flex={1} space="sm">
                <Text color="$white" fontWeight="$semibold" fontSize="$md">
                  Get Your Recipes Easier With AI Food Scanner
                </Text>
                <Pressable 
                  onPress={navigateToRecipeScanner}
                  alignSelf="flex-start"
                  bg="$yellow400"
                  borderRadius="$full"
                  px="$3"
                  py="$1.5"
                  mt="$1"
                >
                  <HStack alignItems="center" space="xs">
                    <Icon as={SearchIcon} size="sm" color="$gray800" />
                    <Text fontWeight="$bold" color="$gray800">Scan Now</Text>
                  </HStack>
                </Pressable>
              </VStack>
              <Box 
                h={80}
                w={80}
                bg="$primary700" 
                borderRadius="$md"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={SearchIcon} size="xl" color="$white" />
              </Box>
            </HStack>
          </Card>

          {/* Point and Generate Card */}
          <Card bg="$purple800" borderRadius="$xl" p="$0" mt="$2">
            <HStack p="$4" alignItems="center">
              <VStack flex={1} space="sm">
                <Text color="$white" fontWeight="$semibold" fontSize="$md">
                  Point & Generate - Identify Ingredients Instantly
                </Text>
                <Pressable 
                  onPress={navigateToPointAndGenerate}
                  alignSelf="flex-start"
                  bg="$yellow400"
                  borderRadius="$full"
                  px="$3"
                  py="$1.5"
                  mt="$1"
                >
                  <HStack alignItems="center" space="xs">
                    <Icon as={CameraIcon} size="sm" color="$gray800" />
                    <Text fontWeight="$bold" color="$gray800">Try Now</Text>
                  </HStack>
                </Pressable>
              </VStack>
              <Box 
                h={80}
                w={80}
                bg="$purple700" 
                borderRadius="$md"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={CameraIcon} size="xl" color="$white" />
              </Box>
            </HStack>
          </Card>

          {/* Saved Recipes Card */}
          <Card bg="$blue800" borderRadius="$xl" p="$0" mt="$2">
            <HStack p="$4" alignItems="center">
              <VStack flex={1} space="sm">
                <Text color="$white" fontWeight="$semibold" fontSize="$md">
                  Your Saved Recipe Collection
                </Text>
                <Pressable 
                  onPress={() => setIsSavedRecipesVisible(true)}
                  alignSelf="flex-start"
                  bg="$yellow400"
                  borderRadius="$full"
                  px="$3"
                  py="$1.5"
                  mt="$1"
                >
                  <HStack alignItems="center" space="xs">
                    <Icon as={BookmarkIcon} size="sm" color="$gray800" />
                    <Text fontWeight="$bold" color="$gray800">View Saved</Text>
                  </HStack>
                </Pressable>
              </VStack>
              <Box 
                h={80}
                w={80}
                bg="$blue700" 
                borderRadius="$md"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={BookmarkIcon} size="xl" color="$white" />
              </Box>
            </HStack>
          </Card>

          {/* AI Voice Assistant Card */}
          <Card bg="$orange800" borderRadius="$xl" p="$0" mt="$2">
            <HStack p="$4" alignItems="center">
              <VStack flex={1} space="sm">
                <Text color="$white" fontWeight="$semibold" fontSize="$md">
                  Ask CookMate AI Voice Assistant
                </Text>
                <Pressable 
                  onPress={openVoiceAssistant}
                  alignSelf="flex-start"
                  bg="$yellow400"
                  borderRadius="$full"
                  px="$3"
                  py="$1.5"
                  mt="$1"
                >
                  <HStack alignItems="center" space="xs">
                    <Icon as={MicIcon} size="sm" color="$gray800" />
                    <Text fontWeight="$bold" color="$gray800">Talk Now</Text>
                  </HStack>
                </Pressable>
              </VStack>
              <Box 
                h={80}
                w={80}
                bg="$orange700" 
                borderRadius="$md"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={MicIcon} size="xl" color="$white" />
              </Box>
            </HStack>
          </Card>

          {/* Text Chat Assistant Card */}
          <Card bg="$green800" borderRadius="$xl" p="$0" mt="$2">
            <HStack p="$4" alignItems="center">
              <VStack flex={1} space="sm">
                <Text color="$white" fontWeight="$semibold" fontSize="$md">
                  Chat with CookMate AI Assistant
                </Text>
                <Pressable 
                  onPress={openChatAssistant}
                  alignSelf="flex-start"
                  bg="$yellow400"
                  borderRadius="$full"
                  px="$3"
                  py="$1.5"
                  mt="$1"
                >
                  <HStack alignItems="center" space="xs">
                    <Icon as={ChatIcon} size="sm" color="$gray800" />
                    <Text fontWeight="$bold" color="$gray800">Chat Now</Text>
                  </HStack>
                </Pressable>
              </VStack>
              <Box 
                h={80}
                w={80}
                bg="$green700" 
                borderRadius="$md"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={ChatIcon} size="xl" color="$white" />
              </Box>
            </HStack>
          </Card>

          {/* Today's Picks */}
          <VStack space="md" mt="$2">
            <HStack justifyContent="space-between" alignItems="center">
              <Heading size="md">Today's Picks</Heading>
              <Pressable onPress={() => navigation.navigate("Recommendations")}>
                <HStack alignItems="center">
                  <Text color="$primary600" fontWeight="$medium">See All</Text>
                  <ChevronRightIcon size="sm" color="$primary600" />
                </HStack>
              </Pressable>
            </HStack>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} mt="$2">
              <HStack space="md">
                {todaysPicks.map((recipe) => (
                  <Pressable key={recipe.id} onPress={() => navigateToRecipe(recipe)}>
                    <Card w={250} overflow="hidden" mb="$2">
                      <Image
                        source={{ uri: recipe.image }}
                        alt={recipe.title}
                        h={150}
                        w={250}
                      />
                      <CardBody p="$3">
                        <VStack>
                          <Text fontWeight="$bold" fontSize="$md" numberOfLines={1}>{recipe.title}</Text>
                          <HStack alignItems="center" space="xs" mt="$1">
                            <RatingGroup size="sm" value={Math.floor(recipe.rating)}>
                              {[...Array(5)].map((_, i) => (
                                <RatingStar key={i}>
                                  <RatingStarIcon as={i < Math.floor(recipe.rating) ? RatingStarFillIcon : StarIcon} />
                                </RatingStar>
                              ))}
                            </RatingGroup>
                            <Text fontSize="$xs" color="$gray600">{recipe.rating}</Text>
                          </HStack>
                          <Text fontSize="$xs" color="$gray600" mt="$1">Tags: {recipe.tags}</Text>
                        </VStack>
                      </CardBody>
                    </Card>
                  </Pressable>
                ))}
              </HStack>
            </ScrollView>
          </VStack>

          {/* Quick Search */}
          <VStack space="md" mt="$2">
            <HStack justifyContent="space-between" alignItems="center">
              <Heading size="md">Quick Search</Heading>
              <Pressable>
                <HStack alignItems="center">
                  <Text color="$primary600" fontWeight="$medium">Refresh</Text>
                  <ChevronRightIcon size="sm" color="$primary600" />
                </HStack>
              </Pressable>
            </HStack>
            
            <HStack space="md" mt="$2">
              <Pressable 
                flex={1} 
                onPress={() => navigation.navigate("RecipesList", { category: "Bread" })}
              >
                <Box 
                  p="$3" 
                  bg="$primary700" 
                  borderRadius="$lg"
                  h={100}
                >
                  <VStack justifyContent="center" h="100%">
                    <Text color="$white" fontWeight="$bold" fontSize="$sm">Bread Based Recipes</Text>
                    <Text color="$gray200" fontSize="$xs" mt="$1">
                      Bread, garlic clove, medium onion, lemon juice
                    </Text>
                  </VStack>
                </Box>
              </Pressable>
              
              <Pressable 
                flex={1} 
                onPress={() => navigation.navigate("RecipesList", { category: "Chicken" })}
              >
                <Box 
                  p="$3" 
                  bg="$primary700" 
                  borderRadius="$lg"
                  h={100}
                >
                  <VStack justifyContent="center" h="100%">
                    <Text color="$white" fontWeight="$bold" fontSize="$sm">Chicken Based Recipes</Text>
                    <Text color="$gray200" fontSize="$xs" mt="$1">
                      Chicken, garlic, green bell pepper, onion, paprika
                    </Text>
                  </VStack>
                </Box>
              </Pressable>
            </HStack>
            
            {/* Search Bar */}
            <Pressable 
              onPress={navigateToSearch}
              bg="$gray100" 
              borderRadius="$full" 
              p="$3" 
              mt="$2"
              borderWidth={1}
              borderColor="$gray200"
            >
              <HStack alignItems="center" space="sm">
                <Icon as={SearchIcon} size="sm" color="$gray500" />
                <Text color="$gray500" fontStyle="italic">Try "chicken, onion, cabbage"</Text>
              </HStack>
            </Pressable>
          </VStack>
        </VStack>
      </ScrollView>

      {/* Chat Assistant Modal */}
      <ChatAssistant 
        isVisible={isChatAssistantVisible} 
        onClose={closeChatAssistant}
        userName={userName}
      />

      {/* Saved Recipes Modal */}
      <SavedRecipesScreen 
        isVisible={isSavedRecipesVisible}
        onClose={closeSavedRecipes}
        navigation={navigation}
      />

      {/* Voice Assistant Modal */}
      <VoiceAssistant
        isVisible={isVoiceAssistantVisible}
        onClose={closeVoiceAssistant}
      />
    </Box>
  );
}
