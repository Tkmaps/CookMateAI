import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/Home/HomeScreen';
import CategoriesScreen from '../screens/Categories/CategoriesScreen';
import RecipeScreen from '../screens/Recipe/RecipeScreen';
import RecipesListScreen from '../screens/RecipesList/RecipesListScreen';
import IngredientScreen from '../screens/Ingredient/IngredientScreen';
import SearchScreen from '../screens/Search/SearchScreen';
import IngredientsDetailsScreen from '../screens/IngredientsDetails/IngredientsDetailsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import ScanReceiptScreen from '../screens/GroceryList/ScanReceiptScreen';
import SplashScreen from '../screens/Splash/SplashScreen';
import MealPlannerScreen from '../screens/MealPlanner/MealPlannerScreen';
import RecommendationsScreen from '../screens/Recommendations/RecommendationsScreen';
import RecipeScannerScreen from '../screens/Recipe/RecipeScannerScreen';
import RecipeResultsScreen from '../screens/Recipe/RecipeResultsScreen';
import PointAndGenerateScreen from '../screens/Recipe/PointAndGenerateScreen';
import TabNavigator from './TabNavigator';

const Stack = createStackNavigator();

const linking = {
  prefixes: ['cookmateai://'],
  config: {
    screens: {
      Splash: 'splash',
      TabHome: {
        path: 'home',
        screens: {
          Home: 'main',
          Categories: 'categories',
          Search: 'search',
          Profile: 'profile',
          MealPlanner: 'meal-planner',
        },
      },
      Categories: 'categories',
      Recipe: 'recipe/:recipeId',
      RecipesList: 'recipes-list/:categoryId',
      Ingredient: 'ingredient/:ingredientId',
      Search: 'search',
      IngredientsDetails: 'ingredient-details/:ingredientId',
      Profile: 'profile',
      ScanReceipt: 'scan-receipt',
      MealPlanner: 'meal-planner',
      Recommendations: 'recommendations',
      RecipeScanner: 'recipe-scanner',
      PointAndGenerate: 'point-and-generate',
      RecipeResults: 'recipe-results',
    },
  },
};

function MainNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name='Splash'
        component={SplashScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name='TabHome'
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen name='Categories' component={CategoriesScreen}/>
      <Stack.Screen name='Recipe' component={RecipeScreen}/>
      <Stack.Screen name='RecipesList' component={RecipesListScreen} />
      <Stack.Screen name='Ingredient' component={IngredientScreen} />
      <Stack.Screen name='Search' component={SearchScreen} />
      <Stack.Screen name='IngredientsDetails' component={IngredientsDetailsScreen} />
      <Stack.Screen name='Profile' component={ProfileScreen} options={{ title: 'Your Profile' }} />
      <Stack.Screen name='ScanReceipt' component={ScanReceiptScreen} options={{ title: 'Scan Receipt' }} />
      <Stack.Screen name='MealPlanner' component={MealPlannerScreen} options={{ title: 'Meal Planner' }} />
      <Stack.Screen name='Recommendations' component={RecommendationsScreen} options={{ title: 'For You' }} />
      <Stack.Screen name='Home' component={HomeScreen} />
      <Stack.Screen
        name='RecipeScanner'
        component={RecipeScannerScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name='PointAndGenerate'
        component={PointAndGenerateScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name='RecipeResults'
        component={RecipeResultsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function AppContainer() {
  return (
    <NavigationContainer linking={linking}>
      <MainNavigator />
    </NavigationContainer>
  );
}

console.disableYellowBox = true;