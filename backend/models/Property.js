const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    images: [{
        url: String,
        public_id: String
    }],
    amenities: [{
        type: String
    }],
    propertyType: {
        type: String,
        enum: ['apartment', 'house', 'villa', 'cottage', 'other'],
        required: true
    },
    bedrooms: {
        type: Number,
        required: true,
        min: 0
    },
    bathrooms: {
        type: Number,
        required: true,
        min: 0
    },
    maxGuests: {
        type: Number,
        required: true,
        min: 1
    },
    availability: {
        type: Boolean,
        default: true
    },
    rating: {
        average: {
            type: Number,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        }
    },
    rules: [{
        type: String
    }],
    cancellationPolicy: {
        type: String,
        enum: ['flexible', 'moderate', 'strict'],
        default: 'moderate'
    }
}, {
    timestamps: true
});

// Index for location-based searches
propertySchema.index({ 'location.coordinates': '2dsphere' });

const Property = mongoose.model('Property', propertySchema);
module.exports = Property; 