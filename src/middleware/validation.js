const { body, validationResult, query } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(400).json({ errors: errors.array() });
    }
    req.flash('errors', errors.array());
    return res.redirect('back');
  }
  next();
};

const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username minimal 3 karakter, maksimal 50 karakter')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username hanya boleh huruf, angka, dan underscore'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Format email tidak valid'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password minimal 6 karakter'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Konfirmasi password tidak cocok'),
  validate,
];

const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Format email tidak valid'),
  body('password')
    .notEmpty()
    .withMessage('Password wajib diisi'),
  validate,
];

const transactionValidation = [
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Tipe transaksi tidak valid'),
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Nominal harus lebih dari 0'),
  body('category')
    .isIn(['Kos', 'Makan', 'Tugas/Print', 'Nongkrong', 'Transportasi', 'Lainnya'])
    .withMessage('Kategori tidak valid'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Deskripsi maksimal 500 karakter'),
  body('transactionDate')
    .optional()
    .isISO8601()
    .withMessage('Format tanggal tidak valid (YYYY-MM-DD)'),
  validate,
];

const depositValidation = [
  body('amount')
    .isFloat({ min: 1000 })
    .withMessage('Minimal deposit Rp 1.000'),
  validate,
];

const ocrValidation = [
  body('merchant')
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage('Nama merchant maksimal 150 karakter'),
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Nominal harus lebih dari 0'),
  body('category')
    .isIn(['Kos', 'Makan', 'Tugas/Print', 'Nongkrong', 'Transportasi', 'Lainnya'])
    .withMessage('Kategori tidak valid'),
  body('transactionDate')
    .isISO8601()
    .withMessage('Format tanggal tidak valid (YYYY-MM-DD)'),
  validate,
];

module.exports = {
  registerValidation,
  loginValidation,
  transactionValidation,
  depositValidation,
  ocrValidation,
};