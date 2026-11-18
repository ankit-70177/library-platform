import express from 'express'

import {
  applyAsOwner,
  getOwnerApplications,
  approveOwnerApplication,
  rejectOwnerApplication,
} from '../modules/owner/ownerController.js'

import { authenticateUser } from '../middleware/authMiddleware.js'
import { authorizeRole } from '../middleware/authorizeRole.js'

const router = express.Router()

// Public owner application
router.post('/apply', applyAsOwner)

// Admin-only routes
router.get(
  '/applications',
  authenticateUser,
  authorizeRole('admin'),
  getOwnerApplications
)

router.patch(
  '/applications/:id/approve',
  authenticateUser,
  authorizeRole('admin'),
  approveOwnerApplication
)

router.patch(
  '/applications/:id/reject',
  authenticateUser,
  authorizeRole('admin'),
  rejectOwnerApplication
)

export default router