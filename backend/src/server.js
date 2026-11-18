
import 'dotenv/config'
import app from './app.js'
import { testDatabaseConnection } from './config/db.js'

const port = Number(process.env.PORT) || 5001

const startServer = async () => {
  try {
    await testDatabaseConnection()
    console.log('PostgreSQL connected successfully')

    app.listen(port, () => {
      console.log(`Library Platform API listening on port ${port}`)
    })
  } catch (error) {
    console.error('Database connection failed:', error.message)
    process.exit(1)
  }
}

startServer()
