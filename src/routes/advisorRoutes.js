const express = require('express');
const router = express.Router();
const advisorController = require('../controllers/advisorController');
const { requireAuth } = require('../middleware/auth');

router.get('/advisor', requireAuth, advisorController.getAdvisorPage);
router.post('/advisor/analyze', requireAuth, advisorController.postAnalyze);

module.exports = router;