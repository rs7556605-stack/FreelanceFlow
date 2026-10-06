const mongoose = require("mongoose");

const TimeLog = require("../models/TimeLog");
const Project = require("../models/Project");
const Task = require("../models/Task");
const Client = require("../models/Client");

// ==========================================
// GET ACTIVE TIMER
// ==========================================

const getActiveTimer = async (req, res) => {
  try {
    const timer = await TimeLog.findOne({
      user: req.user.id,
      endTime: null,
    })
      .populate("project", "name")
      .populate("task", "title");

    res.status(200).json({
      success: true,
      timer,
    });
  } catch (error) {
    console.error("Get Active Timer Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get active timer",
    });
  }
};

// ==========================================
// GET ALL TIME LOGS
// ==========================================

const getTimeLogs = async (req, res) => {
  try {
    const timeLogs = await TimeLog.find({
      user: req.user.id,
    })
      .populate("project", "name")
      .populate("task", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      timeLogs,
    });
  } catch (error) {
    console.error("Get Time Logs Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch time logs",
    });
  }
};

// ==========================================
// START TIMER
// ==========================================

const startTimer = async (req, res) => {
  try {
    const { project, task } = req.body;

    if (!project) {
      return res.status(400).json({
        success: false,
        message: "Project is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(project)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    if (
      task &&
      !mongoose.Types.ObjectId.isValid(task)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    // Check existing active timer
    const activeTimer = await TimeLog.findOne({
      user: req.user.id,
      endTime: null,
    });

    if (activeTimer) {
      return res.status(400).json({
        success: false,
        message:
          "You already have an active timer. Stop it first.",
      });
    }

    // Check project ownership
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

    // Check task ownership
    if (task) {
      const taskExists = await Task.findOne({
        _id: task,
        user: req.user.id,
        project,
      });

      if (!taskExists) {
        return res.status(403).json({
          success: false,
          message: "Invalid task",
        });
      }
    }

    // Get client hourly rate
    const client = await Client.findOne({
      _id: projectExists.client,
      user: req.user.id,
    });

    const hourlyRate =
      client?.defaultHourlyRate || 0;

    const timer = await TimeLog.create({
      user: req.user.id,
      project,
      task: task || null,
      startTime: new Date(),
      endTime: null,
      duration: 0,
      hourlyRate,
      amount: 0,
      billed: false,
    });

    const populatedTimer =
      await TimeLog.findById(timer._id)
        .populate("project", "name")
        .populate("task", "title");

    res.status(201).json({
      success: true,
      message: "Timer started successfully",
      timer: populatedTimer,
    });
  } catch (error) {
    console.error("Start Timer Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to start timer",
      error: error.message,
    });
  }
};

// ==========================================
// STOP TIMER
// ==========================================

const stopTimer = async (req, res) => {
  try {
    const timer = await TimeLog.findOne({
      _id: req.params.id,
      user: req.user.id,
      endTime: null,
    });

    if (!timer) {
      return res.status(404).json({
        success: false,
        message: "Active timer not found",
      });
    }

    const endTime = new Date();

    const duration = Math.max(
      0,
      Math.floor(
        (endTime.getTime() -
          timer.startTime.getTime()) /
          1000
      )
    );

    const amount =
      (duration / 3600) *
      timer.hourlyRate;

    timer.endTime = endTime;
    timer.duration = duration;
    timer.amount = Number(
      amount.toFixed(2)
    );

    await timer.save();

    const stoppedTimer =
      await TimeLog.findById(timer._id)
        .populate("project", "name")
        .populate("task", "title");

    res.status(200).json({
      success: true,
      message: "Timer stopped successfully",
      timer: stoppedTimer,
    });
  } catch (error) {
    console.error("Stop Timer Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to stop timer",
      error: error.message,
    });
  }
};

// ==========================================
// CREATE MANUAL TIME LOG
// ==========================================

const createManualTimeLog = async (req, res) => {
  try {
    const {
      project,
      task,
      startTime,
      endTime,
      hourlyRate,
      billed,
    } = req.body;

    if (!project) {
      return res.status(400).json({
        success: false,
        message: "Project is required",
      });
    }

    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message:
          "Start time and end time are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(project)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    if (
      task &&
      !mongoose.Types.ObjectId.isValid(task)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

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

    if (task) {
      const taskExists = await Task.findOne({
        _id: task,
        user: req.user.id,
        project,
      });

      if (!taskExists) {
        return res.status(403).json({
          success: false,
          message: "Invalid task",
        });
      }
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid date/time",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message:
          "End time must be after start time",
      });
    }

    const duration = Math.floor(
      (end.getTime() - start.getTime()) /
        1000
    );

    let rate = Number(hourlyRate);

    if (
      hourlyRate === undefined ||
      hourlyRate === null ||
      hourlyRate === ""
    ) {
      const client = await Client.findOne({
        _id: projectExists.client,
        user: req.user.id,
      });

      rate =
        client?.defaultHourlyRate || 0;
    }

    if (Number.isNaN(rate) || rate < 0) {
      rate = 0;
    }

    const amount =
      (duration / 3600) * rate;

    const timeLog = await TimeLog.create({
      user: req.user.id,
      project,
      task: task || null,
      startTime: start,
      endTime: end,
      duration,
      hourlyRate: rate,
      amount: Number(
        amount.toFixed(2)
      ),
      billed: Boolean(billed),
    });

    const populatedLog =
      await TimeLog.findById(timeLog._id)
        .populate("project", "name")
        .populate("task", "title");

    res.status(201).json({
      success: true,
      message:
        "Manual time log created successfully",
      timeLog: populatedLog,
    });
  } catch (error) {
    console.error(
      "Create Manual Time Log Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to create manual time log",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE MANUAL TIME LOG
// ==========================================

const updateManualTimeLog = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      project,
      task,
      startTime,
      endTime,
      hourlyRate,
      billed,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid time log ID",
      });
    }

    const timeLog =
      await TimeLog.findOne({
        _id: id,
        user: req.user.id,
      });

    if (!timeLog) {
      return res.status(404).json({
        success: false,
        message: "Time log not found",
      });
    }

    if (!timeLog.endTime) {
      return res.status(400).json({
        success: false,
        message:
          "Active timer cannot be edited. Stop the timer first.",
      });
    }

    if (!project) {
      return res.status(400).json({
        success: false,
        message: "Project is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(project)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const projectExists =
      await Project.findOne({
        _id: project,
        user: req.user.id,
      });

    if (!projectExists) {
      return res.status(403).json({
        success: false,
        message: "Invalid project",
      });
    }

    if (task) {
      if (!mongoose.Types.ObjectId.isValid(task)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task ID",
        });
      }

      const taskExists =
        await Task.findOne({
          _id: task,
          user: req.user.id,
          project,
        });

      if (!taskExists) {
        return res.status(403).json({
          success: false,
          message: "Invalid task",
        });
      }
    }

    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message:
          "Start time and end time are required",
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid date/time",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message:
          "End time must be after start time",
      });
    }

    const duration = Math.floor(
      (end.getTime() - start.getTime()) /
        1000
    );

    let rate = Number(hourlyRate);

    if (
      hourlyRate === undefined ||
      hourlyRate === null ||
      hourlyRate === ""
    ) {
      const client = await Client.findOne({
        _id: projectExists.client,
        user: req.user.id,
      });

      rate =
        client?.defaultHourlyRate || 0;
    }

    if (Number.isNaN(rate) || rate < 0) {
      rate = 0;
    }

    const amount =
      (duration / 3600) * rate;

    timeLog.project = project;
    timeLog.task = task || null;

    timeLog.startTime = start;
    timeLog.endTime = end;

    timeLog.duration = duration;
    timeLog.hourlyRate = rate;

    timeLog.amount = Number(
      amount.toFixed(2)
    );

    timeLog.billed = Boolean(billed);

    await timeLog.save();

    const updatedLog =
      await TimeLog.findById(timeLog._id)
        .populate("project", "name")
        .populate("task", "title");

    res.status(200).json({
      success: true,
      message:
        "Manual time log updated successfully",
      timeLog: updatedLog,
    });
  } catch (error) {
    console.error(
      "Update Manual Time Log Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update manual time log",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE TIME LOG
// ==========================================

const deleteTimeLog = async (
  req,
  res
) => {
  try {
    const timeLog =
      await TimeLog.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id,
      });

    if (!timeLog) {
      return res.status(404).json({
        success: false,
        message: "Time log not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Time log deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Time Log Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to delete time log",
    });
  }
};

module.exports = {
  getActiveTimer,
  getTimeLogs,
  startTimer,
  stopTimer,
  createManualTimeLog,
  updateManualTimeLog,
  deleteTimeLog,
};