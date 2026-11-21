
import pool from '../../config/db.js'
import { validateLibrary } from './libraryValidation.js'

const libraryFields = [
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
  'available_seats',
  'facilities',
  'photos',
]

const isValidId = (id) => {
  const parsedId = Number(id)
  return Number.isSafeInteger(parsedId) &&
    parsedId > 0 &&
    parsedId <= 2147483647
}

// 1. Create a library
export const createLibrary = async (req, res) => {
  try {
    const validationError = validateLibrary(req.body)

    if (validationError) {
      return res.status(400).json({ message: validationError })
    }

    const {
      name,
      description,
      address,
      city,
      locality,
      latitude,
      longitude,
      phone,
      opening_hours,
      total_seats = 0,
      available_seats,
      facilities = [],
      photos = [],
    } = req.body

    const parsedTotal = Number.isInteger(total_seats) ? total_seats : 0
    const parsedAvailable =
      available_seats !== undefined && Number.isInteger(available_seats)
        ? available_seats
        : parsedTotal

    if (parsedAvailable > parsedTotal) {
      return res.status(400).json({
        message: 'Available seats cannot exceed total seats.',
      })
    }

    const result = await pool.query(
      `INSERT INTO libraries (
        owner_id, name, description, address, city, locality,
        latitude, longitude, phone, opening_hours,
        total_seats, available_seats, facilities, photos
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14
      )
      RETURNING *`,
      [
        req.user.id,
        name.trim(),
        description ?? null,
        address.trim(),
        city.trim(),
        locality ?? null,
        latitude ?? null,
        longitude ?? null,
        phone ?? null,
        opening_hours ?? {},
        parsedTotal,
        parsedAvailable,
        facilities,
        photos,
      ]
    )

    return res.status(201).json({
      message: 'Library created successfully. Awaiting admin approval.',
      library: result.rows[0],
    })
  } catch (error) {
    console.error('Create library error:', error.message)
    return res.status(500).json({
      message: 'Unable to create library.',
    })
  }
}

// 2. Get all libraries belonging to the logged-in owner
export const getMyLibraries = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM libraries
       WHERE owner_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    )

    return res.status(200).json({
      count: result.rowCount,
      libraries: result.rows,
    })
  } catch (error) {
    console.error('Get my libraries error:', error.message)
    return res.status(500).json({
      message: 'Unable to fetch libraries.',
    })
  }
}

// 3. Get one library by ID
export const getLibraryById = async (req, res) => {
  try {
    const { id } = req.params

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid library ID.' })
    }

    const result = await pool.query(
      'SELECT * FROM libraries WHERE id = $1',
      [Number(id)]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Library not found.' })
    }

    const library = result.rows[0]

    // Owners can only view their own libraries.
    // Admins can view any library.
    if (
      req.user.role !== 'admin' &&
      library.owner_id !== req.user.id
    ) {
      return res.status(403).json({
        message: 'You are not allowed to access this library.',
      })
    }

    return res.status(200).json({ library })
  } catch (error) {
    console.error('Get library error:', error.message)
    return res.status(500).json({
      message: 'Unable to fetch library.',
    })
  }
}

// 4. Update an owner's library
export const updateLibrary = async (req, res) => {
  try {
    const { id } = req.params

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid library ID.' })
    }

    const validationError = validateLibrary(req.body, true)

    if (validationError) {
      return res.status(400).json({ message: validationError })
    }

    const fields = Object.keys(req.body).filter(
      (field) => libraryFields.includes(field)
    )

    const values = fields.map((field) => req.body[field])

    const setClause = fields.map(
      (field, index) => `${field} = $${index + 1}`
    )

    setClause.push('updated_at = CURRENT_TIMESTAMP')

    const idPosition = values.length + 1
    const ownerPosition = values.length + 2

    let query = `
      UPDATE libraries
      SET ${setClause.join(', ')}
      WHERE id = $${idPosition}
        AND owner_id = $${ownerPosition}
    `

    const queryValues = [...values, Number(id), req.user.id]

    // Never allow available seats to exceed total seats.
    if (req.body.total_seats !== undefined) {
      query += ` AND available_seats <= $${fields.indexOf('total_seats') + 1}`
    }

    query += ' RETURNING *'

    const result = await pool.query(query, queryValues)

    if (result.rowCount === 0) {
      const existing = await pool.query(
        'SELECT id FROM libraries WHERE id = $1 AND owner_id = $2',
        [Number(id), req.user.id]
      )

      if (existing.rowCount === 0) {
        return res.status(404).json({
          message: 'Library not found or you do not own this library.',
        })
      }

      return res.status(400).json({
        message: 'Total seats cannot be less than available seats.',
      })
    }

    return res.status(200).json({
      message: 'Library updated successfully.',
      library: result.rows[0],
    })
  } catch (error) {
    console.error('Update library error:', error.message)
    return res.status(500).json({
      message: 'Unable to update library.',
    })
  }
}

