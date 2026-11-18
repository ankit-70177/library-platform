
import pool from '../../config/db.js'

const isValidId = (id) => {
  const parsed = Number(id)
  return Number.isSafeInteger(parsed) &&
    parsed > 0 &&
    parsed <= 2147483647
}

// GET /api/discovery/libraries
// Public: Search approved libraries
export const getApprovedLibraries = async (req, res) => {
  try {
    const {
      city,
      locality,
      facility,
      min_seats,
      page = '1',
      limit = '10',
    } = req.query

    const pageNumber = Number(page)
    const limitNumber = Number(limit)
    const minSeats = min_seats === undefined
      ? undefined
      : Number(min_seats)

    if (
      !Number.isInteger(pageNumber) ||
      pageNumber < 1 ||
      !Number.isInteger(limitNumber) ||
      limitNumber < 1 ||
      limitNumber > 50
    ) {
      return res.status(400).json({
        message: 'Invalid page or limit. Limit must be between 1 and 50.',
      })
    }

    if (
      minSeats !== undefined &&
      (!Number.isInteger(minSeats) || minSeats < 0)
    ) {
      return res.status(400).json({
        message: 'min_seats must be a non-negative integer.',
      })
    }

    const conditions = ["status = 'approved'"]
    const values = []

    if (city) {
      values.push(`%${String(city).trim()}%`)
      conditions.push(`city ILIKE $${values.length}`)
    }

    if (locality) {
      values.push(`%${String(locality).trim()}%`)
      conditions.push(`locality ILIKE $${values.length}`)
    }

    if (facility) {
      values.push(String(facility).trim())
      conditions.push(`facilities @> ARRAY[$${values.length}]::text[]`)
    }

    if (minSeats !== undefined) {
      values.push(minSeats)
      conditions.push(`available_seats >= $${values.length}`)
    }

    const whereClause = conditions.join(' AND ')

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM libraries
       WHERE ${whereClause}`,
      values
    )

    const offset = (pageNumber - 1) * limitNumber

    const queryValues = [...values, limitNumber, offset]

    const result = await pool.query(
      `SELECT
        id, name, description, address, city, locality,
        latitude, longitude, phone, opening_hours,
        total_seats, available_seats, facilities, photos,
        status, created_at
       FROM libraries
       WHERE ${whereClause}
       ORDER BY name ASC
       LIMIT $${values.length + 1}
       OFFSET $${values.length + 2}`,
      queryValues
    )

    return res.status(200).json({
      success: true,
      count: result.rowCount,
      total: countResult.rows[0].total,
      page: pageNumber,
      limit: limitNumber,
      libraries: result.rows,
    })
  } catch (error) {
    console.error('Discovery search error:', error.message)
    return res.status(500).json({
      message: 'Unable to discover libraries.',
    })
  }
}

// GET /api/discovery/libraries/:id
// Public: Get approved library details
export const getApprovedLibraryById = async (req, res) => {
  try {
    const { id } = req.params

    if (!isValidId(id)) {
      return res.status(400).json({
        message: 'Invalid library ID.',
      })
    }

    const result = await pool.query(
      `SELECT
        id, name, description, address, city, locality,
        latitude, longitude, phone, opening_hours,
        total_seats, available_seats, facilities, photos,
        status, created_at
       FROM libraries
       WHERE id = $1 AND status = 'approved'`,
      [Number(id)]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: 'Approved library not found.',
      })
    }

    return res.status(200).json({
      success: true,
      library: result.rows[0],
    })
  } catch (error) {
    console.error('Library details error:', error.message)
    return res.status(500).json({
      message: 'Unable to fetch library details.',
    })
  }
}

