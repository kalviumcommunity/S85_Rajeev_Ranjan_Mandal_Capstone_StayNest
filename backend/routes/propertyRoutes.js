const express = require('express');
const router = express.Router();
const { createProperty, getAllProperties, getPropertyById, updateProperty } = require('../controllers/propertyController');

// Create a new property
router.post('/', createProperty);

// Get all properties
router.get('/', getAllProperties);

// Get property by ID
router.get('/:id', getPropertyById);

// Update property by ID
router.put('/:id', updateProperty);

module.exports = router; 