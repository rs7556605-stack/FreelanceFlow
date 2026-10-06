const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/protected", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "Protected route accessed successfully 🔐",
    userId: req.user.id,
  });
});

module.exports = router;