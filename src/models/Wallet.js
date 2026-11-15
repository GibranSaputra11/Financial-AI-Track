const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Wallet = sequelize.define('Wallet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  totalBalance: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  monthlyBudget: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    validate: {
      min: 0,
    },
  },
}, {
  tableName: 'wallets',
  timestamps: true,
});

module.exports = Wallet;