const express = require('express');
const router = express.Router();
const ocrController = require('../controllers/ocrController');
const { requireAuth } = require('../middleware/auth');
const { ocrValidation } = require('../middleware/validation');

router.get('/ocr', requireAuth, ocrController.getOCRPage);
router.post('/ocr/scan', requireAuth, ocrController.uploadMiddleware, ocrController.postOCRScan);
router.post('/ocr/save', requireAuth, ocrValidation, ocrController.postOCRSave);

module.exports = router;