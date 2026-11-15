const User = require('./User');
const Wallet = require('./Wallet');
const Transaction = require('./Transaction');
const AIAnalysisLog = require('./AIAnalysisLog');

User.hasOne(Wallet, { foreignKey: 'userId', as: 'wallet', onDelete: 'CASCADE' });
Wallet.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions', onDelete: 'CASCADE' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(AIAnalysisLog, { foreignKey: 'userId', as: 'analysisLogs', onDelete: 'CASCADE' });
AIAnalysisLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  User,
  Wallet,
  Transaction,
  AIAnalysisLog,
};