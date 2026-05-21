/**
 * Authentication Controller
 * Handles user registration, login, and logout
 *
 * Now uses userService for data access via Prisma
 */

const userService = require('../services/userService');
const jwt = require('jsonwebtoken');

const signInUser = async (req, res, user, message = 'Login successful!') => {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

  req.session.userId = user.id;
  req.session.isAuthenticated = true;

  await userService.createSession(user.id, req.sessionID);

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    message,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
};

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

    const user = await userService.createUser({
      name,
      email,
      password,
      isVerified: true,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! You can now login.',
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

    // Verify password
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    return signInUser(req, res, user);
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

module.exports = {
  register,
  login,
  logout,
  getMe,
};
