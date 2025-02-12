const {v2 : cloudinary} = require('cloudinary')
require('dotenv').config();

const requiredEnvVariables = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
requiredEnvVariables.forEach((envVar) => {
    if (!process.env[envVar]) {
        console.error(`Error: Missing required environment variable ${envVar}`);
        process.exit(1);
    }
});

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;