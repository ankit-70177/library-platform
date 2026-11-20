export const isValidId = (value) => {
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 && id <= 2147483647
}

export const validateBooking = (body) => {
  const { library_id, seats_booked, start_time, end_time } = body

  if (!isValidId(library_id)) {
    return 'A valid library_id is required.'
  }

  if (
    !Number.isInteger(seats_booked) ||
    seats_booked < 1 ||
    seats_booked > 100
  ) {
    return 'seats_booked must be an integer between 1 and 100.'
  }

  if (
    typeof start_time !== 'string' ||
    typeof end_time !== 'string' ||
    !Number.isFinite(Date.parse(start_time)) ||
    !Number.isFinite(Date.parse(end_time))
  ) {
    return 'Valid start_time and end_time are required.'
  }

  if (Date.parse(start_time) <= Date.now()) {
    return 'Booking start time must be in the future.'
  }

  if (Date.parse(end_time) <= Date.parse(start_time)) {
    return 'Booking end time must be after start time.'
  }

  if (Date.parse(end_time) - Date.parse(start_time) > 24 * 60 * 60 * 1000) {
    return 'A booking cannot exceed 24 hours.'
  }

  return null
}
