import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mydb',
  port: process.env.DB_PORT || 3306,
  
  // --- SHIFTED FOR FILESS.IO SHARED PLAN ---
  
  // Limits total active connections to 1. 
  // This allows up to 4 "zombie" connections to exist before you hit the limit of 5.
  connectionLimit: 1, 
  
  // Ensures that if a connection is not used for 30 seconds, it is closed.
  // This helps clean up "ghost" connections left by Render's inactivity shutdowns.
  idleTimeout: 30000, 
  
  // Prevents the pool from trying to keep a connection open forever.
  enableKeepAlive: false, 
  
  // Standard stability settings
  waitForConnections: true,
  queueLimit: 0,
  
  // Forces the pool to release resources immediately when they are idle
  maxIdle: 1 
});

export default pool;