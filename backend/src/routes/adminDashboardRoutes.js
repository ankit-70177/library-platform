import express from 'express';

import {
  getAdminDashboard
} from '../modules/admin/adminDashboardController.js';

import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

router.get(
  '/dashboard',
  authenticateUser,
  authorizeRole('admin'),
  getAdminDashboard
);

export default router;
