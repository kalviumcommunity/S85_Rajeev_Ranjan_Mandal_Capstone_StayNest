const express = require("express");
const passport = require("passport");
const { generateToken } = require("../utils/jwtUtils");
const User = require("../models/User");
const router = express.Router();

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
// @access  Public
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
    session: false,
  }),
  async (req, res) => {
    try {
      // Generate JWT token
      const token = generateToken(req.user._id);

      // Remove password from user object
      const userResponse = req.user.toObject();
      delete userResponse.password;

      // Set HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Check if this is a new user who needs role selection
      // New users will have the default role and no previous login
      const isNewUser =
        req.user.isNewUser ||
        (req.user.role === "guest" && !req.user.lastLogin);

      let redirectUrl;
      if (isNewUser) {
        // Redirect new users to role selection
        redirectUrl = `${
          process.env.FRONTEND_URL
        }/auth/role-selection?token=${token}&name=${encodeURIComponent(
          req.user.name
        )}`;
      } else {
        // Existing users go directly to success page
        redirectUrl = `${process.env.FRONTEND_URL}/auth/success?token=${token}`;
      }

      res.redirect(redirectUrl);
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect(
        `${process.env.FRONTEND_URL}/login?error=oauth_callback_failed`
      );
    }
  }
);

// @route   GET /api/auth/logout
// @desc    Logout user (clear session and cookie)
// @access  Public
router.get("/logout", (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // If using sessions, logout from passport
    if (req.logout) {
      req.logout((err) => {
        if (err) {
          console.error("Logout error:", err);
        }
      });
    }

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
});

// @route   PUT /api/auth/update-role
// @desc    Update user role after OAuth registration
// @access  Private
router.put(
  "/update-role",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { role } = req.body;

      // Validate role
      if (!role || !["guest", "host"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role. Must be 'guest' or 'host'",
        });
      }

      // Update user role
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
          role: role,
          lastLogin: new Date(), // Mark as having completed setup
        },
        { new: true, runValidators: true }
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        message: `Role updated to ${role} successfully`,
        user: updatedUser,
      });
    } catch (error) {
      console.error("Update role error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating user role",
      });
    }
  }
);

// @route   GET /api/auth/current
// @desc    Get current authenticated user
// @access  Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    try {
      const userResponse = req.user.toObject();
      delete userResponse.password;

      res.json({
        success: true,
        user: userResponse,
      });
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching user data",
      });
    }
  }
);

module.exports = router;
