const { sequelize } = require('../src/config/database');

// Setup test database
beforeAll(async () => {
  // Sync database models for testing
  await sequelize.sync({ force: true });
});

// Cleanup after all tests
afterAll(async () => {
  await sequelize.close();
});

// Global test utilities
global.testUtils = {
  createTestUser: async () => {
    const { User } = require('../src/models');
    return await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPassword123',
      skillLevel: 'beginner'
    });
  },

  createTestSession: async (userId) => {
    const { CookingSession } = require('../src/models');
    return await CookingSession.create({
      userId,
      recipeId: '123e4567-e89b-12d3-a456-426614174000',
      recipeName: 'Test Recipe',
      totalSteps: 5,
      currentStep: 1
    });
  }
};