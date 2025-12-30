// src/controllers/authController.js
import crypto from 'crypto';
import pool from '../db/pool.js';
import { generateToken } from '../middlewares/auth.js';

// Global variable (shared across imports)
const verificationCodes = new Map();

export const requestLoginCode = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    const emailRegex = /^[a-z0-9._%+-]+[a-z0-9]\.[a-z0-9][a-z0-9._%+-]+@medtech\.tn$/i;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Only @medtech.tn emails are allowed'
      });
    }
    
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    
    // DEBUG: Log before storing
    
    verificationCodes.set(email, {
      code,
      expiresAt,
      attempts: 0
    });
    
    
    res.json({
      success: true,
      message: 'Verification code sent to email',
      debugCode: code
    });
    
  } catch (error) {
    console.error('Request login code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification code'
    });
  }
};

export const verifyLoginCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and code are required'
      });
    }
    
    
    const stored = verificationCodes.get(email);
    console.log(`📝 Stored data for ${email}:`, stored);
    
    if (!stored) {
      return res.status(400).json({
        success: false,
        message: 'No verification code requested for this email. Please request a new code.'
      });
    }
    
    if (Date.now() > stored.expiresAt) {
      verificationCodes.delete(email);
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired'
      });
    }
    
    if (stored.attempts >= 3) {
      verificationCodes.delete(email);
      return res.status(400).json({
        success: false,
        message: 'Too many attempts. Please request a new code.'
      });
    }
    
    // Trim and compare
    const inputCode = code.toString().trim();
    const storedCode = stored.code.toString().trim();
    
    
    if (inputCode !== storedCode) {
      stored.attempts++;
      console.log(` Code mismatch. Attempt ${stored.attempts}/3`);
      return res.status(400).json({
        success: false,
        message: `Invalid verification code. Attempt ${stored.attempts}/3`
      });
    }
    
    // Valid code
    verificationCodes.delete(email);
    
    // ... rest of your code (user lookup and token generation)
    const [admins] = await pool.query(
      'SELECT id, email FROM admins WHERE email = ?',
      [email]
    );
    
    let user;
    if (admins.length > 0) {
      user = {
        id: admins[0].id,
        email: admins[0].email,
        role: 'admin'
      };
    } else {
      user = {
        email: email,
        role: 'student'
      };
    }
    
    const token = generateToken(user);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      }
    });
    
  } catch (error) {
    console.error('Verify login code error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};
export default {
  requestLoginCode,
  verifyLoginCode
};