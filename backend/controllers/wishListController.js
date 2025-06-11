const Property = require("../models/Property");
const Wishlist = require("../models/wishlist"); // Use Wishlist model

// Add a property to the user's wishlist
const addToWishlist = async (req, res) => {
  try {
    const { propertyId } = req.body;
    const userId = req.user.id; // Get userId from JWT token via auth middleware

    // Validate propertyId
    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    // Check if the property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if the wishlist exists for the user
    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      // If no wishlist exists, create one for the user
      wishlist = new Wishlist({ user: userId, properties: [propertyId] });
      await wishlist.save();
    } else {
      // If wishlist exists, add the property to the list if it's not already present
      if (!wishlist.properties.includes(propertyId)) {
        wishlist.properties.push(propertyId);
        await wishlist.save();
      } else {
        return res
          .status(400)
          .json({ message: "Property already in wishlist" });
      }
    }

    return res.status(200).json({ message: "Property added to wishlist" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Remove a property from the user's wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id; // Get userId from JWT token via auth middleware

    // Find the wishlist of the user
    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return res
        .status(404)
        .json({ message: "Wishlist not found for this user" });
    }

    const index = wishlist.properties.indexOf(propertyId);
    if (index !== -1) {
      wishlist.properties.splice(index, 1);
      await wishlist.save();
      return res
        .status(200)
        .json({ message: "Property removed from wishlist" });
    } else {
      return res
        .status(400)
        .json({ message: "Property not found in wishlist" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get the user's wishlist
const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id; // Get userId from JWT token via auth middleware

    // Find the user's wishlist and populate with property data
    const wishlist = await Wishlist.findOne({ user: userId }).populate(
      "properties"
    );

    if (!wishlist) {
      return res
        .status(200)
        .json({ message: "No wishlist found", properties: [] });
    }

    return res.status(200).json({ properties: wishlist.properties });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
};
