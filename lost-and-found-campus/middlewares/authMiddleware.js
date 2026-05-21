/**
 * Authentication Middleware
 * Protects routes by verifying JWT tokens
 *
 * SYLLABUS CONCEPT: Router-level middleware, JWT verification
 * - Verifies JWT from cookies or Authorization header
 * - Attaches user object to request for downstream use
 * - Returns 401 if token is missing or invalid
 */

const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

/**
 * Middleware to protect routes requiring authentication
 * Usage: router.get('/protected', authMiddleware, handler)
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user and attach to request
    // Note: password is already excluded by select: false in schema
    const user = await userService.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.',
      });
    }

    // Check if user is verified (completed OTP verification)
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your account before accessing this resource.',
      });
    }

    // Attach user to request object for use in route handlers
    req.user = user;
    next();
  } catch (error) {
    // Handle JWT verification errors (expired, malformed, etc.)
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      });
    }

    // Generic error
    res.status(500).json({
      success: false,
      message: 'Authentication error.',
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if valid token is present, otherwise continues
 * Used for public pages that show different content for logged-in users
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userService.findById(decoded.id);
      if (user && user.isVerified) {
        req.user = user;
      }
    }
  } catch (error) {
    // Silently fail and continue as guest
  }
  next();
};

/**
 * Optional middleware to check if user is already authenticated
 * Used for login/register pages - redirect if already logged in
 */
const isAlreadyAuthenticated = (req, res, next) => {
  const token = req.cookies?.token;

  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      // Token is valid, redirect to dashboard
      return res.redirect('/dashboard');
    } catch (error) {
      // Token is invalid, continue to next middleware
      next();
    }
  } else {
    next();
  }
};

module.exports = { authMiddleware, isAlreadyAuthenticated, optionalAuthMiddleware };
