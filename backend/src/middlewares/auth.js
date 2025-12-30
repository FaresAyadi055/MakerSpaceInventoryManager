// src/middlewares/auth.js
import pool from '../db/pool.js';

// Simple token-based auth (we'll use email in token for now)
// In the future, replace with JWT or email verification codes

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }
    
    // For now, token is just the email (simplified)
    // In production, use JWT or verification codes
    const email = token;
    
    // Validate email format
    const emailRegex = /^[a-z0-9._%+-]+[a-z0-9]\.[a-z0-9][a-z0-9._%+-]+@medtech\.tn$/i;
    if (!emailRegex.test(email)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }
    
    // Check if user exists in admins table
    const [admins] = await pool.query(
      'SELECT id, email FROM admins WHERE email = ?',
      [email]
    );
    
    if (admins.length > 0) {
      // User is an admin
      req.user = {
        id: admins[0].id,
        email: admins[0].email,
        role: 'admin'
      };
    } else {
      // User is a student (any verified email)
      req.user = {
        email: email,
        role: 'student'
      };
    }
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Role-based middleware
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }
    
    next();
  };
};

// Check if user is admin middleware
export const requireAdmin = requireRole(['admin']);

// Check if user is student middleware
export const requireStudent = requireRole(['student']);