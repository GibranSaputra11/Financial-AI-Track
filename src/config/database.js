require('dotenv').config();

const { Sequelize } = require('sequelize');
const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL tidak ditemukan di environment variables');
}

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: isProduction ? false : console.log,
  dialectOptions: isProduction
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  timezone: '+07:00',
});

// Separate pg Pool for connect-pg-simple session store
const pgPool = new Pool({
  connectionString: databaseUrl,
  ssl: isProduction
    ? {
        require: true,
        rejectUnauthorized: false,
      }
    : false,
  max: 10,
  idleTimeoutMillis: 30000,
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database PostgreSQL terhubung');
    return true;
  } catch (error) {
    console.error('❌ Gagal konek database:', error.message);
    return false;
  }
};

module.exports = { sequelize, testConnection, pgPool };