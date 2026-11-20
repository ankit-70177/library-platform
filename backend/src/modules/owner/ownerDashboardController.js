import pool from '../../config/db.js';

export const getOwnerDashboard = async (req, res) => {
  const ownerId = req.user.id;

  try {
    const [
      libraryStats,
      bookingStats,
      paymentStats,
      subscriptionStats,
      reviewStats,
      recentBookings,
      recentPayments,
      recentReviews
    ] = await Promise.all([

      // Library statistics
      pool.query(
        `SELECT
           COUNT(*)::INTEGER AS total,
           COUNT(*) FILTER (WHERE status = 'approved')::INTEGER AS approved,
           COUNT(*) FILTER (WHERE status = 'pending')::INTEGER AS pending,
           COUNT(*) FILTER (WHERE status = 'rejected')::INTEGER AS rejected
         FROM libraries
         WHERE owner_id = $1`,
        [ownerId]
      ),

      // Booking statistics
      pool.query(
        `SELECT
           COUNT(*)::INTEGER AS total,
           COUNT(*) FILTER (
             WHERE b.status = 'confirmed'
               AND b.start_time > CURRENT_TIMESTAMP
           )::INTEGER AS upcoming,
           COUNT(*) FILTER (WHERE b.status = 'completed')::INTEGER AS completed,
           COUNT(*) FILTER (WHERE b.status = 'cancelled')::INTEGER AS cancelled
         FROM bookings b
         JOIN libraries l ON l.id = b.library_id
         WHERE l.owner_id = $1`,
        [ownerId]
      ),

      // Payment statistics
      pool.query(
        `SELECT
           COUNT(*)::INTEGER AS total,
           COUNT(*) FILTER (WHERE p.status = 'success')::INTEGER AS successful,
           COUNT(*) FILTER (WHERE p.status = 'failed')::INTEGER AS failed,
           COALESCE(
             SUM(p.amount) FILTER (WHERE p.status = 'success'), 0
           ) AS total_revenue
         FROM payments p
         JOIN libraries l ON l.id = p.library_id
         WHERE l.owner_id = $1`,
        [ownerId]
      ),

      // Membership statistics
      pool.query(
        `SELECT
           COUNT(*)::INTEGER AS total,
           COUNT(*) FILTER (
             WHERE s.status = 'active'
               AND s.end_date > CURRENT_TIMESTAMP
           )::INTEGER AS active,
           COUNT(*) FILTER (
             WHERE s.status = 'expired'
                OR (s.status = 'active' AND s.end_date <= CURRENT_TIMESTAMP)
           )::INTEGER AS expired,
           COUNT(*) FILTER (WHERE s.status = 'cancelled')::INTEGER AS cancelled
         FROM subscriptions s
         JOIN libraries l ON l.id = s.library_id
         WHERE l.owner_id = $1`,
        [ownerId]
      ),

      // Review statistics
      pool.query(
        `SELECT
           COUNT(*)::INTEGER AS total,
           COALESCE(ROUND(AVG(r.rating), 2), 0) AS average_rating
         FROM reviews r
         JOIN libraries l ON l.id = r.library_id
         WHERE l.owner_id = $1`,
        [ownerId]
      ),

      // Recent bookings
      pool.query(
        `SELECT
           b.id, b.seats_booked, b.start_time, b.end_time,
           b.status, u.name AS customer_name,
           l.name AS library_name
         FROM bookings b
         JOIN libraries l ON l.id = b.library_id
         JOIN users u ON u.id = b.customer_id
         WHERE l.owner_id = $1
         ORDER BY b.created_at DESC
         LIMIT 5`,
        [ownerId]
      ),

      // Recent payments
      pool.query(
        `SELECT
           p.id, p.amount, p.currency, p.status,
           p.transaction_id, p.created_at,
           u.name AS customer_name,
           l.name AS library_name,
           mp.name AS plan_name
         FROM payments p
         JOIN libraries l ON l.id = p.library_id
         JOIN users u ON u.id = p.customer_id
         JOIN membership_plans mp ON mp.id = p.plan_id
         WHERE l.owner_id = $1
         ORDER BY p.created_at DESC
         LIMIT 5`,
        [ownerId]
      ),

      // Recent reviews
      pool.query(
        `SELECT
           r.id, r.rating, r.comment, r.created_at,
           u.name AS customer_name,
           l.name AS library_name
         FROM reviews r
         JOIN libraries l ON l.id = r.library_id
         JOIN users u ON u.id = r.customer_id
         WHERE l.owner_id = $1
         ORDER BY r.created_at DESC
         LIMIT 5`,
        [ownerId]
      )
    ]);

    return res.status(200).json({
      success: true,
      dashboard: {
        statistics: {
          libraries: libraryStats.rows[0],
          bookings: bookingStats.rows[0],
          payments: paymentStats.rows[0],
          memberships: subscriptionStats.rows[0],
          reviews: reviewStats.rows[0]
        },

        recent_activity: {
          bookings: recentBookings.rows,
          payments: recentPayments.rows,
          reviews: recentReviews.rows
        }
      }
    });

  } catch (error) {
    console.error('Owner dashboard error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch owner dashboard.'
    });
  }
};
