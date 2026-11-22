import bcrypt from 'bcryptjs'
import 'dotenv/config'
import pool from '../src/config/db.js'

const demoUsers = [
  {
    name: 'Demo Customer',
    email: 'ankit.ui.test@example.com',
    password: 'password123',
    role: 'customer',
  },
  {
    name: 'Demo Library Owner',
    email: 'owner.test@example.com',
    password: 'password123',
    role: 'owner',
  },
  {
    name: 'Demo Admin',
    email: 'test@example.com',
    password: 'password123',
    role: 'admin',
  },
]

if (process.env.NODE_ENV === 'production') {
  throw new Error('Demo users must not be seeded in production.')
}

try {
  for (const demoUser of demoUsers) {
    const passwordHash = await bcrypt.hash(demoUser.password, 10)

    await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (LOWER(email)) DO UPDATE SET
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash,
         role = EXCLUDED.role`,
      [demoUser.name, demoUser.email, passwordHash, demoUser.role],
    )
  }

  console.log(`Seeded ${demoUsers.length} demo users.`)
} finally {
  await pool.end()
}
