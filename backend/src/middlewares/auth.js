// src/middlewares/auth.js
import jwt from 'jsonwebtoken';
import pool from '../db/pool.js';

// Generate JWT token for a user
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET || 'super_secret_key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Authenticate middleware with JWT
export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }
    
    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key');
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please login again.'
        });
      }
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }
      throw jwtError;
    }
    
    const email = decoded.email;
    
    // Validate email format
    const emailRegex = /^[a-z0-9._%+-]+@medtech\.tn$/i;
    if (!emailRegex.test(email)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email format in token'
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
      // User is a student
      // Check if student exists in users table (if you have one)
      // For now, create a minimal user object
      req.user = {
        email: email,
        role: 'student'
      };
      
      // If you have a users table, you might want to check/update it here
      // Example:
      // const [users] = await pool.query(
      //   'SELECT id, email FROM users WHERE email = ?',
      //   [email]
      // );
      // if (users.length > 0) {
      //   req.user.id = users[0].id;
      // }
    }
    
    // Add token expiration info to request for debugging
    req.tokenExpiresAt = new Date(decoded.exp * 1000);
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    // Don't expose internal errors
    const message = error.name === 'JsonWebTokenError' 
      ? 'Invalid authentication token'
      : 'Authentication failed';
    
    res.status(500).json({
      success: false,
      message: message
    });
  }
};

// Role-based middleware (unchanged)
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

// Helper function to create login response
export const createLoginResponse = (user) => {
  const token = generateToken(user);
  
  return {
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    }
  };
};