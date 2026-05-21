/**
 * User Model
 * Schema for user authentication and profile
 *
 * SYLLABUS CONCEPT: Mongoose ODM, Schemas, Pre-save hooks
 * - Defines user schema with validation
 * - Uses pre('save') hook for password hashing
 * - Stores OTP for 2FA verification
 * - Notifications array for match alerts
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[\w.+-]+@chitkara\.edu\.in$/, 'Must be a valid @chitkara.edu.in email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password in queries by default
    },
    otp: {
      code: String,
      expiresAt: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
      default: '',
    },
    notifications: [
      {
        type: {
          type: String,
          enum: ['match', 'claim', 'resolution', 'general'],
        },
        message: String,
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Item',
        },
        isRead: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Session tracking (optional, for demonstration)
    activeSessions: [
      {
        sessionId: String,
        loginTime: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

/**
 * Pre-save hook for password hashing
 * SYLLABUS CONCEPT: Mongoose middleware/hooks
 * - Hashes password before saving to database
 * - Only runs when password is modified (isNew or isModified)
 * - Uses bcrypt with 10 salt rounds
 */
userSchema.pre('save', async function (next) {
  // Only hash if password is new or being modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance method to compare passwords
 * SYLLABUS CONCEPT: bcrypt authentication
 * - Compares plain text password with hashed password
 * - Used during login verification
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Instance method to generate OTP
 * Generates a 4-digit numeric OTP
 */
userSchema.methods.generateOTP = function () {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  this.otp = {
    code: otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // OTP expires in 5 minutes
  };
  return otp;
};

/**
 * Instance method to verify OTP
 */
userSchema.methods.verifyOTP = function (otp) {
  if (!this.otp || !this.otp.code || !this.otp.expiresAt) {
    return false;
  }

  // Check if OTP is expired
  if (new Date() > this.otp.expiresAt) {
    this.otp = undefined; // Clear expired OTP
    return false;
  }

  // Check if OTP matches
  if (this.otp.code === otp) {
    this.otp = undefined; // Clear OTP after successful verification
    this.isVerified = true; // Mark user as verified
    return true;
  }

  return false;
};

/**
 * Instance method to add notification
 */
userSchema.methods.addNotification = function (type, message, itemId = null) {
  this.notifications.unshift({ type, message, itemId });
  // Keep only last 50 notifications to prevent bloat
  if (this.notifications.length > 50) {
    this.notifications = this.notifications.slice(0, 50);
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
