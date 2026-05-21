/**
 * Database Configuration
 * Handles MongoDB connection using Mongoose
 *
 * SYLLABUS CONCEPT: Database connection & Mongoose ODM
 * - Uses mongoose.connect() with async/await
 * - Handles connection errors gracefully
 * - Exports connection function for reuse
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit process with failure code
    process.exit(1);
  }
};

module.exports = connectDB;
