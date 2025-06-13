const express = require("express");
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

// Public routes
router.post("/register", validateUserRegistration, register);
router.post("/login", validateUserLogin, login);
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
