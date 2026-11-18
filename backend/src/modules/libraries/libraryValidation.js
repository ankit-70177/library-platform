
const allowedFields = [
  'name',
  'description',
  'address',
  'city',
  'locality',
  'latitude',
  'longitude',
  'phone',
  'opening_hours',
  'total_seats',
  'facilities',
  'photos',
]

const requiredFields = ['name', 'address', 'city']

export const validateLibrary = (data, isUpdate = false) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return 'Invalid request body.'
  }

  const fields = Object.keys(data)

  if (fields.length === 0) {
    return 'At least one field is required.'
  }

  const unknownFields = fields.filter(
    (field) => !allowedFields.includes(field)
  )

  if (unknownFields.length > 0) {
    return `Unsupported fields: ${unknownFields.join(', ')}`
  }

  if (!isUpdate) {
    for (const field of requiredFields) {
      if (
        typeof data[field] !== 'string' ||
        !data[field].trim()
      ) {
        return `${field} is required.`
      }
    }
  }

  if (
    'name' in data &&
    (typeof data.name !== 'string' ||
      !data.name.trim() ||
      data.name.length > 150)
  ) {
    return 'Library name must be between 1 and 150 characters.'
  }

  if (
    'address' in data &&
    (typeof data.address !== 'string' || !data.address.trim())
  ) {
    return 'Invalid library address.'
  }

  if (
    'city' in data &&
    (typeof data.city !== 'string' ||
      !data.city.trim() ||
      data.city.length > 100)
  ) {
    return 'Invalid city.'
  }

  if (
    'description' in data &&
    data.description !== null &&
    (typeof data.description !== 'string' ||
      data.description.length > 2000)
  ) {
    return 'Description must be a string of at most 2000 characters.'
  }

  if (
    'locality' in data &&
    data.locality !== null &&
    (typeof data.locality !== 'string' ||
      data.locality.length > 150)
  ) {
    return 'Invalid locality.'
  }

  if (
    'phone' in data &&
    data.phone !== null &&
    (typeof data.phone !== 'string' ||
      data.phone.length > 20)
  ) {
    return 'Invalid phone number.'
  }

  if (
    'total_seats' in data &&
    (!Number.isInteger(data.total_seats) || data.total_seats < 0)
  ) {
    return 'Total seats must be a non-negative integer.'
  }

  if (
    'latitude' in data &&
    data.latitude !== null &&
    (!Number.isFinite(data.latitude) ||
      data.latitude < -90 ||
      data.latitude > 90)
  ) {
    return 'Latitude must be between -90 and 90.'
  }

  if (
    'longitude' in data &&
    data.longitude !== null &&
    (!Number.isFinite(data.longitude) ||
      data.longitude < -180 ||
      data.longitude > 180)
  ) {
    return 'Longitude must be between -180 and 180.'
  }

  for (const field of ['facilities', 'photos']) {
    if (
      field in data &&
      (!Array.isArray(data[field]) ||
        !data[field].every(
          (item) => typeof item === 'string' && item.trim().length > 0
        ))
    ) {
      return `${field} must be an array of non-empty strings.`
    }
  }

  if (
    'opening_hours' in data &&
    (!data.opening_hours ||
      typeof data.opening_hours !== 'object' ||
      Array.isArray(data.opening_hours))
  ) {
    return 'Opening hours must be an object.'
  }

  return null
}

