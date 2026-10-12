const express = require("express");

const {
  register,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
  changePassword,
  deleteAccount,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);


router.post("/forgot-password", forgotPassword);


router.post("/verify-otp", verifyOTP);


router.post("/reset-password", resetPassword);


router.put("/change-password", changePassword);


router.delete("/account", deleteAccount);

module.exports = router;
