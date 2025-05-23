const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["guest", "host", "admin"],
      default: "guest",
    },
    phone: {
      type: String,
      trim: true,
    },
    profilePicture: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    hostDetails: {
      type: new mongoose.Schema(
        {
          isHost: {
            type: Boolean,
            default: false,
          },
          hostSince: Date,
          totalListings: {
            type: Number,
            default: 0,
          },
          averageRating: {
            type: Number,
            default: 0,
          },
          totalReviews: {
            type: Number,
            default: 0,
          },
        },
        { _id: false }
      ),
      default: () => ({}),
    },
    guestDetails: {
      type: new mongoose.Schema(
        {
          totalBookings: {
            type: Number,
            default: 0,
          },
          wishlist: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Property",
            },
          ],
        },
        { _id: false }
      ),
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
