const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const router = express.Router();

// ==========================================
// AUTHENTICATION
// ==========================================

router.use(
  authMiddleware
);

// ==========================================
// GET ALL TASKS
// ==========================================

router.get(
  "/",
  getTasks
);

// ==========================================
// GET SINGLE TASK
// ==========================================

router.get(
  "/:id",
  getTask
);

// ==========================================
// CREATE TASK
// ==========================================

router.post(
  "/",
  createTask
);

// ==========================================
// UPDATE TASK
// ==========================================

router.put(
  "/:id",
  updateTask
);

// ==========================================
// DELETE TASK
// ==========================================

router.delete(
  "/:id",
  deleteTask
);

module.exports = router;