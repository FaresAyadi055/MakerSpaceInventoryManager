// src/controllers/authController.js
import { Magic } from '@magic-sdk/admin';
import pool from '../db/pool.js';
import { generateToken } from '../middlewares/auth.js';

// Initialize Magic Admin SDK
const magicAdmin = new Magic(process.env.MAGIC_SECRET_KEY);

// ⚡️ CONFIGURATION: Set this to false in production, true for testing
const DEBUG_MODE = process.env.NODE_ENV === 'development';

// Store OTP codes in development for debugging
const devOTPCodes = new Map();

export const requestMagicOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Validate medtech.tn email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(medtech|smu)\.tn$/i;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Only @medtech.tn or @smu.tn emails are allowed'
      });
    }
    
    if (DEBUG_MODE) {
      // 🔧 DEBUG MODE: Generate a fake OTP code and return it
      console.log(`🔧 DEBUG MODE: Generating OTP code for ${email}`);
      
      // Generate a 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
      
      // Store for verification
      devOTPCodes.set(email, {
        code,
        expiresAt,
        attempts: 0
      });
      
      // Clean up old codes
      setTimeout(() => {
        devOTPCodes.delete(email);
      }, 10 * 60 * 1000);
      
      console.log(`🔧 DEBUG CODE for ${email}: ${code}`);
      
      return res.json({
        success: true,
        message: 'Verification code generated (DEBUG MODE)',
        debugCode: code,
        expiresIn: '10 minutes'
      });
    } else {
      // PRODUCTION MODE: Use Magic to send OTP via email
      // Note: With Magic, OTP sending happens on frontend with magic.auth.loginWithEmailOTP()
      // Backend doesn't need to handle OTP sending in production
      
      res.json({
        success: true,
        message: 'Please check your email for the verification code'
      });
    }
    
  } catch (error) {
    console.error('Request Magic OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate login'
    });
  }
};

export const verifyMagicOTP = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and code are required'
      });
    }
    
    if (DEBUG_MODE) {
      // 🔧 DEBUG MODE: Verify against our stored codes
      console.log(`🔧 DEBUG MODE: Verifying code for ${email}`);
      
      const stored = devOTPCodes.get(email);
      
      if (!stored) {
        return res.status(400).json({
          success: false,
          message: 'No verification code requested for this email'
        });
      }
      
      if (Date.now() > stored.expiresAt) {
        devOTPCodes.delete(email);
        return res.status(400).json({
          success: false,
          message: 'Verification code has expired'
        });
      }
      
      if (stored.attempts >= 3) {
        devOTPCodes.delete(email);
        return res.status(400).json({
          success: false,
          message: 'Too many attempts. Please request a new code.'
        });
      }
      
      if (code !== stored.code) {
        stored.attempts++;
        return res.status(400).json({
          success: false,
          message: `Invalid verification code. Attempt ${stored.attempts}/3`
        });
      }
      
      // Valid code in debug mode
      devOTPCodes.delete(email);
      console.log(`🔧 DEBUG: Code verified for ${email}`);
      
      // Create a mock Magic DID token for development
      const mockDidToken = `mock_did_token_${Date.now()}_${email}`;
      
      // Get user role
      const user = await getUserRole(email);
      
      // Generate JWT token
      const token = generateToken(user);
      
      return res.json({
        success: true,
        message: 'Login successful (DEBUG MODE)',
        data: {
          token: token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role
          }
        }
      });
    } else {
      // PRODUCTION MODE: Verify with Magic
      // Note: In production, the frontend should send the Magic DID token
      // not the email/code directly. Frontend handles OTP verification with Magic SDK.
      
      return res.status(400).json({
        success: false,
        message: 'In production, use Magic SDK on frontend to verify OTP'
      });
    }
    
  } catch (error) {
    console.error('Verify Magic OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Login verification failed'
    });
  }
};

export const verifyMagicLogin = async (req, res) => {
  try {
    const { didToken } = req.body;
    
    if (!didToken) {
      return res.status(400).json({
        success: false,
        message: 'No authentication token provided'
      });
    }
    
    // Verify the Magic token (works in both dev and prod)
    let magicUser;
    try {
      magicUser = await magicAdmin.users.getMetadataByToken(didToken);
    } catch (magicError) {
      console.error('Magic token validation error:', magicError);
      
      // In debug mode with mock token
      if (DEBUG_MODE && didToken.startsWith('mock_did_token_')) {
        // Extract email from mock token
        const email = didToken.split('_').pop();
        magicUser = { email };
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired verification code'
        });
      }
    }
    
    const email = magicUser.email;
    
    // ✅ Validate email domain
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(medtech|smu)\.tn$/i;
    if (!emailRegex.test(email)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email domain'
      });
    }
    
    // Get user role
    const user = await getUserRole(email);
    
    // Generate JWT token
    const token = generateToken(user);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token: token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      }
    });
    
  } catch (error) {
    console.error('Verify Magic login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login verification failed'
    });
  }
};

// Helper function to get user role (same as original)
const getUserRole = async (email) => {
  const [admins] = await pool.query(
    'SELECT id, email FROM admins WHERE email = ?',
    [email]
  );
  
  if (admins.length > 0) {
    return {
      id: admins[0].id,
      email: admins[0].email,
      role: 'admin'
    };
  } else {
    return {
      email: email,
      role: 'student'
    };
  }
};

// Cleanup expired debug codes periodically
if (DEBUG_MODE) {
  setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [email, data] of devOTPCodes.entries()) {
      if (now > data.expiresAt) {
        devOTPCodes.delete(email);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 DEBUG: Cleaned up ${cleaned} expired OTP codes`);
    }
  }, 5 * 60 * 1000); // Every 5 minutes
}

export default {
  requestMagicOTP,
  verifyMagicOTP,
  verifyMagicLogin
};