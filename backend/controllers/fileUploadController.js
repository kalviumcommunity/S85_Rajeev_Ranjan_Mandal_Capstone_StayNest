const cloudinary = require("../config/cloudinaryConfig");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Configure multer with enhanced settings for automatic optimization
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // Increased to 20MB to handle large uploads before optimization
    files: 1, // Only one file at a time
  },
  fileFilter: (req, file, cb) => {
    console.log("Processing file:", file); // Debug log
    const allowedFileTypes = /jpeg|jpg|png|gif|webp|bmp|tiff/; // Added more formats
    const extname = allowedFileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedFileTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      console.log("Invalid file type:", {
        originalname: file.originalname,
        mimetype: file.mimetype,
      });
      cb(
        new Error(
          "Only image files are allowed! Supported formats: JPEG, PNG, GIF, WebP, BMP, TIFF"
        )
      );
    }
  },
});

// Create the upload middleware
exports.uploadSingleImage = upload.single("image");

const uploadToCloudinary = async (file) => {
  try {
    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    console.log("Attempting to upload file:", file.path);

    const result = await cloudinary.uploader.upload(file.path, {
      folder: "staynest/property_images",
      use_filename: true,
    });

    // Optional: Remove local file after successful upload
    fs.unlinkSync(file.path);

    console.log("Cloudinary upload successful:", result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    // Log additional file details for debugging
    console.error("File details:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
    });

    throw error;
  }
};

exports.handleImageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const cloudinaryUrl = await uploadToCloudinary(req.file);

    res.status(200).json({
      message: "Image uploaded successfully",
      imageUrl: cloudinaryUrl,
    });
  } catch (error) {
    res.status(500).json({
      message: "Image upload failed",
      error: error.message,
    });
  }
};

// Profile picture upload handler
exports.handleProfilePictureUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Upload to cloudinary with profile picture specific folder and optimization
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "staynest/profile_pictures",
      use_filename: true,
      unique_filename: true,
      transformation: [
        {
          width: 300,
          height: 300,
          crop: "fill",
          gravity: "auto:face", // Smart face detection
          quality: "auto:good",
          fetch_format: "auto",
          flags: "progressive",
        },
      ],
      resource_type: "image",
      format: "auto",
      overwrite: true,
    });

    // Remove local file after successful upload
    const fs = require("fs");
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error("Profile picture upload error:", error);
    res.status(500).json({
      success: false,
      message: "Profile picture upload failed",
      error: error.message,
    });
  }
};

// Property image upload handler with automatic optimization
exports.handlePropertyImageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Upload to cloudinary with comprehensive image optimization
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "staynest/property_images",
      use_filename: true,
      unique_filename: true,
      transformation: [
        {
          width: 1200,
          height: 800,
          crop: "fill",
          gravity: "auto",
          quality: "auto:good",
          fetch_format: "auto",
        },
      ],
      resource_type: "image",
      format: "auto",
    });

    // Remove local file after successful upload
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      message: "Property image uploaded successfully",
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Property image upload error:", error);
    res.status(500).json({
      success: false,
      message: "Property image upload failed",
      error: error.message,
    });
  }
};
