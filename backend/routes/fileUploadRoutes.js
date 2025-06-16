const express = require("express");
const router = express.Router();
const {
  uploadSingleImage,
  handleImageUpload,
  handlePropertyImageUpload,
} = require("../controllers/fileUploadController");
const auth = require("../middleware/auth");

// All file upload routes require authentication
router.use(auth);

// POST route for general file upload
router.post("/upload", uploadSingleImage, handleImageUpload);

// POST route for property image upload
router.post("/property-image", uploadSingleImage, handlePropertyImageUpload);

module.exports = router;
