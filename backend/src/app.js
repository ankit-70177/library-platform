import cors from 'cors';
import express from 'express';
import pool from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import ownerRoutes from './routes/ownerRoutes.js';
import libraryRoutes from './routes/libraryRoutes.js';
import savedLibraryRoutes from './routes/savedLibraryRoutes.js';
import discoveryRoutes from './routes/discoveryRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import ownerDashboardRoutes from './routes/ownerDashboardRoutes.js';
import adminDashboardRoutes from './routes/adminDashboardRoutes.js';

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: 'http://localhost:5173',
  })
);

// Authentication
app.use('/api/auth', authRoutes);

// Owner management
app.use('/api/owners', ownerRoutes);

// Library management
app.use('/api/libraries', libraryRoutes);
app.use('/api/saved-libraries', savedLibraryRoutes);

// Library discovery
app.use('/api/discovery', discoveryRoutes);

// Membership and subscriptions
app.use('/api/subscriptions', subscriptionRoutes);

// Booking and seat management
app.use('/api/bookings', bookingRoutes);

// Payment management
app.use('/api/payments', paymentRoutes);

// Reviews and ratings
app.use('/api/reviews', reviewRoutes);

// Customer dashboard
app.use('/api/customer', customerRoutes);

// Owner dashboard
app.use('/api/owner', ownerDashboardRoutes);

// Admin dashboard
app.use('/api/admin', adminDashboardRoutes);

// Health check
app.get('/api/health', async (_request, response) => {
  try {
    const result = await pool.query('SELECT NOW() AS current_time');

    response.json({
      success: true,
      message: 'Backend and database are running',
      database: 'connected',
      time: result.rows[0].current_time,
    });
  } catch (error) {
    console.error('Health check failed:', error.message);

    response.status(503).json({
      success: false,
      message: 'Database connection failed',
      database: 'disconnected',
    });
  }
});

export default app;
