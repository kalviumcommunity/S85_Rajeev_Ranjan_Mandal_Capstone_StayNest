const mongoose = require("mongoose");
const Message = require("../models/Message");
const Booking = require("../models/Booking");
const { getSocketIO } = require("../utils/socket");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const getBookingIfParticipant = async (bookingId, userId) => {
  if (!isValidObjectId(bookingId)) return null;

  return Booking.findOne({
    _id: bookingId,
    $or: [{ guest: userId }, { host: userId }],
  })
    .populate("guest", "_id name email profilePicture")
    .populate("host", "_id name email profilePicture")
    .populate("property", "_id title");
};

const getMessagesByBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;

    const booking = await getBookingIfParticipant(bookingId, userId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or access denied",
      });
    }

    const messages = await Message.find({ booking: bookingId })
      .populate("sender", "_id name email profilePicture role")
      .populate("receiver", "_id name email profilePicture role")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      booking,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("Error fetching booking messages:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching messages",
      error: error.message,
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { bookingId } = req.params;
    const { content } = req.body;

    if (!content || !String(content).trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    const booking = await getBookingIfParticipant(bookingId, senderId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or access denied",
      });
    }

    const guestId = booking.guest._id.toString();
    const hostId = booking.host._id.toString();
    const receiverId = senderId === guestId ? hostId : guestId;

    const message = await Message.create({
      booking: bookingId,
      sender: senderId,
      receiver: receiverId,
      content: String(content).trim(),
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "_id name email profilePicture role")
      .populate("receiver", "_id name email profilePicture role");

    const io = getSocketIO();
    if (io) {
      io.to(`booking:${bookingId}`).emit("chat:new-message", populatedMessage);

      const receiverUnreadCount = await Message.countDocuments({
        receiver: receiverId,
        isRead: false,
      });

      io.to(`user:${receiverId}`).emit(
        "chat:unread-count-updated",
        receiverUnreadCount,
      );
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Error sending message",
      error: error.message,
    });
  }
};

const markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;

    const booking = await getBookingIfParticipant(bookingId, userId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or access denied",
      });
    }

    const now = new Date();
    const result = await Message.updateMany(
      {
        booking: bookingId,
        receiver: userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: now,
        },
      },
    );

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
      updatedCount: result.modifiedCount || 0,
    });

    const io = getSocketIO();
    if (io) {
      const unreadCount = await Message.countDocuments({
        receiver: userId,
        isRead: false,
      });
      io.to(`user:${userId}`).emit("chat:unread-count-updated", unreadCount);
    }
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      message: "Error marking messages as read",
      error: error.message,
    });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadCount = await Message.countDocuments({
      receiver: userId,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching unread count",
      error: error.message,
    });
  }
};

module.exports = {
  getMessagesByBooking,
  sendMessage,
  markMessagesAsRead,
  getUnreadCount,
};
