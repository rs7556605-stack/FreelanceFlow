import React, {
  useEffect,
  useState,
} from "react";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  FolderKanban,
  ArrowLeft,
  Clock3,
  ReceiptText,
  ListChecks,
  Play,
  UserRound,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import API from "../services/api";

import "./Projects.css";

/* =========================================================
   PROJECT FORM
========================================================= */

const emptyForm = {
  name: "",
  description: "",
  client: "",
  status: "Active",
  budget: "",
  deadline: "",
};

/* =========================================================
   TASK STORAGE
========================================================= */

const TASK_STORAGE_KEY =
  "freelanceflow_tasks";

/* =========================================================
   EMPTY TASK FORM
========================================================= */

const emptyTaskForm = {
  name: "",
  type: "Create",
  description: "",
  priority: "Medium",
  dueDate: "",
  estimatedTime: "",
};

/* =========================================================
   PROJECTS
========================================================= */
const Projects = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /* =======================================================
     PROJECT STATES
  ======================================================= */

  const [projects, setProjects] =
    useState([]);

  const [clients, setClients] =
    useState([]);

  const [form, setForm] =
    useState(emptyForm);

  const [search, setSearch] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =======================================================
     PROJECT EXPANSION
  ======================================================= */

  const [
    expandedProjects,
    setExpandedProjects,
  ] = useState({});

  /* =======================================================
     PROJECT TASKS
  ======================================================= */

  const [
    projectTasks,
    setProjectTasks,
  ] = useState({});

  /* =======================================================
     ADD TASK MODAL
  ======================================================= */

  const [
    showTaskForm,
    setShowTaskForm,
  ] = useState(false);

  const [
    selectedTaskProject,
    setSelectedTaskProject,
  ] = useState(null);

  const [
    taskForm,
    setTaskForm,
  ] = useState(emptyTaskForm);

  const [
    customTaskType,
    setCustomTaskType,
  ] = useState("");

  const [
    taskSaving,
    setTaskSaving,
  ] = useState(false);

  const [
    taskError,
    setTaskError,
  ] = useState("");

  /* =======================================================
     TIME TRACKING
  ======================================================= */

  const [
    timeLogs,
    setTimeLogs,
  ] = useState([]);

  const [
    activeTimer,
    setActiveTimer,
  ] = useState(null);

  const [
    timerNow,
    setTimerNow,
  ] = useState(Date.now());

  /* =========================================================
     FETCH PROJECTS
  ========================================================= */

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await API.get("/projects");

      setProjects(
        response.data?.projects || []
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load projects"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     FETCH CLIENTS
  ========================================================= */

  const fetchClients = async () => {
    try {
      const response =
        await API.get("/clients");

      setClients(
        response.data?.clients || []
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load clients"
      );
    }
  };

  /* =========================================================
     READ LOCAL TASKS
  ========================================================= */

  const readProjectTasks = () => {
    try {
      const stored =
        localStorage.getItem(
          TASK_STORAGE_KEY
        );

      if (!stored) {
        return [];
      }

      const parsed =
        JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed;
    } catch (error) {
      console.error(
        "Task storage error:",
        error
      );

      return [];
    }
  };

  /* =========================================================
     GROUP TASKS BY PROJECT
  ========================================================= */

  const loadProjectTasks = () => {
    const allTasks =
      readProjectTasks();

    const grouped = {};

    allTasks.forEach((task) => {
      if (!task.projectId) {
        return;
      }

      const projectId =
        String(task.projectId);

      if (!grouped[projectId]) {
        grouped[projectId] = [];
      }

      grouped[projectId].push(task);
    });

    setProjectTasks(grouped);
  };

  /* =========================================================
     FETCH TIME LOGS
  ========================================================= */

  const loadProjectTimeData = async () => {
    try {
      const [
        logsResponse,
        activeResponse,
      ] = await Promise.all([
        API.get("/time"),
        API.get("/time/active"),
      ]);

      if (
        logsResponse.data?.success
      ) {
        setTimeLogs(
          logsResponse.data.timeLogs ||
            []
        );
      } else {
        setTimeLogs([]);
      }

      if (
        activeResponse.data?.success
      ) {
        setActiveTimer(
          activeResponse.data.timer ||
            null
        );
      } else {
        setActiveTimer(null);
      }
    } catch (error) {
      console.warn(
        "Time data error:",
        error
      );

      setTimeLogs([]);
      setActiveTimer(null);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchProjects();
    fetchClients();
    loadProjectTasks();
    loadProjectTimeData();
  }, []);




  /* =========================================================
   HIGHLIGHT PROJECT FROM UPCOMING DEADLINES
   ========================================================= */

useEffect(() => {
  const highlightProjectId =
    location.state?.highlightProjectId;

  if (
    !highlightProjectId ||
    !projects.length
  ) {
    return;
  }

  let findProjectTimer = null;
  let removeHighlightTimer = null;

  findProjectTimer = window.setTimeout(() => {
    const element =
      document.getElementById(
        `project-card-${highlightProjectId}`
      );

    if (!element) {
      return;
    }

    /* SCROLL TO EXACT PROJECT */
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    /* START BLINK */
    element.classList.add(
      "project-deadline-highlight"
    );

    /* REMOVE AFTER 8 SECONDS */
    removeHighlightTimer =
      window.setTimeout(() => {
        element.classList.remove(
          "project-deadline-highlight"
        );
      }, 8000);

    /* CLEAR NAVIGATION STATE */
    navigate(
      "/projects",
      {
        replace: true,
        state: {},
      }
    );
  }, 200);

  return () => {
    if (findProjectTimer) {
      window.clearTimeout(
        findProjectTimer
      );
    }

    if (removeHighlightTimer) {
      window.clearTimeout(
        removeHighlightTimer
      );
    }
  };
}, [
  projects,
  location.state?.highlightProjectId,
  navigate,
]);


  /* =========================================================
     LIVE TIMER REFRESH
  ========================================================= */

  useEffect(() => {
    if (!activeTimer) {
      return;
    }

    const interval =
      setInterval(() => {
        setTimerNow(
          Date.now()
        );
      }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [activeTimer]);

  /* =========================================================
     REFRESH TIME DATA
  ========================================================= */

  useEffect(() => {
    const interval =
      setInterval(() => {
        loadProjectTimeData();
      }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  /* =========================================================
     INPUT CHANGE
  ========================================================= */

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  /* =========================================================
     OPEN ADD PROJECT
  ========================================================= */

  const openAddForm = () => {
    setEditingId(null);

    setForm({
      ...emptyForm,
    });

    setError("");

    setShowForm(true);
  };

  /* =========================================================
     CLOSE PROJECT FORM
  ========================================================= */

  const closeForm = () => {
    setShowForm(false);

    setEditingId(null);

    setForm({
      ...emptyForm,
    });
  };

  /* =========================================================
     SAVE PROJECT
  ========================================================= */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        await API.put(
          `/projects/${editingId}`,
          form
        );
      } else {
        await API.post(
          "/projects",
          form
        );
      }

      closeForm();

      await fetchProjects();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to save project"
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     EDIT PROJECT
  ========================================================= */

  const handleEdit = (
    project
  ) => {
    setEditingId(
      project._id
    );

    setForm({
      name:
        project.name || "",

      description:
        project.description || "",

      client:
        project.client?._id ||
        project.client ||
        "",

      status:
        project.status ||
        "Active",

      budget:
        project.budget ?? "",

      deadline:
        project.deadline
          ? project.deadline.split(
              "T"
            )[0]
          : "",
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =========================================================
     DELETE PROJECT
  ========================================================= */

  const handleDelete = async (
    id
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this project?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await API.delete(
        `/projects/${id}`
      );

      setExpandedProjects(
        (previous) => {
          const updated = {
            ...previous,
          };

          delete updated[id];

          return updated;
        }
      );

      await fetchProjects();

      loadProjectTasks();

      await loadProjectTimeData();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete project"
      );
    }
  };

  /* =========================================================
     GET CLIENT ID
  ========================================================= */

  const getClientId = (
    project
  ) => {
    if (!project) {
      return "";
    }

    if (project.client?._id) {
      return project.client._id;
    }

    if (
      typeof project.client ===
      "string"
    ) {
      return project.client;
    }

    return "";
  };

  /* =========================================================
     GET PROJECT TASKS
  ========================================================= */

  const getProjectTaskList = (
    project
  ) => {
    if (!project?._id) {
      return [];
    }

    return (
      projectTasks[
        String(project._id)
      ] || []
    );
  };

  /* =========================================================
     TASK COMPLETED
  ========================================================= */

  const isTaskCompleted = (
    task
  ) => {
    return (
      Boolean(task.completed) ||
      String(
        task.status || ""
      ).toLowerCase() ===
        "completed"
    );
  };

  /* =========================================================
     PROJECT PROGRESS
  ========================================================= */

  const getProjectProgress = (
    project
  ) => {
    const tasks =
      getProjectTaskList(
        project
      );

    if (tasks.length === 0) {
      return 0;
    }

    const completed =
      tasks.filter(
        (task) =>
          isTaskCompleted(task)
      ).length;

    return Math.round(
      (completed /
        tasks.length) *
        100
    );
  };

  /* =========================================================
     TOGGLE PROJECT DETAILS
  ========================================================= */

  const toggleProjectDetails = (
    projectId
  ) => {
    setExpandedProjects(
      (previous) => ({
        ...previous,

        [projectId]:
          !previous[projectId],
      })
    );

    loadProjectTasks();
  };

  /* =========================================================
     TOGGLE TASK COMPLETE
  ========================================================= */

  const toggleProjectTask = (
    taskId
  ) => {
    try {
      const allTasks =
        readProjectTasks();

      const updatedTasks =
        allTasks.map(
          (task) => {
            if (
              String(task.id) !==
              String(taskId)
            ) {
              return task;
            }

            const completed =
              !isTaskCompleted(
                task
              );

            return {
              ...task,

              completed,

              status:
                completed
                  ? "Completed"
                  : "Pending",

              completedAt:
                completed
                  ? new Date().toISOString()
                  : null,
            };
          }
        );

      localStorage.setItem(
        TASK_STORAGE_KEY,
        JSON.stringify(
          updatedTasks
        )
      );

      loadProjectTasks();
    } catch (error) {
      console.error(
        "Task update error:",
        error
      );
    }
  };

  /* =========================================================
     OPEN EXACT CLIENT
  ========================================================= */

  const openProjectClient = (
    project
  ) => {
    const clientId =
      getClientId(project);

    if (!clientId) {
      setError(
        "This project does not have an associated client."
      );

      return;
    }

    /*
      Clients page should read:
      /clients?client=CLIENT_ID
    */

    navigate(
      `/clients?client=${encodeURIComponent(
        clientId
      )}`
    );
  };

  /* =========================================================
     OPEN EXACT PROJECT TASKS
  ========================================================= */

  const openProjectTasks = (
    project
  ) => {
    navigate(
      "/tasks",
      {
        state: {
          projectId:
            project._id,

          projectName:
            project.name,

          clientId:
            getClientId(project),

          clientName:
            project.client?.name ||
            "",
        },
      }
    );
  };

  /* =========================================================
     OPEN ADD TASK FORM
  ========================================================= */

  const openAddTaskForm = (
    project
  ) => {
    setSelectedTaskProject(
      project
    );

    setTaskForm({
      ...emptyTaskForm,
    });

    setCustomTaskType("");

    setTaskError("");

    setShowTaskForm(true);
  };

  /* =========================================================
     CLOSE ADD TASK FORM
  ========================================================= */

  const closeAddTaskForm = () => {
    setShowTaskForm(false);

    setSelectedTaskProject(
      null
    );

    setTaskForm({
      ...emptyTaskForm,
    });

    setCustomTaskType("");

    setTaskError("");
  };

  /* =========================================================
     TASK FORM CHANGE
  ========================================================= */

  const handleTaskFormChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setTaskForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

    setTaskError("");
  };

  /* =========================================================
     CREATE PROJECT TASK
  ========================================================= */

  const handleCreateProjectTask = (
    event
  ) => {
    event.preventDefault();

    if (!selectedTaskProject) {
      return;
    }

    /* TASK NAME */

    if (!taskForm.name.trim()) {
      setTaskError(
        "Task name is required."
      );

      return;
    }

    /* CUSTOM TASK TYPE */

    if (
      taskForm.type ===
        "Other" &&
      !customTaskType.trim()
    ) {
      setTaskError(
        "Please enter a custom task type."
      );

      return;
    }

    try {
      setTaskSaving(true);
      setTaskError("");

      const allTasks =
        readProjectTasks();

      /* FINAL TYPE */

      const finalTaskType =
        taskForm.type === "Other"
          ? customTaskType.trim()
          : taskForm.type;

      /* CLIENT ID */

      const clientId =
        getClientId(
          selectedTaskProject
        );

      /* NEW TASK */

      const newTask = {
        id: `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,

        name:
          taskForm.name.trim(),

        title:
          taskForm.name.trim(),

        type:
          finalTaskType,

        description:
          taskForm.description.trim(),

        projectId:
          selectedTaskProject._id,

        projectName:
          selectedTaskProject.name,

        clientId,

        clientName:
          selectedTaskProject
            .client?.name || "",

        priority:
          taskForm.priority ||
          "Medium",

        status: "Pending",

        dueDate:
          taskForm.dueDate || "",

        estimatedTime:
          taskForm.estimatedTime ||
          "",

        completed: false,

        date:
          new Date()
            .toISOString()
            .slice(0, 10),

        createdAt:
          new Date().toISOString(),
      };

      /* SAVE */

      const updatedTasks = [
        newTask,
        ...allTasks,
      ];

      localStorage.setItem(
        TASK_STORAGE_KEY,
        JSON.stringify(
          updatedTasks
        )
      );

      /* REFRESH */

      loadProjectTasks();

      /* KEEP PROJECT OPEN */

      setExpandedProjects(
        (previous) => ({
          ...previous,

          [selectedTaskProject._id]:
            true,
        })
      );

      closeAddTaskForm();
    } catch (error) {
      console.error(
        "Create task error:",
        error
      );

      setTaskError(
        "Failed to create task."
      );
    } finally {
      setTaskSaving(false);
    }
  };

  /* =========================================================
     START PROJECT TIMER
  ========================================================= */

  const startProjectTimer =
    async (project) => {
      if (!project?._id) {
        setError(
          "Project information is missing."
        );

        return;
      }

      try {
        setError("");

        /*
          CHECK ACTIVE TIMER
        */

        const activeResponse =
          await API.get(
            "/time/active"
          );

        const existingTimer =
          activeResponse.data?.timer;

        /*
          IF TIMER ALREADY RUNNING
        */

        if (existingTimer) {
          const activeProjectId =
            existingTimer.project?._id ||
            existingTimer.project ||
            "";

          /*
            SAME PROJECT
          */

          if (
            String(
              activeProjectId
            ) ===
            String(project._id)
          ) {
            navigate(
              `/time?project=${encodeURIComponent(
                project._id
              )}&client=${encodeURIComponent(
                getClientId(project)
              )}`
            );

            return;
          }

          /*
            DIFFERENT PROJECT
          */

          setError(
            "Another project timer is already running. Stop it first from Time Tracking."
          );

          return;
        }

        /*
          START REAL BACKEND TIMER
        */

        const response =
          await API.post(
            "/time/start",
            {
              project:
                project._id,

              task: null,
            }
          );

        if (
          response.data?.success
        ) {
          setActiveTimer(
            response.data.timer ||
              null
          );

          await loadProjectTimeData();

          /*
            OPEN TIME TRACKER
            WITH EXACT PROJECT
          */

          navigate(
            `/time?project=${encodeURIComponent(
              project._id
            )}&client=${encodeURIComponent(
              getClientId(project)
            )}`
          );
        }
      } catch (error) {
        console.error(
          "Start project timer error:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to start project timer."
        );
      }
    };

  /* =========================================================
     GET TIME LOG PROJECT ID
  ========================================================= */

  const getTimeLogProjectId = (
    log
  ) => {
    return (
      log?.project?._id ||
      log?.project ||
      ""
    );
  };

  /* =========================================================
     PROJECT TRACKED SECONDS
  ========================================================= */

  const getProjectTrackedSeconds =
    (projectId) => {
      let totalSeconds = 0;

      /*
        SAVED TIME LOGS
      */

      timeLogs.forEach(
        (log) => {
          const logProjectId =
            getTimeLogProjectId(
              log
            );

          if (
            String(
              logProjectId
            ) ===
            String(projectId)
          ) {
            totalSeconds +=
              Number(
                log.duration
              ) || 0;
          }
        }
      );

      /*
        ACTIVE TIMER
      */

      const activeProjectId =
        activeTimer?.project?._id ||
        activeTimer?.project ||
        "";

      if (
        activeTimer &&
        String(
          activeProjectId
        ) ===
          String(projectId) &&
        activeTimer.startTime
      ) {
        const startedAt =
          new Date(
            activeTimer.startTime
          ).getTime();

        const liveSeconds =
          Math.max(
            0,
            Math.floor(
              (timerNow -
                startedAt) /
                1000
            )
          );

        totalSeconds +=
          liveSeconds;
      }

      return totalSeconds;
    };

  /* =========================================================
     FORMAT TIME
  ========================================================= */

  const formatTrackedTime = (
    totalSeconds
  ) => {
    const safeSeconds =
      Math.max(
        0,
        Number(
          totalSeconds
        ) || 0
      );

    const hours =
      Math.floor(
        safeSeconds / 3600
      );

    const minutes =
      Math.floor(
        (safeSeconds % 3600) /
          60
      );

    const seconds =
      safeSeconds % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  /* =========================================================
     DEADLINE
  ========================================================= */

  const formatDeadline = (
    deadline
  ) => {
    if (!deadline) {
      return "No deadline";
    }

    return new Date(
      deadline
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredProjects =
    projects.filter(
      (project) => {
        const query =
          search
            .toLowerCase()
            .trim();

        if (!query) {
          return true;
        }

        return (
          project.name
            ?.toLowerCase()
            .includes(query) ||
          project.description
            ?.toLowerCase()
            .includes(query) ||
          project.client?.name
            ?.toLowerCase()
            .includes(query)
        );
      }
    );

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="projects-page">
      <div className="projects-container">

        {/* ==================================================
            BACK BUTTON
        ================================================== */}

        <button
          className="projects-back-btn"
          onClick={() =>
            navigate("/")
          }
        >
          <ArrowLeft size={18} />

          <span>
            Back to Dashboard
          </span>
        </button>

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="projects-header">

          <div>
            <h1 className="projects-title">
              Projects
            </h1>

            <p className="projects-subtitle">
              Manage your projects,
              tasks and progress.
            </p>
          </div>

          <button
            className="add-project-btn"
            onClick={
              openAddForm
            }
          >
            <Plus size={18} />

            <span>
              Add Project
            </span>
          </button>

        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="projects-error">
            {error}
          </div>
        )}

        {/* ==================================================
            SEARCH
        ================================================== */}

        <div className="projects-search-box">

          <div className="projects-search-wrapper">

            <Search
              size={19}
              className="projects-search-icon"
            />

            <input
              type="text"
              className="projects-search-input"
              placeholder="Search projects..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

        </div>

        {/* ==================================================
            FORM
        ================================================== */}

        {showForm && (
          <div className="project-form">

            <div className="project-form-header">

              <h2 className="project-form-title">
                {editingId
                  ? "Edit Project"
                  : "Add Project"}
              </h2>

              <button
                type="button"
                className="close-project-form-btn"
                onClick={
                  closeForm
                }
              >
                <X size={22} />
              </button>

            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="project-form-grid"
            >

              {/* NAME */}

              <div className="project-form-group">

                <label className="project-form-label">
                  Project Name *
                </label>

                <input
                  className="project-form-input"
                  name="name"
                  value={form.name}
                  onChange={
                    handleChange
                  }
                  required
                  placeholder="Website Development"
                />

              </div>

              {/* CLIENT */}

              <div className="project-form-group">

                <label className="project-form-label">
                  Client *
                </label>

                <select
                  className="project-form-input"
                  name="client"
                  value={
                    form.client
                  }
                  onChange={
                    handleChange
                  }
                  required
                >

                  <option value="">
                    Select Client
                  </option>

                  {clients.map(
                    (client) => (
                      <option
                        key={
                          client._id
                        }
                        value={
                          client._id
                        }
                      >
                        {
                          client.name
                        }
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* DESCRIPTION */}

              <div className="project-form-group project-full-width">

                <label className="project-form-label">
                  Description
                </label>

                <textarea
                  className="project-form-input project-form-textarea"
                  name="description"
                  value={
                    form.description
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Describe the project..."
                  rows="4"
                />

              </div>

              {/* STATUS */}

              <div className="project-form-group">

                <label className="project-form-label">
                  Status
                </label>

                <select
                  className="project-form-input"
                  name="status"
                  value={
                    form.status
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="Active">
                    Active
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                </select>

              </div>

              {/* BUDGET */}

              <div className="project-form-group">

                <label className="project-form-label">
                  Budget (₹)
                </label>

                <input
                  className="project-form-input"
                  type="number"
                  min="0"
                  name="budget"
                  value={
                    form.budget
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="25000"
                />

              </div>

              {/* DEADLINE */}

              <div className="project-form-group">

                <label className="project-form-label">
                  Deadline
                </label>

                <input
                  className="project-form-input"
                  type="date"
                  name="deadline"
                  value={
                    form.deadline
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

              {/* BUTTONS */}

              <div className="project-form-actions">

                <button
                  type="button"
                  className="cancel-project-btn"
                  onClick={
                    closeForm
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-project-btn"
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Project"
                    : "Save Project"}
                </button>

              </div>

            </form>

          </div>
        )}



        {/* ==================================================
            PROJECT LIST
        ================================================== */}

        {loading ? (
          <div className="projects-empty">

            <div className="projects-loading-spinner" />

            <p>
              Loading projects...
            </p>

          </div>
        ) : filteredProjects.length ===
          0 ? (
          <div className="projects-empty">

            <FolderKanban
              size={42}
            />

            <h3>
              No projects found
            </h3>

            <p>
              Add your first
              project to get
              started.
            </p>

          </div>
        ) : (
          <div className="projects-grid">

            {filteredProjects.map(
              (project) => {
                const tasks =
                  getProjectTaskList(
                    project
                  );

                const completedTasks =
                  tasks.filter(
                    (task) =>
                      isTaskCompleted(
                        task
                      )
                  ).length;

                const progress =
                  getProjectProgress(
                    project
                  );

                const expanded =
                  Boolean(
                    expandedProjects[
                      project._id
                    ]
                  );

                const trackedSeconds =
                  getProjectTrackedSeconds(
                    project._id
                  );

                const timerRunning =
                  activeTimer &&
                  String(
                    activeTimer
                      .project?._id ||
                      activeTimer.project ||
                      ""
                  ) ===
                    String(
                      project._id
                    );

                return (
                  <div
                    key={
                      project._id
                    }
                     id={`project-card-${project._id}`}
                    className={`project-card ${
                      expanded
                        ? "project-card-expanded"
                        : "project-card-collapsed"
                    }`}
                  >

                    {/* =================================
                        HEADER
                    ================================= */}

                    <div className="project-card-header">

                      <div className="project-card-heading">

                        <h3>
                          {
                            project.name
                          }
                        </h3>

                        <button
                          type="button"
                          className="project-client-name-btn"
                          onClick={() =>
                            openProjectClient(
                              project
                            )
                          }
                        >

                          <UserRound
                            size={14}
                          />

                          <span>
                            {
                              project
                                .client
                                ?.name ||
                              "No client"
                            }
                          </span>

                        </button>

                      </div>

                      <div className="project-card-icon-actions">

                        <button
                          type="button"
                          className="project-icon-edit"
                          onClick={() =>
                            handleEdit(
                              project
                            )
                          }
                          title="Edit Project"
                        >
                          <Pencil
                            size={17}
                          />
                        </button>

                        <button
                          type="button"
                          className="project-icon-delete"
                          onClick={() =>
                            handleDelete(
                              project._id
                            )
                          }
                          title="Delete Project"
                        >
                          <Trash2
                            size={17}
                          />
                        </button>

                      </div>

                    </div>

                    {/* =================================
                        STATUS
                    ================================= */}

                    <div className="project-status-row">

                      <span
                        className={`project-status ${String(
                          project.status ||
                            "Active"
                        )
                          .toLowerCase()
                          .replace(
                            /\s+/g,
                            "-"
                          )}`}
                      >
                        {
                          project.status ||
                          "Active"
                        }
                      </span>

                    </div>

                    {/* =================================
                        COMPACT INFO
                    ================================= */}

                    <div className="project-basic-info">

                      <div className="project-info-box">

                        <span>
                          Budget
                        </span>

                        <strong>
                          ₹
                          {Number(
                            project.budget ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                      </div>

                      <div className="project-info-box">

                        <span>
                          Deadline
                        </span>

                        <strong>
                          {formatDeadline(
                            project.deadline
                          )}
                        </strong>

                      </div>

                      <div className="project-info-box">

                        <span>
                          Tasks
                        </span>

                        <strong>
                          {
                            completedTasks
                          }
                          /
                          {
                            tasks.length
                          }
                        </strong>

                      </div>

                    </div>

                    {/* =================================
                        PROGRESS
                    ================================= */}

                    <div className="project-progress-section">

                      <div className="project-progress-header">

                        <span>
                          Progress
                        </span>

                        <strong>
                          {progress}%
                        </strong>

                      </div>

                      <div className="project-progress-track">

                        <div
                          className="project-progress-fill"
                          style={{
                            width: `${progress}%`,
                          }}
                        />

                      </div>

                    </div>

                    {/* =================================
                        TASK SUMMARY
                    ================================= */}

                    <div className="project-task-summary">

                      <div className="project-task-summary-left">

                        <ListChecks
                          size={19}
                        />

                        <strong>
                          Tasks
                        </strong>

                        <span>
                          {
                            completedTasks
                          }
                          /
                          {
                            tasks.length
                          }
                        </span>

                      </div>

                      <button
                        type="button"
                        className="project-view-btn"
                        onClick={() =>
                          toggleProjectDetails(
                            project._id
                          )
                        }
                      >

                        {expanded ? (
                          <>
                            <ChevronUp
                              size={16}
                            />

                            Hide
                          </>
                        ) : (
                          <>
                            <ChevronDown
                              size={16}
                            />

                            View
                          </>
                        )}

                      </button>

                    </div>

                    {/* =================================
                        EXPANDED AREA
                    ================================= */}

                    {expanded && (
                      <div className="project-expanded-area">

                        {/* DESCRIPTION */}

                        {project.description && (
                          <div className="project-description">

                            <span>
                              Description
                            </span>

                            <p>
                              {
                                project.description
                              }
                            </p>

                          </div>
                        )}

                        {/* TASK LIST */}

                        <div className="project-task-list">

                          <div className="project-task-list-header">

                            <div>

                              <ListChecks
                                size={16}
                              />

                              <strong>
                                Project Tasks
                              </strong>

                            </div>

                            <span>
                              {
                                completedTasks
                              }
                              /
                              {
                                tasks.length
                              }
                            </span>

                          </div>

                          {tasks.length ===
                          0 ? (
                            <div className="project-no-tasks">

                              <ListChecks
                                size={22}
                              />

                              <p>
                                No tasks
                                added for
                                this project.
                              </p>

                            </div>
                          ) : (
                            <div className="project-task-items">

                              {tasks.map(
                                (task) => {
                                  const completed =
                                    isTaskCompleted(
                                      task
                                    );

                                  return (
                                    <div
                                      key={
                                        task.id
                                      }
                                      className={`project-task-item ${
                                        completed
                                          ? "completed"
                                          : ""
                                      }`}
                                    >

                                      <button
                                        type="button"
                                        className={`project-task-checkbox ${
                                          completed
                                            ? "checked"
                                            : ""
                                        }`}
                                        onClick={() =>
                                          toggleProjectTask(
                                            task.id
                                          )
                                        }
                                      >
                                        {completed && (
                                          <Check
                                            size={
                                              14
                                            }
                                          />
                                        )}
                                      </button>

                                      <div className="project-task-content">

                                        <strong>
                                          {
                                            task.name ||
                                            task.title ||
                                            "Untitled Task"
                                          }
                                        </strong>

                                        {task.description && (
                                          <p>
                                            {
                                              task.description
                                            }
                                          </p>
                                        )}

                                        <div className="project-task-meta">

                                          {task.type && (
                                            <span>
                                              {
                                                task.type
                                              }
                                            </span>
                                          )}

                                          {task.priority && (
                                            <span>
                                              {
                                                task.priority
                                              }
                                            </span>
                                          )}

                                          {task.dueDate && (
                                            <span>
                                              Due:{" "}
                                              {
                                                task.dueDate
                                              }
                                            </span>
                                          )}

                                          {task.estimatedTime && (
                                            <span>
                                              {
                                                task.estimatedTime
                                              }
                                            </span>
                                          )}

                                        </div>

                                      </div>

                                    </div>
                                  );
                                }
                              )}

                            </div>
                          )}

                        </div>

                        {/* =================================
                            TIME TRACKED
                        ================================= */}

                        <div className="project-time-box">

                          <div className="project-time-icon">

                            <Clock3
                              size={18}
                            />

                          </div>

                          <div>

                            <span>
                              Time Tracked
                            </span>

                            <strong>
                              {formatTrackedTime(
                                trackedSeconds
                              )}

                              {timerRunning && (
                                <small className="project-live-dot">
                                  ● Live
                                </small>
                              )}
                            </strong>

                          </div>

                        </div>

                        {/* =================================
                            ACTION BUTTONS
                        ================================= */}

                        <div className="project-actions">

                          {/* CLIENT */}

                          <button
                            type="button"
                            onClick={() =>
                              openProjectClient(
                                project
                              )
                            }
                          >

                            <UserRound
                              size={19}
                            />

                            <span>
                              Client
                            </span>

                          </button>

                          {/* TASKS */}

                          <button
                            type="button"
                            onClick={() =>
                              openProjectTasks(
                                project
                              )
                            }
                          >

                            <ListChecks
                              size={19}
                            />

                            <span>
                              Tasks
                            </span>

                          </button>

                          {/* ADD TASKS */}

                          <button
                            type="button"
                            onClick={() =>
                              openAddTaskForm(
                                project
                              )
                            }
                          >

                            <Plus
                              size={19}
                            />

                            <span>
                              Add Tasks
                            </span>

                          </button>

                          {/* START TIMER */}

                          <button
                            type="button"
                            className={
                              timerRunning
                                ? "timer-running"
                                : ""
                            }
                            onClick={() =>
                              startProjectTimer(
                                project
                              )
                            }
                          >

                            <Play
                              size={19}
                            />

                            <span>
                              {timerRunning
                                ? "Timer Running"
                                : "Start Timer"}
                            </span>

                          </button>

                          {/* INVOICE */}

                          <button
                            type="button"
                            className="project-invoice-btn"
                            onClick={() =>
                              navigate(
                                `/invoices/create?project=${encodeURIComponent(
                                  project._id
                                )}&client=${encodeURIComponent(
                                  getClientId(
                                    project
                                  )
                                )}`
                              )
                            }
                          >

                            <ReceiptText
                              size={19}
                            />

                            <span>
                              Create Invoice
                            </span>

                          </button>

                        </div>

                      </div>
                    )}

                  </div>
                );
              }
            )}

          </div>
        )}

        {/* ==================================================
            ADD TASK MODAL
        ================================================== */}

        {showTaskForm && (
          <div
            className="project-task-modal-overlay"
            onMouseDown={(
              event
            ) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeAddTaskForm();
              }
            }}
          >

            <div className="project-task-modal">

              {/* HEADER */}

              <div className="project-task-modal-header">

                <div>

                  <h2>
                    Add Task
                  </h2>

                  <p>
                    Create a custom
                    task for{" "}
                    <strong>
                      {
                        selectedTaskProject?.name
                      }
                    </strong>
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    closeAddTaskForm
                  }
                >
                  <X size={19} />
                </button>

              </div>

              {/* ERROR */}

              {taskError && (
                <div className="project-task-error">
                  {taskError}
                </div>
              )}

              {/* FORM */}

              <form
                onSubmit={
                  handleCreateProjectTask
                }
              >

                {/* PROJECT INFO */}

                <div className="project-task-project-info">

                  <span>
                    Project
                  </span>

                  <strong>
                    {
                      selectedTaskProject?.name
                    }
                  </strong>

                  <small>
                    Client:{" "}
                    {
                      selectedTaskProject
                        ?.client?.name ||
                      "No client"
                    }
                  </small>

                </div>

                <div className="project-task-form-grid">

                  {/* TASK NAME */}

                  <div className="project-task-field project-task-field-full">

                    <label>
                      Task Name *
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={
                        taskForm.name
                      }
                      onChange={
                        handleTaskFormChange
                      }
                      placeholder="e.g. Create Login Page"
                      required
                    />

                  </div>

                  {/* TYPE */}

                  <div className="project-task-field">

                    <label>
                      Task Type
                    </label>

                    <select
                      name="type"
                      value={
                        taskForm.type
                      }
                      onChange={(
                        event
                      ) => {
                        const value =
                          event.target.value;

                        setTaskForm(
                          (
                            previous
                          ) => ({
                            ...previous,
                            type: value,
                          })
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

                      <option value="Create">
                        Create
                      </option>

                      <option value="Design">
                        Design
                      </option>

                      <option value="Development">
                        Development
                      </option>

                      <option value="Testing">
                        Testing
                      </option>

                      <option value="Research">
                        Research
                      </option>

                      <option value="Meeting">
                        Meeting
                      </option>

                      <option value="Content">
                        Content
                      </option>

                      <option value="Bug Fix">
                        Bug Fix
                      </option>

                      <option value="Other">
                        Other
                      </option>

                    </select>

                  </div>

                  {/* CUSTOM TYPE */}

                  {taskForm.type ===
                    "Other" && (
                    <div className="project-task-field custom-task-type-group">

                      <label>
                        Custom Task Type{" "}
                        <span>
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        value={
                          customTaskType
                        }
                        onChange={(
                          event
                        ) =>
                          setCustomTaskType(
                            event
                              .target
                              .value
                          )
                        }
                        placeholder="e.g. Deployment"
                        required
                      />

                    </div>
                  )}

                  {/* PRIORITY */}

                  <div className="project-task-field">

                    <label>
                      Priority
                    </label>

                    <select
                      name="priority"
                      value={
                        taskForm.priority
                      }
                      onChange={
                        handleTaskFormChange
                      }
                    >

                      <option value="Low">
                        Low
                      </option>

                      <option value="Medium">
                        Medium
                      </option>

                      <option value="High">
                        High
                      </option>

                      <option value="Urgent">
                        Urgent
                      </option>

                    </select>

                  </div>

                  {/* DESCRIPTION */}

                  <div className="project-task-field project-task-field-full">

                    <label>
                      Description
                    </label>

                    <textarea
                      name="description"
                      value={
                        taskForm.description
                      }
                      onChange={
                        handleTaskFormChange
                      }
                      placeholder="Describe what needs to be done..."
                      rows="4"
                    />

                  </div>

                  {/* DUE DATE */}

                  <div className="project-task-field">

                    <label>
                      Due Date
                    </label>

                    <input
                      type="date"
                      name="dueDate"
                      value={
                        taskForm.dueDate
                      }
                      onChange={
                        handleTaskFormChange
                      }
                    />

                  </div>

                  {/* ESTIMATED TIME */}

                  <div className="project-task-field">

                    <label>
                      Estimated Time
                    </label>

                    <input
                      type="text"
                      name="estimatedTime"
                      value={
                        taskForm.estimatedTime
                      }
                      onChange={
                        handleTaskFormChange
                      }
                      placeholder="e.g. 2h"
                    />

                  </div>

                </div>

                {/* BUTTONS */}

                <div className="project-task-form-actions">

                  <button
                    type="button"
                    className="project-task-cancel"
                    onClick={
                      closeAddTaskForm
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="project-task-save"
                    disabled={
                      taskSaving
                    }
                  >

                    <Plus
                      size={16}
                    />

                    {taskSaving
                      ? "Saving..."
                      : "Create Task"}

                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default Projects;