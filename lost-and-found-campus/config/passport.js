/**
 * Passport.js Configuration (Optional)
 * JWT Strategy for authentication
 *
 * SYLLABUS CONCEPT: Authentication with Passport.js
 * - Demonstrates Passport.js JWT strategy
 * - Alternative to manual JWT verification in authMiddleware
 * - Can be used alongside or instead of custom auth middleware
 *
 * NOTE: This is optional. The project uses manual JWT verification
 * in authMiddleware.js by default.
 */

// Uncomment below to use Passport.js
/*
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

const options = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(),
    (req) => req.cookies?.token,
  ]),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(options, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id);
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Middleware to use Passport authentication
const isAuthenticated = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    req.user = user;
    next();
  })(req, res, next);
};

module.exports = { passport, isAuthenticated };
*/
