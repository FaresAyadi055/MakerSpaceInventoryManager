import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import 'dotenv/config'
import routes from './routes/index.js'
import pool from './db/pool.js'
import { errorHandler, notFound } from './middlewares/errorHandler.js'
import inventoryRoutes from './routes/inventoryRoutes.js';
import authRoutes from './routes/authRoutes.js';
import logsRoutes from './routes/logsRoutes.js';
import requestsRoutes from './routes/requestsRoutes.js';
import missingRoutes from './routes/missingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import complexRoutes from './routes/complexRoutes.js';
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
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/missing', missingRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/complex', complexRoutes);
/* ------------------------------ Error Handling ------------------------------ */

// 404 handler
app.use(notFound)

// Central error handler
app.use(errorHandler)
const testconnection = async () => {
  try {
    const connection = await pool.getConnection()
    connection.release()
    console.log('Database connection established successfully.')
  } catch (err) {
    console.error('Unable to connect to the database:', err)
    process.exit(1)
  }}
testconnection()
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`)
  console.log(`Test server at http://localhost:${PORT}/health`)
})


export default app
