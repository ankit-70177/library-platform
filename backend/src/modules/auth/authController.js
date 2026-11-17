
import bcrypt from 'bcryptjs'
import pool from '../../config/db.js'

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required',
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      })
    }

    const cleanName = name.trim()
    const cleanEmail = email.trim().toLowerCase()

    if (!cleanName || !cleanEmail) {
      return res.status(400).json({
        success: false,
        message: 'Name and email cannot be empty',
      })
    }

    // Check whether the email already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = $1',
      [cleanEmail]
    )

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      })
    }

    // Hash the password before storing it
    const passwordHash = await bcrypt.hash(password, 10)

    // Public registration always creates a customer account
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [cleanName, cleanEmail, passwordHash, 'customer']
    )

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: result.rows[0],
    })
  } catch (error) {
    console.error('Registration error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Something went wrong during registration',
    })
  }
}
