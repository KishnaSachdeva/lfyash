/**
 * OTP Email Sender
 * Sends OTP via email using Nodemailer
 *
 * SYLLABUS CONCEPT: Third-party modules (nodemailer), Async operations
 * - Configures SMTP transporter
 * - Sends HTML email with OTP
 * - Falls back to console logging in development
 */

const nodemailer = require('nodemailer');

/**
 * Create Nodemailer transporter
 * SYLLABUS CONCEPT: SMTP configuration
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send OTP email
 * @param {string} email - Recipient email address
 * @param {string} otp - OTP code to send
 * @param {string} type - 'registration' or 'login'
 */
const sendOtpEmail = async (email, otp, type = 'registration') => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    // Development mode: log OTP to console
    console.log('\n📧 === OTP EMAIL (Development Mode) ===');
    console.log(`To: ${email}`);
    console.log(`Type: ${type}`);
    console.log(`OTP: ${otp}`);
    console.log('========================================\n');

    return {
      success: true,
      message: 'OTP logged to console (email not configured)',
      otp, // Return OTP for easy testing
    };
  }

  try {
    const transporter = createTransporter();

    // Email options
    const mailOptions = {
      from: `"EduPortaile" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: type === 'registration'
        ? '🎓 Verify Your Email - EduPortaile'
        : '🔐 Login Verification - EduPortaile',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f4; padding: 20px; }
            .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #0a0a0a 0%, #1a2a6c 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .otp-box { background: #f0f0f0; border-left: 4px solid #1a2a6c; padding: 20px; margin: 20px 0; text-align: center; }
            .otp-code { font-size: 32px; font-weight: bold; color: #1a2a6c; letter-spacing: 5px; }
            .footer { background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>EduPortaile</h1>
              <p>Lost & Found Campus Platform</p>
            </div>
            <div class="content">
              <h2>${type === 'registration' ? 'Welcome to EduPortaile!' : 'Login Verification'}</h2>
              <p>Thank you for using EduPortaile. Your One-Time Password (OTP) for ${type} is:</p>
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">Valid for 5 minutes</p>
              </div>
              <p><strong>Important:</strong> Do not share this OTP with anyone. Our team will never ask for your OTP.</p>
              <p>If you didn't request this OTP, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 EduPortaile - Chitkara University</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log(`📧 OTP email sent to ${email}: ${info.messageId}`);

    return {
      success: true,
      message: 'OTP sent successfully to your email',
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Email sending failed:', error.message);

    // Fallback: log to console
    console.log('\n⚠️  Email failed - OTP for development:');
    console.log(`To: ${email}`);
    console.log(`OTP: ${otp}`);
    console.log('========================================\n');

    return {
      success: true,
      message: 'OTP logged to console (email delivery failed)',
      otp,
    };
  }
};

module.exports = { sendOtpEmail, createTransporter };
