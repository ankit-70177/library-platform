import express from 'express';

import {
  createReview,
  getLibraryReviews,
  getMyReviews,
  updateReview,
  deleteReview
} from '../modules/reviews/reviewController.js';

import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

// Customer: View own reviews
router.get('/my', authenticateUser, authorizeRole('customer'), getMyReviews);

// Public: View approved library reviews
router.get('/library/:libraryId', getLibraryReviews);

// Customer: Create, update and delete own reviews
router.post(
  '/',
  authenticateUser,
  authorizeRole('customer'),
  createReview
);

router.patch(
  '/:id',
  authenticateUser,
  authorizeRole('customer'),
  updateReview
);

router.delete(
  '/:id',
  authenticateUser,
  authorizeRole('customer'),
  deleteReview
);

export default router;
