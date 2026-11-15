const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { redirectIfAuth, requireAuth } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validation');

router.get('/login', redirectIfAuth, authController.getLoginPage);
router.post('/login', loginValidation, authController.postLogin);

router.get('/register', redirectIfAuth, authController.getRegisterPage);
router.post('/register', registerValidation, authController.postRegister);

router.get('/logout', authController.logout);

module.exports = router;