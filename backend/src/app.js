import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import helmet from "helmet";
import rateLimit from 'express-rate-limit';
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
app.use(helmet());
/* ----------------------------- Global Middleware ---------------------------- */

// Enable CORS

const corsOptions =
  process.env.NODE_ENV === "production"
    ? {
        origin: process.env.CORS_ORIGIN,
        credentials: true
      }
    : {
        origin: true
      };

app.use(cors(corsOptions));

// Request logging (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

// Parse JSON & URL-encoded bodies
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

/* --------------------------------- Routes ---------------------------------- */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use('/api', routes, limiter);
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
async function testDatabaseConnection() {
  try {
    // 1. Get the current connection's ID so we don't kill ourselves
    const [[{ ID: currentId }]] = await pool.query("SELECT CONNECTION_ID() AS ID");
    
    // 2. Find other active connections for your user
    // On shared plans, you can usually only see/kill your own user's processes
    const [processes] = await pool.query("SHOW PROCESSLIST");
    
    for (const proc of processes) {
      // If the process is not our current one and is the same user/db
      if (proc.Id !== currentId && proc.User !== 'system user') {
        console.log(`Killing zombie connection: ${proc.Id}`);
        try {
          await pool.query(`KILL ${proc.Id}`);
        } catch (killErr) {
          // Sometimes shared hosts restrict the KILL command; we log and move on
          console.warn(`Could not kill connection ${proc.Id}: ${killErr.message}`);
        }
      }
    }

    await pool.query("SELECT 1");
    console.log("✅ Database connection cleaned and established successfully");
  } catch (err) {
    console.error("❌ Unable to connect to the database:", err);
    // On Render, if the DB is down, we want the service to restart
    process.exit(1);
  }
}

testDatabaseConnection();
const PORT = process.env.PORT || 5000
const server = app.listen(PORT, () => {  // Add this variable
  console.log(`Server running on port: ${PORT}`)
  console.log(`Test server at http://localhost:${PORT}/health`)
})

async function shutdown(signal) {
  console.log(`Received ${signal}. Closing resources...`);
  try {
    // 1️⃣ Stop accepting new HTTP requests
    await new Promise((resolve) => server.close(resolve));
    
    // 2️⃣ Close all MySQL connections in the pool
    await pool.end();
    console.log("MySQL pool closed");
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);  // Exit with error code
  } finally {
    process.exit(0);
  }
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);


export default app
