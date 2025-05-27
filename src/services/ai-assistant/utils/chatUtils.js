export const MESSAGE_TYPES = {
  USER: 'user',
  ASSISTANT: 'assistant',
};

export const formatChatMessage = (content, type) => {
  return {
    id: Date.now().toString(),
    content,
    type,
    timestamp: new Date().toISOString(),
  };
};

export const processRecipeResponse = (response) => {
  try {
    // Add any recipe-specific processing here
    return {
      title: response.title || '',
      ingredients: response.ingredients || [],
      instructions: response.instructions || [],
      cookingTime: response.cookingTime || '',
      servings: response.servings || '',
    };
  } catch (error) {
    console.error('Error processing recipe response:', error);
    return null;
  }
};

export const validateMessage = (message) => {
  return message && message.trim().length > 0;
};
