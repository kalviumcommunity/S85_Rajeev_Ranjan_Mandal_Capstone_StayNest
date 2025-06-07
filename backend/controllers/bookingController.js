const Booking = require("../models/Booking");
const Property = require("../models/Property");
const User = require("../models/User");

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const {
      propertyId,
      guestId,
      hostId,
      checkIn,
      checkOut,
      guests,
      priceBreakdown,
      cancellationPolicy,
      specialRequests,
      additionalServices,
    } = req.body;

    // Validate property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Validate guest exists
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
      priceBreakdown,
      cancellationPolicy,
      specialRequests,
      additionalServices,
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
// Update booking by ID
const updateBooking = async (req, res) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("property")
      .populate("guest", "name email profilePicture")
      .populate("host", "name email profilePicture");

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
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

// Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
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

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("property")
      .populate("guest", "name email profilePicture")
      .populate("host", "name email profilePicture");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
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

