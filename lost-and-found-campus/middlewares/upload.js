/**
 * File Upload Middleware (Cloudinary Configuration)
 * Handles image uploads for lost/found items using Cloudinary
 *
 * SYLLABUS CONCEPT: Third-party middleware, Cloud Storage
 * - Uses multer and cloudinary-storage for cloud uploads
 * - Validates file type and size
 * - Stores Cloudinary URL in request for controller access
 */

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

/**
 * Cloudinary Storage configuration
 * - Uploads files directly to Cloudinary
 * - Uses folders for organization
 */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lost-and-found-campus',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  },
});

/**
 * File filter - only allow images
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

/**
 * Multer instance configuration
 * - Storage: CloudinaryStorage
 * - File filter: images only
 * - File size limit: 5MB
 */
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

/**
 * Error handling wrapper for multer
 */
const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.',
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};

module.exports = { upload, uploadErrorHandler };
