const Task = require("../models/Task");
const Project = require("../models/Project");

// ==========================================
// GET ALL TASKS
// ==========================================

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user.id,
    })
      .populate("project", "name status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error("Get Tasks Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
    });
  }
};

// ==========================================
// GET SINGLE TASK
// ==========================================

const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("project", "name status");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("Get Task Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch task",
    });
  }
};

// ==========================================
// CREATE TASK
// ==========================================

const createTask = async (req, res) => {
  try {
    const {
      project,
      title,
      description,
      status,
      priority,
      dueDate,
    } = req.body;

    // ========================================
    // VALIDATE TITLE
    // ========================================

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    // ========================================
    // VALIDATE PROJECT
    // ========================================

    if (!project) {
      return res.status(400).json({
        success: false,
        message: "Project is required",
      });
    }

    // ========================================
    // IMPORTANT:
    // PROJECT MUST BELONG TO CURRENT USER
    // ========================================

    const projectExists = await Project.findOne({
      _id: project,
      user: req.user.id,
    });

    if (!projectExists) {
      return res.status(403).json({
        success: false,
        message: "Invalid project",
      });
    }

    // ========================================
    // CREATE TASK
    // ========================================

    const task = await Task.create({
      user: req.user.id,
      project,
      title: title.trim(),
      description: description?.trim() || "",
      status: status || "Pending",
      priority: priority || "Medium",
      dueDate: dueDate || null,
    });

    const populatedTask = await Task.findById(
      task._id
    ).populate("project", "name status");

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: populatedTask,
    });
  } catch (error) {
    console.error("Create Task Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create task",
    });
  }
};

// ==========================================
// UPDATE TASK
// ==========================================

const updateTask = async (req, res) => {
  try {
    const {
      project,
      title,
      description,
      status,
      priority,
      dueDate,
    } = req.body;

    // ========================================
    // FIND TASK
    // ========================================

    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // ========================================
    // VALIDATE PROJECT
    // ========================================

    if (project) {
      const projectExists = await Project.findOne({
        _id: project,
        user: req.user.id,
      });

      if (!projectExists) {
        return res.status(403).json({
          success: false,
          message: "Invalid project",
        });
      }

      task.project = project;
    }

    // ========================================
    // UPDATE TITLE
    // ========================================

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Task title is required",
        });
      }

      task.title = title.trim();
    }

    // ========================================
    // UPDATE OTHER FIELDS
    // ========================================

    if (description !== undefined) {
      task.description = description.trim();
    }

    if (status !== undefined) {
      task.status = status;
    }

    if (priority !== undefined) {
      task.priority = priority;
    }

    if (dueDate !== undefined) {
      task.dueDate = dueDate || null;
    }

    await task.save();

    const updatedTask = await Task.findById(
      task._id
    ).populate("project", "name status");

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update Task Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update task",
    });
  }
};

// ==========================================
// DELETE TASK
// ==========================================

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete Task Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete task",
    });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
};