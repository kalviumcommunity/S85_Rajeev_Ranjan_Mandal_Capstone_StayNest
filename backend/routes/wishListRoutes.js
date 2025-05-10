const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishListController");

// Routes - Pass userId as a part of the request
router.post("/wishlist", wishlistController.addToWishlist); // Add to wishlist
router.delete("/wishlist/:propertyId", wishlistController.removeFromWishlist); // Remove from wishlist
router.get("/wishlist", wishlistController.getWishlist); // Get wishlist

module.exports = router;
