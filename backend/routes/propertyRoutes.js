const express = require("express");
const router = express.Router();
const {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
} = require("../controllers/propertyController");
const auth = require("../middleware/auth");

// Public routes (anyone can view properties)
router.get("/", getAllProperties);
router.get("/:id", getPropertyById);

// Protected routes (require authentication)
router.use(auth);

// Create a new property
router.post("/", createProperty);

// Update property by ID
router.put("/:id", updateProperty);

module.exports = router;
