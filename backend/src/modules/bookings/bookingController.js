import pool from '../../config/db.js'
import { isValidId, validateBooking } from './bookingValidation.js'

// Customer: Create a booking
export const createBooking = async (req, res) => {
  const validationError = validateBooking(req.body)

  if (validationError) {
    return res.status(400).json({ message: validationError })
  }

  const { library_id, seats_booked, start_time, end_time } = req.body
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Lock the library row to serialize simultaneous booking requests.
    const library = await client.query(
      `SELECT id, name, total_seats
       FROM libraries
       WHERE id = $1 AND status = 'approved'
       FOR UPDATE`,
      [Number(library_id)]
    )

    if (library.rowCount === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ message: 'Approved library not found.' })
    }

    // The customer must have an active membership covering the booking.
    const membership = await client.query(
      `SELECT id
       FROM subscriptions
       WHERE customer_id = $1
         AND library_id = $2
         AND status = 'active'
         AND start_date <= $3
         AND end_date >= $4
       LIMIT 1`,
      [req.user.id, Number(library_id), start_time, end_time]
    )

    if (membership.rowCount === 0) {
      await client.query('ROLLBACK')
      return res.status(403).json({
        message: 'An active membership covering the booking time is required.',
      })
    }

    // Count seats already reserved during any overlapping time.
    const occupied = await client.query(
      `SELECT COALESCE(SUM(seats_booked), 0)::INTEGER AS occupied_seats
       FROM bookings
       WHERE library_id = $1
         AND status = 'confirmed'
         AND start_time < $3
         AND end_time > $2`,
      [Number(library_id), start_time, end_time]
    )

    const availableSeats =
      library.rows[0].total_seats - occupied.rows[0].occupied_seats

    if (availableSeats < seats_booked) {
      await client.query('ROLLBACK')
      return res.status(409).json({
        message: 'Not enough seats available for the selected time.',
        available_seats: Math.max(availableSeats, 0),
      })
    }

    const result = await client.query(
      `INSERT INTO bookings (
         customer_id, library_id, seats_booked, start_time, end_time
       )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, Number(library_id), seats_booked, start_time, end_time]
    )

    await client.query('COMMIT')

    return res.status(201).json({
      message: 'Booking created successfully.',
      booking: result.rows[0],
      available_seats: availableSeats - seats_booked,
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Create booking error:', error.message)
    return res.status(500).json({ message: 'Unable to create booking.' })
  } finally {
    client.release()
  }
}

// Customer: View own bookings
export const getMyBookings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         b.*,
         l.name AS library_name,
         l.address AS library_address,
         l.city AS library_city
       FROM bookings b
       JOIN libraries l ON l.id = b.library_id
       WHERE b.customer_id = $1
       ORDER BY b.start_time DESC`,
      [req.user.id]
    )

    return res.status(200).json({
      count: result.rowCount,
      bookings: result.rows,
    })
  } catch (error) {
    console.error('Get customer bookings error:', error.message)
    return res.status(500).json({ message: 'Unable to fetch bookings.' })
  }
}

// Customer: Cancel own booking
export const cancelBooking = async (req, res) => {
  const { id } = req.params

  if (!isValidId(id)) {
    return res.status(400).json({ message: 'Invalid booking ID.' })
  }

  try {
    const result = await pool.query(
      `UPDATE bookings
       SET status = 'cancelled',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
         AND customer_id = $2
         AND status = 'confirmed'
         AND start_time > CURRENT_TIMESTAMP
       RETURNING *`,
      [Number(id), req.user.id]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: 'Upcoming confirmed booking not found.',
      })
    }

    return res.status(200).json({
      message: 'Booking cancelled successfully.',
      booking: result.rows[0],
    })
  } catch (error) {
    console.error('Cancel booking error:', error.message)
    return res.status(500).json({ message: 'Unable to cancel booking.' })
  }
}

// Owner: View bookings for their own libraries
export const getOwnerBookings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         b.*,
         l.name AS library_name,
         u.name AS customer_name,
         u.email AS customer_email
       FROM bookings b
       JOIN libraries l ON l.id = b.library_id
       JOIN users u ON u.id = b.customer_id
       WHERE l.owner_id = $1
       ORDER BY b.start_time DESC`,
      [req.user.id]
    )

    return res.status(200).json({
      count: result.rowCount,
      bookings: result.rows,
    })
  } catch (error) {
    console.error('Get owner bookings error:', error.message)
    return res.status(500).json({ message: 'Unable to fetch library bookings.' })
  }
}

// Admin: View all bookings
export const getAllBookings = async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         b.*,
         l.name AS library_name,
         u.name AS customer_name,
         u.email AS customer_email
       FROM bookings b
       JOIN libraries l ON l.id = b.library_id
       JOIN users u ON u.id = b.customer_id
       ORDER BY b.start_time DESC`
    )

    return res.status(200).json({
      count: result.rowCount,
      bookings: result.rows,
    })
  } catch (error) {
    console.error('Get all bookings error:', error.message)
    return res.status(500).json({ message: 'Unable to fetch all bookings.' })
  }
}
