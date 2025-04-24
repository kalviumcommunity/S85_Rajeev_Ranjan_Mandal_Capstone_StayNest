const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const User = require('../models/User');

// Create a new review
const createReview = async (req, res) => {
    try {
        const {
            bookingId,
            rating,
            comment,
            categories
        } = req.body;

        // Validate booking exists
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if review already exists for this booking
        const existingReview = await Review.findOne({ booking: bookingId });
        if (existingReview) {
            return res.status(400).json({ message: 'Review already exists for this booking' });
        }

        // Create new review
        const review = new Review({
            booking: bookingId,
            property: booking.property,
            guest: booking.guest,
            host: booking.host,
            rating,
            comment,
            categories
        });

        await review.save();

        // Update booking to mark it as reviewed
        await Booking.findByIdAndUpdate(bookingId, { isReviewed: true });

        res.status(201).json({
            message: 'Review created successfully',
            review
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating review',
            error: error.message
        });
    }
};

module.exports = {
    createReview
}; 