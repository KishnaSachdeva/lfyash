/**
 * Item Routes
 * Handles CRUD operations for lost and found items
 *
 * SYLLABUS CONCEPT: Route parameters, Route handlers, Response methods
 * - Uses express.Router() for modular routing
 * - Route parameters (:id) for single item operations
 * - Multiple route handlers for different operations
 */

const express = require('express');
const router = express.Router();

const {
  getAllItems,
  getLostItems,
  getFoundItems,
  getItemById,
  createItem,
  claimItem,
  resolveItem,
  deleteItem,
  getMyItems,
  updateItem,
} = require('../controllers/itemController');

const { authMiddleware } = require('../middlewares/authMiddleware');
const { upload, uploadErrorHandler } = require('../middlewares/upload');

/**
 * @route   GET /api/items/
 * @desc    Get all items (with filters)
 * @access  Public
 * @query   type=lost|found, category, status, search
 */
router.get('/', getAllItems);

/**
 * @route   GET /api/items/lost
 * @desc    Get all lost items
 * @access  Public
 */
router.get('/lost', getLostItems);

/**
 * @route   GET /api/items/found
 * @desc    Get all found items
 * @access  Public
 */
router.get('/found', getFoundItems);

/**
 * @route   GET /api/items/my
 * @desc    Get current user's items
 * @access  Private
 */
router.get('/my', authMiddleware, getMyItems);

/**
 * @route   GET /api/items/:id
 * @desc    Get single item by ID
 * @access  Public
 * @params  id - Item ID
 */
router.get('/:id', getItemById);

/**
 * @route   POST /api/items/
 * @desc    Create new item (lost or found)
 * @access  Private
 * @body    type, title, description, category, location, date
 * @file    image (optional)
 */
router.post('/', authMiddleware, upload.single('image'), uploadErrorHandler, createItem);

/**
 * @route   POST /api/items/:id/claim
 * @desc    Claim a found item
 * @access  Private
 * @params  id - Item ID
 */
router.post('/:id/claim', authMiddleware, claimItem);

/**
 * @route   PATCH /api/items/:id/resolve
 * @desc    Mark item as resolved
 * @access  Private
 * @params  id - Item ID
 */
router.patch('/:id/resolve', authMiddleware, resolveItem);

/**
 * @route   PATCH /api/items/:id
 * @desc    Update item details
 * @access  Private
 * @params  id - Item ID
 */
router.patch('/:id', authMiddleware, upload.single('image'), uploadErrorHandler, updateItem);

/**
 * @route   DELETE /api/items/:id
 * @desc    Delete item
 * @access  Private
 * @params  id - Item ID
 */
router.delete('/:id', authMiddleware, deleteItem);

module.exports = router;
