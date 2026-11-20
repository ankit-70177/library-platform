import pool from '../../config/db.js'
import {
  isValidId,
  validatePlan,
} from './subscriptionValidation.js'

// Public: List active membership plans
export const getPlans = async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, description, duration_days, price
       FROM membership_plans
       WHERE is_active = TRUE
       ORDER BY duration_days ASC`
    )

    return res.status(200).json({
      count: result.rowCount,
      plans: result.rows,
    })
  } catch (error) {
    console.error('Get plans error:', error.message)
    return res.status(500).json({ message: 'Unable to fetch membership plans.' })
  }
}

// Admin: Create a membership plan
export const createPlan = async (req, res) => {
  try {
    const validationError = validatePlan(req.body)

    if (validationError) {
      return res.status(400).json({ message: validationError })
    }

    const { name, description = null, duration_days, price } = req.body

    const result = await pool.query(
      `INSERT INTO membership_plans
        (name, description, duration_days, price)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name.trim(), description, duration_days, price]
    )

    return res.status(201).json({
      message: 'Membership plan created successfully.',
      plan: result.rows[0],
    })
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'A plan with this name already exists.' })
    }

    console.error('Create plan error:', error.message)
    return res.status(500).json({ message: 'Unable to create membership plan.' })
  }
}

// Customer: Subscribe to an approved library
export const createSubscription = async (req, res) => {
  const { library_id, plan_id } = req.body

  if (!isValidId(library_id) || !isValidId(plan_id)) {
    return res.status(400).json({
      message: 'Valid library_id and plan_id are required.',
    })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const library = await client.query(
      `SELECT id, name
       FROM libraries
       WHERE id = $1 AND status = 'approved'
       FOR SHARE`,
      [Number(library_id)]
    )

    if (library.rowCount === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ message: 'Approved library not found.' })
    }

    const plan = await client.query(
      `SELECT id, name, duration_days, price
       FROM membership_plans
       WHERE id = $1 AND is_active = TRUE`,
      [Number(plan_id)]
    )

    if (plan.rowCount === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ message: 'Active membership plan not found.' })
    }

    // Expire old subscriptions before checking for an active one.
    await client.query(
      `UPDATE subscriptions
       SET status = 'expired', updated_at = CURRENT_TIMESTAMP
       WHERE customer_id = $1
         AND library_id = $2
         AND status = 'active'
         AND end_date <= CURRENT_TIMESTAMP`,
      [req.user.id, Number(library_id)]
    )

    const existing = await client.query(
      `SELECT id
       FROM subscriptions
       WHERE customer_id = $1
         AND library_id = $2
         AND status = 'active'
       LIMIT 1`,
      [req.user.id, Number(library_id)]
    )

    if (existing.rowCount > 0) {
      await client.query('ROLLBACK')
      return res.status(409).json({
        message: 'You already have an active subscription to this library.',
      })
    }

    const subscription = await client.query(
      `INSERT INTO subscriptions
        (customer_id, library_id, plan_id, start_date, end_date)
       VALUES (
         $1, $2, $3, CURRENT_TIMESTAMP,
         CURRENT_TIMESTAMP + ($4 * INTERVAL '1 day')
       )
       RETURNING *`,
      [
        req.user.id,
        Number(library_id),
        Number(plan_id),
        plan.rows[0].duration_days,
      ]
    )

    await client.query('COMMIT')

    return res.status(201).json({
      message: 'Library subscription created successfully.',
      subscription: subscription.rows[0],
    })
  } catch (error) {
    await client.query('ROLLBACK')

    if (error.code === '23505') {
      return res.status(409).json({
        message: 'An active subscription already exists for this library.',
      })
    }

    console.error('Create subscription error:', error.message)
    return res.status(500).json({ message: 'Unable to create subscription.' })
  } finally {
    client.release()
  }
}

// Customer: View own subscriptions
export const getMySubscriptions = async (req, res) => {
  try {
    await pool.query(
      `UPDATE subscriptions
       SET status = 'expired', updated_at = CURRENT_TIMESTAMP
       WHERE customer_id = $1
         AND status = 'active'
         AND end_date <= CURRENT_TIMESTAMP`,
      [req.user.id]
    )

    const result = await pool.query(
      `SELECT
         s.*,
         l.name AS library_name,
         l.city AS library_city,
         p.name AS plan_name,
         p.duration_days,
         p.price
       FROM subscriptions s
       JOIN libraries l ON l.id = s.library_id
       JOIN membership_plans p ON p.id = s.plan_id
       WHERE s.customer_id = $1
       ORDER BY s.created_at DESC`,
      [req.user.id]
    )

    return res.status(200).json({
      count: result.rowCount,
      subscriptions: result.rows,
    })
  } catch (error) {
    console.error('Get subscriptions error:', error.message)
    return res.status(500).json({ message: 'Unable to fetch subscriptions.' })
  }
}

