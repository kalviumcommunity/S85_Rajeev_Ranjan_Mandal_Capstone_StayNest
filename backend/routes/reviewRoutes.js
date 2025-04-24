const express = require('express');
const router = express.Router();
const { createReview } = require('../controllers/reviewController');

// Create a new review
router.post('/', createReview);

module.exports = router; 