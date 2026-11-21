const { User, Wallet, Transaction } = require('../models');

const getLoginPage = (req, res) => {
  res.render('pages/login', {
    title: 'Login - Financial AI Track',
    error: req.query.error || null,
    success: req.query.success || null,
  });
};

const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.redirect('/login?error=Email dan password wajib diisi');
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password))) {
      return res.redirect('/login?error=Email atau password salah');
    }

    req.session.userId = user.id;
    req.session.username = user.username;

    const redirectTo = req.query.redirect || '/dashboard';
    res.redirect(redirectTo);
  } catch (error) {
    console.error('Login error:', error);
    res.redirect('/login?error=Terjadi kesalahan pada server');
  }
};

const { parseRupiah } = require('../utils/helpers');

const getRegisterPage = (req, res) => {
  res.render('pages/register', {
    title: 'Register - Financial AI Track',
    error: req.query.error || null,
  });
};

const postRegister = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, monthlyBudget } = req.body;

    if (!username || !email || !password) {
      return res.redirect('/register?error=Semua kolom wajib diisi');
    }

    if (password !== confirmPassword) {
      return res.redirect('/register?error=Konfirmasi password tidak cocok');
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.redirect('/register?error=Email sudah terdaftar');
    }

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.redirect('/register?error=Username sudah digunakan');
    }

    const user = await User.create({ username, email, password });

    const budgetNum = parseRupiah(monthlyBudget) || 1500000;

    await Wallet.create({
      userId: user.id,
      totalBalance: 0,
      monthlyBudget: budgetNum,
    });

    res.redirect('/login?success=Registrasi berhasil, silakan login');
  } catch (error) {
    console.error('Register error:', error);
    res.redirect('/register?error=Gagal mendaftarkan akun: ' + error.message);
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.clearCookie('fat.sid');
    res.redirect('/login');
  });
};

module.exports = {
  getLoginPage,
  postLogin,
  getRegisterPage,
  postRegister,
  logout,
};