const express = require("express");
const router = express.Router();
const {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  getMyProperties,
  deleteProperty,
} = require("../controllers/propertyController");
const auth = require("../middleware/auth");
const {
  validatePropertyCreation,
  validateObjectId,
  validatePagination,
} = require("../middleware/validation");

// Specific routes must come before parameterized routes
// Protected routes (require authentication)
router.get("/my-properties", auth, getMyProperties);

// Public routes (anyone can view properties)
router.get("/", validatePagination, getAllProperties);
router.get("/:id", validateObjectId("id"), getPropertyById);

// Protected routes (require authentication)
router.use(auth);

// Create a new property
router.post("/", validatePropertyCreation, createProperty);

// Update property by ID
router.put("/:id", validateObjectId("id"), updateProperty);

// Delete property by ID
router.delete("/:id", validateObjectId("id"), deleteProperty);

module.exports = router;
