/**
 * Chat Controller
 * Handles Socket.io events for real-time chat
 *
 * Now uses chatService and itemService for data access via Prisma
 */

const chatService = require('../services/chatService');
const itemService = require('../services/itemService');

/**
 * Store active chat rooms
 * Structure: { itemId: [userId1, userId2] }
 */
const activeRooms = new Map();

/**
 * Initialize chat handlers
 * Called from server.js with socket.io instance
 */
const initializeChatHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    /**
     * Join a chat room for a specific item
     */
    socket.on('joinRoom', async ({ userId, itemId }) => {
      try {
        // Verify item exists
        const item = await itemService.getItemById(itemId);
        if (!item) {
          socket.emit('error', { message: 'Item not found' });
          return;
        }

        // Join the room
        socket.join(itemId);

        // Track active rooms
        if (!activeRooms.has(itemId)) {
          activeRooms.set(itemId, []);
        }
        if (!activeRooms.get(itemId).includes(userId)) {
          activeRooms.get(itemId).push(userId);
        }

        // Notify others in room
        socket.to(itemId).emit('userJoined', {
          userId,
          socketId: socket.id,
          timestamp: new Date(),
        });

        // Load recent messages
        const messages = await chatService.getMessagesByItem(itemId, 50);

        socket.emit('loadMessages', { messages });

        console.log(`User ${userId} joined room ${itemId}`);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    /**
     * Send a message to the room
     */
    socket.on('sendMessage', async ({ userId, itemId, message }) => {
      try {
        if (!message || message.trim() === '') {
          return;
        }

        // Save message to database via service
        const chatMessage = await chatService.createMessage({
          itemId,
          senderId: userId,
          message: message.trim(),
        });

        // Fetch the message with sender details for broadcasting
        const messages = await chatService.getMessagesByItem(itemId, 1, 0);
        const populatedMessage = messages[0]; // Simplified for the broadcast

        // Broadcast to room
        io.to(itemId).emit('receiveMessage', {
          message: chatMessage.message,
          senderId: chatMessage.senderId,
          timestamp: chatMessage.createdAt,
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    /**
     * Typing indicator
     */
    socket.on('typing', ({ userId, itemId, isTyping }) => {
      socket.to(itemId).emit('userTyping', {
        userId,
        isTyping,
      });
    });

    /**
     * Leave room
     */
    socket.on('leaveRoom', ({ userId, itemId }) => {
      socket.leave(itemId);

      // Update active rooms
      if (activeRooms.has(itemId)) {
        const roomUsers = activeRooms.get(itemId).filter(id => id !== userId);
        if (roomUsers.length === 0) {
          activeRooms.delete(itemId);
        } else {
          activeRooms.set(itemId, roomUsers);
        }
      }

      socket.to(itemId).emit('userLeft', {
        userId,
        timestamp: new Date(),
      });

      console.log(`User ${userId} left room ${itemId}`);
    });

    /**
     * Handle disconnection
     */
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.id}`);

      // Clean up active rooms
      activeRooms.forEach((users, itemId) => {
        const updatedUsers = users.filter(() => true);
        if (updatedUsers.length === 0) {
          activeRooms.delete(itemId);
        }
      });
    });
  });
};

/**
 * Get chat messages for an item (REST API endpoint handler)
 */
const getChatMessages = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { limit = 50 } = req.query;

    const messages = await chatService.getMessagesByItem(itemId, parseInt(limit));

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  initializeChatHandlers,
  getChatMessages,
  activeRooms,
};
