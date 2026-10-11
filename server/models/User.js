const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ==========================================
    // BASIC USER INFORMATION
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
      trim: true,
    },

    skills: {
      type: [String],
      default: [],
    },

    experience: {
      type: String,
      default: "",
      trim: true,
    },

    education: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================
    // PROFILE IMAGE
    // ==========================================

    profileImage: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================
    // RESUME
    // ==========================================

    resumeUrl: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================
    // SOCIAL LINKS
    // ==========================================

    socialLinks: {
      github: {
        type: String,
        default: "",
        trim: true,
      },

      linkedin: {
        type: String,
        default: "",
        trim: true,
      },

      twitter: {
        type: String,
        default: "",
        trim: true,
      },

      website: {
        type: String,
        default: "",
        trim: true,
      },
    },

    // ==========================================
    // PASSWORD RESET
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
