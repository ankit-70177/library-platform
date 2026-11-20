import express from 'express';

import {
  createPayment,
  getMyPayments,
  getPaymentById,
  getOwnerPayments,
  getAllPayments
} from '../modules/payments/paymentController.js';

import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

router.use(authenticateUser);

// Customer
router.post('/', authorizeRole('customer'), createPayment);
router.get('/my', authorizeRole('customer'), getMyPayments);

// Owner and Admin
router.get('/owner', authorizeRole('owner'), getOwnerPayments);
router.get('/admin', authorizeRole('admin'), getAllPayments);

// Keep dynamic route last
router.get('/:id', authorizeRole('customer'), getPaymentById);

export default router;
