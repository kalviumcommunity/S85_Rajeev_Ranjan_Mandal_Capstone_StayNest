const User = require("../models/User");
const Property = require("../models/Property");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const logger = require("../utils/logger");
const mongoose = require("mongoose");

// Get admin dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProperties,
      totalBookings,
      totalReviews,
      recentUsers,
      recentProperties,
      recentBookings,
    ] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      Booking.countDocuments(),
      Review.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select("-password"),
      Property.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("host", "name email"),
      Booking.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("guest", "name email")
        .populate("property", "title"),
    ]);

    // Calculate user role distribution
    const userRoles = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    // Calculate booking status distribution
    const bookingStatuses = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Calculate monthly revenue (if you have payment data)
    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          status: "confirmed",
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalProperties,
          totalBookings,
          totalReviews,
        },
        userRoles,
        bookingStatuses,
        monthlyRevenue,
        recent: {
          users: recentUsers,
          properties: recentProperties,
          bookings: recentBookings,
        },
      },
    });

    logger.info(`Admin dashboard stats accessed by user ${req.user.id}`);
  } catch (error) {
    logger.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics",
    });
  }
};

// Get all users with pagination and filtering
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const role = req.query.role;
    const search = req.query.search;

    // Build filter object
    const filter = {};
    if (role && role !== "all") {
      filter.role = role;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });

    logger.info(
      `Admin accessed user list - page ${page}, filter: ${JSON.stringify(
        filter
      )}`
    );
  } catch (error) {
    logger.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
    });
  }
};

// Update user role or status
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, isVerified, isActive } = req.body;

    // Prevent admin from changing their own role
    if (userId === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot modify your own account",
      });
    }

    const updateData = {};
    if (role) updateData.role = role;
    if (typeof isVerified === "boolean") updateData.isVerified = isVerified;
    if (typeof isActive === "boolean") updateData.isActive = isActive;

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      data: user,
    });

    logger.info(
      `Admin ${req.user.id} updated user ${userId}: ${JSON.stringify(
        updateData
      )}`
    );
  } catch (error) {
    logger.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user",
    });
  }
};

// Delete user account
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting their own account
    if (userId === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete user's properties and bookings
    await Promise.all([
      Property.deleteMany({ host: userId }),
      Booking.deleteMany({ $or: [{ guest: userId }, { host: userId }] }),
      Review.deleteMany({ $or: [{ guest: userId }, { host: userId }] }),
    ]);

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: "User and associated data deleted successfully",
    });

    logger.info(
      `Admin ${req.user.id} deleted user ${userId} and associated data`
    );
  } catch (error) {
    logger.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting user",
    });
  }
};

// Get all properties with admin details
const getAllProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const search = req.query.search;

    const filter = {};
    if (status && status !== "all") {
      filter.availability = status === "available";
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { "location.city": { $regex: search, $options: "i" } },
      ];
    }

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .populate("host", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Property.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        properties,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalProperties: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    logger.error("Error fetching properties:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching properties",
    });
  }
};

// Delete property
const deleteProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Delete associated bookings and reviews
    await Promise.all([
      Booking.deleteMany({ property: propertyId }),
      Review.deleteMany({ property: propertyId }),
    ]);

    await Property.findByIdAndDelete(propertyId);

    res.json({
      success: true,
      message: "Property and associated data deleted successfully",
    });

    logger.info(`Admin ${req.user.id} deleted property ${propertyId}`);
  } catch (error) {
    logger.error("Error deleting property:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting property",
    });
  }
};

// Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate("guest", "name email")
        .populate("property", "title location.city")
        .populate("host", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalBookings: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    logger.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
    });
  }
};

// Property Management Functions
const approveProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { approved, rejectionReason } = req.body;

    const property = await Property.findByIdAndUpdate(
      propertyId,
      {
        isApproved: approved,
        rejectionReason: approved ? null : rejectionReason,
        approvedBy: approved ? req.user.id : null,
        approvedAt: approved ? new Date() : null,
      },
      { new: true }
    ).populate("host", "name email");

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.json({
      success: true,
      message: approved
        ? "Property approved successfully"
        : "Property rejected",
      data: property,
    });

    logger.info(
      `Admin ${req.user.id} ${
        approved ? "approved" : "rejected"
      } property ${propertyId}`
    );
  } catch (error) {
    logger.error("Error approving/rejecting property:", error);
    res.status(500).json({
      success: false,
      message: "Error processing property approval",
    });
  }
};

const updateProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const updateData = req.body;

    const property = await Property.findByIdAndUpdate(
      propertyId,
      { ...updateData, lastModifiedBy: req.user.id },
      { new: true, runValidators: true }
    ).populate("host", "name email");

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.json({
      success: true,
      message: "Property updated successfully",
      data: property,
    });

    logger.info(`Admin ${req.user.id} updated property ${propertyId}`);
  } catch (error) {
    logger.error("Error updating property:", error);
    res.status(500).json({
      success: false,
      message: "Error updating property",
    });
  }
};

// Booking Management Functions
const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, adminNotes } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        status,
        adminNotes,
        lastModifiedBy: req.user.id,
        lastModifiedAt: new Date(),
      },
      { new: true }
    )
      .populate("guest", "name email")
      .populate("property", "title")
      .populate("host", "name email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      message: "Booking status updated successfully",
      data: booking,
    });

    logger.info(
      `Admin ${req.user.id} updated booking ${bookingId} status to ${status}`
    );
  } catch (error) {
    logger.error("Error updating booking status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating booking status",
    });
  }
};

const processRefund = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { refundAmount, refundReason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Update booking with refund information
    booking.refund = {
      amount: refundAmount,
      reason: refundReason,
      processedBy: req.user.id,
      processedAt: new Date(),
      status: "processed",
    };
    booking.status = "refunded";

    await booking.save();

    res.json({
      success: true,
      message: "Refund processed successfully",
      data: booking,
    });

    logger.info(
      `Admin ${req.user.id} processed refund of $${refundAmount} for booking ${bookingId}`
    );
  } catch (error) {
    logger.error("Error processing refund:", error);
    res.status(500).json({
      success: false,
      message: "Error processing refund",
    });
  }
};

// Review Management Functions
const getAllReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const flagged = req.query.flagged;

    const filter = {};
    if (flagged === "true") {
      filter.isFlagged = true;
    }

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("guest", "name email")
        .populate("property", "title")
        .populate("host", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalReviews: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    logger.error("Error fetching reviews:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching reviews",
    });
  }
};

const moderateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { action, reason } = req.body; // action: 'approve', 'flag', 'delete'

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (action === "delete") {
      await Review.findByIdAndDelete(reviewId);
      logger.info(`Admin ${req.user.id} deleted review ${reviewId}`);

      return res.json({
        success: true,
        message: "Review deleted successfully",
      });
    }

    // Update review moderation status
    review.isFlagged = action === "flag";
    review.moderationReason = reason;
    review.moderatedBy = req.user.id;
    review.moderatedAt = new Date();

    await review.save();

    res.json({
      success: true,
      message: `Review ${action}ed successfully`,
      data: review,
    });

    logger.info(`Admin ${req.user.id} ${action}ed review ${reviewId}`);
  } catch (error) {
    logger.error("Error moderating review:", error);
    res.status(500).json({
      success: false,
      message: "Error moderating review",
    });
  }
};

// Financial Management Functions
const getFinancialStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const [totalRevenue, totalBookings, refundStats, monthlyRevenue] =
      await Promise.all([
        Booking.aggregate([
          { $match: { status: "confirmed", ...dateFilter } },
          { $group: { _id: null, total: { $sum: "$totalPrice" } } },
        ]),
        Booking.countDocuments({ status: "confirmed", ...dateFilter }),
        Booking.aggregate([
          { $match: { status: "refunded", ...dateFilter } },
          { $group: { _id: null, total: { $sum: "$refund.amount" } } },
        ]),
        Booking.aggregate([
          { $match: { status: "confirmed", ...dateFilter } },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
              },
              revenue: { $sum: "$totalPrice" },
              bookings: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]),
      ]);

    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue[0]?.total || 0,
        totalBookings,
        totalRefunds: refundStats[0]?.total || 0,
        monthlyRevenue,
      },
    });
  } catch (error) {
    logger.error("Error fetching financial stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching financial statistics",
    });
  }
};

module.exports = {
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
};
