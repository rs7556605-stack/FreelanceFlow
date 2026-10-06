const express = require("express");

const {
  getProfile,
  updateProfile,
} = require("../controllers/profileController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// GET PROFILE
// ==========================================

router.get("/", authMiddleware, getProfile);

// ==========================================
// UPDATE PROFILE
// ==========================================

router.put("/", authMiddleware, updateProfile);

module.exports = router;