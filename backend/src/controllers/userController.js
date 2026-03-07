const pool = require('../config/db');
const { adjustBalanceWithTransaction } = require('../services/walletService');

async function getProfile(req, res) {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, wallet_balance, created_at FROM users WHERE id = ?',
      [req.user.id],
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function topupWallet(req, res) {
  try {
    const { amount } = req.body;
    const parsed = Number(amount);

    if (!parsed || parsed <= 0) {
      return res.status(400).json({ message: 'Top-up amount must be greater than 0.' });
    }

    const newBalance = await adjustBalanceWithTransaction(
      req.user.id,
      parsed,
      'credit',
      'Manual top-up',
    );

    return res.json({ message: 'Top-up successful.', wallet_balance: newBalance });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function getTransactions(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT id, amount, type, description, created_at
       FROM transactions
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id],
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = { getProfile, topupWallet, getTransactions };
