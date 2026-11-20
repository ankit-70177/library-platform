import crypto from 'node:crypto';
import pool from '../../config/db.js';
import { validatePayment } from './paymentValidation.js';

export const createPayment = async (req, res) => {
  const validationError = validatePayment(req.body);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const { library_id, plan_id, payment_status } = req.body;
  const customerId = req.user.id;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const libraryResult = await client.query(
      `SELECT id FROM libraries
       WHERE id = $1 AND status = 'approved'
       FOR UPDATE`,
      [library_id]
    );

    if (libraryResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Approved library not found.' });
    }

    const planResult = await client.query(
      `SELECT id, name, duration_days, price
       FROM membership_plans
       WHERE id = $1 AND is_active = true`,
      [plan_id]
    );

    if (planResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Active membership plan not found.' });
    }

    const plan = planResult.rows[0];

    const existing = await client.query(
      `SELECT id FROM subscriptions
       WHERE customer_id = $1 AND library_id = $2
       AND status = 'active' AND end_date > CURRENT_TIMESTAMP`,
      [customerId, library_id]
    );

    if (existing.rowCount > 0 && payment_status === 'success') {
      await client.query('ROLLBACK');
      return res.status(409).json({
        message: 'You already have an active subscription to this library.'
      });
    }

    const transactionId = `KITAAB-${crypto.randomUUID()}`;

    if (payment_status === 'failed') {
      const failedPayment = await client.query(
        `INSERT INTO payments
         (customer_id, library_id, plan_id, amount, transaction_id,
          status, failure_reason)
         VALUES ($1, $2, $3, $4, $5, 'failed', $6)
         RETURNING *`,
        [
          customerId,
          library_id,
          plan_id,
          plan.price,
          transactionId,
          'Demo payment failed.'
        ]
      );

      await client.query('COMMIT');

      return res.status(402).json({
        message: 'Demo payment failed. Subscription was not activated.',
        payment: failedPayment.rows[0]
      });
    }

    const subscriptionResult = await client.query(
      `INSERT INTO subscriptions
       (customer_id, library_id, plan_id, start_date, end_date, status)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP + ($4 * INTERVAL '1 day'), 'active')
       RETURNING *`,
      [customerId, library_id, plan_id, plan.duration_days]
    );

    const subscription = subscriptionResult.rows[0];

    const paymentResult = await client.query(
      `INSERT INTO payments
       (customer_id, library_id, plan_id, subscription_id,
        amount, transaction_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'success')
       RETURNING *`,
      [
        customerId,
        library_id,
        plan_id,
        subscription.id,
        plan.price,
        transactionId
      ]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Demo payment successful. Subscription activated.',
      payment: paymentResult.rows[0],
      subscription
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create payment error:', error);

    return res.status(500).json({
      message: 'Unable to process demo payment.'
    });
  } finally {
    client.release();
  }
};

export const getMyPayments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, l.name AS library_name, mp.name AS plan_name
       FROM payments p
       JOIN libraries l ON l.id = p.library_id
       JOIN membership_plans mp ON mp.id = p.plan_id
       WHERE p.customer_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({
      count: result.rowCount,
      payments: result.rows
    });
  } catch (error) {
    console.error('Get customer payments error:', error);
    return res.status(500).json({ message: 'Unable to fetch payments.' });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM payments
       WHERE id = $1 AND customer_id = $2`,
      [req.params.id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Payment not found.' });
    }

    return res.status(200).json({ payment: result.rows[0] });
  } catch (error) {
    console.error('Get payment error:', error);
    return res.status(500).json({ message: 'Unable to fetch payment.' });
  }
};

export const getOwnerPayments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, l.name AS library_name, u.name AS customer_name,
              u.email AS customer_email
       FROM payments p
       JOIN libraries l ON l.id = p.library_id
       JOIN users u ON u.id = p.customer_id
       WHERE l.owner_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({
      count: result.rowCount,
      payments: result.rows
    });
  } catch (error) {
    console.error('Get owner payments error:', error);
    return res.status(500).json({ message: 'Unable to fetch payments.' });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, l.name AS library_name, u.name AS customer_name,
              u.email AS customer_email
       FROM payments p
       JOIN libraries l ON l.id = p.library_id
       JOIN users u ON u.id = p.customer_id
       ORDER BY p.created_at DESC`
    );

    return res.status(200).json({
      count: result.rowCount,
      payments: result.rows
    });
  } catch (error) {
    console.error('Get admin payments error:', error);
    return res.status(500).json({ message: 'Unable to fetch payments.' });
  }
};
