const express = require("express");
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  checkAvailability
} = require("../controllers/bookingController");
const auth = require("../middleware/auth");

// All booking routes require authentication
router.use(auth);

// Create a new booking
router.post("/", createBooking);

// Get all bookings
router.get("/", getAllBookings);

// Check property availability (must be placed before /:id route to avoid conflict)
router.get("/check-availability", checkAvailability);

// Get booking by ID
router.get("/:id", getBookingById);

// Update booking by ID
router.put("/:id", updateBooking);

module.exports = router;

