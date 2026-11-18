import cors from 'cors'
import express from 'express'
import pool from './config/db.js'

// Import API route modules
import authRoutes from './routes/authRoutes.js'
import ownerRoutes from './routes/ownerRoutes.js'
import libraryRoutes from './routes/libraryRoutes.js'

const app = express()

// Parse incoming JSON request bodies
app.use(express.json())

// Enable frontend communication
app.use(
  cors({
    origin: 'http://localhost:5173',
  })
)

// Authentication APIs
app.use('/api/auth', authRoutes)

// Owner application and management APIs
app.use('/api/owners', ownerRoutes)

// Library Management APIs
app.use('/api/libraries', libraryRoutes)

// Check backend and PostgreSQL connection
app.get('/api/health', async (_request, response) => {
  try {
    const result = await pool.query(
      'SELECT NOW() AS current_time'
    )

    response.json({
      success: true,
      message: 'Backend and database are running',
      database: 'connected',
      time: result.rows[0].current_time,
    })
  } catch (error) {
    console.error('Health check failed:', error.message)

    response.status(503).json({
      success: false,
      message: 'Database connection failed',
      database: 'disconnected',
    })
  }
})

// Export Express application
export default app
import discoveryRoutes from './routes/discoveryRoutes.js'
// Public Library Discovery APIs
app.use('/api/discovery', discoveryRoutes)
