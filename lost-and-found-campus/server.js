/**
 * Server Entry Point
 * Starts HTTP server, initializes Socket.io, connects to database
 *
 * SYLLABUS CONCEPT: HTTP server, Socket.io setup, Non-blocking I/O
 * - Creates HTTP server from Express app
 * - Attaches Socket.io for real-time communication
 * - Handles server lifecycle events
 */

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { initializeChatHandlers } = require('./controllers/chatController');

// Load environment variables
require('./config/env');

/**
 * ==========================================
 * CREATE HTTP SERVER
 * SYLLABUS CONCEPT: HTTP module, Server creation
 * ==========================================
 */
const server = http.createServer(app);
const allowedOrigin = process.env.FRONTEND_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000';

/**
 * ==========================================
 * INITIALIZE SOCKET.IO
 * SYLLABUS CONCEPT: Full-duplex communication, Real-time events
 * ==========================================
 */
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible to routes
app.set('io', io);

// Initialize chat event handlers
initializeChatHandlers(io);

// Socket.io connection logging
io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);
});

io.on('disconnect', (socket) => {
  console.log(`🔌 Socket disconnected: ${socket}`);
});

/**
 * ==========================================
 * START SERVER
 * SYLLABUS CONCEPT: Server lifecycle, Event listeners
 * ==========================================
 */
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log('\n');
  console.log('============================================');
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode`);
  console.log(`📍 Port: http://localhost:${PORT}`);
  console.log(`📧 Email: ${process.env.EMAIL_USER || 'Not configured (dev mode)'}`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'PostgreSQL configured' : 'Not configured'}`);
  console.log('============================================');
  console.log('\nPress Ctrl+C to stop the server\n');
});

/**
 * ==========================================
 * GRACEFUL SHUTDOWN
 * SYLLABUS CONCEPT: Process event handling
 * ==========================================
 */

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error('Stack:', err.stack);
  server.close(() => {
    process.exit(1);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  console.error('Stack:', err.stack);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM (e.g., from Heroku)
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('💤 Process terminated');
    process.exit(0);
  });
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n👋 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('💤 Process terminated');
    process.exit(0);
  });
});

module.exports = { server, io };
