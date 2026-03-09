const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getMessagesByBooking,
  sendMessage,
  markMessagesAsRead,
  getUnreadCount,
} = require("../controllers/messageController");

router.use(auth);

router.get("/unread-count", getUnreadCount);
router.get("/booking/:bookingId", getMessagesByBooking);
router.post("/booking/:bookingId", sendMessage);
router.patch("/booking/:bookingId/read", markMessagesAsRead);

module.exports = router;
