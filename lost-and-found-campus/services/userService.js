const prisma = require('./prisma');
const cloudinary = require('../config/cloudinary');

const userService = {
  async createUser(userData) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    return prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });
  },

  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  async updateProfile(id, updateData) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (user && updateData.profileImage && user.profileImage) {
      // Extract public_id from URL
      const publicId = user.profileImage.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId).catch(err => console.error('Cloudinary delete error:', err));
    }

    return prisma.user.update({
      where: { id },
      data: updateData,
    });
  },

  async createSession(userId, sessionId) {
    return prisma.userSession.create({
      data: {
        userId,
        sessionId,
      },
    });
  },

  async deleteSession(sessionId) {
    return prisma.userSession.deleteMany({
      where: { sessionId },
    });
  },
};

module.exports = userService;
