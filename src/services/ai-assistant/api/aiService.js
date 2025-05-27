import axios from 'axios';

class AIService {
  constructor() {
    this.baseURL = process.env.AI_SERVICE_URL;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  async generateResponse(prompt, context = {}) {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat`,
        {
          prompt,
          context,
          model: 'claude-3-sonnet',
        },
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error in AI response generation:', error);
      throw error;
    }
  }

  async generateRecipeFromImage(imageData) {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageData.uri,
        type: 'image/jpeg',
        name: 'recipe_image.jpg',
      });
      
      const response = await axios.post(
        `${this.baseURL}/analyze-recipe-image`,
        formData,
        {
          headers: {
            ...this.headers,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error analyzing recipe image:', error);
      throw error;
    }
  }

  async generateRecipeFromIngredients(ingredients) {
    try {
      const response = await axios.post(
        `${this.baseURL}/generate-recipe`,
        {
          ingredients,
          model: 'claude-3-sonnet',
        },
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating recipe:', error);
      throw error;
    }
  }

  async getRecipeRecommendations(preferences) {
    try {
      const response = await axios.post(
        `${this.baseURL}/recipe-recommendations`,
        {
          preferences,
          model: 'claude-3-sonnet',
        },
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting recipe recommendations:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();
