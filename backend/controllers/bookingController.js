const Booking = require("../models/Booking");
const Property = require("../models/Property");
const User = require("../models/User");

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const {
      propertyId,
      hostId,
      checkIn,
      checkOut,
      guests,
      totalPrice,
      priceBreakdown,
      cancellationPolicy,
      specialRequests,
      additionalServices,
      status,
      payment,
    } = req.body;

    const guestId = req.user.id; // Get guest ID from JWT token

    // Validate property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Validate guest exists (authenticated user)
    const guest = await User.findById(guestId);
    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    // Validate host exists
    const host = await User.findById(hostId);
    if (!host) {
      return res.status(404).json({ message: "Host not found" });
    }

    // Create new booking
    const booking = new Booking({
      property: propertyId,
      guest: guestId,
      host: hostId,
      checkIn,
      checkOut,
      guests,
      totalPrice,
      priceBreakdown,
      cancellationPolicy,
      specialRequests,
      additionalServices,
      status: status || "pending",
      payment: payment || {
        status: "pending",
        amount: totalPrice,
        paymentMethod: "pay_on_arrival",
      },
    });

    await booking.save();

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating booking",
      error: error.message,
    });
  }
};
// Update booking by ID (only if user is guest or host)
const updateBooking = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from JWT token

    // Atomic operation: find and update in one operation to prevent race conditions
    const updatedBooking = await Booking.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [{ guest: userId }, { host: userId }],
      },
      req.body,
      {
        new: true,
        runValidators: true,
        // Ensure the document exists and matches our conditions
        upsert: false,
      }
    )
      .populate("property")
      .populate("guest", "name email profilePicture")
      .populate("host", "name email profilePicture");

    if (!updatedBooking) {
      // Check if booking exists at all to provide better error message
      const bookingExists = await Booking.findById(req.params.id);
      if (!bookingExists) {
        return res.status(404).json({ message: "Booking not found" });
      } else {
        return res.status(403).json({
          message: "Access denied. You can only update your own bookings",
        });
      }
    }

    res.status(200).json({
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating booking",
      error: error.message,
    });
  }
};

// Get all bookings for the authenticated user
const getAllBookings = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from JWT token

    // Find bookings where user is either guest or host
    const bookings = await Booking.find({
      $or: [{ guest: userId }, { host: userId }],
    })
      .populate("property")
      .populate("guest", "name email profilePicture")
      .populate("host", "name email profilePicture");

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching bookings",
      error: error.message,
    });
  }
};

// Get booking by ID (only if user is guest or host)
const getBookingById = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from JWT token

    const booking = await Booking.findOne({
      _id: req.params.id,
      $or: [{ guest: userId }, { host: userId }],
    })
      .populate("property")
      .populate("guest", "name email profilePicture")
      .populate("host", "name email profilePicture");

    if (!booking) {
      return res
        .status(404)
        .json({ message: "Booking not found or access denied" });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching booking",
      error: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
};
