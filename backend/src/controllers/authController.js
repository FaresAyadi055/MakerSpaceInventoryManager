// src/controllers/authController.js
import pool from '../db/pool.js';

const authController = {
  // Simplified login - just returns user info based on email
  // In the future, this will send verification codes
  async login(req, res) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }
      
      // Validate email format
      const emailRegex = /^[a-z0-9._%+-]+[a-z0-9]\.[a-z0-9][a-z0-9._%+-]+@medtech\.tn$/i;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }
      
      // Check if user is admin
      const [admins] = await pool.query(
        'SELECT id, email FROM admins WHERE email = ?',
        [email]
      );
      
      let role = 'student';
      let userId = null;
      
      if (admins.length > 0) {
        role = 'admin';
        userId = admins[0].id;
      }
      
      // For now, return the email as token (simplified)
      // In production, generate JWT or send verification code
      res.json({
        success: true,
        message: 'Login successful',
        user: {
          email,
          role,
          userId
        },
        token: email // Simplified - use email as token for now
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed'
      });
    }
  },
  
  // Verify token (for frontend to check current user)
  async verify(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }
      
      res.json({
        success: true,
        user: req.user
      });
    } catch (error) {
      console.error('Verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Verification failed'
      });
    }
  }
};

export default authController;