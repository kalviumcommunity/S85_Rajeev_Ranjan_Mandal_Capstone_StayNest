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
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Update property rating using atomic operations
        await mongoose.model('Property').findByIdAndUpdate(
            this.property,
            {
                $inc: { 'rating.count': 1 },
                $set: {
                    'rating.average': {
                        $avg: {
                            $add: [
                                { $multiply: ['$rating.average', '$rating.count'] },
                                this.rating
                            ]
                        }
                    }
                }
            },
            { session }
        );

        // Update host rating using atomic operations
        await mongoose.model('User').findByIdAndUpdate(
            this.host,
            {
                $inc: { 'hostDetails.averageRating': this.rating },
                $inc: { 'hostDetails.totalReviews': 1 }
            },
            { session }
        );

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});

// Static method to recalculate all ratings (can be used for maintenance)
reviewSchema.statics.recalculateAllRatings = async function() {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Recalculate property ratings
        const propertyRatings = await this.aggregate([
            {
                $group: {
                    _id: '$property',
                    averageRating: { $avg: '$rating' },
                    count: { $sum: 1 }
                }
            }
        ]);

        for (const rating of propertyRatings) {
            await mongoose.model('Property').findByIdAndUpdate(
                rating._id,
                {
                    'rating.average': rating.averageRating,
                    'rating.count': rating.count
                },
                { session }
            );
        }

        // Recalculate host ratings
        const hostRatings = await this.aggregate([
            {
                $group: {
                    _id: '$host',
                    averageRating: { $avg: '$rating' },
                    count: { $sum: 1 }
                }
            }
        ]);

        for (const rating of hostRatings) {
            await mongoose.model('User').findByIdAndUpdate(
                rating._id,
                {
                    'hostDetails.averageRating': rating.averageRating,
                    'hostDetails.totalReviews': rating.count
                },
                { session }
            );
        }

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review; 