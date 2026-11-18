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