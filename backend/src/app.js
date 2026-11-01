import express from 'express'

const app = express()

app.use(express.json())
app.get('/api/health', (_request, response) => {
  response.json({ success: true, message: 'Backend is running' })
})

export default app
