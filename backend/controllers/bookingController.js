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

    // Validate dates are valid
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid check-in or check-out date format",
      });
    }

    // Validate check-in date is in the future
    const now = new Date();
    if (checkInDate < now) {
      return res.status(400).json({
        success: false,
        message: "Check-in date must be in the future",
      });
    }

    // Validate check-out is after check-in
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: "Check-out date must be after check-in date",
      });
    }

    // Validate minimum stay duration
    const diffTime = Math.abs(checkOutDate - checkInDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 1) {
      return res.status(400).json({
        success: false,
        message: "Booking must be for at least 1 day",
      });
    }

    // Validate property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Validate guest exists (authenticated user)
    const guest = await User.findById(guestId);
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Guest not found",
      });
    }

    // Validate host exists
    const host = await User.findById(hostId);
    if (!host) {
      return res.status(404).json({
        success: false,
        message: "Host not found",
      });
    }

    // Check if property is available (not marked as unavailable)
    if (!property.availability) {
      return res.status(400).json({
        success: false,
        message: "Property is not available for booking",
      });
    }

    // Check if property has sufficient capacity
    if (property.maxGuests < guests.adults + guests.children) {
      return res.status(400).json({
        success: false,
        message: `Property can only accommodate ${property.maxGuests} guests`,
      });
    }

    // Check if the guest already has a booking for the same property on the same dates
    const existingGuestBooking = await Booking.findOne({
      guest: guestId,
      property: propertyId,
      status: { $nin: ["cancelled", "expired"] },
      $or: [
        // Check if existing booking overlaps with new booking
        {
          checkIn: { $lte: checkOutDate },
          checkOut: { $gte: checkInDate },
        },
      ],
    });

    if (existingGuestBooking) {
      return res.status(400).json({
        success: false,
        message:
          "You already have a booking for this property during these dates",
      });
    }

    // Check if the property is already booked for the requested dates
    const existingBooking = await Booking.findOne({
      property: propertyId,
      status: { $nin: ["cancelled", "expired"] },
      $or: [
        // Check if any existing booking overlaps with new booking
        {
          checkIn: { $lte: checkOutDate },
          checkOut: { $gte: checkInDate },
        },
      ],
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "Property is already booked for the selected dates",
      });
    }

    // Create new booking
    const booking = new Booking({
      property: propertyId,
      guest: guestId,
      host: hostId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
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
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Error creating booking",
      error: error.message,
    });
  }
};

// Update booking by ID (only if user is guest or host)
const updateBooking = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from JWT token

    // Extract update data
    const { checkIn, checkOut, guests, status } = req.body;

    // Get the booking first to check if it exists and user has permission
    const booking = await Booking.findOne({
      _id: req.params.id,
      $or: [{ guest: userId }, { host: userId }],
    });

    if (!booking) {
      // Check if booking exists at all to provide better error message
      const bookingExists = await Booking.findById(req.params.id);
      if (!bookingExists) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      } else {
        return res.status(403).json({
          success: false,
          message: "Access denied. You can only update your own bookings",
        });
      }
    }

    // If dates are being updated, validate them
    if (checkIn || checkOut) {
      const newCheckIn = checkIn ? new Date(checkIn) : booking.checkIn;
      const newCheckOut = checkOut ? new Date(checkOut) : booking.checkOut;

      // Validate date format
      if (isNaN(newCheckIn.getTime()) || isNaN(newCheckOut.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid check-in or check-out date format",
        });
      }

      // Only validate future dates for new bookings or status changes
      if (booking.status === "pending") {
        // Validate check-in is in future
        const now = new Date();
        if (newCheckIn < now) {
          return res.status(400).json({
            success: false,
            message: "Check-in date must be in the future",
          });
        }
      }

      // Validate check-out is after check-in
      if (newCheckOut <= newCheckIn) {
        return res.status(400).json({
          success: false,
          message: "Check-out date must be after check-in date",
        });
      }

      // Check for booking overlaps only if dates are changing
      if (checkIn || checkOut) {
        // Check if there's any other booking for the same property during the updated dates
        const existingBooking = await Booking.findOne({
          _id: { $ne: req.params.id }, // Exclude current booking
          property: booking.property,
          status: { $nin: ["cancelled", "expired"] },
          $or: [
            // Check if any existing booking overlaps with updated booking
            {
              checkIn: { $lte: newCheckOut },
              checkOut: { $gte: newCheckIn },
            },
          ],
        });

        if (existingBooking) {
          return res.status(400).json({
            success: false,
            message: "Property is already booked for the selected dates",
          });
        }
      }
    }

    // If the guest count is being updated, validate it
    if (guests) {
      // Get property to check max guest capacity
      const property = await Property.findById(booking.property);

      if (
        property &&
        property.maxGuests < guests.adults + (guests.children || 0)
      ) {
        return res.status(400).json({
          success: false,
          message: `Property can only accommodate ${property.maxGuests} guests`,
        });
      }
    }

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

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({
      success: false,
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
      .populate("host", "name email profilePicture")
      .sort({ createdAt: -1 }); // Sort by creation date, newest first

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
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
      return res.status(404).json({
        success: false,
        message: "Booking not found or access denied",
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching booking",
      error: error.message,
    });
  }
};

// Check property availability for given dates
const checkAvailability = async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut } = req.query;

    if (!propertyId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: "Property ID, check-in, and check-out dates are required",
      });
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Check if property is marked as available
    if (!property.availability) {
      return res.status(200).json({
        success: true,
        available: false,
        message: "Property is not available for booking",
      });
    }

    // Check for overlapping bookings
    const existingBooking = await Booking.findOne({
      property: propertyId,
      status: { $nin: ["cancelled", "expired"] },
      $or: [
        // Check if any existing booking overlaps with requested dates
        {
          checkIn: { $lte: checkOutDate },
          checkOut: { $gte: checkInDate },
        },
      ],
    });

    res.status(200).json({
      success: true,
      available: !existingBooking,
      message: existingBooking
        ? "Property is not available for the selected dates"
        : "Property is available for the selected dates",
    });
  } catch (error) {
    console.error("Error checking availability:", error);
    res.status(500).json({
      success: false,
      message: "Error checking property availability",
      error: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  checkAvailability,
};
