const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { User, UserProgress, CookingSession } = require('../models');
const { AppError, catchAsync } = require('../middleware/errorHandler');
const { protect } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Protect all routes
router.use(protect);

// Validation rules
const updateProfileValidation = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('skillLevel').optional().isIn(['beginner', 'intermediate', 'expert']).withMessage('Invalid skill level'),
  body('preferences').optional().isObject().withMessage('Preferences must be an object')
];

const updatePreferencesValidation = [
  body('dietaryRestrictions').optional().isArray().withMessage('Dietary restrictions must be an array'),
  body('cuisinePreferences').optional().isArray().withMessage('Cuisine preferences must be an array'),
  body('cookingGoals').optional().isArray().withMessage('Cooking goals must be an array'),
  body('voiceSettings').optional().isObject().withMessage('Voice settings must be an object')
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

// Get current user profile
router.get('/profile', catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] }
  });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
}));

// Update user profile
router.put('/profile', updateProfileValidation, checkValidation, catchAsync(async (req, res, next) => {
  const { name, skillLevel, preferences } = req.body;
  const userId = req.user.id;

  const user = await User.findByPk(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Update user fields
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (skillLevel !== undefined) updates.skillLevel = skillLevel;
  if (preferences !== undefined) {
    updates.preferences = {
      ...user.preferences,
      ...preferences
    };
  }

  await user.update(updates);

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
}));

// Update user preferences
router.put('/preferences', updatePreferencesValidation, checkValidation, catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const updates = req.body;

  const user = await User.findByPk(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Merge with existing preferences
  const updatedPreferences = {
    ...user.preferences,
    ...updates
  };

  await user.update({ preferences: updatedPreferences });

  res.status(200).json({
    status: 'success',
    data: {
      preferences: updatedPreferences
    }
  });
}));

// Get user progress overview
router.get('/progress', catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  // Get user progress records
  const progressRecords = await UserProgress.findAll({
    where: { userId },
    order: [['lastCooked', 'DESC']]
  });

  // Get cooking session statistics
  const sessionStats = await CookingSession.findAll({
    where: { 
      userId,
      status: 'completed'
    },
    attributes: [
      'recipeId',
      'recipeName'
    ]
  });

  // Calculate overall statistics
  const totalRecipes = progressRecords.length;
  const totalSessions = sessionStats.length;
  const averageMastery = progressRecords.length > 0 ? 
    Math.round(progressRecords.reduce((sum, p) => sum + p.masteryLevel, 0) / progressRecords.length) : 0;

  // Group by skill level achievements
  const skillLevelBreakdown = {
    beginner: progressRecords.filter(p => p.masteryLevel < 30).length,
    intermediate: progressRecords.filter(p => p.masteryLevel >= 30 && p.masteryLevel < 70).length,
    expert: progressRecords.filter(p => p.masteryLevel >= 70).length
  };

  // Recent activity
  const recentActivity = progressRecords.slice(0, 10).map(p => ({
    recipeId: p.recipeId,
    recipeName: p.recipeName,
    masteryLevel: p.masteryLevel,
    lastCooked: p.lastCooked,
    completionCount: p.completionCount
  }));

  res.status(200).json({
    status: 'success',
    data: {
      overview: {
        totalRecipes,
        totalSessions,
        averageMastery,
        skillLevelBreakdown
      },
      recentActivity,
      allProgress: progressRecords
    }
  });
}));

// Get progress for specific recipe
router.get('/progress/:recipeId', catchAsync(async (req, res, next) => {
  const { recipeId } = req.params;
  const userId = req.user.id;

  const progress = await UserProgress.findOne({
    where: { userId, recipeId }
  });

  if (!progress) {
    return res.status(200).json({
      status: 'success',
      data: {
        progress: null,
        message: 'No progress found for this recipe'
      }
    });
  }

  // Get recent sessions for this recipe
  const recentSessions = await CookingSession.findAll({
    where: { userId, recipeId },
    order: [['startedAt', 'DESC']],
    limit: 5,
    attributes: ['id', 'status', 'startedAt', 'completedAt', 'duration', 'feedback']
  });

  res.status(200).json({
    status: 'success',
    data: {
      progress,
      recentSessions
    }
  });
}));

