require("dotenv").config();

const cloudinary = require('cloudinary').v2;

cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
})

module.exports = cloudinary;