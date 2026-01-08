// test-email.js
import dotenv from 'dotenv';
dotenv.config();

import emailService from '../services/emailService.js';

async function testEmail() {
  console.log('Testing email configuration...');
  
  // Test connection
  const connectionOk = await emailService.testConnection();
  if (!connectionOk) {
    console.log('❌ Email connection failed. Check your .env configuration.');
    return;
  }
  
  // Send test email
  try {
    await emailService.sendVerificationEmail(
      'fares.ayadi@medtech.tn',
      '123456'
    );
    console.log('✅ Test email sent successfully!');
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message);
  }
}

testEmail();