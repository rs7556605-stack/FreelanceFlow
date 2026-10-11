const express = require("express");

const {
  register,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
  changePassword,
} = require("../controllers/authController");

const router = express.Router();

// ===============================
// REGISTER
// ===============================
router.post("/register", register);

// ===============================
// LOGIN
// ===============================
router.post("/login", login);

// ===============================
// FORGOT PASSWORD
// ===============================
router.post("/forgot-password", forgotPassword);

// ===============================
// VERIFY OTP
// ===============================
router.post("/verify-otp", verifyOTP);

// ===============================
// RESET PASSWORD
// ===============================
router.post("/reset-password", resetPassword);

// ===============================
// CHANGE PASSWORD
// ===============================
router.put("/change-password", changePassword);

module.exports = router;