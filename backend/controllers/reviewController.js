const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Property = require("../models/Property");
const User = require("../models/User");

// Create a new review
const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment, categories } = req.body;

    // Validate booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
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
      guest: booking.guest,
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

// Update review by ID
const updateReview = async (req, res) => {
  try {
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("property guest host booking");

    if (!updatedReview) {
      return res.status(404).json({ message: "Review not found" });
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
