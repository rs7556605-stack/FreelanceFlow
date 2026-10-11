const Project = require("../models/Project");
const Task = require("../models/Task");

// =====================================================
// GET DASHBOARD DATA
// =====================================================

const getDashboard = async (req, res) => {
  try {
    // ===================================================
    // GET USER ID
    // ===================================================

    const userId =
      req.user?.id ||
      req.user?._id ||
      req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // ===================================================
    // UPCOMING PROJECT DEADLINES
    // ===================================================

    const upcomingProjectDeadlines =
      await Project.find({
        user: userId,

        status: {
          $ne: "Completed",
        },

        deadline: {
          $ne: null,
          $gte: new Date(),
        },
      })
        .populate("client", "name")
        .sort({
          deadline: 1,
        })

        // IMPORTANT:
        // NO .limit(5)

        .select(
          "name status deadline client"
        )
        .lean();

    // ===================================================
    // UPCOMING TASK DEADLINES
    // ===================================================

    const upcomingTaskDeadlines =
      await Task.find({
        user: userId,

        status: {
          $ne: "Completed",
        },

        dueDate: {
          $ne: null,
          $gte: new Date(),
        },
      })
        .populate("project", "name")
        .sort({
          dueDate: 1,
        })

        // IMPORTANT:
        // NO .limit(5)

        .select(
          "title status dueDate project type customType"
        )
        .lean();

    // ===================================================
    // COMBINE PROJECT + TASK DEADLINES
    // ===================================================

    const upcomingDeadlines = [
      // -------------------------------------------------
      // PROJECT DEADLINES
      // -------------------------------------------------

      ...upcomingProjectDeadlines.map(
        (project) => ({
          type: "Project",

          _id: project._id,

          title: project.name,

          date: project.deadline,

          status: project.status,

          clientId:
            project.client?._id ||
            null,

          clientName:
            project.client?.name ||
            "Unknown Client",
        })
      ),

      // -------------------------------------------------
      // TASK DEADLINES
      // -------------------------------------------------

      ...upcomingTaskDeadlines.map(
        (task) => ({
          type: "Task",

          _id: task._id,

          title: task.title,

          date: task.dueDate,

          status: task.status,

          projectId:
            task.project?._id ||
            null,

          projectName:
            task.project?.name ||
            "Unknown Project",

          taskType:
            task.type || "",

          customType:
            task.customType || "",
        })
      ),
    ];

    // ===================================================
    // SORT ALL DEADLINES BY DATE
    // ===================================================

    upcomingDeadlines.sort(
      (a, b) =>
        new Date(a.date) -
        new Date(b.date)
    );

    // ===================================================
    // RESPONSE
    // ===================================================

    return res.status(200).json({
      success: true,
      upcomingDeadlines,
    });
  } catch (error) {
    console.error(
      "❌ Dashboard Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load dashboard data.",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getDashboard,
};