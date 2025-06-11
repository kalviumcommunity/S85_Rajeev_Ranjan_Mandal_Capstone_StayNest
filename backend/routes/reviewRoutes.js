const express = require("express");
const router = express.Router();
const {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
} = require("../controllers/reviewController");
const auth = require("../middleware/auth");

// Public routes (anyone can view reviews)
router.get("/", getAllReviews);
router.get("/:id", getReviewById);

// Protected routes (require authentication)
router.use(auth);

// Create a new review
router.post("/", createReview);

// Update review by ID
router.put("/:id", updateReview);

module.exports = router;
