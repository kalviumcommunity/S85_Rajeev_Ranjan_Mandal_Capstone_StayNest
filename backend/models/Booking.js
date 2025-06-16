const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          // Check if date is in the future
          return value >= new Date();
        },
        message: "Check-in date must be in the future",
      },
    },
    checkOut: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          // Check if date is in the future and after check-in
          return value >= new Date() && value > this.checkIn;
        },
        message: "Check-out date must be in the future and after check-in date",
      },
    },
    guests: {
      adults: { type: Number, required: true, min: 1 },
      children: { type: Number, default: 0, min: 0 },
      infants: { type: Number, default: 0, min: 0 },
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    priceBreakdown: {
      basePrice: Number,
      cleaningFee: Number,
      serviceFee: Number,
      taxes: Number,
      discounts: Number,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "expired"],
      default: "pending",
    },
    payment: {
      status: {
        type: String,
        enum: [
          "pending",
          "completed",
          "failed",
          "refunded",
          "partially_refunded",
        ],
        default: "pending",
      },
      amount: Number,
      currency: { type: String, default: "INR" },
      paymentMethod: String,
      transactionId: String,
      paymentDate: Date,
      refundDate: Date,
      refundAmount: Number,
    },
    cancellationReason: String,
    cancellationDate: Date,
    cancellationPolicy: {
      type: String,
      enum: ["flexible", "moderate", "strict"],
      required: true,
    },
    specialRequests: String,
    checkInInstructions: String,
    checkOutInstructions: String,
    houseRules: [String],
    additionalServices: [
      {
        service: String,
        price: Number,
        quantity: Number,
      },
    ],
    communication: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        message: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
    // Admin fields
    adminNotes: {
      type: String,
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastModifiedAt: {
      type: Date,
    },
    refund: {
      amount: Number,
      reason: String,
      processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      processedAt: Date,
      status: {
        type: String,
        enum: ["pending", "processed", "failed"],
        default: "pending",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Validate minimum stay duration (at least 1 day)
bookingSchema.pre("save", function (next) {
  const checkInDate = new Date(this.checkIn);
  const checkOutDate = new Date(this.checkOut);

  // Calculate difference in milliseconds and convert to days
  const diffTime = Math.abs(checkOutDate - checkInDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 1) {
    return next(new Error("Booking must be for at least 1 day"));
  }
  next();
});

// Validate check-out date is after check-in date
bookingSchema.pre("save", function (next) {
  if (this.checkOut <= this.checkIn) {
    next(new Error("Check-out date must be after check-in date"));
  }
  next();
});

// Calculate total price before saving
bookingSchema.pre("save", function (next) {
  if (
    this.isModified("priceBreakdown") ||
    this.isModified("additionalServices")
  ) {
    let total = 0;
    if (this.priceBreakdown.basePrice) total += this.priceBreakdown.basePrice;
    if (this.priceBreakdown.cleaningFee)
      total += this.priceBreakdown.cleaningFee;
    if (this.priceBreakdown.serviceFee) total += this.priceBreakdown.serviceFee;
    if (this.priceBreakdown.taxes) total += this.priceBreakdown.taxes;
    if (this.additionalServices?.length > 0) {
      this.additionalServices.forEach((service) => {
        total += service.price * service.quantity;
      });
    }
    if (this.priceBreakdown.discounts) total -= this.priceBreakdown.discounts;
    this.totalPrice = total;
  }
  next();
});

// Add index for checking booking overlaps
bookingSchema.index({ property: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ guest: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ status: 1 });

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
