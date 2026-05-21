const prisma = require('./prisma');

const normalizeNotificationType = (type) => String(type || 'GENERAL').toUpperCase();

const notificationService = {
  async createNotification(userId, message, itemId = null, type = 'GENERAL') {
    return prisma.notification.create({
      data: {
        userId,
        message,
        itemId,
        type: normalizeNotificationType(type),
      },
    });
  },

  async getUserNotifications(userId, limit = 20, offset = 0) {
    return prisma.notification.findMany({
      where: { userId },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        item: {
          select: {
            title: true,
            type: true,
          },
        },
      },
    });
  },

  async markAsRead(notificationId, userId) {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: { isRead: true },
    });
  },

  async deleteNotification(notificationId, userId) {
    return prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId,
      },
    });
  },

  async clearNotifications(userId) {
    return prisma.notification.deleteMany({
      where: { userId },
    });
  },
};

module.exports = notificationService;
