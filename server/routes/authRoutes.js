const express = require("express");

const router = express.Router();

const {
  forgotPassword,
  verifyOTP,
  resetPassword,
  changePassword,
} = require("../controllers/authController");

// ==========================================
// FORGOT PASSWORD
// ==========================================

router.post("/forgot-password", forgotPassword);

// ==========================================
// VERIFY OTP
// ==========================================

router.post("/verify-otp", verifyOTP);

// ==========================================
// RESET PASSWORD
// ==========================================

router.post("/reset-password", resetPassword);

// ==========================================
// CHANGE PASSWORD - LOGGED IN USER
// ==========================================

router.put("/change-password", changePassword);

module.exports = router;