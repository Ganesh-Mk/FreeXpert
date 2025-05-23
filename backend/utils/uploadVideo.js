const { v2: cloudinary } = require("cloudinary");
const { Readable } = require("stream");
require("dotenv").config();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Convert buffer to readable stream
const bufferToStream = (buffer) => {
  const readable = new Readable();
  readable._read = () => { };
  readable.push(buffer);
  readable.push(null);
  return readable;
};

// Upload Video Function
const uploadVideo = (videoBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "video"  // Set resource type to video
      },
      (error, result) => {
        if (error) reject(new Error("Cloudinary video upload failed"));
        else resolve(result.secure_url);
      }
    );
    bufferToStream(videoBuffer).pipe(uploadStream);
  });
};

module.exports = uploadVideo;
