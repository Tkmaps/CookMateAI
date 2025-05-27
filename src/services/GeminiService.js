// src/services/GeminiService.js
// This file will now act as an intermediary to the AI Assistant Backend

const AI_ASSISTANT_BASE_URL = 'http://localhost:3000/api'; // Placeholder: Update with your AI Assistant Backend URL

/**
 * Service to handle chat interactions with the AI Assistant Backend
 */
export const chatWithGemini = async (prompt, history = []) => {
  try {
    const response = await fetch(`${AI_ASSISTANT_BASE_URL}/coach/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, history }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to chat with AI Assistant');
    }

    const data = await response.json();
    return {
      text: data.response,
      history: data.history || [...history, { role: 'user', parts: [{ text: prompt }] }, { role: 'model', parts: [{ text: data.response }] }]
    };
  } catch (error) {
    console.error('Error chatting with AI Assistant:', error);
    return {
      text: "I'm sorry, I encountered an error processing your request. Please try again.",
      history: history
    };
  }
};

/**
 * Service to handle recipe-focused chat with cooking context via AI Assistant Backend
 */
export const askCookingQuestion = async (question) => {
  try {
    const response = await fetch(`${AI_ASSISTANT_BASE_URL}/coach/cooking-question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to ask cooking question to AI Assistant');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error asking cooking question:', error);
    return "I'm sorry, I encountered an error processing your cooking question. Please try again.";
  }
};

/**
 * Service to generate recipes based on ingredients via AI Assistant Backend
 */
export const generateRecipesFromIngredients = async (ingredients) => {
  try {
    const response = await fetch(`${AI_ASSISTANT_BASE_URL}/coach/generate-recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ingredients }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate recipes with AI Assistant');
    }

    const data = await response.json();
    return data.recipes;
  } catch (error) {
    console.error('Error generating recipes:', error);
    return [];
  }
};

/**
 * Utility function to prepare a system prompt for the AI Assistant (if needed by backend)
 */
export const createCookingAssistantPrompt = () => {
  // This prompt might be handled by the backend, but keeping it for consistency or future client-side use
  return `You are CookMate AI, a helpful cooking assistant in a recipe app.
  Your expertise is in recipes, cooking techniques, ingredient substitutions, and meal planning.
  Keep responses focused on cooking, food, and nutrition.
  If asked about non-cooking topics, gently redirect the conversation back to food-related topics.
  Be concise, practical, and friendly.`;
};

/**
 * Format chat history for AI Assistant Backend (if needed)
 */
export const formatChatHistory = (messages) => {
  // The backend might expect a different format, adjust as necessary
  return messages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    content: msg.message // Assuming backend expects 'content' instead of 'parts'
  }));
};