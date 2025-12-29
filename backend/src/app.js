import express from 'express'
import cors from 'cors'
import morgan from 'morgan'

import routes from './routes/index.js'
import { errorHandler, notFound } from './middlewares/errorHandler.js'

const app = express()

/* ----------------------------- Global Middleware ---------------------------- */

// Enable CORS
app.use(cors())

// Request logging (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

// Parse JSON & URL-encoded bodies
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

/* --------------------------------- Routes ---------------------------------- */

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use('/api', routes)

/* ------------------------------ Error Handling ------------------------------ */

// 404 handler
app.use(notFound)

// Central error handler
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`)
  console.log(`Test server at http://localhost:${PORT}/health`)
})


export default app
