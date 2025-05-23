import React, { useState } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  ScrollView,
  HStack,
  Pressable,
  Icon,
  Divider,
  Image,
  Switch,
  ChevronRightIcon,
} from "@gluestack-ui/themed";
import { LinearGradient } from "../../components/ui/linear-gradient";
import { 
  EditIcon, 
  BellIcon, 
  BrushIcon, 
  GlobeIcon, 
  SyncIcon, 
  CloudIcon, 
  LockIcon,
  LogOutIcon
} from "@gluestack-ui/themed";

// Mock user data
const mockUser = {
  name: "Alex Johnson",
  email: "alex.j@example.com",
  avatar: "https://source.unsplash.com/random/200x200/?person",
};

export default function ProfileScreen({ navigation }) {
  const [dietaryPreferences, setDietaryPreferences] = useState({
    vegan: false,
    vegetarian: true,
    glutenFree: false,
    dairyFree: false,
    nutFree: true,
  });

  const togglePreference = (preference) => {
    setDietaryPreferences({
      ...dietaryPreferences,
      [preference]: !dietaryPreferences[preference],
    });
  };

  return (
    <Box flex={1} bg="$background50">
      <LinearGradient
        h={200}
        colors={["#14b8a6", "#0f766e"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Box p="$4" justifyContent="flex-end" h="100%" alignItems="center">
          <Image 
            source={{ uri: mockUser.avatar }}
            alt="User Avatar"
            size="xl"
            borderRadius="$full"
            borderWidth={3}
            borderColor="$white"
            mb="$2"
          />
          <Heading color="$white" size="lg">{mockUser.name}</Heading>
          <Text color="$white" opacity={0.9}>{mockUser.email}</Text>
        </Box>
      </LinearGradient>

      <ScrollView flex={1}>
        <VStack space="md" width="100%" p="$4">
          {/* Edit Profile Button */}
          <Pressable mb="$2">
            <HStack 
              justifyContent="center" 
              bg="$primary500" 
              p="$3" 
              borderRadius="$lg"
              alignItems="center"
            >
              <Icon as={EditIcon} color="$white" size="sm" mr="$2" />
              <Text color="$white" fontWeight="$semibold">Edit Profile</Text>
            </HStack>
          </Pressable>

          {/* Dietary Preferences */}
          <Box
            bg="$white"
            p="$4"
            borderRadius="$lg"
            shadowColor="$gray400"
            shadowOpacity={0.2}
            shadowRadius={3}
            elevation={3}
            mb="$4"
          >
            <Heading size="md" mb="$3">Dietary Preferences</Heading>
            <VStack space="md">
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontWeight="$medium">Vegan</Text>
                <Switch 
                  value={dietaryPreferences.vegan} 
                  onToggle={() => togglePreference('vegan')}
                  trackColor={{ false: "$gray300", true: "$primary400" }}
                  thumbColor={dietaryPreferences.vegan ? "$primary500" : "$gray100"}
                />
              </HStack>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontWeight="$medium">Vegetarian</Text>
                <Switch 
                  value={dietaryPreferences.vegetarian} 
                  onToggle={() => togglePreference('vegetarian')}
                  trackColor={{ false: "$gray300", true: "$primary400" }}
                  thumbColor={dietaryPreferences.vegetarian ? "$primary500" : "$gray100"}
                />
              </HStack>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontWeight="$medium">Gluten-free</Text>
                <Switch 
                  value={dietaryPreferences.glutenFree} 
                  onToggle={() => togglePreference('glutenFree')}
                  trackColor={{ false: "$gray300", true: "$primary400" }}
                  thumbColor={dietaryPreferences.glutenFree ? "$primary500" : "$gray100"}
                />
              </HStack>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontWeight="$medium">Dairy-free</Text>
                <Switch 
                  value={dietaryPreferences.dairyFree} 
                  onToggle={() => togglePreference('dairyFree')}
                  trackColor={{ false: "$gray300", true: "$primary400" }}
                  thumbColor={dietaryPreferences.dairyFree ? "$primary500" : "$gray100"}
                />
              </HStack>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontWeight="$medium">Nut-free</Text>
                <Switch 
                  value={dietaryPreferences.nutFree} 
                  onToggle={() => togglePreference('nutFree')}
                  trackColor={{ false: "$gray300", true: "$primary400" }}
                  thumbColor={dietaryPreferences.nutFree ? "$primary500" : "$gray100"}
                />
              </HStack>
              <Pressable>
                <HStack alignItems="center" justifyContent="space-between" mt="$2">
                  <Text color="$primary600" fontWeight="$medium">Manage All Preferences</Text>
                  <ChevronRightIcon size="sm" color="$primary600" />
                </HStack>
              </Pressable>
            </VStack>
          </Box>

          {/* App Settings */}
          <Box
            bg="$white"
            p="$4"
            borderRadius="$lg"
            shadowColor="$gray400"
            shadowOpacity={0.2}
            shadowRadius={3}
            elevation={3}
            mb="$4"
          >
            <Heading size="md" mb="$3">App Settings</Heading>
            <VStack space="md">
              <Pressable>
                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space="md" alignItems="center">
                    <Box p="$2" borderRadius="$md" bg="$primary100">
                      <Icon as={BellIcon} color="$primary500" />
                    </Box>
                    <Text fontWeight="$medium">Notifications</Text>
                  </HStack>
                  <ChevronRightIcon size="sm" color="$gray400" />
                </HStack>
              </Pressable>
              <Divider />
              <Pressable>
                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space="md" alignItems="center">
                    <Box p="$2" borderRadius="$md" bg="$primary100">
                      <Icon as={BrushIcon} color="$primary500" />
                    </Box>
                    <Text fontWeight="$medium">Theme</Text>
                  </HStack>
                  <ChevronRightIcon size="sm" color="$gray400" />
                </HStack>
              </Pressable>
              <Divider />
              <Pressable>
                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space="md" alignItems="center">
                    <Box p="$2" borderRadius="$md" bg="$primary100">
                      <Icon as={GlobeIcon} color="$primary500" />
                    </Box>
                    <Text fontWeight="$medium">Language</Text>
                  </HStack>
                  <Text color="$gray600">English</Text>
                </HStack>
              </Pressable>
            </VStack>
          </Box>

          {/* Sync & Backup */}
          <Box
            bg="$white"
            p="$4"
            borderRadius="$lg"
            shadowColor="$gray400"
            shadowOpacity={0.2}
            shadowRadius={3}
            elevation={3}
            mb="$4"
          >
            <Heading size="md" mb="$3">Sync & Backup</Heading>
            <VStack space="md">
              <HStack justifyContent="space-between" alignItems="center">
                <Text color="$gray700">Last synced</Text>
                <Text color="$gray600">Today, 2:30 PM</Text>
              </HStack>
              <HStack justifyContent="space-between" alignItems="center">
                <Text color="$gray700">Storage Used</Text>
                <Text color="$gray600">12.4 MB / 1 GB</Text>
              </HStack>
              <Pressable>
                <HStack alignItems="center" justifyContent="center" mt="$2" p="$2">
                  <Icon as={SyncIcon} color="$primary500" size="sm" mr="$2" />
                  <Text color="$primary500" fontWeight="$medium">Sync Now</Text>
                </HStack>
              </Pressable>
            </VStack>
          </Box>

          {/* Account Security */}
          <Box
            bg="$white"
            p="$4"
            borderRadius="$lg"
            shadowColor="$gray400"
            shadowOpacity={0.2}
            shadowRadius={3}
            elevation={3}
            mb="$4"
          >
            <Heading size="md" mb="$3">Account Security</Heading>
            <VStack space="md">
              <Pressable>
                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space="md" alignItems="center">
                    <Box p="$2" borderRadius="$md" bg="$primary100">
                      <Icon as={LockIcon} color="$primary500" />
                    </Box>
                    <Text fontWeight="$medium">Change Password</Text>
                  </HStack>
                  <ChevronRightIcon size="sm" color="$gray400" />
                </HStack>
              </Pressable>
              <Divider />
              <Pressable>
                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space="md" alignItems="center">
                    <Box p="$2" borderRadius="$md" bg="$primary100">
                      <Icon as={LockIcon} color="$primary500" />
                    </Box>
                    <Text fontWeight="$medium">Two-factor Authentication</Text>
                  </HStack>
                  <Text color="$primary500" fontSize="$xs" fontWeight="$medium">Enable</Text>
                </HStack>
              </Pressable>
              <Divider />
              <Pressable>
                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space="md" alignItems="center">
                    <Box p="$2" borderRadius="$md" bg="$red100">
                      <Icon as={LogOutIcon} color="$red500" />
                    </Box>
                    <Text fontWeight="$medium" color="$red500">Log Out</Text>
                  </HStack>
                </HStack>
              </Pressable>
            </VStack>
          </Box>

          {/* App Version */}
          <Box alignItems="center" mb="$8">
            <Text color="$gray500" fontSize="$xs">CookMate AI v1.0.0</Text>
          </Box>
        </VStack>
      </ScrollView>
    </Box>
  );
} 