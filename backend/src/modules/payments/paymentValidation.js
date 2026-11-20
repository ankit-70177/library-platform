export const validatePayment = (body) => {
  const { library_id, plan_id, payment_status } = body;

  if (!Number.isSafeInteger(library_id) || library_id <= 0) {
    return 'A valid library_id is required.';
  }

  if (!Number.isSafeInteger(plan_id) || plan_id <= 0) {
    return 'A valid plan_id is required.';
  }

  if (!['success', 'failed'].includes(payment_status)) {
    return 'payment_status must be success or failed.';
  }

  return null;
};
