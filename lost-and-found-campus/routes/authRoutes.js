/**
 * Authentication Routes
 * Handles user registration, login, logout
 *
 * SYLLABUS CONCEPT: Router-level middleware, Route handlers
 * - Uses express.Router() for modular routing
 * - Applies middleware at router level
 * - Separates concerns from main app.js
 */

const express = require('express');
const router = express.Router();

const {
  register,
  login,
  logout,
  getMe,
} = require('../controllers/authController');

const { validateEmail } = require('../middlewares/validateEmail');
const { authMiddleware, isAlreadyAuthenticated } = require('../middlewares/authMiddleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register new user (with email validation)
 * @access  Public
 */
router.post('/register', validateEmail, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authMiddleware, logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authMiddleware, getMe);

/**
 * @route   GET /api/auth/check
 * @desc    Check if user is authenticated (for frontend)
 * @access  Public
 */
router.get('/check', authMiddleware, (req, res) => {
  res.json({
    success: true,
    authenticated: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
    },
  });
});

module.exports = router;
