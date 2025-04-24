const express = require('express');
const router = express.Router();
const { createProperty } = require('../controllers/propertyController');

// Create a new property
router.post('/', createProperty);

module.exports = router; 