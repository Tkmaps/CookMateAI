import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Box, Icon } from '@gluestack-ui/themed';
import { HomeIcon, SearchIcon, CalendarIcon, ShoppingCartIcon, UserIcon } from '@gluestack-ui/themed';

// Screens
import HomeScreen from '../screens/Home/HomeScreen';
import SearchScreen from '../screens/Search/SearchScreen';
import MealPlannerScreen from '../screens/MealPlanner/MealPlannerScreen';
import GroceryListScreen from '../screens/GroceryList/GroceryListScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import RecommendationsScreen from '../screens/Recommendations/RecommendationsScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarActiveTintColor: '#14b8a6',
        tabBarInactiveTintColor: '#64748b',
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <Box alignItems="center" justifyContent="center">
              <Icon as={HomeIcon} color={color} size="md" />
            </Box>
          ),
        }}
      />
      <Tab.Screen
        name="DiscoverTab"
        component={RecommendationsScreen}
        options={{
          tabBarLabel: 'Discover',
          tabBarIcon: ({ color }) => (
            <Box alignItems="center" justifyContent="center">
              <Icon as={SearchIcon} color={color} size="md" />
            </Box>
          ),
        }}
      />
      <Tab.Screen
        name="MealPlannerTab"
        component={MealPlannerScreen}
        options={{
          tabBarLabel: 'Meal Plan',
          tabBarIcon: ({ color }) => (
            <Box alignItems="center" justifyContent="center">
              <Icon as={CalendarIcon} color={color} size="md" />
            </Box>
          ),
        }}
      />
      <Tab.Screen
        name="GroceryTab"
        component={GroceryListScreen}
        options={{
          tabBarLabel: 'Grocery',
          tabBarIcon: ({ color }) => (
            <Box alignItems="center" justifyContent="center">
              <Icon as={ShoppingCartIcon} color={color} size="md" />
            </Box>
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <Box alignItems="center" justifyContent="center">
              <Icon as={UserIcon} color={color} size="md" />
            </Box>
          ),
        }}
      />
    </Tab.Navigator>
  );
} 