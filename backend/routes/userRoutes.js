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

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Protected routes
router.use(auth);

router.get("/me", getCurrentUser);
router.put("/profile", updateProfile);
router.post("/profile-picture", uploadSingleImage, handleProfilePictureUpload);
router.put("/change-password", changePassword);
router.delete("/account", deleteAccount);
router.put("/become-host", becomeHost);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);

module.exports = router;
