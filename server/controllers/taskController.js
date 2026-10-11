const Task = require("../models/Task");
const Project = require("../models/Project");
const Client = require("../models/Client");

// =====================================================
// POPULATE TASK
// =====================================================
// Client ko direct populate karega
// Project ko populate karega
// Project ke andar client ko bhi populate karega
// =====================================================

const populateTask = (query) => {
  return query
    .populate({
      path: "client",
      select: "name clientName company email phone",
    })
    .populate({
      path: "project",
      select: "name status client",
      populate: {
        path: "client",
        select: "name clientName company email phone",
      },
    });
};

// =====================================================
// VALIDATE CLIENT + PROJECT
// =====================================================

const validateClientAndProject = async ({
  clientId,
  projectId,
  userId,
}) => {
  // ===================================================
  // CLIENT
  // ===================================================

  const client = clientId
    ? await Client.findOne({
        _id: clientId,
        user: userId,
      }).select(
        "name clientName company email phone"
      )
    : null;

  if (clientId && !client) {
    return {
      error: {
        status: 403,
        message: "Invalid client",
      },
    };
  }

  // ===================================================
  // PROJECT
  // ===================================================

  const project = await Project.findOne({
    _id: projectId,
    user: userId,
  }).select(
    "name status client"
  );

  if (!project) {
    return {
      error: {
        status: 403,
        message: "Invalid project",
      },
    };
  }

  // ===================================================
  // PROJECT MUST BELONG TO CLIENT
  // ===================================================

  if (
    clientId &&
    project.client &&
    project.client.toString() !==
      clientId.toString()
  ) {
    return {
      error: {
        status: 400,
        message:
          "Selected project does not belong to selected client",
      },
    };
  }

  // ===================================================
  // RETURN
  // ===================================================

  return {
    client,
    project,
  };
};

// =====================================================
// GET ALL TASKS
// =====================================================

const getTasks = async (req, res) => {
  try {
    const tasks = await populateTask(
      Task.find({
        user: req.user.id,
      }).sort({
        createdAt: -1,
      })
    ).lean();

    // =================================================
    // IMPORTANT
    // OLD TASKS:
    // Agar task.client empty hai,
    // project.client se client set karo
    // =================================================

    const fixedTasks = tasks.map(
      (task) => {
        // ---------------------------------------------
        // DIRECT CLIENT AVAILABLE
        // ---------------------------------------------

        if (
          task.client &&
          typeof task.client === "object"
        ) {
          return task;
        }

        // ---------------------------------------------
        // PROJECT CLIENT AVAILABLE
        // ---------------------------------------------

        if (
          task.project &&
          task.project.client &&
          typeof task.project.client ===
            "object"
        ) {
          return {
            ...task,

            client:
              task.project.client,
          };
        }

        // ---------------------------------------------
        // NO CLIENT
        // ---------------------------------------------

        return task;
      }
    );

    console.log(
      "======================================"
    );

    console.log(
      "TASKS RESPONSE:"
    );

    console.log(
      JSON.stringify(
        fixedTasks,
        null,
        2
      )
    );

    console.log(
      "======================================"
    );

    return res.status(200).json({
      success: true,
      tasks: fixedTasks,
    });
  } catch (error) {
    console.error(
      "GET TASKS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch tasks",
    });
  }
};

// =====================================================
// GET SINGLE TASK
// =====================================================

const getTask = async (req, res) => {
  try {
    const task =
      await populateTask(
        Task.findOne({
          _id: req.params.id,
          user: req.user.id,
        })
      ).lean();

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // =================================================
    // OLD TASK FALLBACK
    // =================================================

    if (
      !task.client &&
      task.project &&
      task.project.client &&
      typeof task.project.client ===
        "object"
    ) {
      task.client =
        task.project.client;
    }

    return res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    console.error(
      "GET TASK ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch task",
    });
  }
};

// =====================================================
// CREATE TASK
// =====================================================

