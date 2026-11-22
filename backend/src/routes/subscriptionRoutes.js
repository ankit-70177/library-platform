import express from 'express'

import {
  getPlans,
  createPlan,
  getMySubscriptions,
  cancelSubscription,
  getOwnerSubscriptions,
  getAllSubscriptions,
} from '../modules/subscriptions/subscriptionController.js'

import { authenticateUser } from '../middleware/authMiddleware.js'
import { authorizeRole } from '../middleware/authorizeRole.js'

const router = express.Router()

// Public: View available plans
router.get('/plans', getPlans)

// All routes below require authentication
router.use(authenticateUser)

// Admin: Create a membership plan
router.post(
  '/plans',
  authorizeRole('admin'),
  createPlan
)

// Customer: Create and view subscriptions
router.get(
  '/my',
  authorizeRole('customer'),
  getMySubscriptions
)

// Customer: Renew or cancel a subscription
router.patch(
  '/:id/cancel',
  authorizeRole('customer'),
  cancelSubscription
)

// Owner: View subscriptions for their own libraries
router.get(
  '/owner',
  authorizeRole('owner'),
  getOwnerSubscriptions
)

// Admin: View all subscriptions
router.get(
  '/admin',
  authorizeRole('admin'),
  getAllSubscriptions
)

export default router
