export const validateReview = (body) => {
  const { library_id, rating, comment } = body;

  if (!Number.isSafeInteger(library_id) || library_id <= 0) {
    return 'A valid library_id is required.';
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return 'Rating must be an integer between 1 and 5.';
  }

  if (
    comment !== undefined &&
    comment !== null &&
    typeof comment !== 'string'
  ) {
    return 'Comment must be a string.';
  }

  if (typeof comment === 'string' && comment.trim().length > 1000) {
    return 'Comment cannot exceed 1000 characters.';
  }

  return null;
};

export const validateReviewUpdate = (body) => {
  const { rating, comment } = body;

  if (rating === undefined && comment === undefined) {
    return 'At least one field (rating or comment) is required.';
  }

  if (
    rating !== undefined &&
    (!Number.isInteger(rating) || rating < 1 || rating > 5)
  ) {
    return 'Rating must be an integer between 1 and 5.';
  }

  if (
    comment !== undefined &&
    comment !== null &&
    typeof comment !== 'string'
  ) {
    return 'Comment must be a string.';
  }

  if (typeof comment === 'string' && comment.trim().length > 1000) {
    return 'Comment cannot exceed 1000 characters.';
  }

  return null;
};
