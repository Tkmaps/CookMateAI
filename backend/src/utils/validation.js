const { body, param, query } = require('express-validator');

// Common validation rules
const commonValidations = {
  uuid: (field) => param(field).isUUID().withMessage(`${field} must be a valid UUID`),
  email: () => body('email').isEmail().withMessage('Please provide a valid email'),
  password: () => body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  name: () => body('name').notEmpty().withMessage('Name is required'),
  skillLevel: () => body('skillLevel')
    .optional()
    .isIn(['beginner', 'intermediate', 'expert'])
    .withMessage('Skill level must be beginner, intermediate, or expert'),
  pagination: () => [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ]
};

// Session validation rules
const sessionValidations = {
  startSession: [
    body('recipeId').isUUID().withMessage('Recipe ID must be a valid UUID'),
    body('recipeName').notEmpty().withMessage('Recipe name is required'),
    body('totalSteps').isInt({ min: 1 }).withMessage('Total steps must be a positive integer'),
    body('context').optional().isObject().withMessage('Context must be an object')
  ],
  updateSession: [
    commonValidations.uuid('id'),
    body('currentStep').optional().isInt({ min: 0 }).withMessage('Current step must be a non-negative integer'),
    body('status').optional().isIn(['active', 'paused', 'completed', 'abandoned']).withMessage('Invalid status'),
    body('context').optional().isObject().withMessage('Context must be an object')
  ]
};

// Voice validation rules
const voiceValidations = {
  transcribe: [
    body('sessionId').optional().isUUID().withMessage('Session ID must be a valid UUID'),
    body('language').optional().isIn(['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE']).withMessage('Unsupported language'),
    body('enableWordTimestamps').optional().isBoolean().withMessage('enableWordTimestamps must be boolean')
  ],
  synthesize: [
    body('text').notEmpty().withMessage('Text is required').isLength({ max: 5000 }).withMessage('Text too long'),
    body('voice').optional().isIn(['default', 'male', 'female', 'friendly']).withMessage('Invalid voice option'),
    body('speed').optional().isIn(['slow', 'normal', 'fast']).withMessage('Invalid speed option'),
    body('format').optional().isIn(['mp3', 'wav', 'ogg']).withMessage('Invalid audio format')
  ]
};

// Coaching validation rules
const coachingValidations = {
  ask: [
    body('sessionId').isUUID().withMessage('Session ID must be a valid UUID'),
    body('question').notEmpty().withMessage('Question is required').isLength({ max: 1000 }).withMessage('Question too long'),
    body('context').optional().isObject().withMessage('Context must be an object')
  ],
  stepGuidance: [
    body('sessionId').isUUID().withMessage('Session ID must be a valid UUID'),
    body('stepNumber').isInt({ min: 1 }).withMessage('Step number must be a positive integer'),
    body('stepData').optional().isObject().withMessage('Step data must be an object')
  ],
  feedback: [
    body('sessionId').isUUID().withMessage('Session ID must be a valid UUID'),
    body('interactionId').isUUID().withMessage('Interaction ID must be a valid UUID'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('feedback').optional().isString().withMessage('Feedback must be a string')
  ]
};

// User validation rules
const userValidations = {
  updateProfile: [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    commonValidations.skillLevel(),
    body('preferences').optional().isObject().withMessage('Preferences must be an object')
  ],
  updatePreferences: [
    body('dietaryRestrictions').optional().isArray().withMessage('Dietary restrictions must be an array'),
    body('cuisinePreferences').optional().isArray().withMessage('Cuisine preferences must be an array'),
    body('cookingGoals').optional().isArray().withMessage('Cooking goals must be an array'),
    body('voiceSettings').optional().isObject().withMessage('Voice settings must be an object')
  ],
  deleteAccount: [
    body('confirmPassword').notEmpty().withMessage('Password confirmation required')
  ]
};

// Auth validation rules
const authValidations = {
  signup: [
    commonValidations.name(),
    commonValidations.email(),
    commonValidations.password(),
    commonValidations.skillLevel()
  ],
  login: [
    commonValidations.email(),
    body('password').notEmpty().withMessage('Password is required')
  ]
};

module.exports = {
  commonValidations,
  sessionValidations,
  voiceValidations,
  coachingValidations,
  userValidations,
  authValidations
};