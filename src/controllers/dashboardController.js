const { Wallet, Transaction, AIAnalysisLog } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const {
  formatRupiah,
  formatRupiahSigned,
  getCategoryIcon,
  getCategoryColor,
  getRemainingDays,
  formatDate,
  getStatusFromBudget,
  getDailyAllowance,
} = require('../utils/helpers');

const getDashboard = async (req, res) => {
  try {
    const userId = req.userId;

    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) {
      return res.redirect('/login');
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const transactions = await Transaction.findAll({
      where: {
        userId,
        transactionDate: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
      order: [['transactionDate', 'DESC']],
      limit: 10,
    });

    const totalIncome = await Transaction.sum('amount', {
      where: { userId, type: 'income', transactionDate: { [Op.between]: [startOfMonth, endOfMonth] } },
    }) || 0;

    const totalExpense = await Transaction.sum('amount', {
      where: { userId, type: 'expense', transactionDate: { [Op.between]: [startOfMonth, endOfMonth] } },
    }) || 0;

    const expensesByCategory = await Transaction.findAll({
      attributes: [
        'category',
        [fn('SUM', col('amount')), 'totalAmount'],
      ],
      where: { userId, type: 'expense', transactionDate: { [Op.between]: [startOfMonth, endOfMonth] } },
      group: ['category'],
      raw: true,
    });

    const remainingDays = getRemainingDays();
    const remainingBudget = wallet.totalBalance;
    const dailyAllowance = getDailyAllowance(remainingBudget, remainingDays);
    const { status, class: statusClass } = getStatusFromBudget(remainingBudget, wallet.monthlyBudget);

    const categoryStats = {};
    expensesByCategory.forEach(item => {
      categoryStats[item.category] = parseFloat(item.totalAmount);
    });

    const categories = ['Kos', 'Makan', 'Tugas/Print', 'Nongkrong', 'Transportasi', 'Lainnya'];
    const chartData = categories.map(cat => ({
      category: cat,
      amount: categoryStats[cat] || 0,
      icon: getCategoryIcon(cat),
      color: getCategoryColor(cat),
      percentage: totalExpense > 0 ? ((categoryStats[cat] || 0) / totalExpense * 100).toFixed(1) : 0,
    }));

    res.render('pages/dashboard', {
      title: 'Dashboard - Financial AI Track',
      user: { username: req.username },
      formatRupiah,
      wallet: {
        totalBalance: wallet.totalBalance,
        monthlyBudget: wallet.monthlyBudget,
        formattedBalance: formatRupiah(wallet.totalBalance),
        formattedBudget: formatRupiah(wallet.monthlyBudget),
      },
      stats: {
        totalIncome,
        totalExpense,
        remainingDays,
        remainingBudget,
        dailyAllowance,
        formattedIncome: formatRupiah(totalIncome),
        formattedExpense: formatRupiah(totalExpense),
        formattedRemaining: formatRupiah(remainingBudget),
        formattedDaily: formatRupiah(dailyAllowance),
      },
      status: { label: status, class: statusClass },
      chartData,
      recentTransactions: transactions.map(t => ({
        ...t.toJSON(),
        formattedAmount: formatRupiahSigned(t.amount, t.type),
        formattedDate: formatDate(t.transactionDate),
        categoryIcon: getCategoryIcon(t.category),
        categoryColor: getCategoryColor(t.category),
      })),
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).render('pages/error', {
      title: 'Error',
      message: 'Gagal memuat dashboard',
      error,
    });
  }
};

module.exports = { getDashboard };