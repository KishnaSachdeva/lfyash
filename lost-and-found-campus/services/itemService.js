const prisma = require('./prisma');
const cloudinary = require('../config/cloudinary');
const { tokenize } = require('../utils/matchAlgo');
const notificationService = require('./notificationService');
const { findMatches } = require('../utils/matchAlgo');

const itemService = {
  async createItem(itemData) {
    const keywords = tokenize(itemData.description);

    const item = await prisma.item.create({
      data: {
        ...itemData,
        keywords,
      },
    });

    // Trigger matching algorithm
    const candidates = await prisma.item.findMany({
      where: {
        type: itemData.type === 'lost' ? 'FOUND' : 'LOST',
        status: 'ACTIVE',
        NOT: { id: item.id },
      },
    });

    const matches = findMatches(item, candidates);

    if (matches.length > 0) {
      // Create notifications for the users of matched items
      for (const match of matches) {
        await notificationService.createNotification(
          match.item.reportedById,
          `Potential match found for your ${match.item.type} item!`,
          item.id,
          'match'
        );
      }
    }

    return item;
  },

  async getAllItems({ page = 1, limit = 10, category, status, type, sortBy = 'createdAt', sortOrder = 'desc' }) {
    const skip = (page - 1) * limit;

    const where = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (type) where.type = type;

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { reportedBy: { select: { name: true, email: true } } },
      }),
      prisma.item.count({ where }),
    ]);

    return {
      items,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  },

  async getItemById(id) {
    return prisma.item.findUnique({
      where: { id },
      include: {
        reportedBy: true,
        claimedBy: true,
        messages: {
          include: { sender: { select: { name: true, email: true } } },
          orderBy: { createdAt: 'asc' }
        }
      },
    });
  },

  async getItemsByUserId(userId) {
    return prisma.item.findMany({
      where: { reportedById: userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async updateItem(id, updateData) {
    const item = await prisma.item.findUnique({ where: { id } });

    if (item && updateData.image && item.image) {
      // Extract public_id from URL
      const publicId = item.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId).catch(err => console.error('Cloudinary delete error:', err));
    }

    if (updateData.description) {
      updateData.keywords = tokenize(updateData.description);
    }

    return prisma.item.update({
      where: { id },
      data: updateData,
    });
  },

  async deleteItem(id) {
    const item = await prisma.item.findUnique({ where: { id } });

    if (item && item.image) {
      const publicId = item.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId).catch(err => console.error('Cloudinary delete error:', err));
    }

    return prisma.item.delete({
      where: { id },
    });
  },

  async claimItem(itemId, userId) {
    return prisma.item.update({
      where: { id: itemId },
      data: {
        status: 'CLAIMED',
        claimedById: userId,
      },
    });
  },
};

module.exports = itemService;
