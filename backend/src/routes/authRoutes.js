
import express from 'express'
import { register } from '../modules/auth/authController.js'

const router = express.Router()

// Customer registration
router.post('/register', register)

export default router