// Get cooking statistics
router.get('/stats', catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { period = '30' } = req.query; // days

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(period));

  // Get sessions in period
  const sessions = await CookingSession.findAll({
    where: {
      userId,
      startedAt: {
        [Op.gte]: startDate
      }
    },
    order: [['startedAt', 'ASC']]
  });

  // Calculate statistics
  const stats = {
    totalSessions: sessions.length,
    completedSessions: sessions.filter(s => s.status === 'completed').length,
    totalCookingTime: sessions.reduce((sum, s) => sum + (s.duration || 0), 0),
    averageSessionTime: 0,
    favoriteRecipes: {},
    dailyActivity: {},
    skillProgression: []
  };

  // Calculate averages
  const completedSessions = sessions.filter(s => s.status === 'completed' && s.duration);
  if (completedSessions.length > 0) {
    stats.averageSessionTime = Math.round(
      completedSessions.reduce((sum, s) => sum + s.duration, 0) / completedSessions.length
    );
  }

  // Count favorite recipes
  sessions.forEach(session => {
    if (session.recipeName) {
      stats.favoriteRecipes[session.recipeName] = 
        (stats.favoriteRecipes[session.recipeName] || 0) + 1;
    }
  });

  // Daily activity
  sessions.forEach(session => {
    const date = session.startedAt.toISOString().split('T')[0];
    stats.dailyActivity[date] = (stats.dailyActivity[date] || 0) + 1;
  });

  // Get skill progression over time
  const progressRecords = await UserProgress.findAll({
    where: { userId },
    order: [['updatedAt', 'ASC']]
  });

  stats.skillProgression = progressRecords.map(p => ({
    date: p.updatedAt,
    recipe: p.recipeName,
    masteryLevel: p.masteryLevel
  }));

  res.status(200).json({
    status: 'success',
    data: {
      period: `${period} days`,
      stats
    }
  });
}));

// Get user achievements
router.get('/achievements', catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  // Get user data
  const user = await User.findByPk(userId);
  const progressRecords = await UserProgress.findAll({ where: { userId } });
  const sessions = await CookingSession.findAll({ 
    where: { userId, status: 'completed' } 
  });

  // Define achievements
  const achievements = [
    {
      id: 'first_recipe',
      name: 'First Recipe',
      description: 'Complete your first recipe',
      icon: '🍳',
      unlocked: sessions.length > 0,
      unlockedAt: sessions.length > 0 ? sessions[0].completedAt : null
    },
    {
      id: 'recipe_master',
      name: 'Recipe Master',
      description: 'Complete 10 different recipes',
      icon: '👨‍🍳',
      unlocked: progressRecords.length >= 10,
      unlockedAt: progressRecords.length >= 10 ? progressRecords[9].updatedAt : null
    },
    {
      id: 'speed_cook',
      name: 'Speed Cook',
      description: 'Complete a recipe in under 30 minutes',
      icon: '⚡',
      unlocked: sessions.some(s => s.duration && s.duration < 1800),
      unlockedAt: sessions.find(s => s.duration && s.duration < 1800)?.completedAt || null
    },
    {
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Achieve 100% mastery on any recipe',
      icon: '⭐',
      unlocked: progressRecords.some(p => p.masteryLevel >= 100),
      unlockedAt: progressRecords.find(p => p.masteryLevel >= 100)?.updatedAt || null
    },
    {
      id: 'consistent_cook',
      name: 'Consistent Cook',
      description: 'Cook for 7 days in a row',
      icon: '📅',
      unlocked: false, // Would need more complex logic to track consecutive days
      unlockedAt: null
    },
    {
      id: 'skill_upgrade',
      name: 'Skill Upgrade',
      description: 'Upgrade your skill level',
      icon: '📈',
      unlocked: user.skillLevel !== 'beginner',
      unlockedAt: user.updatedAt
    }
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  res.status(200).json({
    status: 'success',
    data: {
      achievements,
      summary: {
        unlocked: unlockedCount,
        total: totalCount,
        percentage: Math.round((unlockedCount / totalCount) * 100)
      }
    }
  });
}));

// Delete user account
router.delete('/account', catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { confirmPassword } = req.body;

  if (!confirmPassword) {
    return next(new AppError('Password confirmation required', 400));
  }

  const user = await User.findByPk(userId);
  if (!user || !(await user.validatePassword(confirmPassword))) {
    return next(new AppError('Incorrect password', 401));
  }

  // Soft delete - deactivate account
  await user.update({ isActive: false });

  res.status(200).json({
    status: 'success',
    message: 'Account deactivated successfully'
  });
}));

// Export user data (GDPR compliance)
router.get('/export', catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  // Get all user data
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] }
  });

  const progress = await UserProgress.findAll({ where: { userId } });
  const sessions = await CookingSession.findAll({ where: { userId } });

  const exportData = {
    user,
    progress,
    sessions,
    exportedAt: new Date().toISOString()
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="cookmate-data-${userId}.json"`);
  
  res.status(200).json({
    status: 'success',
    data: exportData
  });
}));

module.exports = router;