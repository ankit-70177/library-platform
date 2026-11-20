import pool from '../../config/db.js';

export const getAdminDashboard = async (req, res) => {
  try {
    const [
      userStats,
      libraryStats,
      applicationStats,
      bookingStats,
      paymentStats,
      subscriptionStats,
      reviewStats,
      recentUsers,
      recentBookings,
      recentPayments,
      recentApplications
    ] = await Promise.all([

      // User statistics
      pool.query(
        `SELECT
           COUNT(*)::INTEGER AS total,
           COUNT(*) FILTER (WHERE role = 'customer')::INTEGER AS customers,
           COUNT(*) FILTER (WHERE role = 'owner')::INTEGER AS owners,
           COUNT(*) FILTER (WHERE role = 'admin')::INTEGER AS admins
         FROM users`
      ),

      // Library statistics
      pool.query(
        `SELECT
           COUNT(*)::INTEGER AS total,
           COUNT(*) FILTER (WHERE status = 'approved')::INTEGER AS approved,
           COUNT(*) FILTER (WHERE status = 'pending')::INTEGER AS pending,
           COUNT(*) FILTER (WHERE status = 'rejected')::INTEGER AS rejected
         FROM libraries`
      ),

      // Owner application statistics
      pool.query(
        `SELECT
           COUNT(*)::INTEGER AS total,
           COUNT(*) FILTER (WHERE status = 'pending')::INTEGER AS pending,
           COUNT(*) FILTER (WHERE status = 'approved')::INTEGER AS approved,
           COUNT(*) FILTER (WHERE status = 'rejected')::INTEGER AS rejected
         FROM owner_applications`
      ),

      // Booking statistics
      pool.query(
        `SELECT
           COUNT(*)::INTEGER AS total,
           COUNT(*) FILTER (WHERE status = 'confirmed')::INTEGER AS confirmed,
           COUNT(*) FILTER (WHERE status = 'completed')::INTEGER AS completed,
           COUNT(*) FILTER (WHERE status = 'cancelled')::INTEGER AS cancelled
         FROM bookings`
      ),

      // Payment statistics
      pool.query(
        `SELECT
           COUNT(*)::INTEGER AS total,
           COUNT(*) FILTER (WHERE status = 'success')::INTEGER AS successful,
           COUNT(*) FILTER (WHERE status = 'failed')::INTEGER AS failed,
           COUNT(*) FILTER (WHERE status = 'pending')::INTEGER AS pending,
           COALESCE(
             SUM(amount) FILTER (WHERE status = 'success'), 0
           ) AS total_revenue
         FROM payments`
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
           COUNT(*) FILTER (WHERE status = 'cancelled')::INTEGER AS cancelled
         FROM subscriptions`
      ),

      // Review statistics
      pool.query(
        `SELECT
           COUNT(*)::INTEGER AS total,
           COALESCE(ROUND(AVG(rating), 2), 0) AS average_rating
         FROM reviews`
      ),

      // Recent users
      pool.query(
        `SELECT id, name, email, role, created_at
         FROM users
         ORDER BY created_at DESC
         LIMIT 5`
      ),

      // Recent bookings
      pool.query(
        `SELECT
           b.id, b.seats_booked, b.start_time, b.end_time,
           b.status, u.name AS customer_name,
           l.name AS library_name
         FROM bookings b
         JOIN users u ON u.id = b.customer_id
         JOIN libraries l ON l.id = b.library_id
         ORDER BY b.created_at DESC
         LIMIT 5`
      ),

      // Recent payments
      pool.query(
        `SELECT
           p.id, p.amount, p.currency, p.status,
           p.transaction_id, p.created_at,
           u.name AS customer_name,
           l.name AS library_name
         FROM payments p
         JOIN users u ON u.id = p.customer_id
         JOIN libraries l ON l.id = p.library_id
         ORDER BY p.created_at DESC
         LIMIT 5`
      ),

      // Recent owner applications
      pool.query(
        `SELECT
           id, name, email, library_name,
           status, created_at
         FROM owner_applications
         ORDER BY created_at DESC
         LIMIT 5`
      )
    ]);

    return res.status(200).json({
      success: true,
      dashboard: {
        statistics: {
          users: userStats.rows[0],
          libraries: libraryStats.rows[0],
          owner_applications: applicationStats.rows[0],
          bookings: bookingStats.rows[0],
          payments: paymentStats.rows[0],
          subscriptions: subscriptionStats.rows[0],
          reviews: reviewStats.rows[0]
        },

        recent_activity: {
          users: recentUsers.rows,
          bookings: recentBookings.rows,
          payments: recentPayments.rows,
          owner_applications: recentApplications.rows
        }
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch admin dashboard.'
    });
  }
};