// Customer: Renew an existing subscription
export const renewSubscription = async (req, res) => {
  const { id } = req.params
  const { plan_id } = req.body

  if (!isValidId(id) || !isValidId(plan_id)) {
    return res.status(400).json({ message: 'Valid subscription ID and plan_id are required.' })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const subscription = await client.query(
      `SELECT *
       FROM subscriptions
       WHERE id = $1 AND customer_id = $2
       FOR UPDATE`,
      [Number(id), req.user.id]
    )

    if (subscription.rowCount === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ message: 'Subscription not found.' })
    }

    const plan = await client.query(
      `SELECT id, duration_days
       FROM membership_plans
       WHERE id = $1 AND is_active = TRUE`,
      [Number(plan_id)]
    )

    if (plan.rowCount === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ message: 'Active membership plan not found.' })
    }

    const updated = await client.query(
      `UPDATE subscriptions
       SET plan_id = $1,
           start_date = CASE
             WHEN status = 'active' AND end_date > CURRENT_TIMESTAMP
             THEN start_date
             ELSE CURRENT_TIMESTAMP
           END,
           end_date = GREATEST(end_date, CURRENT_TIMESTAMP)
             + ($2 * INTERVAL '1 day'),
           status = 'active',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [
        Number(plan_id),
        plan.rows[0].duration_days,
        Number(id),
      ]
    )

    await client.query('COMMIT')

    return res.status(200).json({
      message: 'Subscription renewed successfully.',
      subscription: updated.rows[0],
    })
  } catch (error) {
    await client.query('ROLLBACK')

    if (error.code === '23505') {
      return res.status(409).json({
        message: 'Another active subscription already exists for this library.',
      })
    }

    console.error('Renew subscription error:', error.message)
    return res.status(500).json({ message: 'Unable to renew subscription.' })
  } finally {
    client.release()
  }
}

// Customer: Cancel own subscription
export const cancelSubscription = async (req, res) => {
  const { id } = req.params

  if (!isValidId(id)) {
    return res.status(400).json({ message: 'Invalid subscription ID.' })
  }

  try {
    const result = await pool.query(
      `UPDATE subscriptions
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
         AND customer_id = $2
         AND status = 'active'
       RETURNING *`,
      [Number(id), req.user.id]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: 'Active subscription not found.',
      })
    }

    return res.status(200).json({
      message: 'Subscription cancelled successfully.',
      subscription: result.rows[0],
    })
  } catch (error) {
    console.error('Cancel subscription error:', error.message)
    return res.status(500).json({ message: 'Unable to cancel subscription.' })
  }
}

// Owner: View subscriptions for own libraries
export const getOwnerSubscriptions = async (req, res) => {
  try {
    await pool.query(
      `UPDATE subscriptions s
       SET status = 'expired', updated_at = CURRENT_TIMESTAMP
       FROM libraries l
       WHERE s.library_id = l.id
         AND l.owner_id = $1
         AND s.status = 'active'
         AND s.end_date <= CURRENT_TIMESTAMP`,
      [req.user.id]
    )

    const result = await pool.query(
      `SELECT
         s.id,
         s.start_date,
         s.end_date,
         s.status,
         s.created_at,
         u.name AS customer_name,
         u.email AS customer_email,
         l.id AS library_id,
         l.name AS library_name,
         p.name AS plan_name,
         p.price
       FROM subscriptions s
       JOIN libraries l ON l.id = s.library_id
       JOIN users u ON u.id = s.customer_id
       JOIN membership_plans p ON p.id = s.plan_id
       WHERE l.owner_id = $1
       ORDER BY s.created_at DESC`,
      [req.user.id]
    )

    return res.status(200).json({
      count: result.rowCount,
      subscriptions: result.rows,
    })
  } catch (error) {
    console.error('Owner subscriptions error:', error.message)
    return res.status(500).json({ message: 'Unable to fetch library subscriptions.' })
  }
}

// Admin: View all subscriptions
export const getAllSubscriptions = async (_req, res) => {
  try {
    await pool.query(
      `UPDATE subscriptions
       SET status = 'expired', updated_at = CURRENT_TIMESTAMP
       WHERE status = 'active' AND end_date <= CURRENT_TIMESTAMP`
    )

    const result = await pool.query(
      `SELECT
         s.*,
         u.name AS customer_name,
         u.email AS customer_email,
         l.name AS library_name,
         p.name AS plan_name,
         p.price
       FROM subscriptions s
       JOIN users u ON u.id = s.customer_id
       JOIN libraries l ON l.id = s.library_id
       JOIN membership_plans p ON p.id = s.plan_id
       ORDER BY s.created_at DESC`
    )

    return res.status(200).json({
      count: result.rowCount,
      subscriptions: result.rows,
    })
  } catch (error) {
    console.error('Admin subscriptions error:', error.message)
    return res.status(500).json({ message: 'Unable to fetch all subscriptions.' })
  }
}
