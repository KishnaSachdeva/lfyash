/**
 * Environment Variables Configuration
 * Loads .env file and validates required variables
 *
 * SYLLABUS CONCEPT: Environment variables, dotenv module
 * - Uses dotenv.config() to load .env file
 * - Validates that critical variables are present
 * - Provides defaults where appropriate
 */

const dotenv = require('dotenv');
const path = require('path');

// Load .env file from project root
dotenv.config({ path: path.join(__dirname, '../.env') });

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'SESSION_SECRET'];

const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingVars.length > 0) {
  console.warn('⚠️  Warning: Missing required environment variables:');
  missingVars.forEach(v => console.warn(`   - ${v}`));
  console.warn('   The application may not function correctly.\n');
}

// Export config object for easy access
const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  sessionSecret: process.env.SESSION_SECRET,
  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
  },
};

module.exports = config;
