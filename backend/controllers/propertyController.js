const Property = require("../models/Property");
const User = require("../models/User");

// Create a new property
const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      price,
      images,
      amenities,
      propertyType,
      bedrooms,
      bathrooms,
      maxGuests,
      rules,
      cancellationPolicy,
    } = req.body;

    const hostId = req.user.id; // Get host ID from JWT token

    // Validate host exists and has host role
    const host = await User.findById(hostId);
    if (!host) {
      return res.status(404).json({ message: "Host not found" });
    }

    if (host.role !== "host" && host.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only hosts can create properties" });
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
      cancellationPolicy,
    });

    await property.save();

    res.status(201).json({
      message: "Property created successfully",
      property,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating property",
      error: error.message,
    });
  }
};

// Update property by ID (only by the property owner)
const updateProperty = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from JWT token

    // First check if property exists and user is the owner
    const existingProperty = await Property.findOne({
      _id: req.params.id,
      host: userId, // Only the host who owns the property can update it
    });

    if (!existingProperty) {
      return res
        .status(404)
        .json({ message: "Property not found or access denied" });
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("host", "name email profilePicture");

    res.status(200).json({
      message: "Property updated successfully",
      property: updatedProperty,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating property",
      error: error.message,
    });
  }
};

// Get all properties
const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate(
      "host",
      "name email profilePicture"
    );
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching properties",
      error: error.message,
    });
  }
};

// Get property by ID
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "host",
      "name email profilePicture"
    );
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching property",
      error: error.message,
    });
  }
};

module.exports = {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
};
