const express = require('express');
const router = express.Router();
const { 
  submitSupportQuery, 
  requestPhoneSupport, 
  getSupportStats 
} = require('../controllers/supportController');

// Rate limiting middleware for support requests
const rateLimit = require('express-rate-limit');

const supportRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many support requests. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all support routes
router.use(supportRateLimit);

// @route   POST /api/support/query
// @desc    Submit a support query via email
// @access  Public
router.post('/query', submitSupportQuery);

// @route   POST /api/support/phone-request
// @desc    Request a phone callback from support
// @access  Public
router.post('/phone-request', requestPhoneSupport);

// @route   GET /api/support/stats
// @desc    Get support statistics (for admin use)
// @access  Public (should be protected in production)
router.get('/stats', getSupportStats);

module.exports = router;
