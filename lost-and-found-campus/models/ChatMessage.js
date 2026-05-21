/**
 * ChatMessage Model
 * Schema for real-time chat messages
 *
 * SYLLABUS CONCEPT: Mongoose ODM, References between models
 * - Stores chat messages for item-specific conversations
 * - References both User and Item models
 * - Used with Socket.io for real-time communication
 */

const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
      index: true, // Index for faster lookups by item
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Message cannot be empty'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    // For tracking read status (optional feature)
    isRead: {
      type: Boolean,
      default: false,
    },
    // Message type (text, system notification, etc.)
    messageType: {
      type: String,
      enum: ['text', 'system'],
      default: 'text',
    },
  },
  {
    timestamps: true, // Adds createdAt automatically
  }
);

/**
 * Compound index for efficient queries
 * SYLLABUS CONCEPT: Database indexing
 */
chatMessageSchema.index({ itemId: 1, createdAt: 1 });

/**
 * Static method to get messages for an item
 * SYLLABUS CONCEPT: Mongoose static methods, populate
 */
chatMessageSchema.statics.getMessagesByItem = function (itemId, limit = 50) {
  return this.find({ itemId })
    .populate('senderId', 'name email')
    .sort({ createdAt: 1 })
    .limit(limit);
};

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;
