// src/services/emailService.js
import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

const emailService = {
  // Send verification code email
  async sendVerificationEmail(email, code) {
    try {
      const transporter = createTransporter();
      
      const mailOptions = {
        from: `"MakerSpace App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Makerspace Login Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Makerspace app Login</h2>
            <p>Your verification code is:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #007bff; font-size: 36px; letter-spacing: 5px; margin: 0;">
                ${code}
              </h1>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px;">
              MakerSpace App<br />
              MedTech University
            </p>
          </div>
        `,
        text: `Your Makerspace verification code is: ${code}\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Verification email sent to ${email}: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending verification email:', error);
      throw error;
    }
  },

  // Send request notification to admins
  async sendRequestNotification(studentEmail, itemName, quantity) {
    try {
      // Get all admin emails
      const [admins] = await pool.query('SELECT email FROM admins');
      
      if (admins.length === 0) return;
      
      const adminEmails = admins.map(admin => admin.email).join(', ');
      const transporter = createTransporter();
      
      const mailOptions = {
        from: `"Makerspace Inventory" <${process.env.EMAIL_USER}>`,
        to: adminEmails,
        subject: 'New Item Request - Makerspace Inventory',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Item Request</h2>
            <p>A student has requested an item from the inventory:</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #007bff;">
              <p><strong>Student:</strong> ${studentEmail}</p>
              <p><strong>Item:</strong> ${itemName}</p>
              <p><strong>Quantity:</strong> ${quantity}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p>Please log in to the admin panel to review this request.</p>
            <hr style="margin: 20px 0;" />
            <p style="color: #666; font-size: 12px;">Makerspace Inventory System</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`📧 Request notification sent to admins`);
    } catch (error) {
      console.error('Error sending request notification:', error);
    }
  },

  // Test email configuration
  async testConnection() {
    try {
      const transporter = createTransporter();
      await transporter.verify();
      console.log('✅ Email server connection successful');
      return true;
    } catch (error) {
      console.error('❌ Email server connection failed:', error.message);
      return false;
    }
  },
};

export default emailService;