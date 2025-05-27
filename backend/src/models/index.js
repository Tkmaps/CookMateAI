const User = require('./User');
const CookingSession = require('./CookingSession');
const CoachingInteraction = require('./CoachingInteraction');
const UserProgress = require('./UserProgress');

// Define associations
User.hasMany(CookingSession, {
  foreignKey: 'userId',
  as: 'cookingSessions'
});

CookingSession.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

CookingSession.hasMany(CoachingInteraction, {
  foreignKey: 'sessionId',
  as: 'interactions'
});

CoachingInteraction.belongsTo(CookingSession, {
  foreignKey: 'sessionId',
  as: 'session'
});

User.hasMany(UserProgress, {
  foreignKey: 'userId',
  as: 'progress'
});

UserProgress.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = {
  User,
  CookingSession,
  CoachingInteraction,
  UserProgress
};