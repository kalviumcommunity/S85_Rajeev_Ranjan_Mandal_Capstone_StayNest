const express = require("express");
const passport = require("passport");
const { generateToken } = require("../utils/jwtUtils");
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
      console.log("OAuth callback received");
      console.log("User from Google:", req.user);

      // Generate JWT token
      const token = generateToken(req.user._id);
      console.log("JWT token generated:", token ? "Success" : "Failed");

      // Remove password from user object
      const userResponse = req.user.toObject();
      delete userResponse.password;
      console.log("User response prepared:", userResponse);

      // Set HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Redirect to frontend with success (only send token, fetch user data on frontend)
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/success?token=${token}`;
      console.log("Redirecting to:", redirectUrl);
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
