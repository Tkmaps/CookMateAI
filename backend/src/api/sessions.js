const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { CookingSession, CoachingInteraction, UserProgress } = require('../models');
const { AppError, catchAsync } = require('../middleware/errorHandler');
const { protect } = require('../middleware/auth');
const { SessionManager } = require('../config/redis');

const router = express.Router();
const sessionManager = new SessionManager();

// Protect all routes
router.use(protect);

// Validation rules
const startSessionValidation = [
  body('recipeId').isUUID().withMessage('Recipe ID must be a valid UUID'),
  body('recipeName').notEmpty().withMessage('Recipe name is required'),
  body('totalSteps').isInt({ min: 1 }).withMessage('Total steps must be a positive integer')
];

const updateSessionValidation = [
  param('id').isUUID().withMessage('Session ID must be a valid UUID'),
  body('currentStep').optional().isInt({ min: 0 }).withMessage('Current step must be a non-negative integer'),
  body('status').optional().isIn(['active', 'paused', 'completed', 'abandoned']).withMessage('Invalid status')
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

// Start a new cooking session
router.post('/start', startSessionValidation, checkValidation, catchAsync(async (req, res, next) => {
  const { recipeId, recipeName, totalSteps, context } = req.body;
  const userId = req.user.id;

  // Create session in database
  const session = await CookingSession.create({
    userId,
    recipeId,
    recipeName,
    totalSteps,
    context: {
      skillLevel: req.user.skillLevel,
      pace: 'normal',
      questionsAsked: [],
      tipsProvided: [],
      timersUsed: [],
      adaptations: [],
      ...context
    }
  });

  // Store session in Redis for quick access
  await sessionManager.setSession(session.id, {
    sessionId: session.id,
    userId,
    recipeId,
    recipeName,
    currentStep: 0,
    totalSteps,
    startTime: new Date().toISOString(),
    context: session.context,
    timers: []
  });

  // Emit session started event via Socket.IO
  const io = req.app.get('io');
  io.to(`session:${session.id}`).emit('session_started', {
    sessionId: session.id,
    recipeName,
    totalSteps
  });

  res.status(201).json({
    status: 'success',
    data: {
      session
    }
  });
}));

// Get session details
router.get('/:id', catchAsync(async (req, res, next) => {
  const sessionId = req.params.id;
  const userId = req.user.id;

  // Get from Redis first (faster)
  let sessionData = await sessionManager.getSession(sessionId);
  
  if (!sessionData) {
    // Fallback to database
    const session = await CookingSession.findOne({
      where: { id: sessionId, userId },
      include: [
        {
          model: CoachingInteraction,
          as: 'interactions',
          order: [['timestamp', 'ASC']]
        }
      ]
    });

    if (!session) {
      return next(new AppError('Session not found', 404));
    }

    sessionData = session;
  }

  res.status(200).json({
    status: 'success',
    data: {
      session: sessionData
    }
  });
}));

// Update session
router.put('/:id/update', updateSessionValidation, checkValidation, catchAsync(async (req, res, next) => {
  const sessionId = req.params.id;
  const userId = req.user.id;
  const updates = req.body;

  // Update in database
  const session = await CookingSession.findOne({
    where: { id: sessionId, userId }
  });

  if (!session) {
    return next(new AppError('Session not found', 404));
  }

  // Update session
  await session.update(updates);

  // Update in Redis
  await sessionManager.updateSession(sessionId, updates);

  // Emit session updated event
  const io = req.app.get('io');
  io.to(`session:${sessionId}`).emit('session_updated', {
    sessionId,
    updates
  });

  res.status(200).json({
    status: 'success',
    data: {
      session
    }
  });
}));

// End session
router.delete('/:id/end', catchAsync(async (req, res, next) => {
  const sessionId = req.params.id;
  const userId = req.user.id;
  const { feedback } = req.body;

  // Get session from database
  const session = await CookingSession.findOne({
    where: { id: sessionId, userId }
  });

  if (!session) {
    return next(new AppError('Session not found', 404));
  }

  // Calculate duration and update session
  const completedAt = new Date();
  const duration = Math.floor((completedAt - session.startedAt) / 1000);

  await session.update({
    status: 'completed',
    completedAt,
    duration,
    feedback: feedback || {}
  });

  // Update user progress
  let userProgress = await UserProgress.findOne({
    where: { userId, recipeId: session.recipeId }
  });

  if (!userProgress) {
    userProgress = await UserProgress.create({
      userId,
      recipeId: session.recipeId,
      recipeName: session.recipeName
    });
  }

  userProgress.updateProgress({
    duration,
    feedback: feedback || {}
  });
  await userProgress.save();

  // Clean up Redis session
  await sessionManager.deleteSession(sessionId);

  // Emit session ended event
  const io = req.app.get('io');
  io.to(`session:${sessionId}`).emit('session_ended', {
    sessionId,
    duration,
    feedback
  });

  res.status(200).json({
    status: 'success',
    data: {
      session,
      progress: userProgress
    }
  });
}));

// Get user's active sessions
router.get('/user/active', catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const activeSessions = await CookingSession.findAll({
    where: {
      userId,
      status: ['active', 'paused']
    },
    order: [['startedAt', 'DESC']]
  });

  res.status(200).json({
    status: 'success',
    results: activeSessions.length,
    data: {
      sessions: activeSessions
    }
  });
}));

// Get session history
router.get('/user/history', catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const { count, rows: sessions } = await CookingSession.findAndCountAll({
    where: { userId },
    order: [['startedAt', 'DESC']],
    limit,
    offset
  });

  res.status(200).json({
    status: 'success',
    results: sessions.length,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    data: {
      sessions
    }
  });
}));

module.exports = router;