/**
 * TheMealDB API Service
 * Provides functions to interact with TheMealDB API
 */

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

/**
 * Search meal by name
 * @param {string} name - Meal name to search for
 * @returns {Promise<Array>} - List of meals matching the search term
 */
export const searchMealByName = async (name) => {
  try {
    const response = await fetch(`${BASE_URL}/search.php?s=${encodeURIComponent(name)}`);
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error('Error searching meals by name:', error);
    throw error;
  }
};

/**
 * List meals by first letter
 * @param {string} letter - First letter to search for
 * @returns {Promise<Array>} - List of meals starting with the letter
 */
export const getMealsByFirstLetter = async (letter) => {
  try {
    const response = await fetch(`${BASE_URL}/search.php?f=${letter.charAt(0)}`);
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error('Error getting meals by first letter:', error);
    throw error;
  }
};

/**
 * Get meal details by ID
 * @param {string} id - Meal ID
 * @returns {Promise<Object>} - Meal details
 */
export const getMealById = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
    const data = await response.json();
    return data.meals ? data.meals[0] : null;
  } catch (error) {
    console.error('Error getting meal by ID:', error);
    throw error;
  }
};

/**
 * Get a random meal
 * @returns {Promise<Object>} - Random meal
 */
export const getRandomMeal = async () => {
  try {
    const response = await fetch(`${BASE_URL}/random.php`);
    const data = await response.json();
    return data.meals ? data.meals[0] : null;
  } catch (error) {
    console.error('Error getting random meal:', error);
    throw error;
  }
};

/**
 * Get all meal categories
 * @returns {Promise<Array>} - List of meal categories
 */
export const getAllCategories = async () => {
  try {
    const response = await fetch(`${BASE_URL}/categories.php`);
    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error('Error getting all categories:', error);
    throw error;
  }
};

/**
 * Get list of all meal categories (names only)
 * @returns {Promise<Array>} - List of category names
 */
export const getCategoryList = async () => {
  try {
    const response = await fetch(`${BASE_URL}/list.php?c=list`);
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error('Error getting category list:', error);
    throw error;
  }
};

/**
 * Get list of all areas (countries)
 * @returns {Promise<Array>} - List of areas
 */
export const getAreaList = async () => {
  try {
    const response = await fetch(`${BASE_URL}/list.php?a=list`);
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error('Error getting area list:', error);
    throw error;
  }
};

/**
 * Get list of all ingredients
 * @returns {Promise<Array>} - List of ingredients
 */
export const getIngredientList = async () => {
  try {
    const response = await fetch(`${BASE_URL}/list.php?i=list`);
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error('Error getting ingredient list:', error);
    throw error;
  }
};

/**
 * Filter meals by main ingredient
 * @param {string} ingredient - Ingredient to filter by
 * @returns {Promise<Array>} - List of meals containing the ingredient
 */
export const filterByIngredient = async (ingredient) => {
  try {
    const response = await fetch(`${BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`);
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error('Error filtering by ingredient:', error);
    throw error;
  }
};

/**
 * Filter meals by category
 * @param {string} category - Category to filter by
 * @returns {Promise<Array>} - List of meals in the category
 */
export const filterByCategory = async (category) => {
  try {
    const response = await fetch(`${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`);
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error('Error filtering by category:', error);
    throw error;
  }
};

/**
 * Filter meals by area (country)
 * @param {string} area - Area to filter by
 * @returns {Promise<Array>} - List of meals from the area
 */
export const filterByArea = async (area) => {
  try {
    const response = await fetch(`${BASE_URL}/filter.php?a=${encodeURIComponent(area)}`);
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error('Error filtering by area:', error);
    throw error;
  }
};

/**
 * Get ingredient image URL
 * @param {string} ingredient - Ingredient name
 * @param {string} size - Image size (small, medium, large)
 * @returns {string} - Image URL
 */
export const getIngredientImageUrl = (ingredient, size = '') => {
  const baseUrl = 'https://www.themealdb.com/images/ingredients';
  const formattedIngredient = ingredient.replace(/ /g, '_');
  
  if (size) {
    return `${baseUrl}/${formattedIngredient}-${size}.png`;
  }
  
  return `${baseUrl}/${formattedIngredient}.png`;
}; 