const createTask = async (
  req,
  res
) => {
  try {
    const {
      client,
      project,
      title,
      description,
      status,
      priority,
      dueDate,
    } = req.body;

    console.log(
      "======================================"
    );

    console.log(
      "CREATE TASK BODY:"
    );

    console.log(req.body);

    console.log(
      "======================================"
    );

    // =================================================
    // TITLE
    // =================================================

    if (
      !title ||
      !title.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Task title is required",
      });
    }

    // =================================================
    // CLIENT
    // =================================================

    if (!client) {
      return res.status(400).json({
        success: false,
        message:
          "Client is required",
      });
    }

    // =================================================
    // PROJECT
    // =================================================

    if (!project) {
      return res.status(400).json({
        success: false,
        message:
          "Project is required",
      });
    }

    // =================================================
    // VALIDATE RELATION
    // =================================================

    const relation =
      await validateClientAndProject({
        clientId: client,
        projectId: project,
        userId: req.user.id,
      });

    if (relation.error) {
      return res
        .status(
          relation.error.status
        )
        .json({
          success: false,
          message:
            relation.error.message,
        });
    }

    // =================================================
    // FINAL CLIENT
    // =================================================

    const finalClient =
      relation.client?._id ||
      relation.project.client ||
      client;

    // =================================================
    // CREATE TASK
    // =================================================

    const task =
      await Task.create({
        user: req.user.id,

        client:
          finalClient,

        project:
          relation.project._id,

        title:
          title.trim(),

        description:
          description?.trim() || "",

        status:
          status || "Pending",

        priority:
          priority || "Medium",

        dueDate:
          dueDate || null,
      });

    // =================================================
    // POPULATE CREATED TASK
    // =================================================

    let populatedTask =
      await populateTask(
        Task.findById(
          task._id
        )
      ).lean();

    // =================================================
    // FALLBACK
    // =================================================

    if (
      populatedTask &&
      !populatedTask.client &&
      populatedTask.project?.client
    ) {
      populatedTask.client =
        populatedTask.project.client;
    }

    console.log(
      "TASK CREATED:"
    );

    console.log(
      JSON.stringify(
        populatedTask,
        null,
        2
      )
    );

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,
      message:
        "Task created successfully",
      task:
        populatedTask,
    });
  } catch (error) {
    console.error(
      "CREATE TASK ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create task",
    });
  }
};

// =====================================================
// UPDATE TASK
// =====================================================

const updateTask = async (
  req,
  res
) => {
  try {
    const {
      client,
      project,
      title,
      description,
      status,
      priority,
      dueDate,
    } = req.body;

    // =================================================
    // FIND TASK
    // =================================================

    const task =
      await Task.findOne({
        _id: req.params.id,
        user: req.user.id,
      });

    if (!task) {
      return res.status(404).json({
        success: false,
        message:
          "Task not found",
      });
    }

    // =================================================
    // FINAL CLIENT
    // =================================================

    const finalClient =
      client !== undefined
        ? client
        : task.client;

    // =================================================
    // FINAL PROJECT
    // =================================================

    const finalProject =
      project !== undefined
        ? project
        : task.project;

    // =================================================
    // PROJECT VALIDATION
    // =================================================

    const projectExists =
      await Project.findOne({
        _id: finalProject,
        user: req.user.id,
      }).select(
        "name status client"
      );

    if (!projectExists) {
      return res.status(403).json({
        success: false,
        message:
          "Invalid project",
      });
    }

    // =================================================
    // CLIENT VALIDATION
    // =================================================

    if (finalClient) {
      const clientExists =
        await Client.findOne({
          _id: finalClient,
          user: req.user.id,
        }).select(
          "name clientName company email phone"
        );

      if (!clientExists) {
        return res.status(403).json({
          success: false,
          message:
            "Invalid client",
        });
      }

      // -----------------------------------------------
      // PROJECT MUST BELONG TO CLIENT
      // -----------------------------------------------

      if (
        projectExists.client &&
        projectExists.client.toString() !==
          finalClient.toString()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Selected project does not belong to selected client",
        });
      }
    }

    // =================================================
    // CLIENT
    // =================================================

    if (
      client !== undefined
    ) {
      task.client =
        client || undefined;
    }

    // =================================================
    // PROJECT
    // =================================================

    if (
      project !== undefined
    ) {
      task.project =
        project;
    }

    // =================================================
    // TITLE
    // =================================================

    if (
      title !== undefined
    ) {
      if (
        !title ||
        !title.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Task title is required",
        });
      }

      task.title =
        title.trim();
    }

    // =================================================
    // DESCRIPTION
    // =================================================

    if (
      description !==
      undefined
    ) {
      task.description =
        description?.trim() ||
        "";
    }

    // =================================================
    // STATUS
    // =================================================

    if (
      status !== undefined
    ) {
      task.status =
        status;
    }

    // =================================================
    // PRIORITY
    // =================================================

    if (
      priority !== undefined
    ) {
      task.priority =
        priority;
    }

    // =================================================
    // DUE DATE
    // =================================================

    if (
      dueDate !== undefined
    ) {
      task.dueDate =
        dueDate || null;
    }

    // =================================================
    // SAVE
    // =================================================

    await task.save();

    // =================================================
    // POPULATED TASK
    // =================================================

    let updatedTask =
      await populateTask(
        Task.findById(
          task._id
        )
      ).lean();

    // =================================================
    // OLD TASK FALLBACK
    // =================================================

    if (
      updatedTask &&
      !updatedTask.client &&
      updatedTask.project?.client
    ) {
      updatedTask.client =
        updatedTask.project.client;
    }

    console.log(
      "TASK UPDATED:"
    );

    console.log(
      JSON.stringify(
        updatedTask,
        null,
        2
      )
    );

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      message:
        "Task updated successfully",
      task:
        updatedTask,
    });
  } catch (error) {
    console.error(
      "UPDATE TASK ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update task",
    });
  }
};

// =====================================================
// DELETE TASK
// =====================================================

const deleteTask = async (
  req,
  res
) => {
  try {
    const task =
      await Task.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id,
      });

    if (!task) {
      return res.status(404).json({
        success: false,
        message:
          "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Task deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE TASK ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to delete task",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
};