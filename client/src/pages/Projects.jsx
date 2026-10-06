import React, { useEffect, useState } from "react";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  FolderKanban,
  ArrowLeft,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import API from "../services/api";

import "./Projects.css";

const emptyForm = {
  name: "",
  description: "",
  client: "",
  status: "Active",
  budget: "",
  deadline: "",
};

const Projects = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);

  const [clients, setClients] = useState([]);

  const [form, setForm] = useState(emptyForm);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // ==========================================
  // FETCH PROJECTS
  // ==========================================

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/projects");

      setProjects(response.data.projects || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load projects"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH CLIENTS
  // ==========================================

  const fetchClients = async () => {
    try {
      const response = await API.get("/clients");

      setClients(response.data.clients || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load clients"
      );
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchProjects();
    fetchClients();
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
  // SAVE PROJECT
  // ==========================================

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
        await API.post("/projects", form);
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

  // ==========================================
  // EDIT PROJECT
  // ==========================================

  const handleEdit = (project) => {
    setEditingId(project._id);

    setForm({
      name: project.name || "",

      description:
        project.description || "",

      client: project.client?._id || "",

      status:
        project.status || "Active",

      budget:
        project.budget ?? "",

      deadline: project.deadline
        ? project.deadline.split("T")[0]
        : "",
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // DELETE PROJECT
  // ==========================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await API.delete(`/projects/${id}`);

      await fetchProjects();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete project"
      );
    }
  };

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredProjects = projects.filter(
    (project) => {
      const query = search.toLowerCase();

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

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="projects-page">

      <div className="projects-container">

        {/* =====================================
            BACK BUTTON
        ====================================== */}

        <button
          className="projects-back-btn"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={18} />

          <span>
            Back to Dashboard
          </span>
        </button>

        {/* =====================================
            HEADER
        ====================================== */}

        <div className="projects-header">

          <div>

            <h1 className="projects-title">
              Projects
            </h1>

            <p className="projects-subtitle">
              Manage your freelance projects.
            </p>

          </div>

          <button
            className="add-project-btn"
            onClick={openAddForm}
          >
            <Plus size={18} />

            <span>
              Add Project
            </span>
          </button>

        </div>

        {/* =====================================
            ERROR
        ====================================== */}

        {error && (
          <div className="projects-error">
            {error}
          </div>
        )}

        {/* =====================================
            SEARCH
        ====================================== */}

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
                setSearch(event.target.value)
              }
            />

          </div>

        </div>

        {/* =====================================
            FORM
        ====================================== */}

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
                onClick={closeForm}
              >
                <X size={22} />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
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
                  onChange={handleChange}
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
                  value={form.client}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select Client
                  </option>

                  {clients.map((client) => (
                    <option
                      key={client._id}
                      value={client._id}
                    >
                      {client.name}
                    </option>
                  ))}
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
                  value={form.description}
                  onChange={handleChange}
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
                  value={form.status}
                  onChange={handleChange}
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
                  value={form.budget}
                  onChange={handleChange}
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
                  value={form.deadline}
                  onChange={handleChange}
                />

              </div>

              {/* BUTTONS */}

              <div className="project-form-actions">

                <button
                  type="button"
                  className="cancel-project-btn"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-project-btn"
                  disabled={saving}
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

        {/* =====================================
            PROJECT LIST
        ====================================== */}

        {loading ? (

          <div className="projects-empty">

            <p>
              Loading projects...
            </p>

          </div>

        ) : filteredProjects.length === 0 ? (

          <div className="projects-empty">

            <FolderKanban
              size={44}
              className="projects-empty-icon"
            />

            <h3 className="projects-empty-title">
              No projects found
            </h3>

            <p className="projects-empty-text">
              Add your first project to get started.
            </p>

          </div>

        ) : (

          <div className="projects-grid">

            {filteredProjects.map(
              (project) => (

                <div
                  key={project._id}
                  className="project-card"
                >

                  {/* CARD HEADER */}

                  <div className="project-card-header">

                    <div>

                      <h3 className="project-card-name">
                        {project.name}
                      </h3>

                      <p className="project-card-client">
                        {project.client?.name ||
                          "No client"}
                      </p>

                    </div>

                    <div className="project-card-actions">

                      <button
                        type="button"
                        className="project-action-btn project-edit-btn"
                        onClick={() =>
                          handleEdit(project)
                        }
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        className="project-action-btn project-delete-btn"
                        onClick={() =>
                          handleDelete(
                            project._id
                          )
                        }
                      >
                        <Trash2 size={17} />
                      </button>

                    </div>

                  </div>

                  {/* STATUS */}

                  <div className="project-status-row">

                    <span
                      className={`project-status ${
                        project.status ===
                        "Completed"
                          ? "project-status-completed"
                          : "project-status-active"
                      }`}
                    >
                      {project.status}
                    </span>

                  </div>

                  {/* DESCRIPTION */}

                  {project.description && (
                    <p className="project-card-description">
                      {project.description}
                    </p>
                  )}

                  {/* DETAILS */}

                  <div className="project-details">

                    <div className="project-detail-item">

                      <span>
                        Budget
                      </span>

                      <strong>
                        ₹
                        {Number(
                          project.budget || 0
                        ).toLocaleString("en-IN")}
                      </strong>

                    </div>

                    {project.deadline && (
                      <div className="project-detail-item">

                        <span>
                          Deadline
                        </span>

                        <strong>
                          {new Date(
                            project.deadline
                          ).toLocaleDateString(
                            "en-IN"
                          )}
                        </strong>

                      </div>
                    )}

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

export default Projects;