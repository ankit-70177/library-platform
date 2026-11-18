import cors from 'cors'
import express from 'express'
import pool from './config/db.js'
import authRoutes from './routes/authRoutes.js'

const app = express()

app.use(express.json())
app.use(cors({
  origin: 'http://localhost:5173',
}))

app.use('/api/auth', authRoutes)

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

export default app
