const express = require('express');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { getDashboardStats, listUsers } = require('../controllers/adminController');

const router = express.Router();

router.get('/stats', authMiddleware, adminOnly, getDashboardStats);
router.get('/users', authMiddleware, adminOnly, listUsers);

module.exports = router;
