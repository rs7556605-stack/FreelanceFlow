const express = require("express");

const router = express.Router();

const {
  login,
  register,
  forgotPassword,
  verifyOTP,
  resetPassword,
  changePassword,
} = require("../controllers/authController");

router.post("/register", register);

router.post("/login", login);

router.post("/forgot-password", forgotPassword);

router.post("/verify-otp", verifyOTP);

router.post("/reset-password", resetPassword);

router.put("/change-password", changePassword);

module.exports = router;
