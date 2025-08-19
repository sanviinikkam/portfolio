const { sequelize } = require('../models');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DB_NAME = 'cyber_threat_tracker_test';

// Setup test database before all tests
beforeAll(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  } catch (error) {
    console.error('Test database setup failed:', error);
  }
});

// Clean up after all tests
afterAll(async () => {
  try {
    await sequelize.close();
  } catch (error) {
    console.error('Test database cleanup failed:', error);
  }
});
