const Property = require('../models/Property');
const User = require('../models/User');

// Create a new property
const createProperty = async (req, res) => {
    try {
        const {
            title,
            description,
            hostId,
            location,
            price,
            images,
            amenities,
            propertyType,
            bedrooms,
            bathrooms,
            maxGuests,
            rules,
            cancellationPolicy
        } = req.body;

        // Validate host exists
        const host = await User.findById(hostId);
        if (!host) {
            return res.status(404).json({ message: 'Host not found' });
        }

        // Create new property
        const property = new Property({
            title,
            description,
            host: hostId,
            location,
            price,
            images,
            amenities,
            propertyType,
            bedrooms,
            bathrooms,
            maxGuests,
            rules,
            cancellationPolicy
        });

        await property.save();

        res.status(201).json({
            message: 'Property created successfully',
            property
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating property',
            error: error.message
        });
    }
};

module.exports = {
    createProperty
}; 