const cloudinary = require('cloudinary').v2;
const { cloudinaryConfig } = require('./env'); // Assuming we add these to env.js or .env

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
