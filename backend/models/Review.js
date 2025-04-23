const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
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
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    categories: {
        cleanliness: { type: Number, min: 1, max: 5 },
        communication: { type: Number, min: 1, max: 5 },
        checkIn: { type: Number, min: 1, max: 5 },
        accuracy: { type: Number, min: 1, max: 5 },
        location: { type: Number, min: 1, max: 5 },
        value: { type: Number, min: 1, max: 5 }
    },
    hostResponse: {
        comment: String,
        date: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Ensure one review per booking
reviewSchema.index({ booking: 1 }, { unique: true });

// Update property and host average ratings when a review is created
reviewSchema.post('save', async function() {
    const Property = mongoose.model('Property');
    const User = mongoose.model('User');

    // Update property rating
    const propertyReviews = await this.constructor.find({ property: this.property });
    const propertyAvgRating = propertyReviews.reduce((acc, review) => acc + review.rating, 0) / propertyReviews.length;
    
    await Property.findByIdAndUpdate(this.property, {
        'rating.average': propertyAvgRating,
        'rating.count': propertyReviews.length
    });

    // Update host rating
    const hostReviews = await this.constructor.find({ host: this.host });
    const hostAvgRating = hostReviews.reduce((acc, review) => acc + review.rating, 0) / hostReviews.length;
    
    await User.findByIdAndUpdate(this.host, {
        'hostDetails.averageRating': hostAvgRating
    });
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review; 