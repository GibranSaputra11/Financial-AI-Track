const { Wallet, Transaction, AIAnalysisLog } = require('../models');
const { Op, fn, col } = require('sequelize');
const {
  formatRupiah,
  getRemainingDays,
  getDailyAllowance,
  getStatusFromBudget,
} = require('../utils/helpers');
const { generateBudgetAdvisorWithGemini } = require('../services/geminiService');

const getAdvisorPage = async (req, res) => {
  try {
    const userId = req.userId;

    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) {
      return res.redirect('/login');
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const recentTransactions = await Transaction.findAll({
      where: {
        userId,
        transactionDate: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
      order: [['transactionDate', 'DESC']],
      limit: 10,
      attributes: ['type', 'amount', 'category', 'description', 'merchant', 'transactionDate'],
      raw: true,
    });

    const remainingDays = getRemainingDays();
    const remainingBudget = parseFloat(wallet.totalBalance);
    const dailyAllowance = getDailyAllowance(remainingBudget, remainingDays);
    const { status, class: statusClass } = getStatusFromBudget(remainingBudget, parseFloat(wallet.monthlyBudget) || 1500000);

    const lastAnalysis = await AIAnalysisLog.findOne({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    res.render('pages/advisor', {
      title: 'AI Advisor - Financial AI Track',
      user: { username: req.username },
      wallet: {
        totalBalance: wallet.totalBalance,
        monthlyBudget: wallet.monthlyBudget,
        formattedBalance: formatRupiah(wallet.totalBalance),
        formattedBudget: formatRupiah(wallet.monthlyBudget),
      },
      stats: {
        remainingDays,
        remainingBudget,
        dailyAllowance,
        formattedRemaining: formatRupiah(remainingBudget),
        formattedDaily: formatRupiah(dailyAllowance),
      },
      status: { label: status, class: statusClass },
      recentTransactions: recentTransactions.map(t => ({
        ...t,
        formattedAmount: (t.type === 'income' ? '+' : '-') + formatRupiah(t.amount),
      })),
      lastAnalysis: lastAnalysis ? {
        createdAt: lastAnalysis.createdAt,
        analysisResultJson: lastAnalysis.analysisResultJson,
      } : null,
    });
  } catch (error) {
    console.error('Advisor page error:', error);
    res.status(500).render('pages/error', {
      title: 'Error',
      message: 'Gagal memuat AI Advisor',
      error,
    });
  }
};

const postAnalyze = async (req, res) => {
  try {
    const userId = req.userId;

    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet tidak ditemukan' });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const recentTransactions = await Transaction.findAll({
      where: {
        userId,
        transactionDate: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
      order: [['transactionDate', 'DESC']],
      limit: 20,
      attributes: ['type', 'amount', 'category', 'description', 'merchant', 'transactionDate'],
      raw: true,
    });

    const walletData = {
      totalBalance: parseFloat(wallet.totalBalance),
      monthlyBudget: parseFloat(wallet.monthlyBudget) || 1500000,
      remainingDays: getRemainingDays(),
      dailyAllowance: getDailyAllowance(parseFloat(wallet.totalBalance), getRemainingDays()),
    };

    const analysisResult = await generateBudgetAdvisorWithGemini(walletData, recentTransactions);

    await AIAnalysisLog.create({
      userId,
      remainingDays: walletData.remainingDays,
      remainingBudget: walletData.totalBalance,
      analysisResultJson: analysisResult,
    });

    res.json({
      success: true,
      data: analysisResult,
    });
  } catch (error) {
    console.error('Analyze error:', error);
    res.status(500).json({ error: 'Gagal menganalisis: ' + error.message });
  }
};

module.exports = {
  getAdvisorPage,
  postAnalyze,
};