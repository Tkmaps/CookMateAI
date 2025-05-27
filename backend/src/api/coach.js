const express = require('express');
const { body, param, validationResult } = require('express-validator');
const aiService = require('../services/aiService');
const { CookingSession, CoachingInteraction } = require('../models');
const { AppError, catchAsync } = require('../middleware/errorHandler');
const { protect } = require('../middleware/auth');
const { coachRateLimiter } = require('../middleware/rateLimiter');
const { coachingLogger } = require('../middleware/logger');
const { SessionManager } = require('../config/redis');

const router = express.Router();
const sessionManager = new SessionManager();

// Apply middleware
router.use(protect);
router.use(coachRateLimiter);

// Validation rules
const askValidation = [
  body('sessionId').isUUID().withMessage('Session ID must be a valid UUID'),
  body('question').notEmpty().withMessage('Question is required'),
  body('context').optional().isObject().withMessage('Context must be an object')
];

const stepGuidanceValidation = [
  body('sessionId').isUUID().withMessage('Session ID must be a valid UUID'),
  body('stepNumber').isInt({ min: 1 }).withMessage('Step number must be a positive integer'),
  body('stepData').optional().isObject().withMessage('Step data must be an object')
];

const feedbackValidation = [
  body('sessionId').isUUID().withMessage('Session ID must be a valid UUID'),
  body('interactionId').isUUID().withMessage('Interaction ID must be a valid UUID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('feedback').optional().isString().withMessage('Feedback must be a string')
];

// Check validation results
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Ask the AI coach a question
router.post('/ask', askValidation, checkValidation, catchAsync(async (req, res, next) => {
  const { sessionId, question, context = {} } = req.body;
  const userId = req.user.id;
  const startTime = Date.now();

  // Get session context
  const sessionData = await sessionManager.getSession(sessionId);
  if (!sessionData) {
    return next(new AppError('Session not found', 404));
  }

  // Verify session belongs to user
  if (sessionData.userId !== userId) {
    return next(new AppError('Unauthorized access to session', 403));
  }

  try {
    // Get recent interaction history for context
    const recentInteractions = await CoachingInteraction.findAll({
      where: { sessionId },
      order: [['timestamp', 'DESC']],
      limit: 5
    });

    // Prepare context for AI
    const aiContext = {
      sessionId,
      userId,
      recipeId: sessionData.recipeId,
      recipeName: sessionData.recipeName,
      currentStep: sessionData.currentStep,
      totalSteps: sessionData.totalSteps,
      skillLevel: sessionData.context?.skillLevel || req.user.skillLevel,
      userHistory: recentInteractions.map(i => ({
        userInput: i.userInput,
        coachResponse: i.coachResponse
      })),
      ...context
    };

    // Generate AI response
    const aiResponse = await aiService.handleQuestion(question, aiContext);
    const responseTime = Date.now() - startTime;

    // Save interaction to database
    const interaction = await CoachingInteraction.create({
      sessionId,
      userInput: question,
      coachResponse: aiResponse.text,
      interactionType: 'question_answer',
      context: {
        currentStep: sessionData.currentStep,
        recipeSection: context.recipeSection,
        userEmotion: context.userEmotion,
        confidence: context.confidence,
        adaptationMade: false
      },
      responseTime
    });

    // Update session context
    await sessionManager.updateSession(sessionId, {
      context: {
        ...sessionData.context,
        lastInteraction: new Date().toISOString(),
        questionsAsked: [...(sessionData.context?.questionsAsked || []), question]
      }
    });

    // Log the interaction
    coachingLogger({
      sessionId,
      userId,
      type: 'question_answer',
      responseTime,
      adaptationMade: false
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`session:${sessionId}`).emit('coach_response', {
      interactionId: interaction.id,
      question,
      response: aiResponse.text,
      type: 'question_answer'
    });

    res.status(200).json({
      status: 'success',
      data: {
        interaction: {
          id: interaction.id,
          question,
          response: aiResponse.text,
          responseTime,
          provider: aiResponse.provider,
          usage: aiResponse.usage
        }
      }
    });
  } catch (error) {
    coachingLogger({
      sessionId,
      userId,
      type: 'question_answer',
      responseTime: Date.now() - startTime,
      adaptationMade: false
    });
    throw error;
  }
}));

// Get step-by-step guidance
router.post('/step-guidance', stepGuidanceValidation, checkValidation, catchAsync(async (req, res, next) => {
  const { sessionId, stepNumber, stepData = {} } = req.body;
  const userId = req.user.id;
  const startTime = Date.now();

  // Get session context
  const sessionData = await sessionManager.getSession(sessionId);
  if (!sessionData || sessionData.userId !== userId) {
    return next(new AppError('Session not found or unauthorized', 404));
  }

  try {
    // Prepare context for AI
    const aiContext = {
      sessionId,
      userId,
      recipeId: sessionData.recipeId,
      recipeName: sessionData.recipeName,
      currentStep: stepNumber,
      totalSteps: sessionData.totalSteps,
      skillLevel: sessionData.context?.skillLevel || req.user.skillLevel
    };

    // Generate step guidance
    const aiResponse = await aiService.generateStepGuidance(stepData, aiContext);
    const responseTime = Date.now() - startTime;

    // Save interaction
    const interaction = await CoachingInteraction.create({
      sessionId,
      userInput: `Step ${stepNumber} guidance requested`,
      coachResponse: aiResponse.text,
      interactionType: 'step_guidance',
      context: {
        currentStep: stepNumber,
        stepData,
        adaptationMade: false
      },
      responseTime
    });

    // Update session current step
    await sessionManager.updateSession(sessionId, {
      currentStep: stepNumber,
      context: {
        ...sessionData.context,
        lastInteraction: new Date().toISOString()
      }
    });

    // Log the interaction
    coachingLogger({
      sessionId,
      userId,
      type: 'step_guidance',
      responseTime,
      adaptationMade: false
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`session:${sessionId}`).emit('step_guidance', {
      stepNumber,
      guidance: aiResponse.text,
      interactionId: interaction.id
    });

    res.status(200).json({
      status: 'success',
      data: {
        stepNumber,
        guidance: aiResponse.text,
        interactionId: interaction.id,
        responseTime,
        provider: aiResponse.provider
      }
    });
  } catch (error) {
    coachingLogger({
      sessionId,
      userId,
      type: 'step_guidance',
      responseTime: Date.now() - startTime,
      adaptationMade: false
    });
    throw error;
  }
}));

// Get contextual tips
router.get('/tips/:sessionId', catchAsync(async (req, res, next) => {
  const { sessionId } = req.params;
  const userId = req.user.id;

  // Get session context
  const sessionData = await sessionManager.getSession(sessionId);
  if (!sessionData || sessionData.userId !== userId) {
    return next(new AppError('Session not found or unauthorized', 404));
  }

  try {
    // Generate contextual tip
    const aiContext = {
      sessionId,
      userId,
      recipeId: sessionData.recipeId,
      recipeName: sessionData.recipeName,
      currentStep: sessionData.currentStep,
      totalSteps: sessionData.totalSteps,
      skillLevel: sessionData.context?.skillLevel || req.user.skillLevel
    };

    const aiResponse = await aiService.generateTip(aiContext);

    // Save interaction
    const interaction = await CoachingInteraction.create({
      sessionId,
      userInput: 'Tip requested',
      coachResponse: aiResponse.text,
      interactionType: 'tip_suggestion',
      context: {
        currentStep: sessionData.currentStep,
        adaptationMade: false
      }
    });

    // Update session context
    await sessionManager.updateSession(sessionId, {
      context: {
        ...sessionData.context,
        tipsProvided: [...(sessionData.context?.tipsProvided || []), aiResponse.text]
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        tip: aiResponse.text,
        interactionId: interaction.id,
        provider: aiResponse.provider
      }
    });
  } catch (error) {
    throw error;
  }
}));

// Handle troubleshooting
router.post('/troubleshoot', catchAsync(async (req, res, next) => {
  const { sessionId, issue, context = {} } = req.body;
  const userId = req.user.id;
  const startTime = Date.now();

  // Get session context
  const sessionData = await sessionManager.getSession(sessionId);
  if (!sessionData || sessionData.userId !== userId) {
    return next(new AppError('Session not found or unauthorized', 404));
  }

  try {
    // Prepare context for AI
    const aiContext = {
      sessionId,
      userId,
      recipeId: sessionData.recipeId,
      recipeName: sessionData.recipeName,
      currentStep: sessionData.currentStep,
      totalSteps: sessionData.totalSteps,
      skillLevel: sessionData.context?.skillLevel || req.user.skillLevel,
      ...context
    };

    // Generate troubleshooting advice
    const aiResponse = await aiService.provideTroubleshooting(issue, aiContext);
    const responseTime = Date.now() - startTime;

    // Save interaction
    const interaction = await CoachingInteraction.create({
      sessionId,
      userInput: `Troubleshooting: ${issue}`,
      coachResponse: aiResponse.text,
      interactionType: 'troubleshooting',
      context: {
        currentStep: sessionData.currentStep,
        issue,
        adaptationMade: true
      },
      responseTime
    });

    // Log the interaction
    coachingLogger({
      sessionId,
      userId,
      type: 'troubleshooting',
      responseTime,
      adaptationMade: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        advice: aiResponse.text,
        interactionId: interaction.id,
        responseTime,
        provider: aiResponse.provider
      }
    });
  } catch (error) {
    throw error;
  }
}));

// Get ingredient substitution suggestions
router.post('/substitute', catchAsync(async (req, res, next) => {
  const { sessionId, ingredient, context = {} } = req.body;
  const userId = req.user.id;

  // Get session context
  const sessionData = await sessionManager.getSession(sessionId);
  if (!sessionData || sessionData.userId !== userId) {
    return next(new AppError('Session not found or unauthorized', 404));
  }

  try {
    // Prepare context for AI
    const aiContext = {
      sessionId,
      userId,
      recipeId: sessionData.recipeId,
      recipeName: sessionData.recipeName,
      currentStep: sessionData.currentStep,
      skillLevel: sessionData.context?.skillLevel || req.user.skillLevel,
      ...context
    };

    // Generate substitution suggestions
    const aiResponse = await aiService.suggestSubstitution(ingredient, aiContext);

    // Save interaction
    const interaction = await CoachingInteraction.create({
      sessionId,
      userInput: `Substitution for: ${ingredient}`,
      coachResponse: aiResponse.text,
      interactionType: 'substitution_help',
      context: {
        currentStep: sessionData.currentStep,
        ingredient,
        adaptationMade: true
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        substitutions: aiResponse.text,
        interactionId: interaction.id,
        provider: aiResponse.provider
      }
    });
  } catch (error) {
    throw error;
  }
}));

// Provide feedback on coaching interaction
router.post('/feedback', feedbackValidation, checkValidation, catchAsync(async (req, res, next) => {
  const { sessionId, interactionId, rating, feedback } = req.body;
  const userId = req.user.id;

  // Verify session belongs to user
  const sessionData = await sessionManager.getSession(sessionId);
  if (!sessionData || sessionData.userId !== userId) {
    return next(new AppError('Session not found or unauthorized', 404));
  }

  // Update interaction with feedback
  const interaction = await CoachingInteraction.findOne({
    where: { id: interactionId, sessionId }
  });

  if (!interaction) {
    return next(new AppError('Interaction not found', 404));
  }

  await interaction.update({
    userSatisfaction: rating,
    context: {
      ...interaction.context,
      userFeedback: feedback
    }
  });

  res.status(200).json({
    status: 'success',
    message: 'Feedback recorded successfully'
  });
}));

// Get coaching analytics for session
router.get('/analytics/:sessionId', catchAsync(async (req, res, next) => {
  const { sessionId } = req.params;
  const userId = req.user.id;

  // Verify session belongs to user
  const sessionData = await sessionManager.getSession(sessionId);
  if (!sessionData || sessionData.userId !== userId) {
    return next(new AppError('Session not found or unauthorized', 404));
  }

  // Get interaction analytics
  const interactions = await CoachingInteraction.findAll({
    where: { sessionId },
    order: [['timestamp', 'ASC']]
  });

  const analytics = {
    totalInteractions: interactions.length,
    interactionTypes: {},
    averageResponseTime: 0,
    averageSatisfaction: 0,
    adaptationsMade: 0
  };

  let totalResponseTime = 0;
  let totalSatisfaction = 0;
  let satisfactionCount = 0;

  interactions.forEach(interaction => {
    // Count interaction types
    analytics.interactionTypes[interaction.interactionType] = 
      (analytics.interactionTypes[interaction.interactionType] || 0) + 1;

    // Calculate averages
    if (interaction.responseTime) {
      totalResponseTime += interaction.responseTime;
    }

    if (interaction.userSatisfaction) {
      totalSatisfaction += interaction.userSatisfaction;
      satisfactionCount++;
    }

    if (interaction.context?.adaptationMade) {
      analytics.adaptationsMade++;
    }
  });

  analytics.averageResponseTime = interactions.length > 0 ? 
    Math.round(totalResponseTime / interactions.length) : 0;
  analytics.averageSatisfaction = satisfactionCount > 0 ? 
    (totalSatisfaction / satisfactionCount).toFixed(1) : 0;

  res.status(200).json({
    status: 'success',
    data: {
      analytics,
      interactions: interactions.map(i => ({
        id: i.id,
        type: i.interactionType,
        timestamp: i.timestamp,
        responseTime: i.responseTime,
        satisfaction: i.userSatisfaction
      }))
    }
  });
}));

module.exports = router;