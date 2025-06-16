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
      // Comprehensive transformation for automatic optimization
      transformation: [
        // First transformation: Resize and crop intelligently
        {
          width: 1200,
          height: 800,
          crop: "fill",
          gravity: "auto", // Automatically detect best crop area
          quality: "auto:good", // Automatic quality optimization
          fetch_format: "auto", // Automatically choose best format (WebP, AVIF, etc.)
        },
        // Second transformation: Further optimize file size
        {
          flags: "progressive", // Progressive JPEG loading
          quality: "auto:eco", // Eco-friendly compression for smaller files
        },
      ],
      // Additional optimization settings
      resource_type: "image",
      format: "auto", // Let Cloudinary choose the best format
      // Limit file size after processing (max 500KB)
      bytes: 500000,
      // Enable automatic backup in case of processing issues
      backup: false,
      // Overwrite if same filename exists
      overwrite: true,
      // Additional metadata
      context: {
        purpose: "property_listing",
        auto_optimized: "true",
      },
    });

    // Remove local file after successful upload
    const fs = require("fs");
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      message: "Property image uploaded and optimized successfully",
      imageUrl: result.secure_url,
      publicId: result.public_id,
      // Include optimization info for debugging
      optimizationInfo: {
        originalSize: req.file.size,
        optimizedFormat: result.format,
        finalWidth: result.width,
        finalHeight: result.height,
        bytes: result.bytes,
      },
    });
  } catch (error) {
    console.error("Property image upload error:", error);

    // If Cloudinary processing fails, try with basic settings
    if (error.message && error.message.includes("bytes")) {
      try {
        // Fallback with more aggressive compression
        const fallbackResult = await cloudinary.uploader.upload(req.file.path, {
          folder: "staynest/property_images",
          transformation: [
            {
              width: 800,
              height: 600,
              crop: "fill",
              quality: "auto:low",
              fetch_format: "auto",
            },
          ],
          resource_type: "image",
        });

        // Remove local file
        const fs = require("fs");
        fs.unlinkSync(req.file.path);

        return res.status(200).json({
          success: true,
          message: "Property image uploaded with fallback optimization",
          imageUrl: fallbackResult.secure_url,
          publicId: fallbackResult.public_id,
          note: "Image was heavily compressed due to size constraints",
        });
      } catch (fallbackError) {
        console.error("Fallback upload also failed:", fallbackError);
      }
    }

    res.status(500).json({
      success: false,
      message: "Property image upload failed",
      error: error.message,
    });
  }
};
