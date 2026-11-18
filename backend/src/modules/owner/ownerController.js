import bcrypt from 'bcryptjs'
import pool from '../../config/db.js'

export const applyAsOwner = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      libraryName,
      libraryAddress,
      phone,
    } = req.body

    // 1. Validate required fields
    if (
      !name ||
      !email ||
      !password ||
      !libraryName ||
      !libraryAddress ||
      !phone
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.',
      })
    }

    // 2. Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // 3. Check whether this email already belongs to a user
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = $1',
      [normalizedEmail]
    )

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      })
    }

    // 4. Check for an existing application
    const existingApplication = await pool.query(
      `SELECT id, status
       FROM owner_applications
       WHERE LOWER(email) = $1`,
      [normalizedEmail]
    )

    if (existingApplication.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An application with this email already exists.',
      })
    }

    // 5. Hash the password
    const passwordHash = await bcrypt.hash(password, 10)

    // 6. Save the application as pending
    const result = await pool.query(
      `INSERT INTO owner_applications
       (name, email, password_hash, library_name, library_address, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, library_name, library_address, phone, status, created_at`,
      [
        name.trim(),
        normalizedEmail,
        passwordHash,
        libraryName.trim(),
        libraryAddress.trim(),
        phone.trim(),
      ]
    )

    return res.status(201).json({
      success: true,
      message: 'Owner application submitted successfully. Await admin approval.',
      application: result.rows[0],
    })
  } catch (error) {
    console.error('Owner application error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Something went wrong while submitting your application.',
    })
  }
}

// Get all owner applications (Admin only)
export const getOwnerApplications = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        name,
        email,
        library_name,
        library_address,
        phone,
        status,
        created_at,
        reviewed_by,
        reviewed_at
       FROM owner_applications
       ORDER BY created_at DESC`
    )

    return res.status(200).json({
      success: true,
      applications: result.rows,
    })
  } catch (error) {
    console.error('Get applications error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch owner applications.',
    })
  }
}


// Approve an owner application (Admin only)
export const approveOwnerApplication = async (req, res) => {
  const client = await pool.connect()

  try {
    const { id } = req.params

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID.',
      })
    }

    await client.query('BEGIN')

    const applicationResult = await client.query(
      `SELECT *
       FROM owner_applications
       WHERE id = $1
       FOR UPDATE`,
      [id]
    )

    if (applicationResult.rows.length === 0) {
      await client.query('ROLLBACK')

      return res.status(404).json({
        success: false,
        message: 'Owner application not found.',
      })
    }

    const application = applicationResult.rows[0]

    if (application.status !== 'pending') {
      await client.query('ROLLBACK')

      return res.status(409).json({
        success: false,
        message: 'This application has already been reviewed.',
      })
    }

    const ownerResult = await client.query(
      `INSERT INTO users
       (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'owner')
       RETURNING id, name, email, role`,
      [
        application.name,
        application.email,
        application.password_hash,
      ]
    )

    await client.query(
      `UPDATE owner_applications
       SET status = 'approved',
           reviewed_by = $1,
           reviewed_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [req.user.id, id]
    )

    await client.query('COMMIT')

    return res.status(200).json({
      success: true,
      message: 'Owner application approved successfully.',
      owner: ownerResult.rows[0],
    })
  } catch (error) {
    await client.query('ROLLBACK')

    console.error('Approve application error:', error.message)

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to approve owner application.',
    })
  } finally {
    client.release()
  }
}


// Reject an owner application (Admin only)
export const rejectOwnerApplication = async (req, res) => {
  try {
    const { id } = req.params

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID.',
      })
    }

    const result = await pool.query(
      `UPDATE owner_applications
       SET status = 'rejected',
           reviewed_by = $1,
           reviewed_at = CURRENT_TIMESTAMP
       WHERE id = $2
         AND status = 'pending'
       RETURNING id, name, email, library_name, status, reviewed_at`,
      [req.user.id, id]
    )

    if (result.rows.length === 0) {
      const existing = await pool.query(
        'SELECT id FROM owner_applications WHERE id = $1',
        [id]
      )

      return res.status(existing.rows.length === 0 ? 404 : 409).json({
        success: false,
        message: existing.rows.length === 0
          ? 'Owner application not found.'
          : 'This application has already been reviewed.',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Owner application rejected successfully.',
      application: result.rows[0],
    })
  } catch (error) {
    console.error('Reject application error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Failed to reject owner application.',
    })
  }
}