const { body, param, query, validationResult } = require("express-validator");
const mongoose = require("mongoose");

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  next();
};

// Custom validator for MongoDB ObjectId
const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

// User validation rules
const validateUserRegistration = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  body("password")
    .isLength({ min: 6, max: 128 })
    .withMessage("Password must be between 6 and 128 characters"),

  body("role")
    .optional()
    .isIn(["guest", "host"])
    .withMessage("Role must be either guest or host"),

  handleValidationErrors,
];

const validateUserLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  body("password").notEmpty().withMessage("Password is required"),

  handleValidationErrors,
];

// Property validation rules
const validatePropertyCreation = [
  body("title")
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Title must be between 5 and 100 characters"),

  body("description")
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage("Description must be between 20 and 2000 characters"),

  body("location.address")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Address must be between 5 and 200 characters"),

  body("location.city")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("City must be between 2 and 50 characters"),

  body("location.state")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("State must be between 2 and 50 characters"),

  body("location.country")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Country must be between 2 and 50 characters"),

  body("price")
    .isFloat({ min: 1, max: 100000 })
    .withMessage("Price must be between 1 rs. and 100000 rs."),

  body("propertyType")
    .isIn(["apartment", "house", "villa", "cottage", "other"])
    .withMessage("Invalid property type"),

  body("bedrooms")
    .isInt({ min: 0, max: 20 })
    .withMessage("Bedrooms must be between 0 and 20"),

  body("bathrooms")
    .isFloat({ min: 0, max: 20 })
    .withMessage("Bathrooms must be between 0 and 20"),

  body("maxGuests")
    .isInt({ min: 1, max: 50 })
    .withMessage("Max guests must be between 1 and 50"),

  body("images")
    .isArray({ min: 1 })
    .withMessage("At least one image is required")
    .custom((images) => {
      return images.every(img => 
        img.hasOwnProperty('url') && 
        img.hasOwnProperty('public_id') && 
        typeof img.url === 'string' && 
        typeof img.public_id === 'string'
      );
    })
    .withMessage("Each image must have valid url and public_id properties"),

  body("amenities")
    .isArray({ min: 1 })
    .withMessage("At least one amenity is required")
    .custom((amenities) => {
      return amenities.every(amenity => typeof amenity === 'string');
    })
    .withMessage("Each amenity must be a string"),

  body("rules")
    .optional()
    .isArray()
    .custom((rules) => {
      return rules.every(rule => typeof rule === 'string');
    })
    .withMessage("Each rule must be a string"),

  body("cancellationPolicy")
    .optional()
    .isIn(['flexible', 'moderate', 'strict'])
    .withMessage("Invalid cancellation policy"),

  body("availability")
    .optional()
    .isBoolean()
    .withMessage("Availability must be a boolean value"),

  handleValidationErrors,
];

// Query validation
const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  handleValidationErrors,
];

// Parameter validation
const validateObjectId = (paramName) => [
  param(paramName)
    .custom(isValidObjectId)
    .withMessage(`Invalid ${paramName} ID format`),

  handleValidationErrors,
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validatePropertyCreation,
  validatePagination,
  validateObjectId,
  handleValidationErrors,
};
