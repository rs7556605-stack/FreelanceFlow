const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  getActiveTimer,
  getTimeLogs,
  startTimer,
  stopTimer,
  createManualTimeLog,
  updateManualTimeLog,
  deleteTimeLog,
} = require("../controllers/timeController");

const router = express.Router();

// ==========================================
// AUTH
// ==========================================

router.use(authMiddleware);

// ==========================================
// ACTIVE TIMER
// ==========================================

router.get("/active", getActiveTimer);

// ==========================================
// ALL TIME LOGS
// ==========================================

router.get("/", getTimeLogs);

// ==========================================
// START TIMER
// ==========================================

router.post("/start", startTimer);

// ==========================================
// STOP TIMER
// ==========================================

router.put("/stop/:id", stopTimer);

// ==========================================
// CREATE MANUAL LOG
// ==========================================

router.post("/manual", createManualTimeLog);

// ==========================================
// UPDATE MANUAL LOG
// ==========================================

router.put("/manual/:id", updateManualTimeLog);

// ==========================================
// DELETE LOG
// ==========================================

router.delete("/:id", deleteTimeLog);

module.exports = router;