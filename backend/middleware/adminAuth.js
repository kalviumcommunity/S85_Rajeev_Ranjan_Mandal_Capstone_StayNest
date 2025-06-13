const User = require('../models/User');

// Middleware to check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    // Check if user is authenticated (auth middleware should run first)
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get user details from database
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required. You do not have permission to access this resource.'
      });
    }

    // Add user details to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authorization'
    });
  }
};

module.exports = adminAuth;
