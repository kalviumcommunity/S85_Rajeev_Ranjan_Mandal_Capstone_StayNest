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

// Update property by ID (only by the property owner or admin)
const updateProperty = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from JWT token

    // Get user to check role
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build query conditions based on user role to prevent race conditions
    let queryConditions;
    if (user.role === "admin") {
      // Admin can update any property
      queryConditions = { _id: req.params.id };
    } else {
      // Regular users can only update their own properties
      queryConditions = { _id: req.params.id, host: userId };
    }

    // Atomic operation: find and update in one operation to prevent race conditions
    const updatedProperty = await Property.findOneAndUpdate(
      queryConditions,
      req.body,
      {
        new: true,
        runValidators: true,
        // Ensure the document exists and matches our conditions
        upsert: false,
      }
    ).populate("host", "name email profilePicture");

    if (!updatedProperty) {
      // Check if property exists at all to provide better error message
      const propertyExists = await Property.findById(req.params.id);
      if (!propertyExists) {
        return res.status(404).json({ message: "Property not found" });
      } else {
        return res.status(403).json({
          message:
            "Access denied. Only property owner or admin can update this property",
        });
      }
    }

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

// Get properties by host (user's own properties)
const getMyProperties = async (req, res) => {
  try {
    const hostId = req.user.id; // Get host ID from JWT token

    const properties = await Property.find({ host: hostId }).populate(
      "host",
      "name email profilePicture"
    );

    res.status(200).json({
      success: true,
      properties,
      count: properties.length,
    });
  } catch (error) {
    console.error("Error in getMyProperties:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching your properties",
      error: error.message,
    });
  }
};

// Delete property by ID (only by the property owner or admin)
const deleteProperty = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from JWT token

    // Get user to check role
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Build query conditions based on user role
    let queryConditions;
    if (user.role === "admin") {
      // Admin can delete any property
      queryConditions = { _id: req.params.id };
    } else {
      // Regular users can only delete their own properties
      queryConditions = { _id: req.params.id, host: userId };
    }

    // Find the property first to check if it exists and user has permission
    const property = await Property.findOne(queryConditions);

    if (!property) {
      // Check if property exists at all to provide better error message
      const propertyExists = await Property.findById(req.params.id);
      if (!propertyExists) {
        return res.status(404).json({
          success: false,
          message: "Property not found",
        });
      } else {
        return res.status(403).json({
          success: false,
          message:
            "Access denied. Only property owner or admin can delete this property",
        });
      }
    }

    // Delete the property
    await Property.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting property",
      error: error.message,
    });
  }
};

module.exports = {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  getMyProperties,
  deleteProperty,
};
