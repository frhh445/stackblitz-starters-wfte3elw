const express = require('express');
const { authMiddleware } = require('./auth');
const { listAvailableNumbers, buyNumber, getMyMessages } = require('./numberController');

const router = express.Router();

router.get('/available', authMiddleware, listAvailableNumbers);
router.post('/buy', authMiddleware, buyNumber);
router.get('/messages', authMiddleware, getMyMessages);

module.exports = router;
