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

  const [allProjects, setAllProjects] =
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
  // DEADLINES
  // =========================================================

  const [showAllDeadlines, setShowAllDeadlines] =
    useState(false);

  // =========================================================
  // TASKS
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

  // =========================================================
  // TODAY KEY
  // =========================================================

  const getTodayKey = () => {
    const now = new Date();

    const year = now.getFullYear();

    const month = String(
      now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      now.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =========================================================
  // TASK STORAGE KEY
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
      const saved = JSON.parse(
        localStorage.getItem(
          getTaskStorageKey()
        ) || "[]"
      );

      if (!Array.isArray(saved)) {
        return [];
      }

      return saved.filter(
        (task) =>
          task.date ===
          getTodayKey()
      );
    } catch (err) {
      console.error(
        "Task storage error:",
        err
      );

      return [];
    }
  };

  // =========================================================
  // SAVE LOCAL TASKS
  // =========================================================

  const saveLocalTasks = (
    tasks
  ) => {
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
    } catch (err) {
      console.error(
        "Task save error:",
        err
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
      Boolean(
        task.completed
      ) ||
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
    if (!user) {
      return;
    }

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
            "Could not load projects:",
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
    const trimmedName =
      taskName.trim();

    if (!trimmedName) {
      setTaskError(
        "Please enter a task name."
      );
      return;
    }

    if (
      taskProject ===
        "__OTHER_PROJECT__" &&
      !customProjectName.trim()
    ) {
      setTaskError(
        "Please enter a custom project name."
      );
      return;
    }

    if (
      taskType === "Other" &&
      !customTaskType.trim()
    ) {
      setTaskError(
        "Please enter a custom task type."
      );
      return;
    }

    const selectedProject =
      projectOptions.find(
        (project) =>
          String(
            project.id
          ) ===
          String(
            taskProject
          )
      );

    const finalProjectName =
      taskProject ===
      "__OTHER_PROJECT__"
        ? customProjectName.trim()
        : selectedProject?.name ||
          "No Project";

    const finalProjectId =
      taskProject ===
      "__OTHER_PROJECT__"
        ? ""
        : selectedProject?.id ||
          "";

    const finalTaskType =
      taskType === "Other"
        ? customTaskType.trim()
        : taskType;

    const newTask = {
      id: `task-${Date.now()}`,

      name: trimmedName,

      projectId:
        finalProjectId,

      projectName:
        finalProjectName,

      type:
        finalTaskType,

      displayType:
        finalTaskType,

      completed: false,

      date: getTodayKey(),

      createdAt:
        new Date().toISOString(),
    };

    const updatedTasks = [
      newTask,
      ...todaysTasks,
    ];

    setTodaysTasks(
      updatedTasks
    );

    saveLocalTasks(
      updatedTasks
    );

    setTaskName("");
    setTaskProject("");
    setCustomProjectName("");
    setTaskType("Update");
    setCustomTaskType("");
    setTaskError("");
    setTaskFormOpen(false);
  };

  // =========================================================
  // TOGGLE TASK
  // =========================================================

  const toggleTask = (
    taskId
  ) => {
    const updatedTasks =
      todaysTasks.map(
        (task) =>
          String(
            task.id
          ) ===
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
          String(
            task.id
          ) !==
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
  // FETCH DASHBOARD
  // =========================================================

  useEffect(() => {
    const fetchDashboard =
      async () => {
        try {
          setLoading(true);
          setError("");

          const [
            dashboardResult,
            clientsResult,
            projectsResult,
            invoicesResult,
          ] =
            await Promise.allSettled([
              API.get(
                "/dashboard/summary"
              ),

              API.get(
                "/clients"
              ),

              API.get(
                "/projects"
              ),

              API.get(
                "/invoices"
              ),
            ]);

          // =================================================
          // SUMMARY
          // =================================================

          let summaryData = {};
          let summaryResponseData =
            {};

          if (
            dashboardResult.status ===
            "fulfilled"
          ) {
            summaryResponseData =
              dashboardResult
                .value?.data ||
              {};

            summaryData =
              summaryResponseData
                .stats ||
              {};
          }

          // =================================================
          // LIST HELPER
          // =================================================

          const getList = (
            result,
            keys
          ) => {
            if (
              result.status !==
              "fulfilled"
            ) {
              return [];
            }

            const data =
              result.value?.data;

            for (
              const key of keys
            ) {
              if (
                Array.isArray(
                  data?.[key]
                )
              ) {
                return data[key];
              }
            }

            if (
              Array.isArray(
                data
              )
            ) {
              return data;
            }

            return [];
          };

          // =================================================
          // CLIENTS
          // =================================================

          const clients =
            getList(
              clientsResult,
              [
                "clients",
                "data",
              ]
            );

          // =================================================
          // PROJECTS
          // =================================================

          const projects =
            getList(
              projectsResult,
              [
                "projects",
                "data",
              ]
            );

          // =================================================
          // INVOICES
          // =================================================

          const invoices =
            getList(
              invoicesResult,
              [
                "invoices",
                "data",
              ]
            );

          console.log(
            "Dashboard Clients:",
            clients
          );

          console.log(
            "Dashboard Projects:",
            projects
          );

          console.log(
            "Dashboard Invoices:",
            invoices
          );

          // =================================================
          // CLIENT COUNT
          // =================================================

          const totalClients =
            clients.length >
            0
              ? clients.length
              : Number(
                  summaryData.totalClients ||
                    0
                );

          // =================================================
          // PROJECT STATUS
          // =================================================

          const completedProjects =
            projects.filter(
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

                return [
                  "completed",
                  "complete",
                  "done",
                  "finished",
                ].includes(
                  status
                );
              }
            ).length;

          const activeProjects =
            projects.length >
            0
              ? Math.max(
                  projects.length -
                    completedProjects,
                  0
                )
              : Number(
                  summaryData.activeProjects ||
                    0
                );

          // =================================================
          // RECENT PROJECTS
          // =================================================

          const sortedProjects =
            [
              ...projects,
            ].sort(
              (a, b) => {
                const dateA =
                  new Date(
                    a?.createdAt ||
                      a?.updatedAt ||
                      0
                  ).getTime();

                const dateB =
                  new Date(
                    b?.createdAt ||
                      b?.updatedAt ||
                      0
                  ).getTime();

                return (
                  dateB -
                  dateA
                );
              }
            );

          const recentProjectsData =
            sortedProjects.length >
            0
              ? sortedProjects.slice(
                  0,
                  5
                )
              : Array.isArray(
                  summaryData.recentProjects
                )
              ? summaryData.recentProjects
              : [];

          // =================================================
          // RECENT INVOICES
          // =================================================

          const sortedInvoices =
            [
              ...invoices,
            ].sort(
              (a, b) => {
                const dateA =
                  new Date(
                    a?.createdAt ||
                      a?.invoiceDate ||
                      a?.updatedAt ||
                      0
                  ).getTime();

                const dateB =
                  new Date(
                    b?.createdAt ||
                      b?.invoiceDate ||
                      b?.updatedAt ||
                      0
                  ).getTime();

                return (
                  dateB -
                  dateA
                );
              }
            );

          const recentInvoicesData =
            sortedInvoices.length >
            0
              ? sortedInvoices.slice(
                  0,
                  5
                )
              : Array.isArray(
                  summaryData.recentInvoices
                )
              ? summaryData.recentInvoices
              : [];

          // =================================================
          // INVOICE HELPERS
          // =================================================

          const getInvoiceStatus =
            (invoice) =>
              String(
                invoice?.status ||
                  ""
              )
                .trim()
                .toLowerCase();

          const isPending =
            (invoice) => {
              const status =
                getInvoiceStatus(
                  invoice
                );

              return [
                "pending",
                "unpaid",
                "due",
                "overdue",
              ].includes(
                status
              );
            };

          const isPaid =
            (invoice) => {
              const status =
                getInvoiceStatus(
                  invoice
                );

              return [
                "paid",
                "payment received",
                "payment_received",
              ].includes(
                status
              );
            };

          const invoiceAmount =
            (invoice) =>
              Number(
                invoice?.total ??
                  invoice?.amount ??
                  invoice?.grandTotal ??
                  0
              );

          // =================================================
          // INVOICE COUNTS
          // =================================================

          let pendingInvoiceCount =
            Number(
              summaryData.pendingInvoiceCount ||
                0
            );

          let paidInvoiceCount =
            Number(
              summaryData.paidInvoiceCount ||
                0
            );

          let totalRevenue =
            Number(
              summaryData.totalRevenue ||
                0
            );

          let outstandingAmount =
            Number(
              summaryData.outstandingAmount ||
                0
            );

          // =================================================
          // CALCULATE FROM ACTUAL INVOICES
          // =================================================

          if (
            invoices.length >
            0
          ) {
            pendingInvoiceCount =
              invoices.filter(
                isPending
              ).length;

            paidInvoiceCount =
              invoices.filter(
                isPaid
              ).length;

            totalRevenue =
              invoices
                .filter(
                  isPaid
                )
                .reduce(
                  (
                    total,
                    invoice
                  ) =>
                    total +
                    invoiceAmount(
                      invoice
                    ),
                  0
                );

            outstandingAmount =
              invoices
                .filter(
                  isPending
                )
                .reduce(
                  (
                    total,
                    invoice
                  ) =>
                    total +
                    invoiceAmount(
                      invoice
                    ),
                  0
                );
          }

          // =================================================
          // MONTHLY REVENUE CHART
          // =================================================

          const currentYear =
            new Date().getFullYear();

          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];

          const monthlyRevenue =
            monthNames.map(
              (
                month,
                monthIndex
              ) => ({
                month,
                monthIndex,
                revenue: 0,
              })
            );

          invoices.forEach(
            (invoice) => {
              if (
                !isPaid(
                  invoice
                )
              ) {
                return;
              }

              const invoiceDate =
                invoice?.invoiceDate ||
                invoice?.createdAt ||
                invoice?.updatedAt;

              if (
                !invoiceDate
              ) {
                return;
              }

              const date =
                new Date(
                  invoiceDate
                );

              if (
                Number.isNaN(
                  date.getTime()
                )
              ) {
                return;
              }

              if (
                date.getFullYear() !==
                currentYear
              ) {
                return;
              }

              const amount =
                invoiceAmount(
                  invoice
                );

              if (
                Number.isNaN(
                  amount
                )
              ) {
                return;
              }

              monthlyRevenue[
                date.getMonth()
              ].revenue +=
                amount;
            }
          );

          setRevenueByMonth(
            monthlyRevenue
          );

          console.log(
            "Monthly Revenue:",
            monthlyRevenue
          );

          // =================================================
          // SET DASHBOARD
          // =================================================

          setDashboardData({
            totalClients,

            activeProjects,

            completedProjects,

            pendingInvoiceCount,

            paidInvoiceCount,

            totalRevenue,

            outstandingAmount,
          });

          // =================================================
          // RECENT PROJECTS
          // =================================================

          setRecentProjects(
            recentProjectsData
          );

          // =================================================
          // RECENT INVOICES
          // =================================================

          setRecentInvoices(
            recentInvoicesData
          );

          // =================================================
          // UPCOMING DEADLINES
          // =================================================

          const summaryDeadlines =
            summaryResponseData
              ?.upcomingDeadlines;

          if (
            Array.isArray(
              summaryDeadlines
            ) &&
            summaryDeadlines.length >
              0
          ) {
            setUpcomingDeadlines(
              summaryDeadlines
            );
          } else {
            const projectDeadlines =
              projects
                .filter(
                  (project) =>
                    project?.deadline
                )
                .sort(
                  (a, b) =>
                    new Date(
                      a.deadline
                    ) -
                    new Date(
                      b.deadline
                    )
                )
                .slice(
                  0,
                  5
                )
                .map(
                  (project) => ({
                    _id:
                      project?._id ||
                      project?.id,

                    type:
                      "Project",

                    title:
                      project?.name ||
                      project?.title ||
                      "Untitled Project",

                    clientName:
                      project
                        ?.client
                        ?.name ||
                      project?.clientName ||
                      "No client",

                    projectName:
                      project?.name ||
                      project?.title ||
                      "Untitled Project",

                    date:
                      project.deadline,
                  })
                );

            setUpcomingDeadlines(
              projectDeadlines
            );
          }

          // =================================================
          // SERVER TASKS
          // =================================================

          const serverTaskList =
            Array.isArray(
              summaryResponseData
                ?.todaysTasks
            )
              ? summaryResponseData
                  .todaysTasks
              : [];

          const serverTasks =
            serverTaskList.map(
              (
                task,
                index
              ) =>
                normalizeTask(
                  task,
                  index
                )
            );

          // =================================================
          // LOCAL TASKS
          // =================================================

          const localTasks =
            readLocalTasks();

          // =================================================
          // COMBINE
          // =================================================

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

    fetchDashboard();
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
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
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

  // =========================================================
  // DAYS LEFT
  // =========================================================

  const getDaysLeft = (
    date
  ) => {
    if (!date) {
      return {
        text: "No date",
        className: "normal",
      };
    }

    const today =
      new Date();

    const deadline =
      new Date(date);

    today.setHours(
      0,
      0,
      0,
      0
    );

    deadline.setHours(
      0,
      0,
      0,
      0
    );

    const difference =
      deadline.getTime() -
      today.getTime();

    const daysLeft =
      Math.ceil(
        difference /
          (1000 *
            60 *
            60 *
            24)
      );

    if (
      daysLeft < 0
    ) {
      const overdueDays =
        Math.abs(
          daysLeft
        );

      return {
        text: `🔴 ${overdueDays} ${
          overdueDays === 1
            ? "day"
            : "days"
        } overdue`,

        className:
          "overdue",
      };
    }

    if (
      daysLeft === 0
    ) {
      return {
        text: "⚠️ Due today",
        className: "today",
      };
    }

    if (
      daysLeft === 1
    ) {
      return {
        text: "⚠️ Tomorrow",
        className: "urgent",
      };
    }

    return {
      text: `🟢 ${daysLeft} days left`,
      className:
        "normal",
    };
  };

  // =========================================================
  // PROJECT OPTIONS
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
  // PROJECT STATISTICS
  // =========================================================

  const projectStatsSource =
    allProjects.length >
    0
      ? allProjects
      : recentProjects;

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

            return [
              "completed",
              "complete",
              "done",
              "finished",
            ].includes(
              status
            );
          }
        ).length
      : Number(
          dashboardData.completedProjects ||
            0
        );

  const actualActiveProjects =
    Math.max(
      actualTotalProjects -
        actualCompletedProjects,
      0
    );

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
  // REVENUE CHART MAX
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

            <button
              type="button"
              className="dashboard-menu-toggle"
              onClick={() =>
                setSidebarOpen(
                  (prev) =>
                    !prev
                )
              }
            >
              {sidebarOpen ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>

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

            <div className="dashboard-user-area">

              <div className="dashboard-user-info">

                <p className="dashboard-user-name">
                  {user?.name ||
                    user?.username ||
                    "User"}
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
          LAYOUT
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

        {sidebarOpen && (
          <div
            className="dashboard-sidebar-overlay"
            onClick={
              closeSidebar
            }
          />
        )}

        {/* ===================================================
            MAIN
        =================================================== */}

        <main className="dashboard-main">

          {/* =================================================
              WELCOME
          ================================================= */}

          <div className="dashboard-welcome">

            <h2>
              Dashboard
            </h2>

            <p>
              Welcome back,{" "}
              {user?.name ||
                user?.username ||
                "User"}
              .
            </p>

          </div>

          {error && (
            <div className="dashboard-error">
              {error}
            </div>
          )}

          {/* =================================================
              STATS
          ================================================= */}

          <div className="dashboard-stats">

            {/* CLIENTS */}

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

            {/* COMPLETED PROJECTS */}

            <div className="dashboard-stat-card">

              <CheckSquare className="dashboard-stat-icon completed-icon" />

              <p className="dashboard-stat-label">
                Completed Projects
              </p>

              <h3 className="dashboard-stat-value">
                {loading
                  ? "..."
                  : actualCompletedProjects}
              </h3>

              {!loading && (
                <>
                  <div className="project-completion-info">

                    <span>
                      {
                        actualCompletedProjects
                      }{" "}
                      of{" "}
                      {
                        actualTotalProjects
                      }{" "}
                      projects
                    </span>

                    <strong>
                      (
                      {
                        projectCompletionPercentage
                      }
                      %)
                    </strong>

                  </div>

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

            {/* PENDING */}

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

            {/* REVENUE */}

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
              TODAY TASKS
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

                  <div className="dashboard-task-field dashboard-task-field-full">

                    <label>
                      Task Name
                    </label>

                    <input
                      type="text"
                      value={
                        taskName
                      }
                      onChange={(
                        e
                      ) => {
                        setTaskName(
                          e.target
                            .value
                        );

                        setTaskError(
                          ""
                        );
                      }}
                      placeholder="e.g. Login Page"
                    />

                  </div>

                  <div className="dashboard-task-field">

                    <label>
                      Select Project
                    </label>

                    <select
                      value={
                        taskProject
                      }
                      onChange={(
                        e
                      ) => {
                        const value =
                          e.target
                            .value;

                        setTaskProject(
                          value
                        );

                        if (
                          value !==
                          "__OTHER_PROJECT__"
                        ) {
                          setCustomProjectName(
                            ""
                          );
                        }

                        setTaskError(
                          ""
                        );
                      }}
                    >

                      <option value="">
                        No Project
                      </option>

                      {projectOptions.map(
                        (
                          project
                        ) => (
                          <option
                            key={String(
                              project.id
                            )}
                            value={String(
                              project.id
                            )}
                          >
                            {
                              project.name
                            }
                          </option>
                        )
                      )}

                      <option value="__OTHER_PROJECT__">
                        Other
                      </option>

                    </select>

                  </div>

                  {taskProject ===
                    "__OTHER_PROJECT__" && (
                    <div className="dashboard-task-field">

                      <label>
                        Custom Project Name
                      </label>

                      <input
                        type="text"
                        value={
                          customProjectName
                        }
                        onChange={(
                          e
                        ) => {
                          setCustomProjectName(
                            e.target
                              .value
                          );

                          setTaskError(
                            ""
                          );
                        }}
                        placeholder="e.g. Client Website"
                      />

                    </div>
                  )}

                  <div className="dashboard-task-field">

                    <label>
                      Task Type
                    </label>

                    <select
                      value={
                        taskType
                      }
                      onChange={(
                        e
                      ) => {
                        const value =
                          e.target
                            .value;

                        setTaskType(
                          value
                        );

                        if (
                          value !==
                          "Other"
                        ) {
                          setCustomTaskType(
                            ""
                          );
                        }

                        setTaskError(
                          ""
                        );
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

                  {taskType ===
                    "Other" && (
                    <div className="dashboard-task-field">

                      <label>
                        Custom Task Type
                      </label>

                      <input
                        type="text"
                        value={
                          customTaskType
                        }
                        onChange={(
                          e
                        ) => {
                          setCustomTaskType(
                            e.target
                              .value
                          );

                          setTaskError(
                            ""
                          );
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
                  .slice(
                    0,
                    5
                  )
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

                        <div className="dashboard-task-content">

                          <div className="dashboard-task-title-row">

                            <strong>
                              {
                                task.name
                              }
                            </strong>

                            <span className="dashboard-task-type">
                              {task.displayType ||
                                task.type ||
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

<section className="dashboard-financial-section">

  <div className="dashboard-financial-header">

    <div>
      <h3>
        Revenue Overview
      </h3>

      <p>
        Paid invoice revenue for this year
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

  {/* =================================================
      REVENUE CHART
  ================================================= */}

  <div className="dashboard-revenue-chart">

    {loading ? (

      <div className="dashboard-revenue-empty">
        Loading revenue...
      </div>

    ) : (

      <div className="dashboard-revenue-bars">

        {revenueByMonth.map((item) => {

          const revenue =
            Number(item.revenue || 0);

          const height =
            revenue > 0
              ? Math.max(
                  (revenue / maxRevenue) * 100,
                  8
                )
              : 3;

          return (

            <div
              className="dashboard-revenue-column"
              key={item.month}
            >

              {/* TOOLTIP */}

              <div className="dashboard-revenue-tooltip">
                {formatCurrency(revenue)}
              </div>

              {/* BAR */}

              <div className="dashboard-revenue-bar-wrapper">

                <div
                  className={`dashboard-revenue-bar ${
                    revenue > 0
                      ? "has-revenue"
                      : "empty"
                  }`}
                  style={{
                    height: `${height}%`,
                  }}
                />

              </div>

              {/* MONTH */}

              <span className="dashboard-revenue-month">
                {item.month}
              </span>

            </div>

          );

        })}

      </div>

    )}

  </div>

</section>

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
                    .slice(
                      0,
                      2
                    )
                    .map(
                      (
                        project
                      ) => (
                        <Link
                          to="/projects"
                          className="dashboard-overview-item dashboard-clickable-item"
                          key={
                            project._id ||
                            project.id
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
                                project.name ||
                                project.title ||
                                "Untitled Project"
                              }
                            </h4>

                            <p>
                              {project
                                .client
                                ?.name ||
                                project.clientName ||
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
                                project.status ||
                                "Active"
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
                    .slice(
                      0,
                      2
                    )
                    .map(
                      (
                        invoice
                      ) => (
                        <Link
                          to={`/invoices/${
                            invoice._id ||
                            invoice.id
                          }`}
                          className="dashboard-overview-item dashboard-clickable-item"
                          key={
                            invoice._id ||
                            invoice.id
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
                                invoice.invoiceNumber ||
                                invoice.number ||
                                "Invoice"
                              }
                            </h4>

                            <p>
                              {invoice
                                .client
                                ?.name ||
                                invoice.clientName ||
                                "No client"}
                            </p>

                          </div>

                          <div className="dashboard-overview-item-right">

                            <strong>
                              {formatCurrency(
                                invoice.total ??
                                  invoice.amount ??
                                  0
                              )}
                            </strong>

                            <span
                              className={`dashboard-status ${
                                String(
                                  invoice.status ||
                                    ""
                                )
                                  .toLowerCase()
                                  .replace(
                                    " ",
                                    "-"
                                  )
                              }`}
                            >
                              {
                                invoice.status ||
                                "Pending"
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
  to="/Upcoming-Deadlines"
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
                      key={`${item.type}-${item._id || item.id}`}
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

                      <div className="dashboard-deadline-right">

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

                        {(() => {
                          const status =
                            getDaysLeft(
                              item.date
                            );

                          return (
                            <span
                              className={`dashboard-deadline-remaining ${status.className}`}
                            >
                              {
                                status.text
                              }
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
