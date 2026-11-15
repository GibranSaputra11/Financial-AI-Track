require('dotenv').config();
const { sequelize } = require('../config/database');
const { User, Wallet, Transaction, AIAnalysisLog } = require('../models');

const syncDatabase = async () => {
  try {
    console.log('🔄 Menghubungkan dan menyinkronkan database PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ Koneksi database sukses.');

    await sequelize.sync({ alter: true });
    console.log('✅ Skema tabel berhasil disinkronkan (alter: true).');

    process.exit(0);
  } catch (error) {
    console.error('❌ Gagal sync database:', error);
    process.exit(1);
  }
};

syncDatabase();