// 5. Delete an owner's library
export const deleteLibrary = async (req, res) => {
  try {
    const { id } = req.params

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid library ID.' })
    }

    const result = await pool.query(
      `DELETE FROM libraries
       WHERE id = $1 AND owner_id = $2
       RETURNING id`,
      [Number(id), req.user.id]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: 'Library not found or you do not own this library.',
      })
    }

    return res.status(200).json({
      message: 'Library deleted successfully.',
    })
  } catch (error) {
    console.error('Delete library error:', error.message)
    return res.status(500).json({
      message: 'Unable to delete library.',
    })
  }
}














// 6. Get all pending libraries (Admin only)
export const getPendingLibraries = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.*, u.name AS owner_name, u.email AS owner_email
       FROM libraries l
       JOIN users u ON u.id = l.owner_id
       WHERE l.status = 'pending'
       ORDER BY l.created_at ASC`
    )

    return res.status(200).json({
      count: result.rowCount,
      libraries: result.rows,
    })
  } catch (error) {
    console.error('Get pending libraries error:', error.message)
    return res.status(500).json({
      message: 'Unable to fetch pending libraries.',
    })
  }
}

// 7. Approve a library (Admin only)
export const approveLibrary = async (req, res) => {
  try {
    const { id } = req.params

    if (!isValidId(id)) {
      return res.status(400).json({
        message: 'Invalid library ID.',
      })
    }

    const result = await pool.query(
      `UPDATE libraries
       SET status = 'approved',
           reviewed_by = $1,
           reviewed_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND status = 'pending'
       RETURNING *`,
      [req.user.id, Number(id)]
    )

    if (result.rowCount === 0) {
      const existing = await pool.query(
        'SELECT id, status FROM libraries WHERE id = $1',
        [Number(id)]
      )

      if (existing.rowCount === 0) {
        return res.status(404).json({
          message: 'Library not found.',
        })
      }

      return res.status(409).json({
        message: `Library cannot be approved because its current status is ${existing.rows[0].status}.`,
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Library approved successfully.',
      library: result.rows[0],
    })
  } catch (error) {
    console.error('Approve library error:', error.message)
    return res.status(500).json({
      message: 'Unable to approve library.',
    })
  }
}

// 8. Reject a library (Admin only)
export const rejectLibrary = async (req, res) => {
  try {
    const { id } = req.params

    if (!isValidId(id)) {
      return res.status(400).json({
        message: 'Invalid library ID.',
      })
    }

    const result = await pool.query(
      `UPDATE libraries
       SET status = 'rejected',
           reviewed_by = $1,
           reviewed_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND status = 'pending'
       RETURNING *`,
      [req.user.id, Number(id)]
    )

    if (result.rowCount === 0) {
      const existing = await pool.query(
        'SELECT id, status FROM libraries WHERE id = $1',
        [Number(id)]
      )

      if (existing.rowCount === 0) {
        return res.status(404).json({
          message: 'Library not found.',
        })
      }

      return res.status(409).json({
        message: `Library cannot be rejected because its current status is ${existing.rows[0].status}.`,
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Library rejected successfully.',
      library: result.rows[0],
    })
  } catch (error) {
    console.error('Reject library error:', error.message)
    return res.status(500).json({
      message: 'Unable to reject library.',
    })
  }
}



