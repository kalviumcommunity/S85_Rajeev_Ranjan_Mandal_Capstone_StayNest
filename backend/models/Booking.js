const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    guest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },
    guests: {
        adults: { type: Number, required: true, min: 1 },
        children: { type: Number, default: 0, min: 0 },
        infants: { type: Number, default: 0, min: 0 }
    },
    totalPrice: {
        type: Number,
        required: true
    },
    priceBreakdown: {
        basePrice: Number,
        cleaningFee: Number,
        serviceFee: Number,
        taxes: Number,
        discounts: Number
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed', 'expired'],
        default: 'pending'
    },
    payment: {
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded'],
            default: 'pending'
        },
        amount: Number,
        currency: { type: String, default: 'USD' },
        paymentMethod: String,
        transactionId: String,
        paymentDate: Date,
        refundDate: Date,
        refundAmount: Number
    },
    cancellationReason: String,
    cancellationDate: Date,
    cancellationPolicy: {
        type: String,
        enum: ['flexible', 'moderate', 'strict'],
        required: true
    },
    specialRequests: String,
    checkInInstructions: String,
    checkOutInstructions: String,
    houseRules: [String],
    additionalServices: [{
        service: String,
        price: Number,
        quantity: Number
    }],
    communication: [{
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: String,
        timestamp: { type: Date, default: Date.now }
    }],
    review: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    },
    isReviewed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Validate check-out date is after check-in date
bookingSchema.pre('save', function(next) {
    if (this.checkOut <= this.checkIn) {
        next(new Error('Check-out date must be after check-in date'));
    }
    next();
});

// Calculate total price before saving
bookingSchema.pre('save', function(next) {
    if (this.isModified('priceBreakdown') || this.isModified('additionalServices')) {
        let total = 0;
        if (this.priceBreakdown.basePrice) total += this.priceBreakdown.basePrice;
        if (this.priceBreakdown.cleaningFee) total += this.priceBreakdown.cleaningFee;
        if (this.priceBreakdown.serviceFee) total += this.priceBreakdown.serviceFee;
        if (this.priceBreakdown.taxes) total += this.priceBreakdown.taxes;
        if (this.additionalServices?.length > 0) {
            this.additionalServices.forEach(service => {
                total += (service.price * service.quantity);
            });
        }
        if (this.priceBreakdown.discounts) total -= this.priceBreakdown.discounts;
        this.totalPrice = total;
    }
    next();
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking; 