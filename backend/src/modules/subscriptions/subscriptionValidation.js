export const isValidId = (value) => {
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 && id <= 2147483647
}

export const validatePlan = (body) => {
  const { name, description, duration_days, price } = body

  if (
    typeof name !== 'string' ||
    !name.trim() ||
    name.trim().length > 100
  ) {
    return 'Plan name is required and must be at most 100 characters.'
  }

  if (
    !Number.isInteger(duration_days) ||
    duration_days < 1 ||
    duration_days > 3650
  ) {
    return 'Duration must be an integer between 1 and 3650 days.'
  }

  if (
    typeof price !== 'number' ||
    !Number.isFinite(price) ||
    price < 0 ||
    price > 99999999
  ) {
    return 'Price must be a valid non-negative number.'
  }

  if (
    description !== undefined &&
    description !== null &&
    typeof description !== 'string'
  ) {
    return 'Description must be a string.'
  }

  return null
}
