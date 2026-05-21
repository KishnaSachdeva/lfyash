/**
 * Global Error Handler Middleware
 * Catches and formats all errors consistently
 *
 * SYLLABUS CONCEPT: Error-handling middleware
 * - Four-parameter function signature (err, req, res, next)
 * - Express identifies this as error handler by the 4 parameters
 * - Logs errors and sends formatted response
 * - Different behavior in development vs production
 */

const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('❌ Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : 'Not shown in production',
    url: req.originalUrl,
    method: req.method,
  });

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    // Extract all validation error messages
    const errors = Object.values(err.errors).map(e => e.message);
    message = errors.join(', ');
  }

  // Handle Prisma errors
  if (err.code && err.code.startsWith('P')) {
    statusCode = 400;
    // Prisma error codes: P2002 (Unique constraint), etc.
    if (err.code === 'P2002') {
      message = 'A record with this unique field already exists';
    } else if (err.code === 'P2025') {
      message = 'Record not found';
    }
  }

  // Handle Mongoose duplicate key error (unique constraint)

  // Handle Mongoose duplicate key error (unique constraint)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
  }

  // Handle Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    message,
    // Include stack trace in development for debugging
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

/**
 * 404 Not Found Handler
 * Catches requests to undefined routes
 * SYLLABUS CONCEPT: Middleware ordering, catch-all routes
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};

module.exports = { errorHandler, notFoundHandler };
