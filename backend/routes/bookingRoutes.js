const express = require('express');
const router = express.Router();
const { createBooking, getAllBookings, getBookingById } = require('../controllers/bookingController');

// Create a new booking
router.post('/', createBooking);

// Get all bookings
router.get('/', getAllBookings);

// Get booking by ID
router.get('/:id', getBookingById);

module.exports = router; 