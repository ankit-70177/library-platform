import express from 'express'

import {
  createBooking,
  getMyBookings,
  cancelBooking,
  getOwnerBookings,
  getAllBookings,
} from '../modules/bookings/bookingController.js'

import { authenticateUser } from '../middleware/authMiddleware.js'
import { authorizeRole } from '../middleware/authorizeRole.js'

const router = express.Router()

router.use(authenticateUser)

// Customer routes
router.post('/', authorizeRole('customer'), createBooking)
router.get('/my', authorizeRole('customer'), getMyBookings)
router.patch('/:id/cancel', authorizeRole('customer'), cancelBooking)

// Owner routes
router.get('/owner', authorizeRole('owner'), getOwnerBookings)

// Admin routes
router.get('/admin', authorizeRole('admin'), getAllBookings)

export default router
