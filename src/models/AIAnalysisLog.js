const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AIAnalysisLog = sequelize.define('AIAnalysisLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  remainingDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  remainingBudget: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  analysisResultJson: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
}, {
  tableName: 'ai_analysis_logs',
  timestamps: true,
});

module.exports = AIAnalysisLog;