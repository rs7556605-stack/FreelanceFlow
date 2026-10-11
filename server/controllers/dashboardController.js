const Project = require("../models/Project");
const Task = require("../models/Task");

// =====================================================
// GET DASHBOARD SUMMARY
// =====================================================

const getDashboardSummary = async (req, res) => {
  try {
    // =================================================
    // GET LOGGED-IN USER ID
    // =================================================

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

    // =================================================
    // CURRENT DATE
    // =================================================

    const today = new Date();

    // =================================================
    // GET ALL USER PROJECTS
    // =================================================

    const projects = await Project.find({
      user: userId,
    })
      .populate("client", "name")
      .sort({
        createdAt: -1,
      })
      .lean();

    // =================================================
    // GET ALL USER TASKS
    // =================================================

    const tasks = await Task.find({
      user: userId,
    })
      .populate("project", "name")
      .sort({
        createdAt: -1,
      })
      .lean();

    // =================================================
    // PROJECT STATISTICS
    // =================================================

    const totalProjects = projects.length;

    const completedProjects = projects.filter(
      (project) =>
        String(project.status || "").toLowerCase() ===
        "completed"
    ).length;

    const pendingProjects = projects.filter(
      (project) =>
        String(project.status || "").toLowerCase() !==
        "completed"
    ).length;

    // =================================================
    // TASK STATISTICS
    // =================================================

    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
      (task) =>
        String(task.status || "").toLowerCase() ===
        "completed"
    ).length;

    const pendingTasks = tasks.filter(
      (task) =>
        String(task.status || "").toLowerCase() !==
        "completed"
    ).length;

    // =================================================
    // TASKS DUE TODAY
    // =================================================

    const tasksDueToday = tasks.filter((task) => {
      if (!task.dueDate) {
        return false;
      }

      const dueDate = new Date(task.dueDate);

      return (
        dueDate.getFullYear() === today.getFullYear() &&
        dueDate.getMonth() === today.getMonth() &&
        dueDate.getDate() === today.getDate() &&
        String(task.status || "").toLowerCase() !==
          "completed"
      );
    });

    // =================================================
    // OVERDUE TASKS
    // =================================================

    const overdueTasks = tasks.filter((task) => {
      if (!task.dueDate) {
        return false;
      }

      const dueDate = new Date(task.dueDate);

      return (
        dueDate < today &&
        String(task.status || "").toLowerCase() !==
          "completed"
      );
    });

    // =================================================
    // UPCOMING PROJECT DEADLINES
    // =================================================

    const upcomingProjectDeadlines =
      await Project.find({
        user: userId,

        status: {
          $ne: "Completed",
        },

        deadline: {
          $ne: null,
          $gte: today,
        },
      })
        .populate(
          "client",
          "name"
        )
        .sort({
          deadline: 1,
        })
        .select(
          "name status deadline client"
        )
        .lean();

    // =================================================
    // UPCOMING TASK DEADLINES
    // =================================================

    const upcomingTaskDeadlines =
      await Task.find({
        user: userId,

        status: {
          $ne: "Completed",
        },

        dueDate: {
          $ne: null,
          $gte: today,
        },
      })
        .populate(
          "project",
          "name"
        )
        .sort({
          dueDate: 1,
        })
        .select(
          "title status dueDate project type customType"
        )
        .lean();

    // =================================================
    // COMBINE PROJECT + TASK DEADLINES
    // =================================================

    const upcomingDeadlines = [
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

    // =================================================
    // SORT DEADLINES BY DATE
    // =================================================

    upcomingDeadlines.sort(
      (a, b) =>
        new Date(a.date) -
        new Date(b.date)
    );

    // =================================================
    // PROJECT PROGRESS
    // =================================================

    const projectProgress = projects.map(
      (project) => {
        const projectTasks = tasks.filter(
          (task) =>
            String(
              task.project?._id ||
                task.project
            ) ===
            String(project._id)
        );

        const projectTotalTasks =
          projectTasks.length;

        const projectCompletedTasks =
          projectTasks.filter(
            (task) =>
              String(
                task.status || ""
              ).toLowerCase() ===
              "completed"
          ).length;

        let progress = 0;

        if (projectTotalTasks > 0) {
          progress = Math.round(
            (projectCompletedTasks /
              projectTotalTasks) *
              100
          );
        } else if (
          String(
            project.status || ""
          ).toLowerCase() ===
          "completed"
        ) {
          progress = 100;
        }

        return {
          _id: project._id,

          name: project.name,

          status: project.status,

          deadline:
            project.deadline || null,

          clientId:
            project.client?._id ||
            null,

          clientName:
            project.client?.name ||
            "Unknown Client",

          totalTasks:
            projectTotalTasks,

          completedTasks:
            projectCompletedTasks,

          progress,
        };
      }
    );

    // =================================================
    // RECENT PROJECTS
    // =================================================

    const recentProjects = projects
      .slice(0, 5)
      .map((project) => {
        const projectTasks =
          tasks.filter(
            (task) =>
              String(
                task.project?._id ||
                  task.project
              ) ===
              String(project._id)
          );

        const total =
          projectTasks.length;

        const completed =
          projectTasks.filter(
            (task) =>
              String(
                task.status || ""
              ).toLowerCase() ===
              "completed"
          ).length;

        let progress = 0;

        if (total > 0) {
          progress = Math.round(
            (completed / total) * 100
          );
        } else if (
          String(
            project.status || ""
          ).toLowerCase() ===
          "completed"
        ) {
          progress = 100;
        }

        return {
          _id: project._id,

          name: project.name,

          status: project.status,

          deadline:
            project.deadline || null,

          clientId:
            project.client?._id ||
            null,

          clientName:
            project.client?.name ||
            "Unknown Client",

          progress,

          totalTasks: total,

          completedTasks: completed,
        };
      });

    // =================================================
    // RECENT TASKS
    // =================================================

    const recentTasks = tasks
      .slice(0, 5)
      .map((task) => ({
        _id: task._id,

        title: task.title,

        description:
          task.description || "",

        status:
          task.status || "Pending",

        priority:
          task.priority || "Medium",

        dueDate:
          task.dueDate || null,

        projectId:
          task.project?._id ||
          null,

        projectName:
          task.project?.name ||
          "Unknown Project",

        type:
          task.type || "",

        customType:
          task.customType || "",
      }));

    // =================================================
    // OVERALL PROGRESS
    // =================================================

    let overallProgress = 0;

    if (totalTasks > 0) {
      overallProgress = Math.round(
        (completedTasks /
          totalTasks) *
          100
      );
    } else if (
      totalProjects > 0 &&
      completedProjects ===
        totalProjects
    ) {
      overallProgress = 100;
    }

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      summary: {
        totalProjects,

        completedProjects,

        pendingProjects,

        totalTasks,

        completedTasks,

        pendingTasks,

        tasksDueToday:
          tasksDueToday.length,

        overdueTasks:
          overdueTasks.length,

        overallProgress,
      },

      projects: {
        total: totalProjects,

        completed:
          completedProjects,

        pending:
          pendingProjects,

        recent:
          recentProjects,

        progress:
          projectProgress,
      },

      tasks: {
        total: totalTasks,

        completed:
          completedTasks,

        pending:
          pendingTasks,

        dueToday:
          tasksDueToday,

        overdue:
          overdueTasks,

        recent:
          recentTasks,
      },

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

      error:
        process.env.NODE_ENV ===
        "production"
          ? undefined
          : error.message,
    });
  }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getDashboardSummary,
};