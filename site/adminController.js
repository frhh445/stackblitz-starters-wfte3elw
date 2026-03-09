const pool = require('./db');

async function getDashboardStats(_req, res) {
  try {
    const [[users]] = await pool.execute('SELECT COUNT(*) AS total_users FROM users');
    const [[numbers]] = await pool.execute('SELECT COUNT(*) AS total_numbers FROM virtual_numbers');
    const [[sold]] = await pool.execute("SELECT COUNT(*) AS sold_numbers FROM virtual_numbers WHERE status = 'sold'");
    const [[revenue]] = await pool.execute(
      "SELECT IFNULL(SUM(ABS(amount)),0) AS total_revenue FROM transactions WHERE type='debit'",
    );

    return res.json({
      total_users: users.total_users,
      total_numbers: numbers.total_numbers,
      sold_numbers: sold.sold_numbers,
      total_revenue: Number(revenue.total_revenue),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function listUsers(_req, res) {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, wallet_balance, created_at FROM users ORDER BY created_at DESC',
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = { getDashboardStats, listUsers };
