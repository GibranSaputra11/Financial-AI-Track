const { Wallet, Transaction, AIAnalysisLog } = require('../models');
const { Op } = require('sequelize');
const multer = require('multer');
const {
  formatRupiah,
  getCategoryIcon,
  getCategoryColor,
  getRemainingDays,
  formatDate,
  getDailyAllowance,
  getStatusFromBudget,
} = require('../utils/helpers');
const { extractReceiptWithGemini } = require('../services/geminiService');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 4 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format file tidak didukung. Gunakan JPG, PNG, atau WebP (max 4MB).'));
    }
  },
});

const getOCRPage = (req, res) => {
  res.render('pages/ocr', {
    title: 'Scan Struk AI - Financial AI Track',
    user: { username: req.username },
    error: req.query.error || null,
  });
};

const uploadMiddleware = upload.single('receipt');

const postOCRScan = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File struk tidak ditemukan' });
    }

    const { buffer, mimetype } = req.file;
    const result = await extractReceiptWithGemini(buffer, mimetype);

    res.json({
      success: true,
      data: {
        merchant: result.merchant || '',
        amount: result.amount,
        category: result.category,
        transactionDate: result.transactionDate,
        description: result.description || '',
      },
    });
  } catch (error) {
    console.error('OCR scan error:', error);
    res.status(500).json({ error: error.message });
  }
};

const postOCRSave = async (req, res) => {
  try {
    const userId = req.userId;
    const { merchant, amount, category, transactionDate, description } = req.body;

    if (!amount || !category || !transactionDate) {
      return res.status(400).json({ error: 'Data tidak lengkap' });
    }

    const amountNum = parseFloat(amount);
    if (amountNum <= 0) {
      return res.status(400).json({ error: 'Nominal harus > 0' });
    }

    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet || parseFloat(wallet.totalBalance) < amountNum) {
      return res.status(400).json({ error: 'Saldo tidak mencukupi untuk pengeluaran ini' });
    }

    const transaction = await Transaction.create({
      userId,
      type: 'expense',
      amount: amountNum,
      category,
      merchant: merchant || null,
      description: description || null,
      receiptUrl: null,
      transactionDate,
    });

    wallet.totalBalance = parseFloat(wallet.totalBalance) - amountNum;
    await wallet.save();

    res.json({
      success: true,
      data: {
        id: transaction.id,
        formattedAmount: '- ' + formatRupiah(amountNum),
        formattedDate: formatDate(transactionDate),
        categoryIcon: getCategoryIcon(category),
        categoryColor: getCategoryColor(category),
      },
    });
  } catch (error) {
    console.error('OCR save error:', error);
    res.status(500).json({ error: 'Gagal menyimpan transaksi: ' + error.message });
  }
};

module.exports = {
  getOCRPage,
  uploadMiddleware,
  postOCRScan,
  postOCRSave,
};