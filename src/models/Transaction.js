const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define('Transaction', {
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
  type: {
    type: DataTypes.ENUM('income', 'expense'),
    allowNull: false,
    defaultValue: 'expense',
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Makan',
    validate: {
      isIn: [['Kos', 'Makan', 'Tugas/Print', 'Nongkrong', 'Transportasi', 'Lainnya']],
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  merchant: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  receiptUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  transactionDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'transactions',
  timestamps: true,
});

module.exports = Transaction;