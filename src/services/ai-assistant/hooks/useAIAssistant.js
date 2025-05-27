import { useState, useCallback } from 'react';
import { useAIContext } from '../context/AIContext';

export function useAIAssistant() {
  const { aiService, setLoading, setError } = useAIContext();
  const [response, setResponse] = useState('');

  const generateResponse = useCallback(async (prompt) => {
    try {
      setLoading(true);
      setError(null);
      const result = await aiService.generateResponse(prompt);
      setResponse(result);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [aiService, setLoading, setError]);

  const generateRecipeFromImage = useCallback(async (imageData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await aiService.generateRecipeFromImage(imageData);
      setResponse(result);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [aiService, setLoading, setError]);

  return {
    response,
    generateResponse,
    generateRecipeFromImage,
  };
}
