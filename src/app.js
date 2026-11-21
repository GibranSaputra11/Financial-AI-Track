require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

const sessionMiddleware = require('./config/session');
const { testConnection } = require('./config/database');
const { User } = require('./models');
const multer = require('multer');
const flash = require('connect-flash');

const expressLayouts = require('express-ejs-layouts');

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const ocrRoutes = require('./routes/ocrRoutes');
const advisorRoutes = require('./routes/advisorRoutes');

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');

app.use(expressLayouts);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(sessionMiddleware);
app.use(flash());

app.use(async (req, res, next) => {
  res.locals.user = null;
  if (req.session && req.session.userId) {
    const user = await User.findByPk(req.session.userId, { attributes: ['id', 'username', 'email'] });
    if (user) {
      res.locals.user = user.toJSON();
      req.username = user.username;
    }
  }
  next();
});

app.get('/', (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.redirect('/login');
});

app.use(authRoutes);
app.use(dashboardRoutes);
app.use(transactionRoutes);
app.use(ocrRoutes);
app.use(advisorRoutes);

app.use((req, res) => {
  res.status(404).render('pages/error', {
    title: '404 - Halaman Tidak Ditemukan',
    message: 'Halaman yang Anda cari tidak ditemukan',
    error: { message: 'Route tidak ditemukan' },
  });
});

app.use((err, req, res, next) => {
  console.error('SERVER ERROR DETAILS:', err.message, err.stack);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Ukuran file terlalu besar (maksimal 4MB)' });
    }
  }
  
  res.status(500).render('pages/error', {
    title: 'Error Server',
    message: err.message || 'Terjadi kesalahan pada server',
    error: process.env.NODE_ENV === 'development' ? { message: err.message, stack: err.stack } : { message: 'Internal server error' },
  });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('❌ Tidak bisa memulai server: Database tidak terhubung');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Financial AI Track berjalan di http://localhost:${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Timezone: ${process.env.TZ || 'Asia/Jakarta'}`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;