import React, { useEffect, useState } from "react";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Users,
  ArrowLeft,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import API from "../services/api";
import "./Clients.css";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  defaultHourlyRate: "",
  address: "",
};

const Clients = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // ==========================================
  // FETCH CLIENTS
  // ==========================================

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/clients");

      setClients(response.data.clients || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load clients"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
  // SAVE CLIENT
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        await API.put(
          `/clients/${editingId}`,
          form
        );
      } else {
        await API.post("/clients", form);
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);

      await fetchClients();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to save client"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // EDIT CLIENT
  // ==========================================

  const handleEdit = (client) => {
    setEditingId(client._id);

    setForm({
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      company: client.company || "",
      defaultHourlyRate:
        client.defaultHourlyRate || "",
      address: client.address || "",
    });

    setShowForm(true);
  };

  // ==========================================
  // DELETE CLIENT
  // ==========================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this client?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await API.delete(`/clients/${id}`);

      await fetchClients();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete client"
      );
    }
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
  // SEARCH
  // ==========================================

  const filteredClients = clients.filter((client) => {
    const query = search.toLowerCase();

    return (
      client.name?.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query) ||
      client.company?.toLowerCase().includes(query)
    );
  });

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="clients-page">

      <div className="clients-container">

        {/* =====================================
            BACK BUTTON
        ====================================== */}

        <button
          className="clients-back-btn"
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

        <div className="clients-header">

          <div>

            <h1 className="clients-title">
              Clients
            </h1>

            <p className="clients-subtitle">
              Manage your freelance clients.
            </p>

          </div>

          <button
            className="add-client-btn"
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
              setShowForm(true);
            }}
          >
            <Plus size={18} />

            <span>
              Add Client
            </span>
          </button>

        </div>

        {/* =====================================
            ERROR
        ====================================== */}

        {error && (
          <div className="clients-error">
            {error}
          </div>
        )}

        {/* =====================================
            SEARCH
        ====================================== */}

        <div className="clients-search-box">

          <div className="clients-search-wrapper">

            <Search
              size={19}
              className="clients-search-icon"
            />

            <input
              type="text"
              className="clients-search-input"
              placeholder="Search clients..."
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
          <div className="client-form">

            <div className="client-form-header">

              <h2 className="client-form-title">
                {editingId
                  ? "Edit Client"
                  : "Add Client"}
              </h2>

              <button
                type="button"
                className="close-form-btn"
                onClick={closeForm}
              >
                <X size={22} />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="client-form-grid"
            >

              {/* CLIENT NAME */}

              <div className="client-form-group">

                <label className="client-form-label">
                  Client Name *
                </label>

                <input
                  className="client-form-input"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Name"
                />

              </div>

              {/* COMPANY */}

              <div className="client-form-group">

                <label className="client-form-label">
                  Company
                </label>

                <input
                  className="client-form-input"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Company name"
                />

              </div>

              {/* EMAIL */}

              <div className="client-form-group">

                <label className="client-form-label">
                  Email
                </label>

                <input
                  className="client-form-input"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="client@example.com"
                />

              </div>

              {/* PHONE */}

              <div className="client-form-group">

                <label className="client-form-label">
                  Phone
                </label>

                <input
                  className="client-form-input"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91"
                />

              </div>

              {/* HOURLY RATE */}

              <div className="client-form-group">

                <label className="client-form-label">
                  Hourly Rate (₹)
                </label>

                <input
                  className="client-form-input"
                  type="number"
                  min="0"
                  name="defaultHourlyRate"
                  value={form.defaultHourlyRate}
                  onChange={handleChange}
                  placeholder="Hourly rate"
                />

              </div>

              {/* ADDRESS */}

              <div className="client-form-group">

                <label className="client-form-label">
                  Address
                </label>

                <input
                  className="client-form-input"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="City, State"
                />

              </div>

              {/* FORM BUTTONS */}

              <div className="client-form-actions">

                <button
                  type="button"
                  className="cancel-client-btn"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-client-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Client"
                    : "Save Client"}
                </button>

              </div>

            </form>

          </div>
        )}

        {/* =====================================
            CLIENT LIST
        ====================================== */}

        {loading ? (

          <div className="clients-empty">

            <p>
              Loading clients...
            </p>

          </div>

        ) : filteredClients.length === 0 ? (

          <div className="clients-empty">

            <Users
              size={42}
              className="clients-empty-icon"
            />

            <h3 className="clients-empty-title">
              No clients found
            </h3>

            <p className="clients-empty-text">
              Add your first client to get started.
            </p>

          </div>

        ) : (

          <div className="clients-grid">

            {filteredClients.map((client) => (

              <div
                key={client._id}
                className="client-card"
              >

                {/* CARD HEADER */}

                <div className="client-card-header">

                  <div>

                    <h3 className="client-card-name">
                      {client.name}
                    </h3>

                    {client.company && (
                      <p className="client-card-company">
                        {client.company}
                      </p>
                    )}

                  </div>

                  <div className="client-card-actions">

                    <button
                      type="button"
                      className="client-action-btn client-edit-btn"
                      onClick={() =>
                        handleEdit(client)
                      }
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      type="button"
                      className="client-action-btn client-delete-btn"
                      onClick={() =>
                        handleDelete(client._id)
                      }
                    >
                      <Trash2 size={17} />
                    </button>

                  </div>

                </div>

                {/* CLIENT DETAILS */}

                <div className="client-details">

                  {client.email && (
                    <p className="client-detail">
                      📧 {client.email}
                    </p>
                  )}

                  {client.phone && (
                    <p className="client-detail">
                      📞 {client.phone}
                    </p>
                  )}

                  <p className="client-hourly-rate">
                    ₹{client.defaultHourlyRate}/hour
                  </p>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
};

export default Clients;