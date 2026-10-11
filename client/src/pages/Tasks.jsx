import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  CheckSquare,
  ArrowLeft,
  Users,
  FolderKanban,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import API from "../services/api";

import "./Tasks.css";

// ==================================================
// EMPTY FORM
// ==================================================

const emptyForm = {
  client: "",
  project: "",
  title: "",
  description: "",
  status: "Pending",
  priority: "Medium",
  dueDate: "",
};

// ==================================================
// TASKS
// ==================================================

const Tasks = () => {
  const location =
    useLocation();

  const navigate =
    useNavigate();

  // ==================================================
  // STATES
  // ==================================================

  const [tasks, setTasks] =
    useState([]);

  const [projects, setProjects] =
    useState([]);

  const [clients, setClients] =
    useState([]);

  const [form, setForm] =
    useState({
      ...emptyForm,
    });

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

  // ==================================================
  // FETCH TASKS
  // ==================================================

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await API.get(
          "/tasks"
        );

      console.log(
        "TASKS RESPONSE:",
        response.data
      );

      setTasks(
        response.data?.tasks ||
          []
      );
    } catch (error) {
      console.error(
        "FETCH TASKS ERROR:",
        error
      );

      setError(
        error.response?.data
          ?.message ||
          "Failed to load tasks"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // FETCH PROJECTS
  // ==================================================

  const fetchProjects =
    async () => {
      try {
        const response =
          await API.get(
            "/projects"
          );

        setProjects(
          response.data
            ?.projects || []
        );
      } catch (error) {
        console.error(
          "FETCH PROJECTS ERROR:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "Failed to load projects"
        );
      }
    };

  // ==================================================
  // FETCH CLIENTS
  // ==================================================

  const fetchClients =
    async () => {
      try {
        const response =
          await API.get(
            "/clients"
          );

        setClients(
          response.data
            ?.clients || []
        );
      } catch (error) {
        console.error(
          "FETCH CLIENTS ERROR:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "Failed to load clients"
        );
      }
    };

  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchClients();
  }, []);

  // ==================================================
  // PROJECT CLIENT ID
  // ==================================================

  const getProjectClientId =
    (project) => {
      if (!project) {
        return "";
      }

      if (
        project.client &&
        typeof project.client ===
          "object"
      ) {
        return (
          project.client._id ||
          project.client.id ||
          ""
        );
      }

      return (
        project.client || ""
      );
    };

  // ==================================================
  // FILTER PROJECTS BY CLIENT
  // ==================================================

  const filteredProjects =
    useMemo(() => {
      if (!form.client) {
        return [];
      }

      return projects.filter(
        (project) => {
          const clientId =
            getProjectClientId(
              project
            );

          return (
            clientId?.toString() ===
            form.client?.toString()
          );
        }
      );
    }, [
      projects,
      form.client,
    ]);

  // ==================================================
  // OPEN ADD FORM
  // ==================================================

  const openAddForm = () => {
    setEditingId(null);

    setForm({
      ...emptyForm,
    });

    setError("");

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==================================================
  // CLOSE FORM
  // ==================================================

  const closeForm = () => {
    setShowForm(false);

    setEditingId(null);

    setForm({
      ...emptyForm,
    });

    setError("");
  };

  // ==================================================
  // FORM CHANGE
  // ==================================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    // -----------------------------------------------
    // CLIENT CHANGE
    // -----------------------------------------------

    if (
      name === "client"
    ) {
      setForm(
        (previous) => ({
          ...previous,

          client:
            value,

          project:
            "",
        })
      );

      return;
    }

    // -----------------------------------------------
    // NORMAL
    // -----------------------------------------------

    setForm(
      (previous) => ({
        ...previous,
        [name]:
          value,
      })
    );
  };

  // ==================================================
  // VALIDATE
  // ==================================================

  const validateForm =
    () => {
      if (!form.client) {
        return "Please select a client.";
      }

      if (!form.project) {
        return "Please select a project.";
      }

      if (
        !form.title.trim()
      ) {
        return "Please enter task title.";
      }

      return "";
    };

  // ==================================================
  // SAVE TASK
  // ==================================================

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      try {
        setSaving(true);
        setError("");

        const validationError =
          validateForm();

        if (validationError) {
          setError(
            validationError
          );

          return;
        }

        // ==========================================
        // NO TYPE
        // ==========================================

        const taskData = {
          client:
            form.client,

          project:
            form.project,

          title:
            form.title.trim(),

          description:
            form.description.trim(),

          status:
            form.status,

          priority:
            form.priority,

          dueDate:
            form.dueDate ||
            null,
        };

        console.log(
          "FINAL TASK DATA:",
          taskData
        );

        // ==========================================
        // UPDATE
        // ==========================================

        if (editingId) {
          await API.put(
            `/tasks/${editingId}`,
            taskData
          );
        }

        // ==========================================
        // CREATE
        // ==========================================

        else {
          await API.post(
            "/tasks",
            taskData
          );
        }

        // ==========================================
        // CLOSE
        // ==========================================

        closeForm();

        // ==========================================
        // REFRESH
        // ==========================================

        await fetchTasks();
      } catch (error) {
        console.error(
          "SAVE TASK ERROR:",
          error
        );

        console.error(
          "SERVER RESPONSE:",
          error.response?.data
        );

        setError(
          error.response?.data
            ?.message ||
            "Failed to save task"
        );
      } finally {
        setSaving(false);
      }
    };

  // ==================================================
  // EDIT TASK
  // ==================================================

  const handleEdit = (
    task
  ) => {
    // -----------------------------------------------
    // CLIENT
    // -----------------------------------------------

    let clientId = "";

    if (
      task.client &&
      typeof task.client ===
        "object"
    ) {
      clientId =
        task.client._id ||
        task.client.id ||
        "";
    } else {
      clientId =
        task.client || "";
    }

    // -----------------------------------------------
    // OLD TASK FALLBACK
    // -----------------------------------------------

    if (
      !clientId &&
      task.project?.client
    ) {
      if (
        typeof task.project.client ===
          "object"
      ) {
        clientId =
          task.project.client._id ||
          task.project.client.id ||
          "";
      } else {
        clientId =
          task.project.client;
      }
    }

    // -----------------------------------------------
    // PROJECT
    // -----------------------------------------------

    let projectId = "";

    if (
      task.project &&
      typeof task.project ===
        "object"
    ) {
      projectId =
        task.project._id ||
        task.project.id ||
        "";
    } else {
      projectId =
        task.project || "";
    }

    // -----------------------------------------------
    // SET
    // -----------------------------------------------

    setEditingId(
      task._id
    );

    setForm({
      client:
        clientId,

      project:
        projectId,

      title:
        task.title || "",

      description:
        task.description || "",

      status:
        task.status ||
        "Pending",

      priority:
        task.priority ||
        "Medium",

      dueDate:
        task.dueDate
          ? task.dueDate.split(
              "T"
            )[0]
          : "",
    });

    setError("");

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==================================================
  // DELETE
  // ==================================================

  const handleDelete =
    async (id) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this task?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");

        await API.delete(
          `/tasks/${id}`
        );

        await fetchTasks();
      } catch (error) {
        console.error(
          "DELETE TASK ERROR:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "Failed to delete task"
        );
      }
    };

  // ==================================================
  // CLIENT NAME
  // ==================================================

  const getClientName =
    (task) => {
      // -----------------------------------------------
      // DIRECT CLIENT OBJECT
      // -----------------------------------------------

      if (
        task?.client &&
        typeof task.client ===
          "object"
      ) {
        return (
          task.client.name ||
          task.client.clientName ||
          task.client.company ||
          "No client"
        );
      }

      // -----------------------------------------------
      // CLIENT ID
      // -----------------------------------------------

      if (
        task?.client
      ) {
        const client =
          clients.find(
            (item) =>
              item?._id
                ?.toString() ===
              task.client?.toString()
          );

        if (client) {
          return (
            client.name ||
            client.clientName ||
            client.company ||
            "No client"
          );
        }
      }

      // -----------------------------------------------
      // PROJECT CLIENT OBJECT
      // -----------------------------------------------

      if (
        task?.project?.client &&
        typeof task.project
          .client ===
          "object"
      ) {
        return (
          task.project.client.name ||
          task.project.client
            .clientName ||
          task.project.client
            .company ||
          "No client"
        );
      }

      // -----------------------------------------------
      // PROJECT CLIENT ID
      // -----------------------------------------------

      if (
        task?.project?.client
      ) {
        const clientId =
          typeof task.project
            .client ===
          "object"
            ? task.project
                .client._id
            : task.project
                .client;

        const client =
          clients.find(
            (item) =>
              item?._id
                ?.toString() ===
              clientId?.toString()
          );

        if (client) {
          return (
            client.name ||
            client.clientName ||
            client.company ||
            "No client"
          );
        }
      }

      return "No client";
    };

  // ==================================================
  // PROJECT NAME
  // ==================================================

  const getProjectName =
    (task) => {
      // -----------------------------------------------
      // PROJECT OBJECT
      // -----------------------------------------------

      if (
        task?.project &&
        typeof task.project ===
          "object"
      ) {
        return (
          task.project.name ||
          "No project"
        );
      }

      // -----------------------------------------------
      // PROJECT ID
      // -----------------------------------------------

      if (
        task?.project
      ) {
        const project =
          projects.find(
            (item) =>
              item?._id
                ?.toString() ===
              task.project?.toString()
          );

        if (project) {
          return (
            project.name ||
            "No project"
          );
        }
      }

      return "No project";
    };

  // ==================================================
  // SEARCH
  // ==================================================

  const filteredTasks =
    tasks.filter(
      (task) => {
        const query =
          search
            .toLowerCase()
            .trim();

        if (!query) {
          return true;
        }

        const clientName =
          getClientName(
            task
          ).toLowerCase();

        const projectName =
          getProjectName(
            task
          ).toLowerCase();

        return (
          task.title
            ?.toLowerCase()
            .includes(query) ||

          task.description
            ?.toLowerCase()
            .includes(query) ||

          clientName.includes(
            query
          ) ||

          projectName.includes(
            query
          ) ||

          task.status
            ?.toLowerCase()
            .includes(query) ||

          task.priority
            ?.toLowerCase()
            .includes(query)
        );
      }
    );

  // ==================================================
  // HIGHLIGHT TASK
  // ==================================================

  useEffect(() => {
    const taskId =
      location.state
        ?.highlightTaskId;

    if (
      !taskId ||
      !tasks.length
    ) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          const element =
            document.getElementById(
              `task-card-${taskId}`
            );

          if (!element) {
            return;
          }

          element.scrollIntoView(
            {
              behavior:
                "smooth",
              block:
                "center",
            }
          );

          element.classList.add(
            "task-deadline-highlight"
          );

          window.setTimeout(
            () => {
              element.classList.remove(
                "task-deadline-highlight"
              );
            },
            8000
          );

          navigate(
            "/tasks",
            {
              replace:
                true,
              state: {},
            }
          );
        },
        200
      );

    return () =>
      window.clearTimeout(
        timer
      );
  }, [
    tasks,
    location.state
      ?.highlightTaskId,
    navigate,
  ]);

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="tasks-page">

      <div className="tasks-container">

        {/* ==========================================
            BACK
        ========================================== */}

        <button
          className="tasks-back-btn"
          type="button"
          onClick={() =>
            navigate("/")
          }
        >
          <ArrowLeft
            size={18}
          />

          <span>
            Back to Dashboard
          </span>
        </button>

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="tasks-header">

          <div>
            <h1 className="tasks-title">
              Tasks
            </h1>

            <p className="tasks-subtitle">
              Manage your project
              tasks.
            </p>
          </div>

          <div className="tasks-header-actions">

            <button
              className="add-task-btn"
              type="button"
              onClick={
                openAddForm
              }
            >
              <Plus
                size={18}
              />

              <span>
                Add Task
              </span>
            </button>

          </div>

        </div>

        {/* ==========================================
            ERROR
        ========================================== */}

        {error && (
          <div className="tasks-error">
            {error}
          </div>
        )}

        {/* ==========================================
            SEARCH
        ========================================== */}

        <div className="tasks-search-box">

          <div className="tasks-search-wrapper">

            <Search
              size={19}
              className="tasks-search-icon"
            />

            <input
              type="text"
              className="tasks-search-input"
              placeholder="Search tasks, clients, projects..."
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
            />

          </div>

        </div>

        {/* ==========================================
            FORM
        ========================================== */}

        {showForm && (
          <div className="task-form">

            <div className="task-form-header">

              <h2 className="task-form-title">
                {editingId
                  ? "Edit Task"
                  : "Add Task"}
              </h2>

              <button
                type="button"
                className="close-task-form-btn"
                onClick={
                  closeForm
                }
              >
                <X
                  size={22}
                />
              </button>

            </div>

            <form
              className="task-form-grid"
              onSubmit={
                handleSubmit
              }
            >

              {/* ======================================
                  CLIENT
              ====================================== */}

              <div className="task-form-group">

                <label className="task-form-label">
                  Client *
                </label>

                <select
                  className="task-form-input"
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
                        {client.name ||
                          client.clientName ||
                          client.company ||
                          "Unnamed Client"}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* ======================================
                  PROJECT
              ====================================== */}

              <div className="task-form-group">

                <label className="task-form-label">
                  Project *
                </label>

                <select
                  className="task-form-input"
                  name="project"
                  value={
                    form.project
                  }
                  onChange={
                    handleChange
                  }
                  required
                  disabled={
                    !form.client
                  }
                >
                  <option value="">
                    {!form.client
                      ? "First Select Client"
                      : "Select Project"}
                  </option>

                  {filteredProjects.map(
                    (project) => (
                      <option
                        key={
                          project._id
                        }
                        value={
                          project._id
                        }
                      >
                        {
                          project.name
                        }
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* ======================================
                  TITLE
              ====================================== */}

              <div className="task-form-group">

                <label className="task-form-label">
                  Task Title *
                </label>

                <input
                  className="task-form-input"
                  type="text"
                  name="title"
                  value={
                    form.title
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter task title"
                  required
                />

              </div>

              {/* ======================================
                  STATUS
              ====================================== */}

              <div className="task-form-group">

                <label className="task-form-label">
                  Status
                </label>

                <select
                  className="task-form-input"
                  name="status"
                  value={
                    form.status
                  }
                  onChange={
                    handleChange
                  }
                >
                  <option value="Pending">
                    Pending
                  </option>

                  <option value="In Progress">
                    In Progress
                  </option>

                  <option value="Completed">
                    Completed
                  </option>
                </select>

              </div>

              {/* ======================================
                  DESCRIPTION
              ====================================== */}

              <div className="task-form-group task-full-width">

                <label className="task-form-label">
                  Description
                </label>

                <textarea
                  className="task-form-input task-form-textarea"
                  name="description"
                  value={
                    form.description
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Describe the task..."
                  rows="4"
                />

              </div>

              {/* ======================================
                  PRIORITY
              ====================================== */}

              <div className="task-form-group">

                <label className="task-form-label">
                  Priority
                </label>

                <select
                  className="task-form-input"
                  name="priority"
                  value={
                    form.priority
                  }
                  onChange={
                    handleChange
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
                </select>

              </div>

              {/* ======================================
                  DUE DATE
              ====================================== */}

              <div className="task-form-group">

                <label className="task-form-label">
                  Due Date
                </label>

                <input
                  className="task-form-input"
                  type="date"
                  name="dueDate"
                  value={
                    form.dueDate
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

              {/* ======================================
                  BUTTONS
              ====================================== */}

              <div className="task-form-actions">

                <button
                  type="button"
                  className="cancel-task-btn"
                  onClick={
                    closeForm
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-task-btn"
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Task"
                    : "Save Task"}
                </button>

              </div>

            </form>

          </div>
        )}

        {/* ==========================================
            TASK LIST
        ========================================== */}

        {loading ? (
          <div className="tasks-empty">
            <p>
              Loading tasks...
            </p>
          </div>
        ) : filteredTasks.length ===
          0 ? (
          <div className="tasks-empty">

            <CheckSquare
              size={44}
              className="tasks-empty-icon"
            />

            <h3 className="tasks-empty-title">
              No tasks found
            </h3>

            <p className="tasks-empty-text">
              Add your first
              task to get
              started.
            </p>

          </div>
        ) : (
          <div className="tasks-grid">

            {filteredTasks.map(
              (task) => (
                <div
                  key={
                    task._id
                  }
                  id={`task-card-${task._id}`}
                  className="task-card"
                >

                  {/* ==================================
                      HEADER
                  ================================== */}

                  <div className="task-card-header">

                    <div className="task-card-main">

                      <h3 className="task-card-title">
                        {
                          task.title
                        }
                      </h3>

                      {/* CLIENT */}

                      <p className="task-card-client">

                        <span>
                          Client:
                        </span>{" "}

                        <strong>
                          {
                            getClientName(
                              task
                            )
                          }
                        </strong>

                      </p>

                      {/* PROJECT */}

                      <p className="task-card-project">

                        <span>
                          Project:
                        </span>{" "}

                        <strong>
                          {
                            getProjectName(
                              task
                            )
                          }
                        </strong>

                      </p>

                    </div>

                    {/* ACTIONS */}

                    <div className="task-card-actions">

                      <button
                        type="button"
                        className="task-action-btn task-edit-btn"
                        onClick={() =>
                          handleEdit(
                            task
                          )
                        }
                        title="Edit Task"
                      >
                        <Pencil
                          size={17}
                        />
                      </button>

                      <button
                        type="button"
                        className="task-action-btn task-delete-btn"
                        onClick={() =>
                          handleDelete(
                            task._id
                          )
                        }
                        title="Delete Task"
                      >
                        <Trash2
                          size={17}
                        />
                      </button>

                    </div>

                  </div>

                  {/* ==================================
                      BADGES
                  ================================== */}

                  <div className="task-badges">

                    <span
                      className={`task-status task-status-${task.status
                        ?.toLowerCase()
                        .replace(
                          /\s+/g,
                          "-"
                        )}`}
                    >
                      {
                        task.status
                      }
                    </span>

                    <span
                      className={`task-priority task-priority-${task.priority?.toLowerCase()}`}
                    >
                      {
                        task.priority
                      }
                    </span>

                  </div>

                  {/* ==================================
                      DESCRIPTION
                  ================================== */}

                  {task.description && (
                    <p className="task-card-description">
                      {
                        task.description
                      }
                    </p>
                  )}

                  {/* ==================================
                      DUE DATE
                  ================================== */}

                  {task.dueDate && (
                    <div className="task-due-date">

                      Due:{" "}

                      {new Date(
                        task.dueDate
                      ).toLocaleDateString(
                        "en-IN"
                      )}

                    </div>
                  )}

                  {/* ==================================
                      BOTTOM BUTTONS
                  ================================== */}

                  <div className="task-card-bottom-actions">

                    {/* CLIENT */}

                    <button
                      type="button"
                      className="tasks-header-btn client-btn"
                      onClick={() =>
                        navigate(
                          "/clients"
                        )
                      }
                    >
                      <Users
                        size={18}
                      />

                      <span>
                        Client
                      </span>
                    </button>

                    {/* PROJECT */}

                    <button
                      type="button"
                      className="tasks-header-btn project-btn"
                      onClick={() =>
                        navigate(
                          "/projects"
                        )
                      }
                    >
                      <FolderKanban
                        size={18}
                      />

                      <span>
                        Project
                      </span>
                    </button>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>

    </div>
  );
};

export default Tasks;