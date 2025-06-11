const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishListController");
const auth = require("../middleware/auth");

// All wishlist routes require authentication
router.use(auth);

// Routes - userId is now extracted from JWT token via auth middleware
router.post("/wishlist", wishlistController.addToWishlist); // Add to wishlist
router.delete("/wishlist/:propertyId", wishlistController.removeFromWishlist); // Remove from wishlist
router.get("/wishlist", wishlistController.getWishlist); // Get wishlist

module.exports = router;
