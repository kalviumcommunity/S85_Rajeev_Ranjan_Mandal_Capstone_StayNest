// Email verification handler
const jwt = require("jsonwebtoken");
// const User = require("../models/User"); // Duplicate removed
const verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret",
    );
    const user = await User.findById(decoded.id);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid verification link." });
    }
    if (user.isVerified) {
      return res
        .status(200)
        .json({ success: true, message: "Email already verified." });
    }
    user.isVerified = true;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired verification link.",
    });
  }
};
const User = require("../models/User");
const { generateToken } = require("../utils/jwtUtils");
const bcrypt = require("bcryptjs");
const {
  validateEmailExistsForSignup,
} = require("../services/emailExistenceService");
const {
  sendVerificationEmail,
} = require("../services/emailVerificationService");

// Register a new user
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = "guest", // Default to 'guest' role if not provided
      phone = "",
      profilePicture = "",
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // Enforce domain-level email deliverability before creating the user
    const emailValidation = await validateEmailExistsForSignup(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.reason || "Please use a valid email address",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Prepare user data
    const userData = {
      name,
      email,
      password,
      role,
      phone,
      profilePicture,
      isVerified: false,
    };

    // If registering as host, set hostDetails properly
    if (role === "host") {
      userData.hostDetails = {
        isHost: true,
        hostSince: new Date(),
        totalListings: 0,
        averageRating: 0,
        totalReviews: 0,
      };
    }

    // Create new user
    const user = new User(userData);
    await user.save();

    // Generate email verification token (expires in 1 hour)
    const jwt = require("jsonwebtoken");
    const verificationToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1h" },
    );

    // Send verification email (required for successful signup)
    const backendUrl =
      process.env.HOST && process.env.PORT
        ? `http://${process.env.HOST}:${process.env.PORT}`
        : "http://localhost:5000";
    const verificationUrl = `${backendUrl}/api/users/verify/${verificationToken}`;
    try {
      await sendVerificationEmail(user.email, user.name, verificationUrl);
    } catch (e) {
      console.error("Error sending verification email:", e);
      // Remove the unverified account if we cannot deliver verification mail.
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        success: false,
        message:
          "Could not send verification email. Please try again with a valid email address.",
      });
    }

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message:
        "Registration successful! Please check your email to verify your account.",
      user: userResponse,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching users",
      error: error.message,
    });
  }
};
// Update user by ID
const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating user",
      error: error.message,
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching user",
      error: error.message,
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    // Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      message: "Login successful",
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    // Get user from database (excluding password)
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate a new token to refresh the session
    const token = generateToken(user._id);

    // Set the new token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user data",
      error: error.message,
    });
  }
};

// Logout user
const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging out",
    });
  }
};

// Update current user's profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, profilePicture } = req.body;

    // Get current user to compare email
    const currentUser = await User.findById(req.user.id);

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if email is being changed and if it's already taken by another user
    if (email && email !== currentUser.email) {
      const existingUser = await User.findOne({
        email: email,
        _id: { $ne: req.user.id }, // Exclude current user from the search
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email is already taken by another user",
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, phone, profilePicture },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// Change user password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Error changing password",
      error: error.message,
    });
  }
};

// Delete user account
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Clear the token cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting account",
      error: error.message,
    });
  }
};

// Become a host (upgrade from guest to host)
const becomeHost = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is already a host
    if (user.role === "host" || user.hostDetails?.isHost) {
      return res.status(400).json({
        success: false,
        message: "User is already a host",
      });
    }

    // Update user to become a host
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        role: "host",
        "hostDetails.isHost": true,
        "hostDetails.hostSince": new Date(),
        "hostDetails.totalListings": 0,
        "hostDetails.averageRating": 0,
        "hostDetails.totalReviews": 0,
      },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Successfully became a host!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Become host error:", error);
    res.status(500).json({
      success: false,
      message: "Error becoming a host",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  logout,
  getCurrentUser,
  getAllUsers,
  getUserById,
  updateUser,
  updateProfile,
  changePassword,
  deleteAccount,
  becomeHost,
};
