import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_RECIPES_KEY = 'saved_recipes';

/**
 * Save a recipe to AsyncStorage
 * @param {Object} recipe - Recipe object to save
 */
export const saveRecipe = async (recipe) => {
  try {
    // Get existing saved recipes
    const savedRecipesJSON = await AsyncStorage.getItem(SAVED_RECIPES_KEY);
    const savedRecipes = savedRecipesJSON ? JSON.parse(savedRecipesJSON) : [];
    
    // Check if recipe already exists
    const recipeExists = savedRecipes.some(
      (saved) => saved.recipeId === recipe.recipeId
    );
    
    if (!recipeExists) {
      // Add timestamp for sorting by most recent
      const recipeWithTimestamp = {
        ...recipe,
        savedAt: new Date().toISOString()
      };
      
      // Add to saved recipes
      savedRecipes.push(recipeWithTimestamp);
      
      // Save back to AsyncStorage
      await AsyncStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(savedRecipes));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error saving recipe:', error);
    return false;
  }
};

/**
 * Remove a recipe from saved recipes
 * @param {string|number} recipeId - ID of the recipe to remove
 */
export const removeRecipe = async (recipeId) => {
  try {
    // Get existing saved recipes
    const savedRecipesJSON = await AsyncStorage.getItem(SAVED_RECIPES_KEY);
    if (!savedRecipesJSON) return false;
    
    const savedRecipes = JSON.parse(savedRecipesJSON);
    
    // Filter out the recipe to remove
    const updatedRecipes = savedRecipes.filter(
      (recipe) => recipe.recipeId !== recipeId
    );
    
    // Save back to AsyncStorage
    await AsyncStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(updatedRecipes));
    return true;
  } catch (error) {
    console.error('Error removing recipe:', error);
    return false;
  }
};

/**
 * Get all saved recipes
 * @returns {Promise<Array>} Array of saved recipes
 */
export const getSavedRecipes = async () => {
  try {
    const savedRecipesJSON = await AsyncStorage.getItem(SAVED_RECIPES_KEY);
    return savedRecipesJSON ? JSON.parse(savedRecipesJSON) : [];
  } catch (error) {
    console.error('Error getting saved recipes:', error);
    return [];
  }
};

/**
 * Check if a recipe is saved
 * @param {string|number} recipeId - ID of the recipe to check
 * @returns {Promise<boolean>} Whether the recipe is saved
 */
export const isRecipeSaved = async (recipeId) => {
  try {
    const savedRecipes = await getSavedRecipes();
    return savedRecipes.some((recipe) => recipe.recipeId === recipeId);
  } catch (error) {
    console.error('Error checking if recipe is saved:', error);
    return false;
  }
}; 