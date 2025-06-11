const Review = require("../models/Review");
const Booking = require("../models/Booking");
const User = require("../models/User");

// Create a new review
const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment, categories } = req.body;
    const userId = req.user.id; // Get user ID from JWT token

    // Validate booking exists and user is the guest
    const booking = await Booking.findOne({
      _id: bookingId,
      guest: userId, // Only the guest can create a review
    });

    if (!booking) {
      return res
        .status(404)
        .json({ message: "Booking not found or access denied" });
    }

    // Check if review already exists for this booking
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "Review already exists for this booking" });
    }

    // Create new review
    const review = new Review({
      booking: bookingId,
      property: booking.property,
      guest: userId, // Use authenticated user ID
      host: booking.host,
      rating,
      comment,
      categories,
    });

    await review.save();

    // Update booking to mark it as reviewed
    await Booking.findByIdAndUpdate(bookingId, { isReviewed: true });

    res.status(201).json({
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating review",
      error: error.message,
    });
  }
};

// Update review by ID (only by the review author or admin)
const updateReview = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from JWT token

    // Get user to check role
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build query conditions based on user role to prevent race conditions
    let queryConditions;
    if (user.role === "admin") {
      // Admin can update any review
      queryConditions = { _id: req.params.id };
    } else {
      // Regular users can only update their own reviews
      queryConditions = { _id: req.params.id, guest: userId };
    }

    // Atomic operation: find and update in one operation to prevent race conditions
    const updatedReview = await Review.findOneAndUpdate(
      queryConditions,
      req.body,
      {
        new: true,
        runValidators: true,
        // Ensure the document exists and matches our conditions
        upsert: false,
      }
    ).populate("property guest host booking");

    if (!updatedReview) {
      // Check if review exists at all to provide better error message
      const reviewExists = await Review.findById(req.params.id);
      if (!reviewExists) {
        return res.status(404).json({ message: "Review not found" });
      } else {
        return res.status(403).json({
          message:
            "Access denied. Only review author or admin can update this review",
        });
      }
    }

    res.status(200).json({
      message: "Review updated successfully",
      review: updatedReview,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating review",
      error: error.message,
    });
  }
};

// Get all reviews
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("property")
      .populate("guest", "name email profilePicture")
      .populate("host", "name email profilePicture")
      .populate("booking");
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching reviews",
      error: error.message,
    });
  }
};

// Get review by ID
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("property")
      .populate("guest", "name email profilePicture")
      .populate("host", "name email profilePicture")
      .populate("booking");
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching review",
      error: error.message,
    });
  }
};

module.exports = {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
};
