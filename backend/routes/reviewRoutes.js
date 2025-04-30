const express = require('express');
const router = express.Router();
const { createReview, getAllReviews, getReviewById } = require('../controllers/reviewController');

// Create a new review
router.post('/', createReview);

// Get all reviews
router.get('/', getAllReviews);

// Get review by ID
router.get('/:id', getReviewById);

module.exports = router; 