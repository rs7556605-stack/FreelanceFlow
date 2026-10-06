const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ==============================
    // BASIC ACCOUNT INFORMATION
    // ==============================

    name: {
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
      minlength: 6,
    },

    // ==============================
    // PLAN
    // ==============================

    plan: {
      type: String,
      enum: ["Free", "Pro"],
      default: "Free",
    },

    // ==============================
    // PROFILE INFORMATION
    // ==============================

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

    // ==============================
    // SKILLS
    // ==============================

    skills: {
      type: [String],
      default: [],
    },

    // ==============================
    // EXPERIENCE
    // ==============================

    experience: {
      type: String,
      default: "",
      trim: true,
    },

    // ==============================
    // EDUCATION
    // ==============================

    education: {
      type: String,
      default: "",
      trim: true,
    },

    // ==============================
    // PROFILE IMAGE
    // ==============================

    profileImage: {
      type: String,
      default: "",
      trim: true,
    },

    // ==============================
    // RESUME
    // ==============================

    resumeUrl: {
      type: String,
      default: "",
      trim: true,
    },

    // ==============================
    // SOCIAL LINKS
    // ==============================

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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);