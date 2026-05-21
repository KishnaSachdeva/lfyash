/**
 * Notification Routes
 * Handles user notifications for matches, claims, resolutions
 *
 * SYLLABUS CONCEPT: Protected routes, User data manipulation
 */

const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../middlewares/authMiddleware');
const notificationService = require('../services/notificationService');

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user.id, 100);
    const unreadCount = notifications.filter(n => !n.isRead).length;

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
    const notifications = await notificationService.getUserNotifications(req.user.id, 50);

    res.json({
      success: true,
      count: notifications.length,
      notifications,
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
    const notifications = await notificationService.getUserNotifications(req.user.id, 100);
    await Promise.all(
      notifications
        .filter(n => !n.isRead)
        .map(n => notificationService.markAsRead(n.id, req.user.id))
    );

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
    await notificationService.deleteNotification(req.params.id, req.user.id);

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
