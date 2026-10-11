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

router.post("/register", register);
router.post("/login", login);

router.post("/forgot-password", forgotPassword);

// OTP verification
router.post("/verify-otp", verifyOTP);
router.post("/verify-reset-otp", verifyOTP);

router.post("/reset-password", resetPassword);

router.put("/change-password", changePassword);

module.exports = router;
