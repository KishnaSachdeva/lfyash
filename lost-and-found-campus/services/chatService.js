const prisma = require('./prisma');

const chatService = {
  async createMessage(data) {
    return prisma.chatMessage.create({
      data: {
        itemId: data.itemId,
        senderId: data.senderId,
        message: data.message,
        messageType: data.messageType || 'TEXT',
      },
    });
  },

  async getMessagesByItem(itemId, limit = 50, offset = 0) {
    return prisma.chatMessage.findMany({
      where: { itemId },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  },

  async markAsRead(messageId, userId) {
    // Verify that the message belongs to the user and is currently unread
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message || message.senderId !== userId || message.isRead) {
      return null;
    }

    return prisma.chatMessage.update({
      where: { id: messageId },
      data: { isRead: true },
    });
  },
};

module.exports = chatService;
