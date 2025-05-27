const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CookingSession = sequelize.define('CookingSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  recipeId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'recipe_id'
  },
  recipeName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'recipe_name'
  },
  currentStep: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'current_step'
  },
  totalSteps: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'total_steps'
  },
  status: {
    type: DataTypes.ENUM('active', 'paused', 'completed', 'abandoned'),
    defaultValue: 'active'
  },
  startedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'started_at'
  },
  completedAt: {
    type: DataTypes.DATE,
    field: 'completed_at'
  },
  duration: {
    type: DataTypes.INTEGER, // in seconds
    field: 'duration'
  },
  feedback: {
    type: DataTypes.JSONB,
    defaultValue: {
      rating: null,
      difficulty: null,
      comments: null,
      improvements: []
    }
  },
  skillImprovements: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'skill_improvements'
  },
  context: {
    type: DataTypes.JSONB,
    defaultValue: {
      pace: 'normal',
      questionsAsked: [],
      tipsProvided: [],
      timersUsed: [],
      adaptations: []
    }
  }
}, {
  tableName: 'cooking_sessions',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['recipe_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['started_at']
    }
  ]
});

// Instance methods
CookingSession.prototype.calculateDuration = function() {
  if (this.completedAt && this.startedAt) {
    return Math.floor((this.completedAt - this.startedAt) / 1000);
  }
  return null;
};

CookingSession.prototype.getProgress = function() {
  return {
    current: this.currentStep,
    total: this.totalSteps,
    percentage: Math.round((this.currentStep / this.totalSteps) * 100)
  };
};

module.exports = CookingSession;