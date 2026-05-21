/**
 * Authentication Controller
 * Handles user registration, login, OTP verification, and logout
 *
 * Now uses userService for data access via Prisma
 */

const userService = require('../services/userService');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('../utils/sendOtp');

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create new user
    const user = await userService.createUser({ name, email, password });

    // Generate and send OTP
    const otp = await userService.generateOTP(user.id);

    // Send OTP via email (or log to console in dev)
    await sendOtpEmail(email, otp, 'registration');

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for OTP verification.',
      userId: user.id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Verify OTP for registration
 */
const verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'User ID and OTP are required',
      });
    }

    // Find user
    const user = await userService.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify OTP
    const isValid = await userService.verifyOTP(userId, otp);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now login.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user
    const user = await userService.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
      });
    }

    // Verify password
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate and send login OTP
    const loginOtp = await userService.generateOTP(user.id);

    // Send OTP via email
    await sendOtpEmail(email, loginOtp, 'login');

    // Store user ID in session for server-side session management
    req.session.pendingUserId = user.id;

    res.status(200).json({
      success: true,
      message: 'Login OTP sent to your email. Please verify to complete login.',
      userId: user.id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Verify login OTP and issue JWT
 */
const verifyLoginOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'User ID and OTP are required',
      });
    }

    // Find user
    const user = await userService.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify OTP
    const isValid = await userService.verifyOTP(userId, otp);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    });

    // Clear pending session
    delete req.session.pendingUserId;

    // Store session data
    req.session.userId = user.id;
    req.session.isAuthenticated = true;

    // Create record in DB for session tracking
    await userService.createSession(user.id, req.sessionID);

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Logout user
 */
const logout = async (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie('token');

    // Destroy session
    const sessionId = req.sessionID;
    req.session.destroy(async (err) => {
      if (err) {
        console.error('Session destruction error:', err);
      } else {
        // Remove session from DB
        await userService.deleteSession(sessionId);
      }
    });

    // Redirect to landing page
    res.redirect('/');
  } catch (error) {
    res.status(500).redirect('/?error=Logout failed');
  }
};

/**
 * Get current user profile
 */
const getMe = async (req, res) => {
  try {
    // req.user is attached by authMiddleware
    const user = await userService.findById(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Resend OTP
 */
const resendOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const user = await userService.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate new OTP
    const otp = await userService.generateOTP(userId);

    // Send OTP
    await sendOtpEmail(user.email, otp, 'registration');

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully. Please check your email.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  register,
  verifyOtp,
  login,
  verifyLoginOtp,
  logout,
  getMe,
  resendOtp,
};
