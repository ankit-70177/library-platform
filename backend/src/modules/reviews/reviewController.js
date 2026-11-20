import pool from '../../config/db.js';
import {
  validateReview,
  validateReviewUpdate
} from './reviewValidation.js';

const isValidId = (id) => Number.isSafeInteger(Number(id)) && Number(id) > 0;

// Create review
export const createReview = async (req, res) => {
  const error = validateReview(req.body);

  if (error) {
    return res.status(400).json({ success: false, message: error });
  }

  const customerId = req.user.id;
  const { library_id, rating, comment } = req.body;

  try {
    const library = await pool.query(
      `SELECT id FROM libraries
       WHERE id = $1 AND status = 'approved'`,
      [library_id]
    );

    if (library.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Approved library not found.'
      });
    }

    const eligibility = await pool.query(
      `SELECT
        EXISTS (
          SELECT 1 FROM subscriptions
          WHERE customer_id = $1
            AND library_id = $2
            AND status = 'active'
            AND end_date > CURRENT_TIMESTAMP
        )
        OR EXISTS (
          SELECT 1 FROM bookings
          WHERE customer_id = $1
            AND library_id = $2
            AND status = 'completed'
        ) AS eligible`,
      [customerId, library_id]
    );

    if (!eligibility.rows[0].eligible) {
      return res.status(403).json({
        success: false,
        message: 'You need an active subscription or completed booking to review this library.'
      });
    }

    const result = await pool.query(
      `INSERT INTO reviews (customer_id, library_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [customerId, library_id, rating, comment?.trim() || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      review: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this library.'
      });
    }

    console.error('Create review error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to submit review.'
    });
  }
};

// Get reviews submitted by the logged-in customer
export const getMyReviews = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         r.id,
         r.customer_id,
         r.library_id,
         l.name AS library_name,
         r.rating,
         r.comment,
         r.created_at,
         r.updated_at
       FROM reviews r
       JOIN libraries l ON l.id = r.library_id
       WHERE r.customer_id = $1
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      count: result.rowCount,
      reviews: result.rows
    });
  } catch (error) {
    console.error('Get my reviews error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch your reviews.'
    });
  }
};

// Get reviews for a library
export const getLibraryReviews = async (req, res) => {
  const libraryId = Number(req.params.libraryId);

  if (!isValidId(libraryId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid library ID.'
    });
  }

  try {
    const library = await pool.query(
      `SELECT id FROM libraries
       WHERE id = $1 AND status = 'approved'`,
      [libraryId]
    );

    if (library.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Approved library not found.'
      });
    }

    const result = await pool.query(
      `SELECT
         r.id,
         r.customer_id,
         u.name AS customer_name,
         r.library_id,
         r.rating,
         r.comment,
         r.created_at,
         r.updated_at
       FROM reviews r
       JOIN users u ON u.id = r.customer_id
       WHERE r.library_id = $1
       ORDER BY r.created_at DESC`,
      [libraryId]
    );

    const summary = await pool.query(
      `SELECT
         COUNT(*)::INTEGER AS total_reviews,
         COALESCE(ROUND(AVG(rating), 2), 0) AS average_rating
       FROM reviews
       WHERE library_id = $1`,
      [libraryId]
    );

    return res.status(200).json({
      success: true,
      ...summary.rows[0],
      reviews: result.rows
    });
  } catch (error) {
    console.error('Get library reviews error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews.'
    });
  }
};

// Update own review
export const updateReview = async (req, res) => {
  const reviewId = Number(req.params.id);

  if (!isValidId(reviewId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid review ID.'
    });
  }

  const error = validateReviewUpdate(req.body);

  if (error) {
    return res.status(400).json({ success: false, message: error });
  }

  const { rating, comment } = req.body;
  const customerId = req.user.id;

  try {
    const result = await pool.query(
      `UPDATE reviews
       SET rating = COALESCE($1, rating),
           comment = CASE WHEN $2::boolean
             THEN $3::text ELSE comment END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND customer_id = $5
       RETURNING *`,
      [
        rating ?? null,
        Object.prototype.hasOwnProperty.call(req.body, 'comment'),
        comment === null ? null : comment?.trim(),
        reviewId,
        customerId
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you are not allowed to update it.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Review updated successfully.',
      review: result.rows[0]
    });
  } catch (error) {
    console.error('Update review error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update review.'
    });
  }
};

// Delete own review
export const deleteReview = async (req, res) => {
  const reviewId = Number(req.params.id);

  if (!isValidId(reviewId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid review ID.'
    });
  }

  try {
    const result = await pool.query(
      `DELETE FROM reviews
       WHERE id = $1 AND customer_id = $2
       RETURNING id`,
      [reviewId, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you are not allowed to delete it.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully.'
    });
  } catch (error) {
    console.error('Delete review error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to delete review.'
    });
  }
};
