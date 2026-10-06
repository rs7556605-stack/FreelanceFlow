import React, { useEffect, useState } from "react";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  CheckSquare,
  ArrowLeft,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import API from "../services/api";

import "./Tasks.css";

const emptyForm = {
  project: "",
  title: "",
  description: "",
  status: "Pending",
  priority: "Medium",
  dueDate: "",
};

const Tasks = () => {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);

  const [projects, setProjects] = useState([]);

  const [form, setForm] = useState(emptyForm);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // ==========================================
  // FETCH TASKS
  // ==========================================

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/tasks");

      setTasks(response.data.tasks || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load tasks"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH PROJECTS
  // ==========================================

  const fetchProjects = async () => {
    try {
      const response = await API.get("/projects");

      setProjects(response.data.projects || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load projects"
      );
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // OPEN ADD FORM
  // ==========================================

  const openAddForm = () => {
    setEditingId(null);

    setForm(emptyForm);

    setError("");

    setShowForm(true);
  };

  // ==========================================
  // CLOSE FORM
  // ==========================================

  const closeForm = () => {
    setShowForm(false);

    setEditingId(null);

    setForm(emptyForm);
  };

  // ==========================================
  // SAVE TASK
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        await API.put(
          `/tasks/${editingId}`,
          form
        );
      } else {
        await API.post("/tasks", form);
      }

      closeForm();

      await fetchTasks();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to save task"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // EDIT TASK
  // ==========================================

  const handleEdit = (task) => {
    setEditingId(task._id);

    setForm({
      project: task.project?._id || "",

      title: task.title || "",

      description:
        task.description || "",

      status:
        task.status || "Pending",

      priority:
        task.priority || "Medium",

      dueDate: task.dueDate
        ? task.dueDate.split("T")[0]
        : "",
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // DELETE TASK
  // ==========================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await API.delete(`/tasks/${id}`);

      await fetchTasks();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete task"
      );
    }
  };

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredTasks = tasks.filter((task) => {
    const query = search.toLowerCase();

    return (
      task.title
        ?.toLowerCase()
        .includes(query) ||
      task.description
        ?.toLowerCase()
        .includes(query) ||
      task.project?.name
        ?.toLowerCase()
        .includes(query) ||
      task.status
        ?.toLowerCase()
        .includes(query) ||
      task.priority
        ?.toLowerCase()
        .includes(query)
    );
  });

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="tasks-page">

      <div className="tasks-container">

        {/* BACK */}

        <button
          className="tasks-back-btn"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={18} />

          <span>
            Back to Dashboard
          </span>
        </button>

        {/* HEADER */}

        <div className="tasks-header">

          <div>

            <h1 className="tasks-title">
              Tasks
            </h1>

            <p className="tasks-subtitle">
              Manage your project tasks.
            </p>

          </div>

          <button
            className="add-task-btn"
            onClick={openAddForm}
          >
            <Plus size={18} />

            <span>
              Add Task
            </span>
          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="tasks-error">
            {error}
          </div>
        )}

        {/* SEARCH */}

        <div className="tasks-search-box">

          <div className="tasks-search-wrapper">

            <Search
              size={19}
              className="tasks-search-icon"
            />

            <input
              type="text"
              className="tasks-search-input"
              placeholder="Search tasks..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>

        </div>

        {/* FORM */}

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
                onClick={closeForm}
              >
                <X size={22} />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="task-form-grid"
            >

              {/* PROJECT */}

              <div className="task-form-group">

                <label className="task-form-label">
                  Project *
                </label>

                <select
                  className="task-form-input"
                  name="project"
                  value={form.project}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select Project
                  </option>

                  {projects.map((project) => (
                    <option
                      key={project._id}
                      value={project._id}
                    >
                      {project.name}
                    </option>
                  ))}
                </select>

              </div>

              {/* TITLE */}

              <div className="task-form-group">

                <label className="task-form-label">
                  Task Title *
                </label>

                <input
                  className="task-form-input"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="Design homepage"
                />

              </div>

              {/* DESCRIPTION */}

              <div className="task-form-group task-full-width">

                <label className="task-form-label">
                  Description
                </label>

                <textarea
                  className="task-form-input task-form-textarea"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the task..."
                  rows="4"
                />

              </div>

              {/* STATUS */}

              <div className="task-form-group">

                <label className="task-form-label">
                  Status
                </label>

                <select
                  className="task-form-input"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
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

              {/* PRIORITY */}

              <div className="task-form-group">

                <label className="task-form-label">
                  Priority
                </label>

                <select
                  className="task-form-input"
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
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

              {/* DUE DATE */}

              <div className="task-form-group">

                <label className="task-form-label">
                  Due Date
                </label>

                <input
                  className="task-form-input"
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                />

              </div>

              {/* BUTTONS */}

              <div className="task-form-actions">

                <button
                  type="button"
                  className="cancel-task-btn"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-task-btn"
                  disabled={saving}
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

        {/* TASK LIST */}

        {loading ? (

          <div className="tasks-empty">

            <p>
              Loading tasks...
            </p>

          </div>

        ) : filteredTasks.length === 0 ? (

          <div className="tasks-empty">

            <CheckSquare
              size={44}
              className="tasks-empty-icon"
            />

            <h3 className="tasks-empty-title">
              No tasks found
            </h3>

            <p className="tasks-empty-text">
              Add your first task to get started.
            </p>

          </div>

        ) : (

          <div className="tasks-grid">

            {filteredTasks.map((task) => (

              <div
                key={task._id}
                className="task-card"
              >

                {/* HEADER */}

                <div className="task-card-header">

                  <div className="task-card-main">

                    <h3 className="task-card-title">
                      {task.title}
                    </h3>

                    <p className="task-card-project">
                      {task.project?.name ||
                        "No project"}
                    </p>

                  </div>

                  <div className="task-card-actions">

                    <button
                      type="button"
                      className="task-action-btn task-edit-btn"
                      onClick={() =>
                        handleEdit(task)
                      }
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      type="button"
                      className="task-action-btn task-delete-btn"
                      onClick={() =>
                        handleDelete(
                          task._id
                        )
                      }
                    >
                      <Trash2 size={17} />
                    </button>

                  </div>

                </div>

                {/* STATUS + PRIORITY */}

                <div className="task-badges">

                  <span
                    className={`task-status task-status-${task.status
                      ?.toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {task.status}
                  </span>

                  <span
                    className={`task-priority task-priority-${task.priority?.toLowerCase()}`}
                  >
                    {task.priority}
                  </span>

                </div>

                {/* DESCRIPTION */}

                {task.description && (
                  <p className="task-card-description">
                    {task.description}
                  </p>
                )}

                {/* DUE DATE */}

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

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
};

export default Tasks;