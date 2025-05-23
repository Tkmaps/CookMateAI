/**
 * Recommendation Service
 * Provides functions to generate meal recommendations based on user preferences
 */

import * as mealDbService from './mealDbService';

/**
 * Get recommended meals based on user preferences
 * @param {Object} preferences - User preferences
 * @param {Array} groceryItems - List of available grocery items
 * @returns {Promise<Array>} - List of recommended meals
 */
export const getRecommendedMeals = async (preferences, groceryItems = []) => {
  try {
    // Get user's dietary preference
    const dietaryPreference = preferences?.selectedDiet || null;
    
    // Get user's favorite cuisines
    const favoriteCuisines = Object.keys(preferences?.favorites || {})
      .filter(key => preferences?.favorites[key]);
    
    // Get user's allergies
    const allergies = Object.keys(preferences?.allergies || {})
      .filter(key => preferences?.allergies[key]);
    
    // Initialize results array
    let recommendations = [];
    
    // Get recommendations based on favorite cuisines
    if (favoriteCuisines.length > 0) {
      // Pick a random favorite cuisine
      const randomCuisine = favoriteCuisines[Math.floor(Math.random() * favoriteCuisines.length)];
      
      // Map app's cuisine names to TheMealDB area names
      const cuisineToAreaMap = {
        italian: 'Italian',
        asian: 'Chinese', // TheMealDB has more specific areas like Chinese, Japanese, etc.
        mexican: 'Mexican',
        american: 'American',
      };
      
      const area = cuisineToAreaMap[randomCuisine] || 'Italian';
      
      // Get meals for this area
      const areaRecommendations = await mealDbService.filterByArea(area);
      
      // Add to recommendations
      recommendations = [...recommendations, ...areaRecommendations];
    }
    
    // Get recommendations based on available grocery items
    if (groceryItems.length > 0) {
      // Extract ingredient names from grocery items
      const ingredientNames = groceryItems
        .map(item => item.name)
        .filter(Boolean);
      
      if (ingredientNames.length > 0) {
        // Pick a random ingredient
        const randomIngredient = ingredientNames[Math.floor(Math.random() * ingredientNames.length)];
        
        // Get meals with this ingredient
        const ingredientRecommendations = await mealDbService.filterByIngredient(randomIngredient);
        
        // Add to recommendations
        recommendations = [...recommendations, ...ingredientRecommendations];
      }
    }
    
    // If we don't have enough recommendations yet, add some random meals
    if (recommendations.length < 5) {
      // Get 5 random meals
      const randomMeals = [];
      for (let i = 0; i < 5; i++) {
        const randomMeal = await mealDbService.getRandomMeal();
        if (randomMeal) randomMeals.push(randomMeal);
      }
      
      // Add to recommendations
      recommendations = [...recommendations, ...randomMeals];
    }
    
    // Remove duplicates
    const uniqueRecommendations = recommendations.filter((meal, index, self) => 
      index === self.findIndex((m) => m.idMeal === meal.idMeal)
    );
    
    // Filter out meals that contain allergens (simplified implementation)
    // A real implementation would need a more robust allergen detection system
    const filteredRecommendations = uniqueRecommendations.filter(meal => {
      // Check if meal doesn't contain allergens
      // This is a simplified check and would need to be more robust in a real app
      const containsAllergen = allergies.some(allergen => 
        meal.strIngredient1?.toLowerCase().includes(allergen) ||
        meal.strIngredient2?.toLowerCase().includes(allergen) ||
        meal.strIngredient3?.toLowerCase().includes(allergen) ||
        meal.strIngredient4?.toLowerCase().includes(allergen) ||
        meal.strIngredient5?.toLowerCase().includes(allergen)
      );
      
      return !containsAllergen;
    });
    
    return filteredRecommendations;
  } catch (error) {
    console.error('Error getting meal recommendations:', error);
    return [];
  }
};

/**
 * Get personalized meal of the day
 * @param {Object} preferences - User preferences
 * @returns {Promise<Object>} - Meal of the day
 */
export const getMealOfTheDay = async (preferences) => {
  try {
    const recommendations = await getRecommendedMeals(preferences);
    if (recommendations.length > 0) {
      return recommendations[0];
    }
    
    // Fallback to a random meal
    return await mealDbService.getRandomMeal();
  } catch (error) {
    console.error('Error getting meal of the day:', error);
    
    // Fallback to a random meal
    return await mealDbService.getRandomMeal();
  }
};

/**
 * Get meals by category
 * @param {string} category - Category name
 * @returns {Promise<Array>} - List of meals in the category
 */
export const getMealsByCategory = async (category) => {
  try {
    return await mealDbService.filterByCategory(category);
  } catch (error) {
    console.error('Error getting meals by category:', error);
    return [];
  }
}; 