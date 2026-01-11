// src/middlewares/auth.js
import { Magic } from '@magic-sdk/admin';
import jwt from 'jsonwebtoken';
import pool from '../db/pool.js';

// Initialize Magic Admin SDK
const magic = new Magic(process.env.MAGIC_SECRET_KEY);

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

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }
    
    // Check if it's a JWT token (from your backend) or Magic token
    let email, userId, userRole;
    
    if (token.length < 500) {
      // It's a JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key');
      email = decoded.email;
      userId = decoded.id;
      userRole = decoded.role;
    } else {
      // It's a Magic DID token
      const magicUser = await magic.users.getMetadataByToken(token);
      email = magicUser.email;
      
      // Check role from database
      const [admins] = await pool.query(
        'SELECT id, email FROM admins WHERE email = ?',
        [email]
      );
      
      if (admins.length > 0) {
        userId = admins[0].id;
        userRole = 'admin';
      } else {
        userId = null;
        userRole = 'student';
      }
    }
    
    // ✅ VALIDATE EMAIL FORMAT
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(medtech|smu)\.tn$/i;
    if (!emailRegex.test(email)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email format in token'
      });
    }
    
    // ✅ Set user object
    if (userRole === 'admin') {
      req.user = {
        id: userId,
        email: email,
        role: 'admin'
      };
    } else {
      req.user = {
        email: email,
        role: 'student'
      };
    }
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Keep all other middleware functions the same...

// ✅ Role-based middleware (EXACTLY THE SAME AS ORIGINAL)
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

// ✅ Check if user is admin middleware (EXACTLY THE SAME)
export const requireAdmin = requireRole(['admin']);

// ✅ Check if user is student middleware (EXACTLY THE SAME)
export const requireStudent = requireRole(['student']);

// ✅ Helper function to create login response (UPDATED for Magic)
export const createLoginResponse = (user, token) => {
  // Token can be either Magic DID token or JWT
  return {
    success: true,
    data: {
      token: token, // This will be the Magic DID token
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    }
  };
};

// ✅ Export all functions
export default {
  generateToken,      // Keep for legacy/transition
  authenticate,
  requireRole,
  requireAdmin,
  requireStudent,
  createLoginResponse
};