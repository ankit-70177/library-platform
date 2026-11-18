
import express from 'express'
import {
  register,
  login,
  getCurrentUser,
} from '../modules/auth/authController.js'

import { authenticateUser } from '../middleware/authMiddleware.js'

const router = express.Router()

// Customer registration
router.post('/register', register)

// Customer login
router.post('/login', login)

// Get currently logged-in user (protected)
router.get('/me', authenticateUser, getCurrentUser)

export default router
