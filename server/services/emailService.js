// src/services/emailService.js
import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';

// Create Microsoft Graph client
const createGraphClient = async () => {
  const credential = new ClientSecretCredential(
    process.env.AZURE_TENANT_ID,
    process.env.AZURE_CLIENT_ID,
    process.env.AZURE_CLIENT_SECRET
  );

  return Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => {
        const token = await credential.getToken('https://graph.microsoft.com/.default');
        return token.token;
      }
    }
  });
};

const emailService = {
  // Send verification code email
  async sendVerificationEmail(email, code) {
    try {
      const client = await createGraphClient();
      
      const message = {
        message: {
          subject: 'Your FabLab Login Code',
          body: {
            contentType: 'HTML',
            content: this.generateEmailHtml(code)
          },
          toRecipients: [
            {
              emailAddress: {
                address: email
              }
            }
          ],
          from: {
            emailAddress: {
              address: process.env.AZURE_SENDER_EMAIL
            }
          }
        },
        saveToSentItems: true
      };

      await client
        .api(`/users/${process.env.AZURE_SENDER_EMAIL}/sendMail`)
        .post(message);
      
      console.log(`✅ Verification email sent via Microsoft Graph API to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending verification email via Microsoft Graph:', error);
      
      // Provide more detailed error information
      if (error.statusCode) {
        console.error(`HTTP Status: ${error.statusCode}`);
      }
      if (error.body) {
        console.error(`Error Details: ${JSON.stringify(error.body)}`);
      }
      
      throw error;
    }
  },

  // Generate email HTML content
  generateEmailHtml(code) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">FabLab app Login</h2>
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
          FabLab App<br />
          MedTech University
        </p>
      </div>
    `;
  },

  // Test Microsoft Graph API connection
  async testConnection() {
    try {
      const client = await createGraphClient();
      
      // Test by getting user info
      const user = await client
        .api(`/users/${process.env.AZURE_SENDER_EMAIL}`)
        .select('displayName,mail,userPrincipalName')
        .get();
      
      console.log('✅ Microsoft Graph API connection successful');
      console.log(`   Connected as: ${user.mail || user.userPrincipalName}`);
      console.log(`   Display Name: ${user.displayName}`);
      
      return {
        success: true,
        user: {
          displayName: user.displayName,
          email: user.mail || user.userPrincipalName
        }
      };
    } catch (error) {
      console.error('❌ Microsoft Graph API connection failed:', error.message);
      
      if (error.statusCode === 401) {
        console.error('   Check your Azure credentials (Tenant ID, Client ID, Client Secret)');
      } else if (error.statusCode === 403) {
        console.error('   Check API permissions. Need: Mail.Send (Application)');
      } else if (error.statusCode === 404) {
        console.error(`   User not found: ${process.env.AZURE_SENDER_EMAIL}`);
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Test sending capability
  async testSend() {
    try {
      const testEmail = process.env.TEST_EMAIL || process.env.AZURE_SENDER_EMAIL;
      const testCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      console.log(`📧 Testing email send to: ${testEmail}`);
      
      await this.sendVerificationEmail(testEmail, testCode);
      
      console.log('✅ Test email sent successfully');
      return {
        success: true,
        message: `Test email sent to ${testEmail}`
      };
    } catch (error) {
      console.error('❌ Test email failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

export default emailService;