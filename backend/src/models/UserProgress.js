const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserProgress = sequelize.define('UserProgress', {
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
  completionCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'completion_count'
  },
  averageTime: {
    type: DataTypes.INTEGER, // in seconds
    field: 'average_time'
  },
  bestTime: {
    type: DataTypes.INTEGER, // in seconds
    field: 'best_time'
  },
  lastCooked: {
    type: DataTypes.DATE,
    field: 'last_cooked'
  },
  masteryLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'mastery_level',
    validate: {
      min: 0,
      max: 100
    }
  },
  skillsLearned: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'skills_learned'
  },
  difficultyRating: {
    type: DataTypes.FLOAT,
    field: 'difficulty_rating',
    validate: {
      min: 1,
      max: 5
    }
  },
  personalNotes: {
    type: DataTypes.TEXT,
    field: 'personal_notes'
  },
  adaptations: {
    type: DataTypes.JSONB,
    defaultValue: {
      ingredients: [],
      techniques: [],
      timing: []
    }
  }
}, {
  tableName: 'user_progress',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['recipe_id']
    },
    {
      fields: ['mastery_level']
    },
    {
      unique: true,
      fields: ['user_id', 'recipe_id']
    }
  ]
});

// Instance methods
UserProgress.prototype.updateProgress = function(sessionData) {
  this.completionCount += 1;
  this.lastCooked = new Date();
  
  if (sessionData.duration) {
    if (!this.averageTime) {
      this.averageTime = sessionData.duration;
    } else {
      this.averageTime = Math.round(
        (this.averageTime * (this.completionCount - 1) + sessionData.duration) / this.completionCount
      );
    }
    
    if (!this.bestTime || sessionData.duration < this.bestTime) {
      this.bestTime = sessionData.duration;
    }
  }
  
  // Update mastery level based on completion count and performance
  this.masteryLevel = Math.min(100, this.completionCount * 10 + 
    (sessionData.feedback?.rating || 0) * 5);
};

module.exports = UserProgress;