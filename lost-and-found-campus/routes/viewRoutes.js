/**
 * View Routes (SSR Pages)
 * Handles server-side rendered pages using EJS
 *
 * SYLLABUS CONCEPT: Template engines (SSR vs CSR)
 * - Uses res.render() to render EJS templates
 * - Demonstrates Server-Side Rendering
 * - Passes data to views from server
 */

const express = require('express');
const router = express.Router();

const { authMiddleware, isAlreadyAuthenticated, optionalAuthMiddleware } = require('../middlewares/authMiddleware');
const itemService = require('../services/itemService');
const userService = require('../services/userService');
const notificationService = require('../services/notificationService');

/**
 * @route   GET /
 * @desc    Landing page
 * @access  Public
 */
router.get('/', (req, res) => {
  // Check if user is already logged in (via cookie)
  if (req.cookies.token) {
    return res.redirect('/dashboard');
  }
  res.render('landing', {
    title: 'EduPortaile - Campus Lost & Found',
    page: 'landing',
  });
});

/**
 * @route   GET /login
 * @desc    Login page
 * @access  Public
 */
router.get('/login', isAlreadyAuthenticated, (req, res) => {
  res.render('login', {
    title: 'Login - EduPortaile',
    page: 'login',
    error: null,
    success: null,
  });
});

/**
 * @route   GET /register
 * @desc    Registration page
 * @access  Public
 */
router.get('/register', isAlreadyAuthenticated, (req, res) => {
  res.render('register', {
    title: 'Register - EduPortaile',
    page: 'register',
    error: null,
    success: null,
  });
});

/**
 * @route   GET /dashboard
 * @desc    User dashboard
 * @access  Private
 */
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    // Fetch user's items and notifications via services
    const userItems = await itemService.getItemsByUserId(req.user.id);
    const notifications = await notificationService.getUserNotifications(req.user.id, 10);

    // Get unread notification count
    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Get stats
    const activeItems = userItems.filter(i => i.status === 'ACTIVE').length;
    const resolvedItems = userItems.filter(i => i.status === 'RESOLVED').length;

    res.render('dashboard', {
      title: 'Dashboard - EduPortaile',
      page: 'dashboard',
      user: req.user,
      userItems,
      notifications,
      unreadCount,
      stats: {
        total: userItems.length,
        active: activeItems,
        resolved: resolvedItems,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load dashboard',
    });
  }
});

/**
 * @route   GET /report
 * @desc    Report item page
 * @access  Private
 */
router.get('/report', authMiddleware, (req, res) => {
  res.render('report', {
    title: 'Report Item - EduPortaile',
    page: 'report',
    type: req.query.type || 'lost',
    error: null,
    success: null,
  });
});

/**
 * @route   GET /item/edit/:id
 * @desc    Edit item page
 * @access  Private
 */
router.get('/item/edit/:id', authMiddleware, async (req, res) => {
  try {
    const item = await itemService.getItemById(req.params.id);

    if (!item) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Item not found',
      });
    }

    if (item.reportedById !== req.user.id) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You are not authorized to edit this item',
      });
    }

    res.render('edit-item', {
      title: `Edit ${item.title}`,
      page: 'items',
      item,
      user: req.user,
    });
  } catch (error) {
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load edit page',
    });
  }
});

/**
 * @route   GET /item/:id
 * @desc    Single item view page
 * @access  Public
 */
router.get('/item/:id', optionalAuthMiddleware, async (req, res) => {
  try {
    const item = await itemService.getItemById(req.params.id);

    if (!item) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Item not found',
      });
    }

    res.render('item', {
      title: item.title,
      page: 'items',
      item,
      user: req.user || null,
    });
  } catch (error) {
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load item',
    });
  }
});

/**
 * @route   GET /items
 * @desc    Browse all items
 * @access  Public
 */
router.get('/items', optionalAuthMiddleware, async (req, res) => {
  try {
    const { type, category } = req.query;

    const { items } = await itemService.getAllItems({
      type,
      category,
      status: 'ACTIVE',
      limit: 50,
    });

    res.render('items', {
      title: `${type ? type.charAt(0).toUpperCase() + type.slice(1) : 'All'} Items - EduPortaile`,
      page: 'items',
      items,
      filter: { type, category },
      user: req.user || null,
    });
  } catch (error) {
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load items',
    });
  }
});

/**
 * @route   GET /chat/:itemId
 * @desc    Chat room for an item
 * @access  Private
 */
router.get('/chat/:itemId', authMiddleware, async (req, res) => {
  try {
    const item = await itemService.getItemById(req.params.itemId);

    if (!item) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Item not found',
      });
    }

    // Check if user is authorized (owner or claimer)
    const isOwner = item.reportedById === req.user.id;
    const isClaimer = item.claimedById && item.claimedById === req.user.id;

    if (!isOwner && !isClaimer) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You are not authorized to view this chat',
      });
    }

    res.render('chat', {
      title: `Chat - ${item.title}`,
      page: 'chat',
      item,
      user: req.user,
    });
  } catch (error) {
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load chat',
    });
  }
});

module.exports = router;
