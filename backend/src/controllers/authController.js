// src/controllers/authController.js
import crypto from 'crypto';
import pool from '../db/pool.js';
import { generateToken } from '../middlewares/auth.js';
import emailService from '../services/emailService.js';

// Global variable (shared across imports)
const verificationCodes = new Map();

// ⚡️ CONFIGURATION: Set this to false in production, true for testing
const DEBUG_MODE = process.env.ACTIVATE_DEBUG === "1"; // Set to 0 in .env to send real emails

export const requestLoginCode = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Validate medtech.tn email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(medtech|smu)\.tn$/i
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Only @medtech.tn emails are allowed'
      });
    }
    
    // Check if email is already in verification process
    const existingCode = verificationCodes.get(email);
    if (existingCode && Date.now() < existingCode.expiresAt) {
      const timeLeft = Math.ceil((existingCode.expiresAt - Date.now()) / 1000 / 60);
      return res.status(429).json({
        success: false,
        message: `Please wait ${timeLeft} minutes before requesting a new code`,
        retryAfter: existingCode.expiresAt
      });
    }
    
    // Generate 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    // Store code
    verificationCodes.set(email, {
      code,
      expiresAt,
      attempts: 0,
      createdAt: Date.now()
    });
    
    console.log(`📧 Generated code for ${email}: ${code}`);
    
    // ⚡️ DECIDE HOW TO SEND THE CODE
    if (DEBUG_MODE) {
      // DEBUG MODE: Return code in HTTP response (for testing)
      console.log(`🔧 DEBUG MODE: Code included in response as debugCode`);
      
      // Keep the exact same response structure
      res.json({
        success: true,
        message: 'Verification code sent to email',
        debugCode: code  // Same field name as before
      });
      
      // Don't send email in debug mode
    } else {
      // PRODUCTION MODE: Send via email
      await emailService.sendVerificationEmail(email, code);
      
      // Same response structure, no debugCode
      res.json({
        success: true,
        message: 'Verification code sent to email'
      });
    }
    
  } catch (error) {
    console.error('Request login code error:', error);
    
    // Clean up on error
    const { email } = req.body;
    if (email) {
      verificationCodes.delete(email);
    }
    
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
    
    // Get stored verification data
    const stored = verificationCodes.get(email);
    
    if (!stored) {
      return res.status(400).json({
        success: false,
        message: 'No verification code requested for this email. Please request a new code.'
      });
    }
    
    // Check expiration
    if (Date.now() > stored.expiresAt) {
      verificationCodes.delete(email);
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired'
      });
    }
    
    // Check attempts
    if (stored.attempts >= 3) {
      verificationCodes.delete(email);
      return res.status(400).json({
        success: false,
        message: 'Too many attempts. Please request a new code.'
      });
    }
    
    // Clean and compare codes
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
    
    // Check if user is admin or student
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

// Cleanup expired codes periodically
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [email, data] of verificationCodes.entries()) {
    if (now > data.expiresAt) {
      verificationCodes.delete(email);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 Cleaned up ${cleaned} expired verification codes`);
  }
}, 5 * 60 * 1000); // Every 5 minutes

export default {
  requestLoginCode,
  verifyLoginCode
};