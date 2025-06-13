const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const {
  getDashboardStats,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllProperties,
  deleteProperty,
  getAllBookings,
  approveProperty,
  updateProperty,
  updateBookingStatus,
  processRefund,
  getAllReviews,
  moderateReview,
  getFinancialStats,
} = require("../controllers/adminController");

// Apply authentication and admin authorization to all routes
router.use(auth);
router.use(adminAuth);

// Dashboard routes
router.get("/dashboard/stats", getDashboardStats);
router.get("/financial/stats", getFinancialStats);

// User management routes
router.get("/users", getAllUsers);
router.put("/users/:userId", updateUser);
router.delete("/users/:userId", deleteUser);

// Property management routes
router.get("/properties", getAllProperties);
router.put("/properties/:propertyId/approve", approveProperty);
router.put("/properties/:propertyId", updateProperty);
router.delete("/properties/:propertyId", deleteProperty);

// Booking management routes
router.get("/bookings", getAllBookings);
router.put("/bookings/:bookingId/status", updateBookingStatus);
router.post("/bookings/:bookingId/refund", processRefund);

// Review management routes
router.get("/reviews", getAllReviews);
router.put("/reviews/:reviewId/moderate", moderateReview);

module.exports = router;
