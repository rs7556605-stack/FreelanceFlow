const mongoose = require("mongoose");

const Project = require("../models/Project");
const Client = require("../models/Client");

// ==========================================
// GET ALL PROJECTS
// ==========================================

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      user: req.user.id,
    })
      .populate("client", "name email company")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("=================================");
    console.error("GET PROJECTS ERROR ❌");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.error("=================================");

    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
      error: error.message,
    });
  }
};

// ==========================================
// GET SINGLE PROJECT
// ==========================================

const getProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate Project ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const project = await Project.findOne({
      _id: id,
      user: req.user.id,
    }).populate("client", "name email company");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("=================================");
    console.error("GET SINGLE PROJECT ERROR ❌");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.error("=================================");

    res.status(500).json({
      success: false,
      message: "Failed to fetch project",
      error: error.message,
    });
  }
};

// ==========================================
// CREATE PROJECT
// ==========================================

const createProject = async (req, res) => {
  try {
    console.log("=================================");
    console.log("CREATE PROJECT REQUEST");
    console.log("User ID:", req.user.id);
    console.log("Request Body:", req.body);
    console.log("=================================");

    const {
      name,
      description,
      client,
      status,
      budget,
      deadline,
    } = req.body;

    // ========================================
    // VALIDATE PROJECT NAME
    // ========================================

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    // ========================================
    // VALIDATE CLIENT
    // ========================================

    if (!client) {
      return res.status(400).json({
        success: false,
        message: "Client is required",
      });
    }

    // ========================================
    // VALIDATE CLIENT ID
    // ========================================

    if (!mongoose.Types.ObjectId.isValid(client)) {
      return res.status(400).json({
        success: false,
        message: "Invalid client ID",
      });
    }

    // ========================================
    // CHECK CLIENT OWNERSHIP
    // ========================================

    const clientExists = await Client.findOne({
      _id: client,
      user: req.user.id,
    });

    if (!clientExists) {
      return res.status(403).json({
        success: false,
        message:
          "Invalid client or client does not belong to current user",
      });
    }

    // ========================================
    // VALIDATE STATUS
    // ========================================

    const allowedStatuses = [
      "Active",
      "Completed",
    ];

    const projectStatus = status || "Active";

    if (!allowedStatuses.includes(projectStatus)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid project status. Use Active or Completed",
      });
    }

    // ========================================
    // VALIDATE BUDGET
    // ========================================

    const projectBudget =
      budget === undefined ||
      budget === null ||
      budget === ""
        ? 0
        : Number(budget);

    if (
      Number.isNaN(projectBudget) ||
      projectBudget < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Budget must be a valid positive number",
      });
    }

    // ========================================
    // VALIDATE DEADLINE
    // ========================================

    let projectDeadline = null;

    if (deadline) {
      const parsedDeadline = new Date(deadline);

      if (Number.isNaN(parsedDeadline.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid deadline",
        });
      }

      projectDeadline = parsedDeadline;
    }

    // ========================================
    // CREATE PROJECT
    // ========================================

    const project = await Project.create({
      user: req.user.id,
      client: clientExists._id,
      name: name.trim(),
      description:
        typeof description === "string"
          ? description.trim()
          : "",
      status: projectStatus,
      budget: projectBudget,
      deadline: projectDeadline,
    });

    // ========================================
    // POPULATE CLIENT
    // ========================================

    const populatedProject =
      await Project.findById(project._id).populate(
        "client",
        "name email company"
      );

    console.log(
      "Project Created Successfully ✅"
    );
    console.log(
      "Project ID:",
      project._id.toString()
    );
    console.log(
      "Project Name:",
      project.name
    );

    // ========================================
    // SUCCESS RESPONSE
    // ========================================

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: populatedProject,
    });
  } catch (error) {
    console.error("=================================");
    console.error("CREATE PROJECT ERROR ❌");
    console.error("Name:", error.name);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.error("=================================");

    // Duplicate / validation error
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Project validation failed",
        error: error.message,
      });
    }

    // Invalid ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid ID provided",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create project",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE PROJECT
// ==========================================

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      client,
      status,
      budget,
      deadline,
    } = req.body;

    // ========================================
    // VALIDATE PROJECT ID
    // ========================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    // ========================================
    // FIND PROJECT
    // ========================================

    const project = await Project.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // ========================================
    // VALIDATE CLIENT
    // ========================================

    if (client !== undefined) {
      if (!client) {
        return res.status(400).json({
          success: false,
          message: "Client is required",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(client)) {
        return res.status(400).json({
          success: false,
          message: "Invalid client ID",
        });
      }

      const clientExists = await Client.findOne({
        _id: client,
        user: req.user.id,
      });

      if (!clientExists) {
        return res.status(403).json({
          success: false,
          message:
            "Invalid client or client does not belong to current user",
        });
      }

      project.client = clientExists._id;
    }

    // ========================================
    // UPDATE NAME
    // ========================================

    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        !name.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Project name is required",
        });
      }

      project.name = name.trim();
    }

    // ========================================
    // UPDATE DESCRIPTION
    // ========================================

    if (description !== undefined) {
      project.description =
        typeof description === "string"
          ? description.trim()
          : "";
    }

    // ========================================
    // UPDATE STATUS
    // ========================================

    if (status !== undefined) {
      const allowedStatuses = [
        "Active",
        "Completed",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid project status. Use Active or Completed",
        });
      }

      project.status = status;
    }

    // ========================================
    // UPDATE BUDGET
    // ========================================

    if (budget !== undefined) {
      const projectBudget =
        budget === "" || budget === null
          ? 0
          : Number(budget);

      if (
        Number.isNaN(projectBudget) ||
        projectBudget < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Budget must be a valid positive number",
        });
      }

      project.budget = projectBudget;
    }

    // ========================================
    // UPDATE DEADLINE
    // ========================================

    if (deadline !== undefined) {
      if (!deadline) {
        project.deadline = null;
      } else {
        const parsedDeadline =
          new Date(deadline);

        if (
          Number.isNaN(
            parsedDeadline.getTime()
          )
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid deadline",
          });
        }

        project.deadline = parsedDeadline;
      }
    }

    // ========================================
    // SAVE
    // ========================================

    await project.save();

    // ========================================
    // POPULATE
    // ========================================

    const updatedProject =
      await Project.findById(
        project._id
      ).populate(
        "client",
        "name email company"
      );

    // ========================================
    // RESPONSE
    // ========================================

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("=================================");
    console.error("UPDATE PROJECT ERROR ❌");
    console.error("Name:", error.name);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.error("=================================");

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Project validation failed",
        error: error.message,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid ID provided",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update project",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE PROJECT
// ==========================================

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    // ========================================
    // VALIDATE PROJECT ID
    // ========================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    // ========================================
    // DELETE ONLY CURRENT USER'S PROJECT
    // ========================================

    const project =
      await Project.findOneAndDelete({
        _id: id,
        user: req.user.id,
      });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("=================================");
    console.error("DELETE PROJECT ERROR ❌");
    console.error("Name:", error.name);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.error("=================================");

    res.status(500).json({
      success: false,
      message: "Failed to delete project",
      error: error.message,
    });
  }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};