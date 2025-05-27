import { useState, useCallback } from 'react';
import { useAIContext } from '../context/AIContext';
import { processRecipeResponse } from '../utils/chatUtils';

export function useRecipeAI() {
  const { aiService, setLoading, setError } = useAIContext();
  const [recipe, setRecipe] = useState(null);

  const generateRecipeFromImage = useCallback(async (imageData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await aiService.generateRecipeFromImage(imageData);
      const processedRecipe = processRecipeResponse(result);
      setRecipe(processedRecipe);
      return processedRecipe;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [aiService, setLoading, setError]);

  const generateRecipeFromIngredients = useCallback(async (ingredients) => {
    try {
      setLoading(true);
      setError(null);
      const result = await aiService.generateRecipeFromIngredients(ingredients);
      const processedRecipe = processRecipeResponse(result);
      setRecipe(processedRecipe);
      return processedRecipe;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [aiService, setLoading, setError]);

  const getRecipeRecommendations = useCallback(async (preferences) => {
    try {
      setLoading(true);
      setError(null);
      const recommendations = await aiService.getRecipeRecommendations(preferences);
      return recommendations;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [aiService, setLoading, setError]);

  return {
    recipe,
    generateRecipeFromImage,
    generateRecipeFromIngredients,
    getRecipeRecommendations,
  };
}
