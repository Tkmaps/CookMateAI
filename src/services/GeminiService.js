import { GoogleGenerativeAI } from '@google/generative-ai';

// Replace with your actual API key from Google AI Studio
const API_KEY = 'YOUR_GEMINI_API_KEY';
const genAI = new GoogleGenerativeAI(API_KEY);

// Model names
const TEXT_MODEL = 'gemini-2.0-flash';
const LIVE_MODEL = 'gemini-2.0-flash-live-001';

/**
 * Service to handle chat interactions with Gemini
 */
export const chatWithGemini = async (prompt, history = []) => {
  try {
    // For safer implementation, get the model
    const model = genAI.getGenerativeModel({ model: TEXT_MODEL });
    
    // Start a chat session
    const chat = model.startChat({
      history: history,
      generationConfig: {
        temperature: 0.5,
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });
    
    // Send message and get response
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    
    return {
      text: response.text(),
      history: [...history, { role: 'user', parts: [{ text: prompt }] }, { role: 'model', parts: [{ text: response.text() }] }]
    };
  } catch (error) {
    console.error('Error chatting with Gemini:', error);
    return {
      text: "I'm sorry, I encountered an error processing your request. Please try again.",
      history: history
    };
  }
};

/**
 * Service to handle recipe-focused chat with cooking context
 */
export const askCookingQuestion = async (question) => {
  try {
    const model = genAI.getGenerativeModel({ model: TEXT_MODEL });
    
    // Add cooking context
    const prompt = `As a cooking assistant for the CookMate AI app, please answer the following question about cooking, recipes, ingredients, or food preparation: ${question}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return response.text();
  } catch (error) {
    console.error('Error asking cooking question:', error);
    return "I'm sorry, I encountered an error processing your cooking question. Please try again.";
  }
};

/**
 * Service to generate recipes based on ingredients
 */
export const generateRecipesFromIngredients = async (ingredients) => {
  try {
    const model = genAI.getGenerativeModel({ model: TEXT_MODEL });
    
    // Format ingredients list
    const ingredientsList = ingredients.map(i => i.name).join(', ');
    
    // Create prompt for recipe generation
    const prompt = `Generate 5 creative and detailed recipes using some or all of the following ingredients: ${ingredientsList}. 
    
    For each recipe, provide:
    1. A creative title
    2. A list of all ingredients with measurements
    3. Step by step cooking instructions
    4. Estimated cooking time
    5. Cuisine type
    
    Format as JSON with the following structure:
    [
      {
        "title": "Recipe Title",
        "ingredients": ["1 cup ingredient1", "2 tbsp ingredient2", ...],
        "instructions": ["Step 1: Do this", "Step 2: Do that", ...],
        "cookingTime": "30 minutes",
        "cuisine": "Italian"
      },
      ...
    ]`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Parse JSON response
    try {
      return JSON.parse(response.text());
    } catch (jsonError) {
      console.error('Error parsing JSON from Gemini:', jsonError);
      return [];
    }
  } catch (error) {
    console.error('Error generating recipes:', error);
    return [];
  }
};

/**
 * Utility function to prepare a system prompt for Gemini
 */
export const createCookingAssistantPrompt = () => {
  return `You are CookMate AI, a helpful cooking assistant in a recipe app. 
  Your expertise is in recipes, cooking techniques, ingredient substitutions, and meal planning. 
  Keep responses focused on cooking, food, and nutrition. 
  If asked about non-cooking topics, gently redirect the conversation back to food-related topics.
  Be concise, practical, and friendly.`;
};

/**
 * Format chat history for Gemini API
 */
export const formatChatHistory = (messages) => {
  return messages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.message }]
  }));
}; 