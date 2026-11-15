const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { requireAuth } = require('../middleware/auth');
const { transactionValidation, depositValidation } = require('../middleware/validation');

router.get('/transactions', requireAuth, transactionController.getTransactions);
router.get('/transactions/add', requireAuth, transactionController.getAddTransaction);
router.post('/transactions/add', requireAuth, transactionValidation, transactionController.postAddTransaction);
router.post('/dashboard/deposit', requireAuth, depositValidation, transactionController.postDeposit);
router.delete('/transactions/:id', requireAuth, transactionController.deleteTransaction);

module.exports = router;