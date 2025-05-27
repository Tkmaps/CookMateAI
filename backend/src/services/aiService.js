const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const { aiConfig } = require('../config');
const { AppError } = require('../middleware/errorHandler');

class AIService {
  constructor() {
    this.geminiClient = null;
    this.groqClient = null;
    this.currentProvider = 'gemini';
    
    this.initializeClients();
  }

  initializeClients() {
    // Initialize Gemini
    if (aiConfig.gemini.apiKey) {
      this.geminiClient = new GoogleGenerativeAI(aiConfig.gemini.apiKey);
    }

    // Initialize Groq as fallback
    if (aiConfig.groq.apiKey) {
      this.groqClient = new Groq({
        apiKey: aiConfig.groq.apiKey
      });
    }

    // Set current provider based on availability
    if (this.geminiClient) {
      this.currentProvider = 'gemini';
    } else if (this.groqClient) {
      this.currentProvider = 'groq';
    } else {
      throw new Error('No AI provider configured. Please set GEMINI_API_KEY or GROQ_API_KEY');
    }
  }

  async generateResponse(prompt, context = {}) {
    try {
      if (this.currentProvider === 'gemini' && this.geminiClient) {
        return await this.generateGeminiResponse(prompt, context);
      } else if (this.currentProvider === 'groq' && this.groqClient) {
        return await this.generateGroqResponse(prompt, context);
      } else {
        throw new Error('No AI provider available');
      }
    } catch (error) {
      // Fallback to alternative provider
      if (this.currentProvider === 'gemini' && this.groqClient) {
        console.warn('Gemini failed, falling back to Groq:', error.message);
        return await this.generateGroqResponse(prompt, context);
      } else if (this.currentProvider === 'groq' && this.geminiClient) {
        console.warn('Groq failed, falling back to Gemini:', error.message);
        return await this.generateGeminiResponse(prompt, context);
      }
      throw error;
    }
  }

  async generateGeminiResponse(prompt, context) {
    const model = this.geminiClient.getGenerativeModel({ 
      model: aiConfig.gemini.model 
    });

    const enhancedPrompt = this.buildContextualPrompt(prompt, context);
    
    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    
    return {
      text: response.text(),
      provider: 'gemini',
      usage: {
        promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
        completionTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: result.response.usageMetadata?.totalTokenCount || 0
      }
    };
  }

  async generateGroqResponse(prompt, context) {
    const enhancedPrompt = this.buildContextualPrompt(prompt, context);
    
    const completion = await this.groqClient.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: this.getSystemPrompt(context)
        },
        {
          role: 'user',
          content: enhancedPrompt
        }
      ],
      model: aiConfig.groq.model,
      temperature: 0.7,
      max_tokens: 1000
    });

    return {
      text: completion.choices[0].message.content,
      provider: 'groq',
      usage: {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens
      }
    };
  }

  buildContextualPrompt(prompt, context) {
    const {
      sessionId,
      userId,
      recipeId,
      recipeName,
      currentStep,
      totalSteps,
      skillLevel,
      userHistory,
      interactionType
    } = context;

    let contextualPrompt = `
Context:
- Recipe: ${recipeName || 'Unknown'}
- Current Step: ${currentStep || 0} of ${totalSteps || 0}
- User Skill Level: ${skillLevel || 'beginner'}
- Interaction Type: ${interactionType || 'general'}

User Input: ${prompt}

Please provide a helpful, encouraging response as a cooking coach.`;

    if (userHistory && userHistory.length > 0) {
      contextualPrompt += `\n\nRecent Conversation:\n${userHistory.slice(-3).map(h => 
        `User: ${h.userInput}\nCoach: ${h.coachResponse}`
      ).join('\n')}`;
    }

    return contextualPrompt;
  }

  getSystemPrompt(context) {
    const { skillLevel = 'beginner', interactionType = 'general' } = context;
    
    return `You are CookMate AI Coach, an expert cooking assistant. Your role is to:

1. Guide users through recipes step-by-step with clear, encouraging instructions
2. Adapt your communication style to the user's skill level (${skillLevel})
3. Provide helpful tips and troubleshooting advice
4. Answer cooking questions with practical, actionable advice
5. Maintain a supportive, patient, and enthusiastic tone

Guidelines:
- Keep responses concise but informative
- Use simple language for beginners, more technical terms for experts
- Always prioritize food safety
- Encourage users and celebrate their progress
- Provide alternatives when possible
- Ask clarifying questions when needed

Current interaction type: ${interactionType}`;
  }

  async generateStepGuidance(step, context) {
    const prompt = `Please provide step-by-step guidance for: "${step.instruction}"
    
Additional context:
- Ingredients needed: ${step.ingredients?.join(', ') || 'Not specified'}
- Estimated time: ${step.estimatedTime || 'Not specified'}
- Difficulty: ${step.difficulty || 'Not specified'}`;

    return await this.generateResponse(prompt, {
      ...context,
      interactionType: 'step_guidance'
    });
  }

  async generateTip(context) {
    const { currentStep, recipeName, skillLevel } = context;
    
    const prompt = `Provide a helpful cooking tip for step ${currentStep} of ${recipeName}. 
    Make it appropriate for a ${skillLevel} cook.`;

    return await this.generateResponse(prompt, {
      ...context,
      interactionType: 'tip_suggestion'
    });
  }

  async handleQuestion(question, context) {
    const prompt = `User question: "${question}"
    
Please provide a helpful answer related to cooking this recipe.`;

    return await this.generateResponse(prompt, {
      ...context,
      interactionType: 'question_answer'
    });
  }

  async provideTroubleshooting(issue, context) {
    const prompt = `The user is experiencing this cooking issue: "${issue}"
    
Please provide troubleshooting advice and solutions.`;

    return await this.generateResponse(prompt, {
      ...context,
      interactionType: 'troubleshooting'
    });
  }

  async generateEncouragement(context) {
    const { currentStep, totalSteps, recipeName } = context;
    const progress = Math.round((currentStep / totalSteps) * 100);
    
    const prompt = `Generate encouraging words for a user who is ${progress}% through cooking ${recipeName}. 
    Keep it brief and motivating.`;

    return await this.generateResponse(prompt, {
      ...context,
      interactionType: 'encouragement'
    });
  }

  async suggestSubstitution(ingredient, context) {
    const prompt = `The user needs a substitution for: "${ingredient}"
    
Please suggest appropriate alternatives and how to use them.`;

    return await this.generateResponse(prompt, {
      ...context,
      interactionType: 'substitution_help'
    });
  }
}

module.exports = new AIService();