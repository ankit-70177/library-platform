import pool from '../../config/db.js';

export const getCustomerDashboard = async (req, res) => {
  const customerId = req.user.id;

  try {
    const [
      profile,
      subscriptionStats,
      bookingStats,
      paymentStats,
      reviewStats,
      recentSubscriptions,
      recentBookings,
      recentPayments,
      recentReviews
    ] = await Promise.all([

      // Customer profile
      pool.query(
        `SELECT id, name, email, role, created_at
         FROM users
         WHERE id = $1 AND role = 'customer'`,
        [customerId]
      ),

      // Subscription statistics
      pool.query(
        `SELECT
           COUNT(*)::INTEGER AS total,
           COUNT(*) FILTER (
             WHERE status = 'active'
               AND end_date > CURRENT_TIMESTAMP
           )::INTEGER AS active,
           COUNT(*) FILTER (
             WHERE status = 'expired'
                OR (status = 'active' AND end_date <= CURRENT_TIMESTAMP)
           )::INTEGER AS expired,
           COUNT(*) FILTER (
             WHERE status = 'cancelled'
           )::INTEGER AS cancelled
         FROM subscriptions
         WHERE customer_id = $1`,
        [customerId]
      ),

      // Booking statistics
      pool.query(
        `SELECT
           COUNT(*)::INTEGER AS total,
           COUNT(*) FILTER (
             WHERE status = 'confirmed'
               AND start_time > CURRENT_TIMESTAMP
           )::INTEGER AS upcoming,
           COUNT(*) FILTER (
             WHERE status = 'completed'
           )::INTEGER AS completed,
           COUNT(*) FILTER (
             WHERE status = 'cancelled'
           )::INTEGER AS cancelled
         FROM bookings
         WHERE customer_id = $1`,
        [customerId]
      ),

      // Payment statistics
      pool.query(
        `SELECT
           COUNT(*)::INTEGER AS total,
           COUNT(*) FILTER (
             WHERE status = 'success'
           )::INTEGER AS successful,
           COUNT(*) FILTER (
             WHERE status = 'failed'
           )::INTEGER AS failed,
           COALESCE(
             SUM(amount) FILTER (WHERE status = 'success'), 0
           ) AS total_successful_amount
         FROM payments
         WHERE customer_id = $1`,
        [customerId]
      ),

      // Review statistics
      pool.query(
        `SELECT
           COUNT(*)::INTEGER AS total,
           COALESCE(ROUND(AVG(rating), 2), 0) AS average_rating
         FROM reviews
         WHERE customer_id = $1`,
        [customerId]
      ),

      // Recent subscriptions
      pool.query(
        `SELECT
           s.id, s.status, s.start_date, s.end_date,
           l.name AS library_name,
           p.name AS plan_name, p.price
         FROM subscriptions s
         JOIN libraries l ON l.id = s.library_id
         JOIN membership_plans p ON p.id = s.plan_id
         WHERE s.customer_id = $1
         ORDER BY s.created_at DESC
         LIMIT 5`,
        [customerId]
      ),

      // Recent bookings
      pool.query(
        `SELECT
           b.id, b.seats_booked, b.start_time, b.end_time,
           b.status, l.name AS library_name, l.city
         FROM bookings b
         JOIN libraries l ON l.id = b.library_id
         WHERE b.customer_id = $1
         ORDER BY b.created_at DESC
         LIMIT 5`,
        [customerId]
      ),

      // Recent payments
      pool.query(
        `SELECT
           p.id, p.amount, p.currency, p.status,
           p.transaction_id, p.created_at,
           l.name AS library_name,
           mp.name AS plan_name
         FROM payments p
         JOIN libraries l ON l.id = p.library_id
         JOIN membership_plans mp ON mp.id = p.plan_id
         WHERE p.customer_id = $1
         ORDER BY p.created_at DESC
         LIMIT 5`,
        [customerId]
      ),

      // Recent reviews
      pool.query(
        `SELECT
           r.id, r.rating, r.comment, r.created_at,
           l.name AS library_name
         FROM reviews r
         JOIN libraries l ON l.id = r.library_id
         WHERE r.customer_id = $1
         ORDER BY r.created_at DESC
         LIMIT 5`,
        [customerId]
      )
    ]);

    if (profile.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found.'
      });
    }

    return res.status(200).json({
      success: true,
      dashboard: {
        profile: profile.rows[0],

        statistics: {
          subscriptions: subscriptionStats.rows[0],
          bookings: bookingStats.rows[0],
          payments: paymentStats.rows[0],
          reviews: reviewStats.rows[0]
        },

        recent_activity: {
          subscriptions: recentSubscriptions.rows,
          bookings: recentBookings.rows,
          payments: recentPayments.rows,
          reviews: recentReviews.rows
        }
      }
    });

  } catch (error) {
    console.error('Customer dashboard error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch customer dashboard.'
    });
  }
};
