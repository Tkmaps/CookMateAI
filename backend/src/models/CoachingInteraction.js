const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CoachingInteraction = sequelize.define('CoachingInteraction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sessionId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'session_id',
    references: {
      model: 'cooking_sessions',
      key: 'id'
    }
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  userInput: {
    type: DataTypes.TEXT,
    field: 'user_input'
  },
  coachResponse: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'coach_response'
  },
  interactionType: {
    type: DataTypes.ENUM(
      'step_guidance',
      'question_answer',
      'tip_suggestion',
      'troubleshooting',
      'encouragement',
      'timer_management',
      'substitution_help',
      'technique_explanation'
    ),
    allowNull: false,
    field: 'interaction_type'
  },
  context: {
    type: DataTypes.JSONB,
    defaultValue: {
      currentStep: null,
      recipeSection: null,
      userEmotion: null,
      confidence: null,
      adaptationMade: false
    }
  },
  responseTime: {
    type: DataTypes.INTEGER, // in milliseconds
    field: 'response_time'
  },
  userSatisfaction: {
    type: DataTypes.INTEGER, // 1-5 rating
    field: 'user_satisfaction',
    validate: {
      min: 1,
      max: 5
    }
  }
}, {
  tableName: 'coaching_interactions',
  indexes: [
    {
      fields: ['session_id']
    },
    {
      fields: ['interaction_type']
    },
    {
      fields: ['timestamp']
    }
  ]
});

module.exports = CoachingInteraction;