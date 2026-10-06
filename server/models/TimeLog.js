const mongoose = require("mongoose");

const timeLogSchema = new mongoose.Schema(
  {
    // ==========================================
    // USER
    // ==========================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==========================================
    // PROJECT
    // ==========================================

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    // ==========================================
    // TASK
    // ==========================================

    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },

    // ==========================================
    // START TIME
    // ==========================================

    startTime: {
      type: Date,
      required: true,
    },

    // ==========================================
    // END TIME
    // ==========================================

    endTime: {
      type: Date,
      default: null,
    },

    // ==========================================
    // DURATION
    // Seconds
    // ==========================================

    duration: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // HOURLY RATE
    // ==========================================

    hourlyRate: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // AMOUNT
    // ==========================================

    amount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // BILLING
    // ==========================================

    billed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "TimeLog",
  timeLogSchema
);