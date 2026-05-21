const session = require('express-session');
const prisma = require('./prisma');

class PrismaSessionStore extends session.Store {
  get(sid, callback) {
    prisma.session
      .findUnique({ where: { sid } })
      .then((record) => {
        if (!record || record.expire <= new Date()) {
          return callback(null, null);
        }

        return callback(null, record.sess);
      })
      .catch((error) => callback(error));
  }

  set(sid, sess, callback) {
    const maxAge = sess.cookie?.maxAge || 7 * 24 * 60 * 60 * 1000;
    const expire = new Date(Date.now() + maxAge);

    prisma.session
      .upsert({
        where: { sid },
        update: { sess, expire },
        create: { sid, sess, expire },
      })
      .then(() => callback?.(null))
      .catch((error) => callback?.(error));
  }

  destroy(sid, callback) {
    prisma.session
      .delete({ where: { sid } })
      .catch((error) => {
        if (error.code !== 'P2025') {
          throw error;
        }
      })
      .then(() => callback?.(null))
      .catch((error) => callback?.(error));
  }

  touch(sid, sess, callback) {
    const maxAge = sess.cookie?.maxAge || 7 * 24 * 60 * 60 * 1000;
    const expire = new Date(Date.now() + maxAge);

    prisma.session
      .update({ where: { sid }, data: { expire } })
      .catch((error) => {
        if (error.code !== 'P2025') {
          throw error;
        }
      })
      .then(() => callback?.(null))
      .catch((error) => callback?.(error));
  }
}

module.exports = PrismaSessionStore;
