const mongoose = require("mongoose");

// =====================================================
// INVOICE ITEM SCHEMA
// =====================================================

const invoiceItemSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },

    hours: {
      type: Number,
      required: true,
      min: 0,
    },

    hourlyRate: {
      type: Number,
      required: true,
      min: 0,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Link invoice item with TimeLog
    timeLogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimeLog",
      default: null,
    },
  },
  {
    _id: false,
  }
);

// =====================================================
// INVOICE SCHEMA
// =====================================================

const invoiceSchema = new mongoose.Schema(
  {
    // -------------------------------------------------
    // USER
    // -------------------------------------------------

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // -------------------------------------------------
    // CLIENT
    // -------------------------------------------------

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    // -------------------------------------------------
    // INVOICE NUMBER
    // -------------------------------------------------

    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // -------------------------------------------------
    // INVOICE DATE
    // -------------------------------------------------

    invoiceDate: {
      type: Date,
      default: Date.now,
    },

    // -------------------------------------------------
    // DUE DATE
    // -------------------------------------------------

    dueDate: {
      type: Date,
      default: null,
    },

    // -------------------------------------------------
    // BILLING PERIOD
    // -------------------------------------------------

    periodStart: {
      type: Date,
      default: null,
    },

    periodEnd: {
      type: Date,
      default: null,
    },

    // -------------------------------------------------
    // ITEMS
    // -------------------------------------------------

    items: {
      type: [invoiceItemSchema],
      default: [],
    },

    // -------------------------------------------------
    // SUBTOTAL
    // -------------------------------------------------

    subtotal: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    // -------------------------------------------------
    // TAX AMOUNT
    // -------------------------------------------------

    // Example:
    //
    // subtotal = 6011.65
    // taxPercent = 18
    // tax = 1082.10
    //

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    // -------------------------------------------------
    // TAX PERCENTAGE
    // -------------------------------------------------

    // IMPORTANT:
    // This stores exactly what user entered.
    //
    // Example:
    //
    // User enters 18
    // taxPercent = 18
    //
    // It will NOT be recalculated from tax amount.
    //

    taxPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // -------------------------------------------------
    // TOTAL
    // -------------------------------------------------

    total: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    // -------------------------------------------------
    // STATUS
    // -------------------------------------------------

    status: {
      type: String,
      enum: [
        "Draft",
        "Pending",
        "Paid",
        "Overdue",
      ],
      default: "Draft",
    },

    // -------------------------------------------------
    // PAYMENT DATE
    // -------------------------------------------------

    paymentDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.model(
    "Invoice",
    invoiceSchema
  );