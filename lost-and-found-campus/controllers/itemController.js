/**
 * Item Controller
 * Handles CRUD operations for lost and found items
 *
 * Now uses itemService for data access via Prisma
 */

const itemService = require('../services/itemService');

/**
 * Get all items with optional filters
 */
const getAllItems = async (req, res) => {
  try {
    const { type, category, status, search, page, limit, sortBy, sortOrder } = req.query;

    // Search is currently handled by a basic text match in the service or could be expanded
    // For now, we'll pass filters to the service
    const result = await itemService.getAllItems({
      type,
      category,
      status,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc',
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get all lost items
 */
const getLostItems = async (req, res) => {
  req.query.type = 'lost';
  return getAllItems(req, res);
};

/**
 * Get all found items
 */
const getFoundItems = async (req, res) => {
  req.query.type = 'found';
  return getAllItems(req, res);
};

/**
 * Get single item by ID
 */
const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await itemService.getItemById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Create new item (lost or found)
 */
const createItem = async (req, res) => {
  try {
    const { type, title, description, category, location, date } = req.body;

    // Validate required fields
    if (!type || !title || !description || !category || !location || !date) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Validate type
    if (!['lost', 'found'].includes(type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "lost" or "found"',
      });
    }

    // Handle image upload (URL from multer/cloudinary)
    const image = req.file ? req.file.path : '';

    // Create item via service
    const item = await itemService.createItem({
      type: type.toUpperCase(),
      title,
      description,
      category,
      location,
      date: new Date(date),
      image,
      reportedById: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: `${type === 'lost' ? 'Lost' : 'Found'} item reported successfully!`,
      item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Claim a found item
 */
const claimItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await itemService.getItemById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    // Can only claim found items
    if (item.type !== 'FOUND') {
      return res.status(400).json({
        success: false,
        message: 'Can only claim found items',
      });
    }

    // Check if already claimed
    if (item.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: `Item is already ${item.status.toLowerCase()}`,
      });
    }

    // Update item status and claim it
    const claimedItem = await itemService.claimItem(id, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Claim initiated! You can now chat with the finder.',
      item: claimedItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Mark item as resolved
 */
const resolveItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await itemService.getItemById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    // Only owner or claimer can resolve
    const isOwner = item.reportedById === req.user.id;
    const isClaimer = item.claimedById === req.user.id;

    if (!isOwner && !isClaimer) {
      return res.status(403).json({
        success: false,
        message: 'Only owner or claimer can resolve this item',
      });
    }

    // Update status
    const resolvedItem = await itemService.updateItem(id, { status: 'RESOLVED' });

    res.status(200).json({
      success: true,
      message: 'Item marked as resolved. Thank you for using EduPortaile!',
      item: resolvedItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete item
 */
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await itemService.getItemById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    // Only owner can delete
    if (item.reportedById !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can delete this item',
      });
    }

    await itemService.deleteItem(id);

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get current user's items
 */
const getMyItems = async (req, res) => {
  try {
    const { status } = req.query;

    const items = await itemService.getAllItems({
      status: status || 'ACTIVE',
    });

    const myItems = items.items.filter(item => item.reportedBy.id === req.user.id);

    res.status(200).json({
      success: true,
      count: myItems.length,
      items: myItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update item details
 */
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await itemService.getItemById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    // Only owner can update
    if (item.reportedById !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can update this item',
      });
    }

    const updateData = { ...req.body };
    delete updateData._method;
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    const updatedItem = await itemService.updateItem(id, updateData);

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      item: updatedItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
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
};
