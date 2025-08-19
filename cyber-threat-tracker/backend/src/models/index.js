const { sequelize } = require('../config/database');
const User = require('./User');
const Threat = require('./Threat');

// Define associations
User.hasMany(Threat, {
  foreignKey: 'created_by',
  as: 'threats',
});

Threat.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator',
});

// Sync database (only in development)
const syncDatabase = async () => {
  try {
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database synchronized successfully.');
    }
  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
  }
};

module.exports = {
  sequelize,
  User,
  Threat,
  syncDatabase,
};
