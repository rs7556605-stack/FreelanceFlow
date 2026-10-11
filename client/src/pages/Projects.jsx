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
   TASK FORM
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

  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);

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

  const [expandedProjects, setExpandedProjects] =
    useState({});

  /* =======================================================
     PROJECT TASKS
  ======================================================= */

  const [projectTasks, setProjectTasks] =
    useState({});

  /* =======================================================
     ADD TASK MODAL
  ======================================================= */

  const [showTaskForm, setShowTaskForm] =
    useState(false);

  const [selectedTaskProject, setSelectedTaskProject] =
    useState(null);

  const [taskForm, setTaskForm] =
    useState(emptyTaskForm);

  const [taskSaving, setTaskSaving] =
    useState(false);

  const [taskError, setTaskError] =
    useState("");

  /* =======================================================
     TIME TRACKING
  ======================================================= */

  const [timeLogs, setTimeLogs] =
    useState([]);

  const [activeTimer, setActiveTimer] =
    useState(null);

  const [timerNow, setTimerNow] =
    useState(Date.now());

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
      console.error(
        "Fetch projects error:",
        error
      );

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
      console.error(
        "Fetch clients error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load clients"
      );
    }
  };

  /* =========================================================
     LOAD TASKS FROM BACKEND

     IMPORTANT:
     No localStorage here.
     Tasks are loaded from MongoDB.
  ========================================================= */

  const loadProjectTasks = async () => {
    try {
      const response =
        await API.get("/tasks");

      const allTasks =
        response.data?.tasks ||
        response.data?.data?.tasks ||
        [];

      const grouped = {};

      allTasks.forEach((task) => {
        const projectId =
          task.project?._id ||
          task.project?.id ||
          task.projectId ||
          task.project ||
          "";

        if (!projectId) {
          return;
        }

        const key = String(projectId);

        if (!grouped[key]) {
          grouped[key] = [];
        }

        grouped[key].push(task);
      });

      setProjectTasks(grouped);
    } catch (error) {
      console.error(
        "Load project tasks error:",
        error
      );

      setProjectTasks({});
    }
  };

  /* =========================================================
     TIME DATA
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
          logsResponse.data.timeLogs || []
        );
      } else {
        setTimeLogs([]);
      }

      if (
        activeResponse.data?.success
      ) {
        setActiveTimer(
          activeResponse.data.timer || null
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
     HIGHLIGHT PROJECT
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

    let findTimer;
    let removeTimer;

    findTimer = window.setTimeout(() => {
      const element =
        document.getElementById(
          `project-card-${highlightProjectId}`
        );

      if (!element) {
        return;
      }

      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      element.classList.add(
        "project-deadline-highlight"
      );

      removeTimer =
        window.setTimeout(() => {
          element.classList.remove(
            "project-deadline-highlight"
          );
        }, 8000);

      navigate(
        "/projects",
        {
          replace: true,
          state: {},
        }
      );
    }, 200);

    return () => {
      if (findTimer) {
        window.clearTimeout(findTimer);
      }

      if (removeTimer) {
        window.clearTimeout(removeTimer);
      }
    };
  }, [
    projects,
    location.state?.highlightProjectId,
    navigate,
  ]);

  /* =========================================================
     LIVE TIMER
  ========================================================= */

  useEffect(() => {
    if (!activeTimer) {
      return;
    }

    const interval =
      setInterval(() => {
        setTimerNow(Date.now());
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
     PROJECT FORM CHANGE
  ========================================================= */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     OPEN PROJECT FORM
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

  const handleSubmit = async (event) => {
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
      await loadProjectTasks();
    } catch (error) {
      console.error(
        "Save project error:",
        error
      );

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

  const handleEdit = (project) => {
    setEditingId(project._id);

    setForm({
      name: project.name || "",

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
          ? String(project.deadline).split("T")[0]
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

  const handleDelete = async (id) => {
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
      await loadProjectTasks();
      await loadProjectTimeData();
    } catch (error) {
      console.error(
        "Delete project error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to delete project"
      );
    }
  };

  /* =========================================================
     GET CLIENT ID
  ========================================================= */

  const getClientId = (project) => {
    if (!project) {
      return "";
    }

    return (
      project.client?._id ||
      project.client?.id ||
      project.client ||
      ""
    );
  };

  /* =========================================================
     GET TASK ID
  ========================================================= */

  const getTaskId = (task) => {
    return (
      task?._id ||
      task?.id ||
      ""
    );
  };

  /* =========================================================
     GET TASK PROJECT ID
  ========================================================= */

  const getTaskProjectId = (task) => {
    return (
      task?.project?._id ||
      task?.project?.id ||
      task?.projectId ||
      task?.project ||
      ""
    );
  };

  /* =========================================================
     GET TASK CLIENT ID
  ========================================================= */

  const getTaskClientId = (task) => {
    return (
      task?.client?._id ||
      task?.client?.id ||
      task?.clientId ||
      task?.client ||
      ""
    );
  };

  /* =========================================================
     GET PROJECT TASK LIST
  ========================================================= */

  const getProjectTaskList = (project) => {
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

  const isTaskCompleted = (task) => {
    return (
      Boolean(task?.completed) ||
      String(
        task?.status || ""
      ).toLowerCase() === "completed"
    );
  };

  /* =========================================================
     PROJECT PROGRESS
  ========================================================= */

  const getProjectProgress = (project) => {
    const tasks =
      getProjectTaskList(project);

    if (!tasks.length) {
      return 0;
    }

    const completed =
      tasks.filter(
        (task) =>
          isTaskCompleted(task)
      ).length;

    return Math.round(
      (completed / tasks.length) *
        100
    );
  };

  /* =========================================================
     TOGGLE PROJECT DETAILS
  ========================================================= */

  const toggleProjectDetails = async (
    projectId
  ) => {
    setExpandedProjects(
      (previous) => ({
        ...previous,
        [projectId]:
          !previous[projectId],
      })
    );

    await loadProjectTasks();
  };

  /* =========================================================
     TOGGLE TASK COMPLETE

     IMPORTANT:
     Updates MongoDB instead of localStorage.
  ========================================================= */

  const toggleProjectTask = async (
    task
  ) => {
    try {
      const taskId =
        getTaskId(task);

      const clientId =
        getTaskClientId(task);

      const projectId =
        getTaskProjectId(task);

      if (!taskId) {
        setError(
          "Task ID is missing."
        );
        return;
      }

      if (!clientId || !projectId) {
        setError(
          "Task client or project information is missing."
        );
        return;
      }

      const completed =
        !isTaskCompleted(task);

      await API.put(
        `/tasks/${taskId}`,
        {
          client: clientId,
          project: projectId,

          title:
            task.title ||
            task.name ||
            "Untitled Task",

          description:
            task.description || "",

          status:
            completed
              ? "Completed"
              : "Pending",

          priority:
            task.priority ||
            "Medium",

          dueDate:
            task.dueDate || null,

          estimatedTime:
            task.estimatedTime || "",

          type:
            ["Create", "Update", "Other"].includes(
              task.type
            )
              ? task.type
              : "Other",
        }
      );

      await loadProjectTasks();
    } catch (error) {
      console.error(
        "Toggle task error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update task"
      );
    }
  };

  /* =========================================================
     OPEN CLIENT
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

    navigate(
      `/clients?client=${encodeURIComponent(
        clientId
      )}`
    );
  };

  /* =========================================================
     OPEN TASKS PAGE
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
     OPEN ADD TASK
  ========================================================= */

  const openAddTaskForm = (
    project
  ) => {
    const clientId =
      getClientId(project);

    if (!clientId) {
      setError(
        "Please assign a client to this project before adding a task."
      );

      return;
    }

    setSelectedTaskProject(
      project
    );

    setTaskForm({
      ...emptyTaskForm,
    });

    setTaskError("");
    setShowTaskForm(true);
  };

  /* =========================================================
     CLOSE ADD TASK
  ========================================================= */

  const closeAddTaskForm = () => {
    setShowTaskForm(false);

    setSelectedTaskProject(
      null
    );

    setTaskForm({
      ...emptyTaskForm,
    });

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

     IMPORTANT:
     Task goes to MongoDB through /api/tasks.
  ========================================================= */

  const handleCreateProjectTask =
    async (event) => {
      event.preventDefault();

      if (!selectedTaskProject) {
        return;
      }

      if (!taskForm.name.trim()) {
        setTaskError(
          "Task name is required."
        );

        return;
      }

      const clientId =
        getClientId(
          selectedTaskProject
        );

      const projectId =
        selectedTaskProject._id;

      if (!clientId) {
        setTaskError(
          "This project has no client."
        );

        return;
      }

      if (!projectId) {
        setTaskError(
          "Project ID is missing."
        );

        return;
      }

      try {
        setTaskSaving(true);
        setTaskError("");

        /*
          Backend currently accepts:
          Create / Update / Other
        */

        const taskType =
          ["Create", "Update", "Other"].includes(
            taskForm.type
          )
            ? taskForm.type
            : "Other";

        const payload = {
          client: clientId,

          project: projectId,

          title:
            taskForm.name.trim(),

          description:
            taskForm.description.trim(),

          status: "Pending",

          priority:
            taskForm.priority ||
            "Medium",

          dueDate:
            taskForm.dueDate ||
            null,

          estimatedTime:
            taskForm.estimatedTime ||
            "",

          type: taskType,
        };

        console.log(
          "Creating project task:",
          payload
        );

        const response =
          await API.post(
            "/tasks",
            payload
          );

        console.log(
          "Task created:",
          response.data
        );

        /*
          Reload from MongoDB.
        */

        await loadProjectTasks();

        /*
          Keep project expanded.
        */

        setExpandedProjects(
          (previous) => ({
            ...previous,

            [projectId]: true,
          })
        );

        /*
          Close modal.
        */

        closeAddTaskForm();
      } catch (error) {
        console.error(
          "Create task error:",
          error
        );

        setTaskError(
          error.response?.data?.message ||
            error.response?.data?.error ||
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

        const activeResponse =
          await API.get(
            "/time/active"
          );

        const existingTimer =
          activeResponse.data?.timer;

        if (existingTimer) {
          const activeProjectId =
            existingTimer.project?._id ||
            existingTimer.project ||
            "";

          if (
            String(activeProjectId) ===
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

          setError(
            "Another project timer is already running. Stop it first from Time Tracking."
          );

          return;
        }

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
          "Start timer error:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to start project timer."
        );
      }
    };

  /* =========================================================
     TIME LOG PROJECT ID
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
     TRACKED SECONDS
  ========================================================= */

  const getProjectTrackedSeconds =
    (projectId) => {
      let totalSeconds = 0;

      timeLogs.forEach(
        (log) => {
          const logProjectId =
            getTimeLogProjectId(
              log
            );

          if (
            String(logProjectId) ===
            String(projectId)
          ) {
            totalSeconds +=
              Number(
                log.duration
              ) || 0;
          }
        }
      );

      const activeProjectId =
        activeTimer?.project?._id ||
        activeTimer?.project ||
        "";

      if (
        activeTimer &&
        String(activeProjectId) ===
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
        Number(totalSeconds) || 0
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
     FORMAT DEADLINE
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
     SEARCH PROJECT
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

        {/* BACK */}

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

        {/* HEADER */}

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

        {/* ERROR */}

        {error && (
          <div className="projects-error">
            {error}
          </div>
        )}

        {/* SEARCH */}

        <div className="projects-search-box">

          <div className="projects-search-wrapper">

            <Search
              size={19}
              className="projects-search-icon"
            />

            <input
              type="text"
              className="projects-search-input"
              placeholder="Search projects or clients..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

        </div>

        {/* PROJECT FORM */}

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

              <div className="project-form-group">

                <label className="project-form-label">
                  Project Name *
                </label>

                <input
                  className="project-form-input"
                  name="name"
                  value={
                    form.name
                  }
                  onChange={
                    handleChange
                  }
                  required
                  placeholder="Website Development"
                />

              </div>

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

        {/* PROJECT LIST */}

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

                    {/* HEADER */}

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

                    {/* STATUS */}

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

                    {/* BASIC INFO */}

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

                    {/* PROGRESS */}

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
                            width:
                              `${progress}%`,
                          }}
                        />

                      </div>

                    </div>

                    {/* TASK SUMMARY */}

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

                    {/* EXPANDED */}

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

                        {/* PROJECT TASKS */}

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

                                  const taskId =
                                    getTaskId(
                                      task
                                    );

                                  return (

                                    <div
                                      key={
                                        taskId
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
                                            task
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
                                            task.title ||
                                            task.name ||
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
                                              {formatDeadline(
                                                task.dueDate
                                              )}
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

                        {/* TIME */}

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

                        {/* ACTIONS */}

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

                          {/* ADD TASK */}

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

                          {/* TIMER */}

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
            onMouseDown={(event) => {

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
                    Create a task for{" "}
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
                      onChange={
                        handleTaskFormChange
                      }
                    >

                      <option value="Create">
                        Create
                      </option>

                      <option value="Update">
                        Update
                      </option>

                      <option value="Other">
                        Other
                      </option>

                    </select>

                  </div>

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
