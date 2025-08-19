const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Threat = sequelize.define('Threat', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('DDoS', 'Phishing', 'Malware', 'Ransomware', 'Data Breach', 'SQL Injection', 'XSS', 'Social Engineering', 'Other'),
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  severity: {
    type: DataTypes.ENUM('Low', 'Medium', 'High'),
    allowNull: false,
  },
  time_detected: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [10, 1000],
    },
  },
  status: {
    type: DataTypes.ENUM('Active', 'Investigating', 'Resolved', 'False Positive'),
    defaultValue: 'Active',
  },
  source: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'threats',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['type'],
    },
    {
      fields: ['severity'],
    },
    {
      fields: ['time_detected'],
    },
    {
      fields: ['created_by'],
    },
    {
      fields: ['country'],
    },
  ],
});

module.exports = Threat;
