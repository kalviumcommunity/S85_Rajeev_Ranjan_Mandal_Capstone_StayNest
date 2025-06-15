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
      required: function () {
        return !this.googleId; // Password not required for Google OAuth users
      },
      minlength: 6,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
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
    lastLogin: {
      type: Date,
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
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Indexes for better query performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ "hostDetails.isHost": 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.model("User", userSchema);
module.exports = User;
