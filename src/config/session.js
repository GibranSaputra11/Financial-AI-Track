const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { pgPool } = require('../config/database');

const isProduction = process.env.NODE_ENV === 'production';

const sessionMiddleware = session({
  store: new pgSession({
    pool: pgPool,
    tableName: 'sessions',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'fallback_secret_change_in_production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    sameSite: isProduction ? 'none' : 'lax',
  },
  name: 'fat.sid',
});

module.exports = sessionMiddleware;