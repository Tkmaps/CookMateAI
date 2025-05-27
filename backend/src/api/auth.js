const express = require('express');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { AppError, catchAsync } = require('../middleware/errorHandler');
const { createSendToken, refreshToken } = require('../middleware/auth');
const { authRateLimiter } = require('../middleware/rateLimiter');
const { authLogger } = require('../middleware/logger');

const router = express.Router();

// Apply rate limiting to all auth routes
router.use(authRateLimiter);
router.use(authLogger);

// Validation rules
const signupValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('skillLevel')
    .optional()
    .isIn(['beginner', 'intermediate', 'expert'])
    .withMessage('Skill level must be beginner, intermediate, or expert')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
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

// Sign up
router.post('/signup', signupValidation, checkValidation, catchAsync(async (req, res, next) => {
  const { name, email, password, skillLevel, preferences } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return next(new AppError('User with this email already exists', 400));
  }

  // Create new user
  const newUser = await User.create({
    name,
    email,
    password,
    skillLevel: skillLevel || 'beginner',
    preferences: preferences || {}
  });

  // Update last login
  newUser.lastLoginAt = new Date();
  await newUser.save();

  createSendToken(newUser, 201, res);
}));

// Login
router.post('/login', loginValidation, checkValidation, catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if user exists and password is correct
  const user = await User.findOne({ where: { email } });
  if (!user || !(await user.validatePassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // Check if user is active
  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated', 401));
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  createSendToken(user, 200, res);
}));

// Logout
router.post('/logout', (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.cookie('refreshToken', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
});

// Refresh token
router.post('/refresh', refreshToken);

// Forgot password (placeholder for future implementation)
router.post('/forgot-password', catchAsync(async (req, res, next) => {
  // TODO: Implement password reset functionality
  res.status(501).json({
    status: 'error',
    message: 'Password reset functionality not yet implemented'
  });
}));

// Reset password (placeholder for future implementation)
router.patch('/reset-password/:token', catchAsync(async (req, res, next) => {
  // TODO: Implement password reset functionality
  res.status(501).json({
    status: 'error',
    message: 'Password reset functionality not yet implemented'
  });
}));

module.exports = router;