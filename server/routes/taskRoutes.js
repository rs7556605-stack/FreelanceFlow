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

router.use(authMiddleware);

// ==========================================
// TASK ROUTES
// ==========================================

router.get("/", getTasks);

router.get("/:id", getTask);

router.post("/", createTask);

router.put("/:id", updateTask);

router.delete("/:id", deleteTask);

module.exports = router;