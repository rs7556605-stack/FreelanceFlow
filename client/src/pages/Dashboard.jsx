import React, { useEffect, useState } from "react";

import {
  LogOut,
  Users,
  FolderKanban,
  Receipt,
  CheckSquare,
  Clock3,
  LayoutDashboard,
  Mail,
  Home,
  UserRound,
  Settings,
  Menu,
  X,
  Plus,
  Trash2,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { Link, NavLink } from "react-router-dom";
import API from "../services/api";

import "./Dashboard.css";

const Dashboard = () => {
  const { user, logout } = useAuth();

  // =========================================================
  // DASHBOARD STATE
  // =========================================================

  const [dashboardData, setDashboardData] = useState({
    totalClients: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingInvoiceCount: 0,
    paidInvoiceCount: 0,
    totalRevenue: 0,
    outstandingAmount: 0,
  });

  const [revenueByMonth, setRevenueByMonth] =
    useState([]);

  const [recentProjects, setRecentProjects] =
    useState([]);

  const [recentInvoices, setRecentInvoices] =
    useState([]);

  const [upcomingDeadlines, setUpcomingDeadlines] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =========================================================
  // MOBILE SIDEBAR
  // =========================================================

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  // =========================================================
  // VIEW ALL DEADLINES
  // =========================================================

  const [showAllDeadlines, setShowAllDeadlines] =
    useState(false);

  // =========================================================
  // TODAY'S TASKS
  // =========================================================

  const [todaysTasks, setTodaysTasks] =
    useState([]);

  const [taskFormOpen, setTaskFormOpen] =
    useState(false);

  const [taskName, setTaskName] =
    useState("");

  const [taskProject, setTaskProject] =
    useState("");

const [customProjectName, setCustomProjectName] =
  useState("");


  const [taskType, setTaskType] =
    useState("Update");


    const [customTaskType, setCustomTaskType] =
  useState("");

  const [taskError, setTaskError] =
    useState("");

  const [allProjects, setAllProjects] =
    useState([]);

  // =========================================================
  // TODAY KEY
  // =========================================================

  const getTodayKey = () => {
    const now = new Date();

    const year =
      now.getFullYear();

    const month =
      String(now.getMonth() + 1)
        .padStart(2, "0");

    const day =
      String(now.getDate())
        .padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =========================================================
  // TASK LOCAL STORAGE KEY
  // =========================================================

  const getTaskStorageKey = () => {
    const userKey =
      user?._id ||
      user?.id ||
      user?.email ||
      "default";

    return `freelanceflow_todays_tasks_${userKey}`;
  };

  // =========================================================
  // READ LOCAL TASKS
  // =========================================================

  const readLocalTasks = () => {
    try {
      const saved =
        JSON.parse(
          localStorage.getItem(
            getTaskStorageKey()
          ) || "[]"
        );

      return Array.isArray(saved)
        ? saved.filter(
            (task) =>
              task.date ===
              getTodayKey()
          )
        : [];
    } catch (storageError) {
      console.error(
        "Task storage error:",
        storageError
      );

      return [];
    }
  };

  // =========================================================
  // SAVE LOCAL TASKS
  // =========================================================

  const saveLocalTasks = (tasks) => {
    try {
      localStorage.setItem(
        getTaskStorageKey(),
        JSON.stringify(
          tasks.filter(
            (task) =>
              task.date ===
              getTodayKey()
          )
        )
      );
    } catch (storageError) {
      console.error(
        "Task save error:",
        storageError
      );
    }
  };

  // =========================================================
  // NORMALIZE TASK
  // =========================================================

  const normalizeTask = (
    task,
    index = 0
  ) => ({
    ...task,

    id:
      task.id ||
      task._id ||
      `server-task-${index}`,

    name:
      task.name ||
      task.title ||
      task.taskName ||
      "Untitled Task",

    projectName:
      task.projectName ||
      task.project?.name ||
      task.project?.title ||
      "No Project",

    projectId:
      task.projectId ||
      task.project?._id ||
      "",

    type:
      task.type ||
      task.taskType ||
      "Other",

    completed:
      Boolean(task.completed) ||
      String(
        task.status || ""
      ).toLowerCase() ===
        "completed",

    date:
      task.date ||
      getTodayKey(),
  });

  // =========================================================
  // LOAD LOCAL TASKS
  // =========================================================

  useEffect(() => {
    if (!user) return;

    setTodaysTasks(
      readLocalTasks()
    );
  }, [user]);

  // =========================================================
  // FETCH ALL PROJECTS
  // =========================================================

  useEffect(() => {
    const fetchProjects =
      async () => {
        try {
          const response =
            await API.get(
              "/projects"
            );

          const data =
            response.data;

          const projects =
            data?.projects ||
            data?.data ||
            (Array.isArray(data)
              ? data
              : []);

          if (
            Array.isArray(
              projects
            )
          ) {
            setAllProjects(
              projects
            );
          }
        } catch (err) {
          console.warn(
            "Could not load all projects:",
            err
          );
        }
      };

    fetchProjects();
  }, []);




  // =========================================================
// ADD TASK
// =========================================================

const addTask = () => {
  const trimmedName = taskName.trim();

  if (!trimmedName) {
    setTaskError("Please enter a task name.");
    return;
  }

  // =======================================================
  // CUSTOM PROJECT VALIDATION
  // =======================================================

  if (
    taskProject === "__OTHER_PROJECT__" &&
    !customProjectName.trim()
  ) {
    setTaskError("Please enter a custom project name.");
    return;
  }

  // =======================================================
  // CUSTOM TASK TYPE VALIDATION
  // =======================================================

  if (
    taskType === "Other" &&
    !customTaskType.trim()
  ) {
    setTaskError("Please enter a custom task type.");
    return;
  }

  // =======================================================
  // SELECTED NORMAL PROJECT
  // =======================================================

  const selectedProject =
    projectOptions.find(
      (project) =>
        String(project.id) ===
        String(taskProject)
    );

  // =======================================================
  // PROJECT NAME
  // =======================================================

  const finalProjectName =
    taskProject === "__OTHER_PROJECT__"
      ? customProjectName.trim()
      : selectedProject?.name || "No Project";

  // =======================================================
  // PROJECT ID
  // =======================================================

  const finalProjectId =
    taskProject === "__OTHER_PROJECT__"
      ? ""
      : selectedProject?.id || "";

  // =======================================================
  // TASK TYPE
  // =======================================================

  const finalTaskType =
    taskType === "Other"
      ? customTaskType.trim()
      : taskType;

  // =======================================================
  // CREATE TASK
  // =======================================================

  const newTask = {
    id: `task-${Date.now()}`,

    name: trimmedName,

    projectId: finalProjectId,

    projectName: finalProjectName,

    type: taskType,

    customType:
      taskType === "Other"
        ? customTaskType.trim()
        : "",

    displayType: finalTaskType,

    completed: false,

    date: getTodayKey(),

    createdAt:
      new Date().toISOString(),
  };

  // =======================================================
  // UPDATE TASK LIST
  // =======================================================

  const updatedTasks = [
    newTask,
    ...todaysTasks,
  ];

  setTodaysTasks(updatedTasks);

  saveLocalTasks(updatedTasks);

  // =======================================================
  // RESET FORM
  // =======================================================

  setTaskName("");

  setTaskProject("");

  setCustomProjectName("");

  setTaskType("Update");

  setCustomTaskType("");

  setTaskError("");

  setTaskFormOpen(false);
};
  // =========================================================
  // COMPLETE / UNCOMPLETE TASK
  // =========================================================

  const toggleTask = (
    taskId
  ) => {
    const updatedTasks =
      todaysTasks.map(
        (task) =>
          String(task.id) ===
          String(taskId)
            ? {
                ...task,
                completed:
                  !task.completed,
              }
            : task
      );

    setTodaysTasks(
      updatedTasks
    );

    saveLocalTasks(
      updatedTasks
    );
  };

  // =========================================================
  // DELETE TASK
  // =========================================================

  const deleteTask = (
    taskId
  ) => {
    const updatedTasks =
      todaysTasks.filter(
        (task) =>
          String(task.id) !==
          String(taskId)
      );

    setTodaysTasks(
      updatedTasks
    );

    saveLocalTasks(
      updatedTasks
    );
  };

  // =========================================================
  // FETCH DASHBOARD DATA
  // =========================================================

  useEffect(() => {
    const fetchDashboardData =
      async () => {
        try {
          setLoading(true);

          setError("");

          const response =
            await API.get(
              "/dashboard/summary"
            );

          if (
            response.data?.success
          ) {
            setDashboardData(
              response.data.stats || {
                totalClients: 0,
                activeProjects: 0,
                completedProjects: 0,
                pendingInvoiceCount: 0,
                paidInvoiceCount: 0,
                totalRevenue: 0,
                outstandingAmount: 0,
              }
            );

            setRevenueByMonth(
              response.data
                .revenueByMonth ||
                []
            );

            setRecentProjects(
              response.data
                .recentProjects ||
                []
            );

            setRecentInvoices(
              response.data
                .recentInvoices ||
                []
            );

            setUpcomingDeadlines(
              response.data
                .upcomingDeadlines ||
                []
            );

            // ==========================================
            // SERVER TASKS
            // ==========================================

            const serverTasks =
              Array.isArray(
                response.data
                  .todaysTasks
              )
                ? response.data
                    .todaysTasks
                    .map(
                      (
                        task,
                        index
                      ) =>
                        normalizeTask(
                          task,
                          index
                        )
                    )
                : [];

            // ==========================================
            // LOCAL TASKS
            // ==========================================

            const localTasks =
              readLocalTasks();

            // ==========================================
            // COMBINE TASKS
            // ==========================================

            const combinedTasks = [
              ...localTasks,

              ...serverTasks.filter(
                (serverTask) =>
                  !localTasks.some(
                    (localTask) =>
                      String(
                        localTask.id
                      ) ===
                      String(
                        serverTask.id
                      )
                  )
              ),
            ];

            setTodaysTasks(
              combinedTasks
            );
          }
        } catch (err) {
          console.error(
            "Dashboard Error:",
            err
          );

          if (
            err.response?.status ===
            401
          ) {
            localStorage.removeItem(
              "token"
            );

            logout();

            return;
          }

          setError(
            err.response?.data
              ?.message ||
              "Failed to load dashboard data."
          );
        } finally {
          setLoading(false);
        }
      };

    fetchDashboardData();
  }, [logout]);

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatCurrency = (
    amount
  ) => {
    return `₹${Number(
      amount || 0
    ).toLocaleString(
      "en-IN"
    )}`;
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "No date";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==========================================
// DEADLINE DAYS LEFT
// ==========================================

const getDaysLeft = (date) => {
  if (!date) {
    return {
      text: "No date",
      className: "normal",
    };
  }

  const today = new Date();
  const deadline = new Date(date);

  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);

  const difference =
    deadline.getTime() - today.getTime();

  const daysLeft = Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );

  // Overdue
  if (daysLeft < 0) {
    const overdueDays = Math.abs(daysLeft);

    return {
      text: `🔴 ${overdueDays} ${
        overdueDays === 1 ? "day" : "days"
      } overdue`,
      className: "overdue",
    };
  }

  // Today
  if (daysLeft === 0) {
    return {
      text: "⚠️ Due today",
      className: "today",
    };
  }

  // Tomorrow
  if (daysLeft === 2) {
    return {
      text: "⚠️ 2 day left",
      className: "urgent",
    };
  }

  // Future
  return {
    text: `🟢 ${daysLeft} days left`,
    className: "normal",
  };
};
  // =========================================================
  // TASK PROJECT OPTIONS
  // =========================================================

  const projectOptions =
    (() => {
      const map =
        new Map();

      [
        ...allProjects,
        ...recentProjects,
      ].forEach(
        (project) => {
          const id =
            project?._id ||
            project?.id ||
            project?.name;

          const name =
            project?.name ||
            project?.title;

          if (
            id &&
            name &&
            !map.has(
              String(id)
            )
          ) {
            map.set(
              String(id),
              {
                id,
                name,
              }
            );
          }
        }
      );

      return Array.from(
        map.values()
      );
    })();

  // =========================================================
  // REAL PROJECT STATISTICS
  // =========================================================

  /*
    IMPORTANT:

    Dashboard summary ka completedProjects
    kabhi-kabhi 0 aa sakta hai.

    Isliye actual /projects list se status
    check karke count calculate kar rahe hain.
  */

  const projectStatsSource =
    allProjects.length > 0
      ? allProjects
      : recentProjects;

  // =========================================================
  // TOTAL PROJECTS
  // =========================================================

  const actualTotalProjects =
    projectStatsSource.length >
    0
      ? projectStatsSource.length
      : Number(
          dashboardData.activeProjects ||
            0
        ) +
        Number(
          dashboardData.completedProjects ||
            0
        );

  // =========================================================
  // COMPLETED PROJECTS
  // =========================================================

  const actualCompletedProjects =
    projectStatsSource.length >
    0
      ? projectStatsSource.filter(
          (project) => {
            const status =
              String(
                project?.status ||
                  project?.projectStatus ||
                  project?.state ||
                  ""
              )
                .trim()
                .toLowerCase();

            return (
              status ===
                "completed" ||
              status ===
                "complete" ||
              status ===
                "done" ||
              status ===
                "finished"
            );
          }
        ).length
      : Number(
          dashboardData.completedProjects ||
            0
        );

  // =========================================================
  // ACTIVE PROJECTS
  // =========================================================

  const actualActiveProjects =
    Math.max(
      actualTotalProjects -
        actualCompletedProjects,
      0
    );

  // =========================================================
  // PROJECT COMPLETION %
  // =========================================================

  const projectCompletionPercentage =
    actualTotalProjects >
    0
      ? Math.round(
          (actualCompletedProjects /
            actualTotalProjects) *
            100
        )
      : 0;

  // =========================================================
  // MAX REVENUE
  // =========================================================

  const maxRevenue =
    Math.max(
      ...revenueByMonth.map(
        (item) =>
          Number(
            item.revenue || 0
          )
      ),
      1
    );

  // =========================================================
  // CLOSE SIDEBAR
  // =========================================================

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="dashboard-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="dashboard-header">

        <div className="dashboard-header-inner">

          <div className="dashboard-brand">

            <h1>
              FreelanceFlow
            </h1>

            <p>
              Project Management
            </p>

          </div>

          <div className="dashboard-header-right">

            {/* MOBILE MENU */}

            <button
              type="button"
              className="dashboard-menu-toggle"
              onClick={() =>
                setSidebarOpen(
                  (prev) =>
                    !prev
                )
              }
              aria-label="Toggle sidebar"
              aria-expanded={
                sidebarOpen
              }
            >
              {sidebarOpen ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>

            {/* TOP NAV */}

            <nav className="dashboard-top-nav">

              <Link to="/">
                <Home size={17} />

                <span>
                  Home
                </span>
              </Link>

              <Link to="/about">
                <UserRound
                  size={17}
                />

                <span>
                  About Me
                </span>
              </Link>

              <Link to="/contact">
                <Mail size={17} />

                <span>
                  Contact
                </span>
              </Link>

            </nav>

            {/* USER */}

            <div className="dashboard-user-area">

              <div className="dashboard-user-info">

                <p className="dashboard-user-name">
                  {user?.name}
                </p>

                <p className="dashboard-user-plan">
                  {user?.plan ||
                    "Free"}{" "}
                  Plan
                </p>

              </div>

            </div>

          </div>

        </div>

      </header>

      {/* =====================================================
          DASHBOARD LAYOUT
      ===================================================== */}

      <div className="dashboard-layout">

        {/* ===================================================
            SIDEBAR
        =================================================== */}

        <aside
          className={`dashboard-sidebar ${
            sidebarOpen
              ? "mobile-open"
              : ""
          }`}
        >

          <div className="dashboard-sidebar-title">

            <span>
              Workspace
            </span>

          </div>

          {/* DASHBOARD */}

          <NavLink
            to="/"
            onClick={
              closeSidebar
            }
            className={({
              isActive,
            }) =>
              `dashboard-sidebar-link ${
                isActive
                  ? "active"
                  : ""
              }`
            }
          >

            <LayoutDashboard
              size={18}
            />

            <span>
              Dashboard
            </span>

          </NavLink>

          {/* CLIENTS */}

          <NavLink
            to="/clients"
            onClick={
              closeSidebar
            }
            className={({
              isActive,
            }) =>
              `dashboard-sidebar-link ${
                isActive
                  ? "active"
                  : ""
              }`
            }
          >

            <Users size={18} />

            <span>
              Clients
            </span>

          </NavLink>

          {/* PROJECTS */}

          <NavLink
            to="/projects"
            onClick={
              closeSidebar
            }
            className={({
              isActive,
            }) =>
              `dashboard-sidebar-link ${
                isActive
                  ? "active"
                  : ""
              }`
            }
          >

            <FolderKanban
              size={18}
            />

            <span>
              Projects
            </span>

          </NavLink>

          {/* TASKS */}

          <NavLink
            to="/tasks"
            onClick={
              closeSidebar
            }
            className={({
              isActive,
            }) =>
              `dashboard-sidebar-link ${
                isActive
                  ? "active"
                  : ""
              }`
            }
          >

            <CheckSquare
              size={18}
            />

            <span>
              Tasks
            </span>

          </NavLink>

          {/* TIME */}

          <NavLink
            to="/time"
            onClick={
              closeSidebar
            }
            className={({
              isActive,
            }) =>
              `dashboard-sidebar-link ${
                isActive
                  ? "active"
                  : ""
              }`
            }
          >

            <Clock3 size={18} />

            <span>
              Time Tracking
            </span>

          </NavLink>

          {/* INVOICES */}

          <NavLink
            to="/invoices"
            onClick={
              closeSidebar
            }
            className={({
              isActive,
            }) =>
              `dashboard-sidebar-link ${
                isActive
                  ? "active"
                  : ""
              }`
            }
          >

            <Receipt size={18} />

            <span>
              Invoices
            </span>

          </NavLink>

          {/* SIDEBAR BOTTOM */}

          <div className="dashboard-sidebar-bottom">

            <button
              type="button"
              onClick={() => {
                closeSidebar();
                logout();
              }}
              className="dashboard-sidebar-logout"
            >

              <LogOut
                size={18}
              />

              <span>
                Logout
              </span>

            </button>

            <NavLink
              to="/settings"
              onClick={
                closeSidebar
              }
              className={({
                isActive,
              }) =>
                `dashboard-sidebar-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >

              <Settings
                size={18}
              />

              <span>
                Settings
              </span>

            </NavLink>

          </div>

        </aside>

        {/* MOBILE OVERLAY */}

        {sidebarOpen && (
          <div
            className="dashboard-sidebar-overlay"
            onClick={
              closeSidebar
            }
            aria-hidden="true"
          />
        )}

        {/* ===================================================
            MAIN
        =================================================== */}

        <main className="dashboard-main">

          {/* WELCOME */}

          <div className="dashboard-welcome">

            <h2>
              Dashboard
            </h2>

            <p>
              Welcome back,{" "}
              {user?.name}.
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div className="dashboard-error">
              {error}
            </div>
          )}

          {/* =================================================
              STATS
          ================================================= */}

          <div className="dashboard-stats">

            {/* TOTAL CLIENTS */}

            <div className="dashboard-stat-card">

              <Users className="dashboard-stat-icon clients-icon" />

              <p className="dashboard-stat-label">
                Total Clients
              </p>

              <h3 className="dashboard-stat-value">
                {loading
                  ? "..."
                  : dashboardData.totalClients}
              </h3>

            </div>

            {/* ACTIVE PROJECTS */}

            <div className="dashboard-stat-card">

              <FolderKanban className="dashboard-stat-icon projects-icon" />

              <p className="dashboard-stat-label">
                Active Projects
              </p>

              <h3 className="dashboard-stat-value">
                {loading
                  ? "..."
                  : actualActiveProjects}
              </h3>

            </div>

            {/* =================================================
                COMPLETED PROJECTS
            ================================================= */}

            <div className="dashboard-stat-card completed-project-card">

              <CheckSquare className="dashboard-stat-icon completed-icon" />

              <p className="dashboard-stat-label">
                Completed Projects
              </p>

              {/* COMPLETED COUNT */}

              <h3 className="dashboard-stat-value">
                {loading
                  ? "..."
                  : actualCompletedProjects}
              </h3>

              {!loading && (
                <>

                  {/* COUNT + PERCENTAGE */}

                  <div className="project-completion-info">

                    <span>
                      {actualCompletedProjects}{" "}
                      of{" "}
                      {actualTotalProjects}{" "}
                      projects:-
                    </span>

                    <strong>
                      ({projectCompletionPercentage}%)
                    </strong>

                  </div>

                  {/* PROGRESS BAR */}

                  <div className="project-completion-bar">

                    <div
                      className="project-completion-fill"
                      style={{
                        width: `${projectCompletionPercentage}%`,
                      }}
                    />

                  </div>

                </>
              )}

            </div>

            {/* PENDING INVOICES */}

            <div className="dashboard-stat-card">

              <Receipt className="dashboard-stat-icon invoices-icon" />

              <p className="dashboard-stat-label">
                Pending Invoices
              </p>

              <h3 className="dashboard-stat-value">
                {loading
                  ? "..."
                  : formatCurrency(
                      dashboardData.outstandingAmount
                    )}
              </h3>

              {!loading && (
                <small className="dashboard-stat-extra">

                  {
                    dashboardData.pendingInvoiceCount
                  }{" "}

                  invoice
                  {dashboardData.pendingInvoiceCount !==
                  1
                    ? "s"
                    : ""}

                </small>
              )}

            </div>

            {/* TOTAL REVENUE */}

            <div className="dashboard-stat-card">

              <Receipt className="dashboard-stat-icon revenue-icon" />

              <p className="dashboard-stat-label">
                Total Revenue
              </p>

              <h3 className="dashboard-stat-value">
                {loading
                  ? "..."
                  : formatCurrency(
                      dashboardData.totalRevenue
                    )}
              </h3>

              {!loading && (
                <small className="dashboard-stat-extra">

                  {
                    dashboardData.paidInvoiceCount
                  }{" "}

                  paid invoice
                  {dashboardData.paidInvoiceCount !==
                  1
                    ? "s"
                    : ""}

                </small>
              )}

            </div>

            {/* OUTSTANDING */}

            <div className="dashboard-stat-card">

              <Receipt className="dashboard-stat-icon outstanding-icon" />

              <p className="dashboard-stat-label">
                Outstanding
              </p>

              <h3 className="dashboard-stat-value">
                {loading
                  ? "..."
                  : formatCurrency(
                      dashboardData.outstandingAmount
                    )}
              </h3>

            </div>

          </div>

          {/* =================================================
              TODAY'S TASKS
          ================================================= */}

          <section className="dashboard-todays-tasks-card">

            <div className="dashboard-overview-header dashboard-tasks-header">

              <div>

                <h3>
                  Today's Tasks
                </h3>

                <p>
                  Work you want to
                  complete today
                </p>

              </div>

              <Link
                to="/tasks"
                className="dashboard-overview-link"
              >
                View All
              </Link>

            </div>

            {/* TASK FORM */}

            {taskFormOpen && (
              <div className="dashboard-task-form">

                <div className="dashboard-task-form-header">

                  <h4>
                    Add Work / Task
                  </h4>

                  <button
                    type="button"
                    className="dashboard-task-form-close"
                    onClick={() => {
                      setTaskFormOpen(
                        false
                      );

                      setTaskError(
                        ""
                      );
                    }}
                  >
                    <X size={18} />
                  </button>

                </div>

                <div className="dashboard-task-form-grid">

                  {/* TASK NAME */}

                  <div className="dashboard-task-field dashboard-task-field-full">

                    <label htmlFor="dashboard-task-name">
                      Task Name
                    </label>

                    <input
                      id="dashboard-task-name"
                      type="text"
                      value={taskName}
                      onChange={(
                        event
                      ) => {
                        setTaskName(
                          event.target
                            .value
                        );

                        setTaskError(
                          ""
                        );
                      }}
                      placeholder="e.g. Login Page"
                    />

                  </div>

                  {/* PROJECT */}

                  <div className="dashboard-task-field">

                    <label htmlFor="dashboard-task-project">
                      Select Project
                    </label>

                    <select
  id="dashboard-task-project"
  value={taskProject}
  onChange={(event) => {
    const value = event.target.value;

    setTaskProject(value);

    if (value !== "__OTHER_PROJECT__") {
      setCustomProjectName("");
    }

    setTaskError("");
  }}
>
  <option value="">
    No Project
  </option>

  {projectOptions.map((project) => (
    <option
      key={String(project.id)}
      value={String(project.id)}
    >
      {project.name}
    </option>
  ))}

  {/* CUSTOM PROJECT */}
  <option value="__OTHER_PROJECT__">
    Other
  </option>
</select>

                  </div>



                  {taskProject === "__OTHER_PROJECT__" && (
  <div className="dashboard-task-field dashboard-task-custom-field">
    <label htmlFor="dashboard-custom-project">
      Custom Project Name
    </label>

    <input
      id="dashboard-custom-project"
      type="text"
      value={customProjectName}
      onChange={(event) => {
        setCustomProjectName(
          event.target.value
        );

        setTaskError("");
      }}
      placeholder="e.g. Client Website"
    />
  </div>
)}

                  {/* TASK TYPE */}

                  <div className="dashboard-task-field">

                    <label htmlFor="dashboard-task-type">
                      Task Type
                    </label>

                    <select
  id="dashboard-task-type"
  value={taskType}
  onChange={(event) => {
    const value = event.target.value;

    setTaskType(value);

    if (value !== "Other") {
      setCustomTaskType("");
    }

    setTaskError("");
  }}
>
  <option value="Update">
    Update
  </option>

  <option value="Create">
    Create
  </option>

  <option value="Other">
    Other
  </option>
</select>

                  </div>
                  {taskType === "Other" && (
  <div className="dashboard-task-field dashboard-task-custom-field">
    <label htmlFor="dashboard-custom-task-type">
      Custom Task Type
    </label>

    <input
      id="dashboard-custom-task-type"
      type="text"
      value={customTaskType}
      onChange={(event) => {
        setCustomTaskType(
          event.target.value
        );

        setTaskError("");
      }}
      placeholder="e.g. Client Discussion"
    />
  </div>
)}

                </div>

                {taskError && (
                  <p className="dashboard-task-form-error">
                    {taskError}
                  </p>
                )}

                <button
                  type="button"
                  className="dashboard-task-save-button"
                  onClick={
                    addTask
                  }
                >

                  <CheckSquare
                    size={17}
                  />

                  Save Task

                </button>

              </div>
            )}

            {/* TASK LIST */}

            <div className="dashboard-tasks-list">

              {todaysTasks.length ===
              0 ? (

                <div className="dashboard-tasks-empty">

                  <CheckSquare
                    size={22}
                  />

                  <div>

                    <strong>
                      No tasks for today
                    </strong>

                    <span>
                      Add your first
                      work/task below.
                    </span>

                  </div>

                </div>

              ) : (

                todaysTasks
                  .slice(0, 5)
                  .map(
                    (task) => (

                      <div
                        className={`dashboard-task-item ${
                          task.completed
                            ? "completed"
                            : ""
                        }`}
                        key={
                          task.id
                        }
                      >

                        {/* CHECKBOX */}

                        <label className="dashboard-task-check-wrap">

                          <input
                            type="checkbox"
                            checked={Boolean(
                              task.completed
                            )}
                            onChange={() =>
                              toggleTask(
                                task.id
                              )
                            }
                          />

                          <span className="dashboard-custom-checkbox">

                            {task.completed
                              ? "✓"
                              : ""}

                          </span>

                        </label>

                        {/* CONTENT */}

                        <div className="dashboard-task-content">

                          <div className="dashboard-task-title-row">

                            <strong>
                              {
                                task.name
                              }
                            </strong>

                            <span className="dashboard-task-type">
                              {task.type ||
                                "Other"}
                            </span>

                          </div>

                          <span className="dashboard-task-project">
                            {
                              task.projectName ||
                              "No Project"
                            }
                          </span>

                          {task.completed && (
                            <span className="dashboard-task-complete-text">
                              Work Complete
                            </span>
                          )}

                        </div>

                        {/* DELETE */}

                        <button
                          type="button"
                          className="dashboard-task-delete"
                          onClick={() =>
                            deleteTask(
                              task.id
                            )
                          }
                        >

                          <Trash2
                            size={17}
                          />

                        </button>

                      </div>

                    )
                  )

              )}

            </div>

            {/* ADD WORK */}

            <button
              type="button"
              className="dashboard-add-task-button"
              onClick={() => {
                setTaskFormOpen(
                  true
                );

                setTaskError(
                  ""
                );
              }}
            >

              <Plus size={18} />

              Add Work / Task

            </button>

          </section>

          {/* =================================================
              REVENUE OVERVIEW
          ================================================= */}

          <div className="dashboard-financial-section">

            <div className="dashboard-financial-header">

              <div>

                <h3>
                  Revenue Overview
                </h3>

                <p>
                  Paid invoice revenue
                  for this year
                </p>

              </div>

              <div className="dashboard-financial-total">

                {loading
                  ? "..."
                  : formatCurrency(
                      dashboardData.totalRevenue
                    )}

              </div>

            </div>

            <div className="dashboard-revenue-chart">

              {revenueByMonth.length ===
                0 &&
              !loading ? (

                <div className="dashboard-revenue-empty">
                  No revenue data
                  available yet.
                </div>

              ) : (

                revenueByMonth.map(
                  (
                    item,
                    index
                  ) => {

                    const revenue =
                      Number(
                        item.revenue ||
                          0
                      );

                    const height =
                      revenue > 0
                        ? Math.max(
                            (revenue /
                              maxRevenue) *
                              100,
                            8
                          )
                        : 4;

                    return (
                      <div
                        className="dashboard-revenue-column"
                        key={`${item.month}-${index}`}
                      >

                        <div className="dashboard-revenue-value">

                          {revenue >
                          0
                            ? formatCurrency(
                                revenue
                              )
                            : ""}

                        </div>

                        <div className="dashboard-revenue-bar-wrapper">

                          <div
                            className="dashboard-revenue-bar"
                            style={{
                              height: `${height}%`,
                            }}
                          />

                        </div>

                        <span>
                          {
                            item.month
                          }
                        </span>

                      </div>
                    );
                  }
                )

              )}

            </div>

          </div>

          {/* =================================================
              RECENT PROJECTS + INVOICES
          ================================================= */}

          <div className="dashboard-overview-grid">

            {/* RECENT PROJECTS */}

            <div className="dashboard-overview-card">

              <div className="dashboard-overview-header">

                <div>

                  <h3>
                    Recent Projects
                  </h3>

                  <p>
                    Latest projects
                    in your workspace
                  </p>

                </div>

                <Link
                  to="/projects"
                  className="dashboard-overview-link"
                >
                  View All
                </Link>

              </div>

              <div className="dashboard-overview-list">

                {loading ? (

                  <div className="dashboard-overview-empty">
                    Loading
                    projects...
                  </div>

                ) : recentProjects.length ===
                  0 ? (

                  <div className="dashboard-overview-empty">
                    No projects
                    found yet.
                  </div>

                ) : (

                  recentProjects
                    .slice(0, 2)
                    .map(
                      (
                        project
                      ) => (

                        <Link
                          to="/projects"
                          className="dashboard-overview-item dashboard-clickable-item"
                          key={
                            project._id
                          }
                        >

                          <div className="dashboard-overview-item-icon project">

                            <FolderKanban
                              size={18}
                            />

                          </div>

                          <div className="dashboard-overview-item-content">

                            <h4>
                              {
                                project.name
                              }
                            </h4>

                            <p>
                              {project
                                .client
                                ?.name ||
                                "No client"}
                            </p>

                          </div>

                          <div className="dashboard-overview-item-right">

                            <span
                              className={`dashboard-status ${
                                String(
                                  project.status ||
                                    ""
                                )
                                  .toLowerCase() ===
                                "completed"
                                  ? "completed"
                                  : "active"
                              }`}
                            >
                              {
                                project.status
                              }
                            </span>

                            {project.deadline && (
                              <small>
                                {formatDate(
                                  project.deadline
                                )}
                              </small>
                            )}

                          </div>

                        </Link>

                      )
                    )

                )}

              </div>

            </div>

            {/* RECENT INVOICES */}

            <div className="dashboard-overview-card">

              <div className="dashboard-overview-header">

                <div>

                  <h3>
                    Recent Invoices
                  </h3>

                  <p>
                    Latest invoices
                    created
                  </p>

                </div>

                <Link
                  to="/invoices"
                  className="dashboard-overview-link"
                >
                  View All
                </Link>

              </div>

              <div className="dashboard-overview-list">

                {loading ? (

                  <div className="dashboard-overview-empty">
                    Loading
                    invoices...
                  </div>

                ) : recentInvoices.length ===
                  0 ? (

                  <div className="dashboard-overview-empty">
                    No invoices
                    found yet.
                  </div>

                ) : (

                  recentInvoices
                    .slice(0, 2)
                    .map(
                      (
                        invoice
                      ) => (

                        <Link
                          to={`/invoices/${invoice._id}`}
                          className="dashboard-overview-item dashboard-clickable-item"
                          key={
                            invoice._id
                          }
                        >

                          <div className="dashboard-overview-item-icon invoice">

                            <Receipt
                              size={18}
                            />

                          </div>

                          <div className="dashboard-overview-item-content">

                            <h4>
                              {
                                invoice.invoiceNumber
                              }
                            </h4>

                            <p>
                              {invoice
                                .client
                                ?.name ||
                                "No client"}
                            </p>

                          </div>

                          <div className="dashboard-overview-item-right">

                            <strong>
                              {formatCurrency(
                                invoice.total
                              )}
                            </strong>

                            <span
                              className={`dashboard-status ${
                                invoice.status
                                  ?.toLowerCase()
                                  .replace(
                                    " ",
                                    "-"
                                  )
                              }`}
                            >
                              {
                                invoice.status
                              }
                            </span>

                          </div>

                        </Link>

                      )
                    )

                )}

              </div>

            </div>

          </div>

          {/* =================================================
              UPCOMING DEADLINES
          ================================================= */}

          <div className="dashboard-deadlines-card">

            <div className="dashboard-overview-header">

              <div>

                <h3>
                  Upcoming Deadlines
                </h3>

                <p>
                  Projects and tasks
                  that need your
                  attention
                </p>

              </div>

              

                <Link
  to="/upcoming-deadlines"
  className="dashboard-overview-link dashboard-view-all-button"
>
  View All
</Link>

              

            </div>

            <div className="dashboard-deadlines-list">

              {loading ? (

                <div className="dashboard-overview-empty">
                  Loading
                  deadlines...
                </div>

              ) : upcomingDeadlines.length ===
                0 ? (

                <div className="dashboard-overview-empty">
                  No upcoming
                  deadlines.
                </div>

              ) : (

                (
                  showAllDeadlines
                    ? upcomingDeadlines
                    : upcomingDeadlines.slice(
                        0,
                        2
                      )
                ).map(
                  (item) => (

                    <Link
                      to={
                        item.type ===
                        "Project"
                          ? "/projects"
                          : "/tasks"
                      }
                      className="dashboard-deadline-item dashboard-clickable-deadline"
                      key={`${item.type}-${item._id}`}
                    >

                      <div className="dashboard-deadline-icon">

                        <Clock3
                          size={18}
                        />

                      </div>

                      <div className="dashboard-deadline-content">

                        <div className="dashboard-deadline-title-row">

                          <h4>
                            {
                              item.title
                            }
                          </h4>

                          <span
                            className={`dashboard-deadline-type ${
                              item.type?.toLowerCase()
                            }`}
                          >
                            {
                              item.type
                            }
                          </span>

                        </div>

                        <p>

                          {item.type ===
                          "Project"
                            ? item.clientName
                            : item.projectName}

                        </p>

                      </div>

                      {/* ==========================================
    RIGHT SIDE DEADLINE
========================================== */}

<div className="dashboard-deadline-right">

  {/* DUE DATE */}

  <span className="dashboard-deadline-due">

    Due:{" "}

    {new Date(
      item.date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
      }
    )}

  </span>


  {/* DAYS LEFT */}

  {(() => {

    const deadlineStatus =
      getDaysLeft(
        item.date
      );

    return (

      <span
        className={`dashboard-deadline-remaining ${deadlineStatus.className}`}
      >

        {deadlineStatus.text}

      </span>

    );

  })()}

</div>

                    </Link>

                  )
                )

              )}

            </div>

          </div>

        </main>

      </div>

    </div>
  );
};

export default Dashboard;