import express from 'express';

import {
  getCustomerDashboard
} from '../modules/customer/customerDashboardController.js';

import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

router.use(authenticateUser);

router.get(
  '/dashboard',
  authorizeRole('customer'),
  getCustomerDashboard
);

export default router;
