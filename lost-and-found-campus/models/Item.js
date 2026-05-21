/**
 * Item Model
 * Schema for both lost and found items
 *
 * SYLLABUS CONCEPT: Mongoose ODM, Schema design
 * - Single schema for both lost and found items
 * - Uses enum for type discrimination
 * - References User model for reportedBy
 * - Status tracking for workflow
 */

const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Item type is required'],
      enum: ['lost', 'found'],
      default: 'lost',
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Electronics', 'Clothing', 'Books', 'Accessories', 'Other'],
      default: 'Other',
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    image: {
      type: String,
      default: '', // Stores file path of uploaded image
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'claimed', 'resolved'],
      default: 'active',
    },
    // For claimed items, track who claimed it
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Additional metadata for matching algorithm
    keywords: [String], // Extracted from description for search
  },
  {
    timestamps: true,
  }
);

/**
 * Index for text search (used in matching algorithm)
 * SYLLABUS CONCEPT: Database indexing for performance
 */
itemSchema.index({ title: 'text', description: 'text', keywords: 'text' });

/**
 * Static method to find items by category
 * SYLLABUS CONCEPT: Mongoose static methods
 */
itemSchema.statics.findByCategory = function (category) {
  return this.find({ category });
};

/**
 * Static method to find active items
 */
itemSchema.statics.findActive = function () {
  return this.find({ status: 'active' });
};

/**
 * Pre-save hook to extract keywords from description
 * SYLLABUS CONCEPT: Mongoose pre-save hooks
 */
itemSchema.pre('save', function (next) {
  // Only process on new items or when description changes
  if (!this.isModified('description') && !this.isNew) {
    return next();
  }

  // Simple keyword extraction (remove common words)
  const stopwords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because', 'until', 'while', 'this', 'that', 'these', 'those', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'you', 'your', 'yours', 'he', 'him', 'his', 'she', 'her', 'hers', 'it', 'its', 'they', 'them', 'their', 'what', 'which', 'who', 'whom'];

  const words = this.description.toLowerCase().split(/\s+/);
  const uniqueKeywords = [...new Set(words.filter(word => !stopwords.includes(word) && word.length > 2))];
  this.keywords = uniqueKeywords.slice(0, 20); // Limit to 20 keywords

  next();
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
