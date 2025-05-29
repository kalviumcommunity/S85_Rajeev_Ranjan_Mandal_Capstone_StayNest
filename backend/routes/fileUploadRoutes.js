const express = require('express');
const router = express.Router();
const { uploadSingleImage, handleImageUpload } = require('../controllers/fileUploadController');

// POST route for file upload
router.post('/upload', uploadSingleImage, handleImageUpload);

module.exports = router;
