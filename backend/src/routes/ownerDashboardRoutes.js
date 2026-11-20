import express from 'express';

import {
  getOwnerDashboard
} from '../modules/owner/ownerDashboardController.js';

import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

router.get(
  '/dashboard',
  authenticateUser,
  authorizeRole('owner'),
  getOwnerDashboard
);

export default router;
