const pool = require('../config/db');

async function addTransaction(connection, userId, amount, type, description) {
  await connection.execute(
    `INSERT INTO transactions (user_id, amount, type, description)
     VALUES (?, ?, ?, ?)`,
    [userId, amount, type, description],
  );
}

async function adjustBalanceWithTransaction(userId, amount, type, description) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute('SELECT wallet_balance FROM users WHERE id = ? FOR UPDATE', [userId]);
    if (!rows.length) {
      throw new Error('User not found.');
    }

    const currentBalance = Number(rows[0].wallet_balance);
    const nextBalance = currentBalance + Number(amount);

    if (nextBalance < 0) {
      throw new Error('Insufficient wallet balance.');
    }

    await connection.execute('UPDATE users SET wallet_balance = ? WHERE id = ?', [nextBalance, userId]);
    await addTransaction(connection, userId, amount, type, description);

    await connection.commit();
    return nextBalance;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { adjustBalanceWithTransaction };
