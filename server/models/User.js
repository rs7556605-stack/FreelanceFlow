const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ==========================================
    // BASIC ACCOUNT INFORMATION
    // ==========================================

    username: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    // ==========================================
    // PROFILE INFORMATION
    // ==========================================

    name: {
      type: String,
      default: "",
      trim: true,
    },

    profession: {
      type: String,
      default: "",
      trim: true,
    },

    bio: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    experience: {
      type: String,
      default: "",
    },

    education: {
      type: String,
      default: "",
    },

    // ==========================================
    // PROFILE IMAGE / RESUME
    // ==========================================

    profileImage: {
      type: String,
      default: "",
    },

    resumeUrl: {
      type: String,
      default: "",
    },

    // ==========================================
    // SOCIAL LINKS
    // ==========================================

    socialLinks: {
      github: {
        type: String,
        default: "",
      },

      linkedin: {
        type: String,
        default: "",
      },

      twitter: {
        type: String,
        default: "",
      },

      website: {
        type: String,
        default: "",
      },
    },

    // ==========================================
    // NOTIFICATIONS
    // ==========================================

    notifications: {
      type: Boolean,
      default: true,
    },

    // ==========================================
    // PROFILE VISIBILITY
    // ==========================================

    profileVisibility: {
      type: String,
      enum: ["private", "public"],
      default: "private",
    },

    // ==========================================
    // FORGOT PASSWORD / OTP
    // ==========================================

    resetPasswordOTP: {
      type: String,
      default: null,
    },

    resetPasswordOTPExpires: {
      type: Date,
      default: null,
    },

    resetPasswordOTPAttempts: {
      type: Number,
      default: 0,
    },

    resetPasswordVerified: {
      type: Boolean,
      default: false,
    },

    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordTokenExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
