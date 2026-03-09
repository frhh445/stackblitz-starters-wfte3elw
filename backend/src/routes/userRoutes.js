const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getProfile, topupWallet, getTransactions } = require('../controllers/userController');

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);
router.post('/wallet/topup', authMiddleware, topupWallet);
router.get('/transactions', authMiddleware, getTransactions);

module.exports = router;
