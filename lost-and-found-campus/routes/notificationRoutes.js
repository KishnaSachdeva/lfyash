/**
 * Notification Routes
 * Handles user notifications for matches, claims, resolutions
 *
 * SYLLABUS CONCEPT: Protected routes, User data manipulation
 */

const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../middlewares/authMiddleware');
const User = require('../models/User');

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const unreadCount = user.notifications.filter(n => !n.isRead).length;

    res.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      count: user.notifications.length,
      notifications: user.notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @route   PATCH /api/notifications/mark-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch('/mark-read', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Mark all as read
    user.notifications.forEach(n => {
      n.isRead = true;
    });

    await user.save();

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a specific notification
 * @access  Private
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Filter out the notification with matching ID
    user.notifications = user.notifications.filter(
      n => n._id.toString() !== req.params.id
    );

    await user.save();

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
