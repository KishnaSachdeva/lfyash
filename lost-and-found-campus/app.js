/**
 * Express Application Setup
 * Main application configuration file
 *
 * SYLLABUS CONCEPT: Express app setup, Middleware lifecycle, Template engines
 * - Application-level middleware
 * - Third-party middleware (morgan, cookie-parser, express-session)
 * - View engine configuration (EJS for SSR)
 * - Static file serving
 * - Route mounting
 */

const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const methodOverride = require('method-override');

// Load environment variables
require('./config/env');

const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

// Initialize Express app
const app = express();

/**
 * ==========================================
 * APPLICATION-LEVEL MIDDLEWARE
 * SYLLABUS CONCEPT: Middleware lifecycle
 * ==========================================
 */

// Logger middleware (development only)
// SYLLABUS CONCEPT: Third-party middleware, HTTP logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Logs: GET /api/items 200 - 15.234 ms
}

// Body parsing middleware
// SYLLABUS CONCEPT: Body parsing (express.json, express.urlencoded)
// Note: body-parser is now built into Express
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(methodOverride('_method'));

// Cookie parser middleware
// SYLLABUS CONCEPT: Cookie handling
app.use(cookieParser());

// Static file serving
// SYLLABUS CONCEPT: Static files, express.static
app.use(express.static(path.join(__dirname, 'public')));

/**
 * ==========================================
 * SESSION MANAGEMENT
 * SYLLABUS CONCEPT: express-session, cookies
 * ==========================================
 */
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 7 * 24 * 60 * 60, // Session expires in 7 days
    }),
    cookie: {
      httpOnly: true, // Prevent XSS
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

/**
 * ==========================================
 * VIEW ENGINE SETUP (EJS)
 * SYLLABUS CONCEPT: Template engines, SSR vs CSR
 * ==========================================
 */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/**
 * ==========================================
 * ROUTE MOUNTING
 * SYLLABUS CONCEPT: Router-level middleware, Modular routing
 * ==========================================
 */

// API Routes
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// View Routes (SSR pages)
const viewRoutes = require('./routes/viewRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/', viewRoutes);

/**
 * ==========================================
 * ERROR HANDLING
 * SYLLABUS CONCEPT: Error-handling middleware
 * ==========================================
 */

// 404 handler - must be before error handler
app.use(notFoundHandler);

// Global error handler (4 parameters = error handler)
app.use(errorHandler);

module.exports = app;
