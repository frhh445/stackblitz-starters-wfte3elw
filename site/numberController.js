const pool = require('./db');
const { adjustBalanceWithTransaction } = require('./walletService');

async function listAvailableNumbers(_req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT id, country_code, number_value, service_name, price
       FROM virtual_numbers
       WHERE status = 'available'
       ORDER BY created_at ASC`,
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function buyNumber(req, res) {
  const connection = await pool.getConnection();

  try {
    const { numberId } = req.body;

    if (!numberId) {
      return res.status(400).json({ message: 'numberId is required.' });
    }

    await connection.beginTransaction();

    const [numberRows] = await connection.execute(
      'SELECT id, number_value, service_name, price, status FROM virtual_numbers WHERE id = ? FOR UPDATE',
      [numberId],
    );

    if (!numberRows.length) {
      await connection.rollback();
      return res.status(404).json({ message: 'Number not found.' });
    }

    const number = numberRows[0];
    if (number.status !== 'available') {
      await connection.rollback();
      return res.status(409).json({ message: 'Number is not available.' });
    }

    await connection.commit();
    connection.release();

    await adjustBalanceWithTransaction(
      req.user.id,
      -Number(number.price),
      'debit',
      `Purchased ${number.service_name} activation on ${number.number_value}`,
    );

    const finalConnection = await pool.getConnection();
    try {
      await finalConnection.beginTransaction();

      await finalConnection.execute(
        "UPDATE virtual_numbers SET status = 'sold', assigned_user_id = ? WHERE id = ?",
        [req.user.id, number.id],
      );

      const [activationResult] = await finalConnection.execute(
        `INSERT INTO sms_activations (user_id, number_id, status)
         VALUES (?, ?, 'active')`,
        [req.user.id, number.id],
      );

      await finalConnection.commit();

      return res.status(201).json({
        message: 'Number purchased successfully.',
        activation_id: activationResult.insertId,
      });
    } catch (error) {
      await finalConnection.rollback();
      throw error;
    } finally {
      finalConnection.release();
    }
  } catch (error) {
    if (connection) {
      try {
        connection.release();
      } catch {
        // ignore
      }
    }

    return res.status(400).json({ message: error.message });
  }
}

async function getMyMessages(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT m.id, vn.number_value, m.sender, m.message_text, m.received_at
       FROM sms_messages m
       JOIN sms_activations sa ON m.activation_id = sa.id
       JOIN virtual_numbers vn ON sa.number_id = vn.id
       WHERE sa.user_id = ?
       ORDER BY m.received_at DESC`,
      [req.user.id],
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = { listAvailableNumbers, buyNumber, getMyMessages };
