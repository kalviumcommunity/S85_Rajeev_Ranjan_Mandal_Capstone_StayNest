const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const {
  register,
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
} = require("../controllers/userController");
const {
  uploadSingleImage,
  handleProfilePictureUpload,
} = require("../controllers/fileUploadController");
const auth = require("../middleware/auth");
const {
  validateUserRegistration,
  validateUserLogin,
  validateObjectId,
} = require("../middleware/validation");

// Rate limiter specifically for authentication operations
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes with auth rate limiting
router.post("/register", authLimiter, validateUserRegistration, register);
router.post("/login", authLimiter, validateUserLogin, login);
router.post("/logout", logout);

// Protected routes
router.use(auth);

router.get("/me", getCurrentUser);
router.get("/current", getCurrentUser);
router.put("/profile", updateProfile);
router.post("/profile-picture", uploadSingleImage, handleProfilePictureUpload);
router.put("/change-password", changePassword);
router.delete("/account", deleteAccount);
router.put("/become-host", becomeHost);
router.get("/", getAllUsers);
router.get("/:id", validateObjectId("id"), getUserById);
router.put("/:id", validateObjectId("id"), updateUser);

module.exports = router;
