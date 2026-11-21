const { Wallet, Transaction } = require('../models');
const { Op, fn, col } = require('sequelize');
const {
  formatRupiah,
  formatRupiahSigned,
  getCategoryIcon,
  getCategoryColor,
  formatDate,
  parseRupiah,
} = require('../utils/helpers');

const getTransactions = async (req, res) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: { userId },
      order: [['transactionDate', 'DESC'], ['createdAt', 'DESC']],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    res.render('pages/transactions', {
      title: 'Transaksi - Financial AI Track',
      user: { username: req.username },
      transactions: transactions.map(t => ({
        ...t.toJSON(),
        formattedAmount: formatRupiahSigned(t.amount, t.type),
        formattedDate: formatDate(t.transactionDate),
        categoryIcon: getCategoryIcon(t.category),
        categoryColor: getCategoryColor(t.category),
      })),
      pagination: {
        currentPage: page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Transactions error:', error);
    res.status(500).render('pages/error', {
      title: 'Error',
      message: 'Gagal memuat transaksi',
      error,
    });
  }
};

const getAddTransaction = (req, res) => {
  res.render('pages/add-transaction', {
    title: 'Tambah Transaksi - Financial AI Track',
    user: { username: req.username },
    type: req.query.type || 'expense',
    error: req.query.error || null,
  });
};

const postAddTransaction = async (req, res) => {
  try {
    const userId = req.userId;
    const { type, amount, category, description, transactionDate } = req.body;

    if (!type || !amount || !category) {
      return res.redirect('/transactions/add?error=Field wajib diisi&type=' + type);
    }

    const amountNum = parseRupiah(amount);
    if (amountNum <= 0) {
      return res.redirect('/transactions/add?error=Nominal harus > 0&type=' + type);
    }

    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) {
      return res.redirect('/transactions/add?error=Wallet tidak ditemukan');
    }

    if (type === 'expense' && wallet.totalBalance < amountNum) {
      return res.redirect('/transactions/add?error=Saldo tidak mencukupi&type=expense');
    }

    const transaction = await Transaction.create({
      userId,
      type,
      amount: amountNum,
      category,
      description: description || null,
      transactionDate: transactionDate || new Date(),
    });

    if (type === 'income') {
      wallet.totalBalance = parseFloat(wallet.totalBalance) + amountNum;
    } else {
      wallet.totalBalance = parseFloat(wallet.totalBalance) - amountNum;
    }
    await wallet.save();

    res.redirect('/transactions?success=Transaksi berhasil ditambahkan');
  } catch (error) {
    console.error('Add transaction error:', error);
    res.redirect('/transactions/add?error=Gagal menambah transaksi: ' + error.message + '&type=' + req.body.type);
  }
};

const postDeposit = async (req, res) => {
  try {
    const userId = req.userId;
    const { amount } = req.body;

    const amountNum = parseRupiah(amount);
    if (!amountNum || amountNum < 1000) {
      return res.redirect('/dashboard?error=Minimal deposit Rp 1.000');
    }

    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) {
      return res.redirect('/dashboard?error=Wallet tidak ditemukan');
    }

    await Transaction.create({
      userId,
      type: 'income',
      amount: amountNum,
      category: 'Lainnya',
      description: 'Manual Deposit (Top Up Saldo)',
      transactionDate: new Date(),
    });

    wallet.totalBalance = parseFloat(wallet.totalBalance) + amountNum;
    await wallet.save();

    res.redirect('/dashboard?success=Deposit berhasil');
  } catch (error) {
    console.error('Deposit error:', error);
    res.redirect('/dashboard?error=Gagal deposit: ' + error.message);
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const transaction = await Transaction.findOne({ where: { id, userId } });
    if (!transaction) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }

    const wallet = await Wallet.findOne({ where: { userId } });
    if (wallet) {
      if (transaction.type === 'income') {
        wallet.totalBalance = parseFloat(wallet.totalBalance) - parseFloat(transaction.amount);
      } else {
        wallet.totalBalance = parseFloat(wallet.totalBalance) + parseFloat(transaction.amount);
      }
      await wallet.save();
    }

    await transaction.destroy();

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete transaction error:', error);
    return res.status(500).json({ error: 'Gagal menghapus' });
  }
};

module.exports = {
  getTransactions,
  getAddTransaction,
  postAddTransaction,
  postDeposit,
  deleteTransaction,
};