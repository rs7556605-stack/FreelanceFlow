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
  Users,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  ListTodo,
  Clock3,
  FolderKanban,
  Play,
  Receipt,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import API from "../services/api";
import "./Clients.css";

/* =========================================================
   CLIENT FORM
========================================================= */

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  defaultHourlyRate: "",
  address: "",
  status: "In Progress",
  budget: "",
  received: "",
  deadline: "",
};

/* =========================================================
   CLIENT META STORAGE
========================================================= */

const CLIENT_META_KEY = "freelanceflow_client_meta";

const readClientMeta = () => {
  try {
    return JSON.parse(
      localStorage.getItem(CLIENT_META_KEY) || "{}"
    );
  } catch (error) {
    console.error("Client meta read error:", error);
    return {};
  }
};

const saveClientMeta = (meta) => {
  try {
    localStorage.setItem(
      CLIENT_META_KEY,
      JSON.stringify(meta)
    );
  } catch (error) {
    console.error("Client meta save error:", error);
  }
};

/* =========================================================
   TASK STORAGE
========================================================= */

const TASK_STORAGE_KEY = "freelanceflow_tasks";

const readLocalTasks = () => {
  try {
    return JSON.parse(
      localStorage.getItem(TASK_STORAGE_KEY) || "[]"
    );
  } catch (error) {
    console.error("Task storage error:", error);
    return [];
  }
};

/* =========================================================
   CLIENT TASK STORAGE
========================================================= */

const CLIENT_TASK_STORAGE_KEY =
  "freelanceflow_client_tasks";

const readClientTasks = () => {
  try {
    return JSON.parse(
      localStorage.getItem(
        CLIENT_TASK_STORAGE_KEY
      ) || "[]"
    );
  } catch (error) {
    console.error(
      "Client task storage error:",
      error
    );
    return [];
  }
};

const saveClientTasks = (tasks) => {
  try {
    localStorage.setItem(
      CLIENT_TASK_STORAGE_KEY,
      JSON.stringify(tasks)
    );
  } catch (error) {
    console.error(
      "Client task save error:",
      error
    );
  }
};

const emptyTaskForm = {
  name: "",
  type: "Update",
  description: "",
  dueDate: "",
};

/* =========================================================
   FORMAT CURRENCY
========================================================= */

const formatCurrency = (value) => {
  const amount = Number(value) || 0;

  return `₹${amount.toLocaleString("en-IN")}`;
};

/* =========================================================
   FORMAT DATE
========================================================= */

const formatDate = (date) => {
  if (!date) {
    return "No deadline";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "No deadline";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/* =========================================================
   FORMAT TIME
========================================================= */

const formatSeconds = (seconds) => {
  const totalSeconds = Math.max(
    0,
    Math.floor(Number(seconds) || 0)
  );

  const hours = Math.floor(
    totalSeconds / 3600
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const remainingSeconds =
    totalSeconds % 60;

  return `${hours}h ${minutes}m ${remainingSeconds}s`;
};

/* =========================================================
   CLIENT COMPONENT
========================================================= */

const Clients = () => {
  const navigate = useNavigate();

  /* =======================================================
     STATES
  ======================================================= */

  const [clients, setClients] = useState([]);

  const [form, setForm] = useState(
    emptyForm
  );

  const [search, setSearch] = useState("");

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

  const [expandedClients, setExpandedClients] =
    useState({});

  const [projects, setProjects] =
    useState([]);

  const [serverTasks, setServerTasks] =
    useState([]);

  const [timeLogs, setTimeLogs] =
    useState([]);

  const [clientMeta, setClientMeta] =
    useState({});

  /* =======================================================
     CLIENT TASK STATES
  ======================================================= */

  const [clientTasks, setClientTasks] =
    useState([]);

  const [showTaskForm, setShowTaskForm] =
    useState(false);

  const [taskClientId, setTaskClientId] =
    useState(null);

  const [taskForm, setTaskForm] =
    useState(emptyTaskForm);

  /* =======================================================
     LOAD LOCAL DATA
  ======================================================= */

  useEffect(() => {
    setClientMeta(readClientMeta());
    setClientTasks(readClientTasks());
  }, []);

  /* =======================================================
     FETCH CLIENTS
  ======================================================= */

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError("");

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
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     FETCH PROJECTS
  ======================================================= */

  const fetchProjects = async () => {
    try {
      const response =
        await API.get("/projects");

      const data = response.data;

      const projectList =
        data?.projects ||
        data?.data ||
        (Array.isArray(data)
          ? data
          : []);

      setProjects(
        Array.isArray(projectList)
          ? projectList
          : []
      );
    } catch (error) {
      console.warn(
        "Failed to load projects:",
        error
      );

      setProjects([]);
    }
  };

  /* =======================================================
     FETCH SERVER TASKS
  ======================================================= */

  const fetchServerTasks = async (
    projectList
  ) => {
    try {
      if (
        !Array.isArray(projectList) ||
        projectList.length === 0
      ) {
        setServerTasks([]);
        return;
      }

      const taskResponses =
        await Promise.all(
          projectList.map(
            async (project) => {
              try {
                const response =
                  await API.get(
                    `/tasks?project=${project._id}`
                  );

                return (
                  response.data?.tasks ||
                  []
                );
              } catch (error) {
                return [];
              }
            }
          )
        );

      setServerTasks(
        taskResponses.flat()
      );
    } catch (error) {
      console.warn(
        "Server tasks loading error:",
        error
      );

      setServerTasks([]);
    }
  };

  /* =======================================================
     FETCH TIME LOGS
  ======================================================= */

  const fetchTimeLogs = async () => {
    try {
      const response =
        await API.get("/time");

      if (response.data?.success) {
        setTimeLogs(
          response.data.timeLogs || []
        );
      } else {
        setTimeLogs([]);
      }
    } catch (error) {
      console.warn(
        "Time logs loading error:",
        error
      );

      setTimeLogs([]);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    const loadData = async () => {
      await fetchClients();
      await fetchProjects();
      await fetchTimeLogs();
    };

    loadData();
  }, []);

  /* =======================================================
     LOAD PROJECT TASKS
  ======================================================= */

  useEffect(() => {
    if (projects.length > 0) {
      fetchServerTasks(projects);
    } else {
      setServerTasks([]);
    }
  }, [projects]);

  /* =======================================================
     REFRESH DATA
  ======================================================= */

  const refreshData = async () => {
    try {
      setError("");

      const clientResponse =
        await API.get("/clients");

      setClients(
        clientResponse.data?.clients ||
          []
      );

      const projectResponse =
        await API.get("/projects");

      const projectData =
        projectResponse.data;

      const projectList =
        projectData?.projects ||
        projectData?.data ||
        (Array.isArray(projectData)
          ? projectData
          : []);

      const safeProjects =
        Array.isArray(projectList)
          ? projectList
          : [];

      setProjects(safeProjects);

      await fetchServerTasks(
        safeProjects
      );

      await fetchTimeLogs();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to refresh data"
      );
    }
  };

  /* =======================================================
     CLIENT INPUT CHANGE
  ======================================================= */

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

  /* =======================================================
     SAVE EXTRA CLIENT DATA
  ======================================================= */

  const saveExtraClientData = (
    clientId,
    values
  ) => {
    if (!clientId) return;

    const currentMeta =
      readClientMeta();

    const updatedMeta = {
      ...currentMeta,
      [clientId]: {
        ...(currentMeta[clientId] || {}),
        ...values,
      },
    };

    saveClientMeta(updatedMeta);
    setClientMeta(updatedMeta);
  };

  /* =======================================================
     SAVE CLIENT
  ======================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const apiForm = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company,
        defaultHourlyRate:
          form.defaultHourlyRate,
        address: form.address,
        status: form.status,
        budget: form.budget,
        received: form.received,
        deadline: form.deadline,
      };

      if (editingId) {
        await API.put(
          `/clients/${editingId}`,
          apiForm
        );

        saveExtraClientData(
          editingId,
          {
            status:
              form.status ||
              "In Progress",

            budget:
              Number(form.budget) || 0,

            received:
              Number(form.received) || 0,

            deadline:
              form.deadline || "",
          }
        );
      } else {
        const response =
          await API.post(
            "/clients",
            apiForm
          );

        const createdClient =
          response.data?.client ||
          response.data?.data;

        if (createdClient?._id) {
          saveExtraClientData(
            createdClient._id,
            {
              status:
                form.status ||
                "In Progress",

              budget:
                Number(form.budget) || 0,

              received:
                Number(form.received) || 0,

              deadline:
                form.deadline || "",
            }
          );
        }
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);

      await refreshData();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to save client"
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     EDIT CLIENT
  ======================================================= */

  const handleEdit = (client) => {
    const meta =
      clientMeta[client._id] || {};

    setEditingId(client._id);

    setForm({
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      company: client.company || "",
      defaultHourlyRate:
        client.defaultHourlyRate || "",

      address: client.address || "",

      status:
        client.status ||
        meta.status ||
        "In Progress",

      budget:
        client.budget ??
        meta.budget ??
        "",

      received:
        client.received ??
        meta.received ??
        "",

      deadline: client.deadline
        ? String(client.deadline).slice(
            0,
            10
          )
        : meta.deadline || "",
    });

    setShowForm(true);
  };

  /* =======================================================
     DELETE CLIENT
  ======================================================= */

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this client?"
      );

    if (!confirmed) return;

    try {
      setError("");

      await API.delete(
        `/clients/${id}`
      );

      const meta =
        readClientMeta();

      delete meta[id];

      saveClientMeta(meta);
      setClientMeta(meta);

      /* Remove local tasks of this client */

      const updatedTasks =
        readClientTasks().filter(
          (task) =>
            String(task.clientId) !==
            String(id)
        );

      saveClientTasks(
        updatedTasks
      );

      setClientTasks(
        updatedTasks
      );

      await refreshData();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete client"
      );
    }
  };

  /* =======================================================
     CLOSE CLIENT FORM
  ======================================================= */

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredClients =
    useMemo(() => {
      const query =
        search
          .toLowerCase()
          .trim();

      if (!query) {
        return clients;
      }

      return clients.filter(
        (client) =>
          client.name
            ?.toLowerCase()
            .includes(query) ||

          client.email
            ?.toLowerCase()
            .includes(query) ||

          client.company
            ?.toLowerCase()
            .includes(query)
      );
    }, [
      clients,
      search,
    ]);

  /* =======================================================
     SHOW / HIDE DETAILS
  ======================================================= */

  const toggleClientDetails = (
    clientId
  ) => {
    setExpandedClients(
      (previous) => ({
        ...previous,

        [clientId]:
          !previous[clientId],
      })
    );
  };

  /* =======================================================
     GET CLIENT PROJECTS
  ======================================================= */

  const getClientProjects = (
    clientId
  ) => {
    return projects.filter(
      (project) =>
        String(
          project.client?._id ||
            project.client
        ) === String(clientId)
    );
  };

  /* =======================================================
     GET LOCAL CLIENT TASKS
  ======================================================= */

  const getLocalClientTasks = (
    clientId
  ) => {
    return clientTasks.filter(
      (task) =>
        String(task.clientId) ===
        String(clientId)
    );
  };

  /* =======================================================
     OPEN TASK FORM
  ======================================================= */

/* =======================================================
   OPEN TASK FORM
======================================================= */

const openTaskForm = (client) => {

  // Client details automatically open
  setExpandedClients((previous) => ({
    ...previous,
    [client._id]: true,
  }));

  // Selected client
  setTaskClientId(client._id);

  // Reset form
  setTaskForm(emptyTaskForm);

  // Show form
  setShowTaskForm(true);

};
  /* =======================================================
     CLOSE TASK FORM
  ======================================================= */

  const closeTaskForm = () => {
    setShowTaskForm(false);
    setTaskClientId(null);
    setTaskForm(emptyTaskForm);
  };

  /* =======================================================
     TASK FORM CHANGE
  ======================================================= */

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
  };

  /* =======================================================
     ADD NEW TASK
  ======================================================= */

  const saveNewClientTask = (
    event
  ) => {
    event.preventDefault();

    if (
      !taskClientId ||
      !taskForm.name.trim()
    ) {
      return;
    }

    const newTask = {
      id:
        `client-task-${Date.now()}-` +
        Math.random()
          .toString(36)
          .slice(2, 8),

      clientId: taskClientId,

      name:
        taskForm.name.trim(),

      title:
        taskForm.name.trim(),

      type:
        taskForm.type,

      description:
        taskForm.description.trim(),

      dueDate:
        taskForm.dueDate,

      completed: false,

      status: "Pending",

      createdAt:
        new Date().toISOString(),
    };

    const updatedTasks = [
      ...clientTasks,
      newTask,
    ];

    saveClientTasks(
      updatedTasks
    );

    setClientTasks(
      updatedTasks
    );

    /*
      Form reset hota hai lekin
      task form open rehta hai,
      isliye multiple tasks
      continuously add kar sakte ho.
    */

    setTaskForm(
      emptyTaskForm
    );
  };

  /* =======================================================
     COMPLETE / UNCOMPLETE TASK
  ======================================================= */

  const toggleClientTask = (
    taskId
  ) => {
    const updatedTasks =
      clientTasks.map(
        (task) => {
          if (
            String(task.id) !==
            String(taskId)
          ) {
            return task;
          }

          const completed =
            !Boolean(
              task.completed
            );

          return {
            ...task,

            completed,

            status: completed
              ? "Completed"
              : "Pending",

            completedAt:
              completed
                ? new Date().toISOString()
                : null,
          };
        }
      );

    saveClientTasks(
      updatedTasks
    );

    setClientTasks(
      updatedTasks
    );
  };

  /* =======================================================
     DELETE TASK
  ======================================================= */

  const deleteClientTask = (
    taskId
  ) => {
    const updatedTasks =
      clientTasks.filter(
        (task) =>
          String(task.id) !==
          String(taskId)
      );

    saveClientTasks(
      updatedTasks
    );

    setClientTasks(
      updatedTasks
    );
  };

  /* =======================================================
     GET ALL TASKS FOR CLIENT
  ======================================================= */

  const getClientTasks = (
    clientId
  ) => {
    const clientProjects =
      getClientProjects(
        clientId
      );

    const projectIds =
      new Set(
        clientProjects.map(
          (project) =>
            String(project._id)
        )
      );

    /* Server tasks */

    const serverClientTasks =
      serverTasks.filter(
        (task) =>
          projectIds.has(
            String(
              task.project?._id ||
                task.project
            )
          )
      );

    /* Tasks page local tasks */

    const localTasks =
      readLocalTasks();

    const localClientTasks =
      localTasks.filter(
        (task) =>
          projectIds.has(
            String(
              task.projectId
            )
          )
      );

    /* Direct client tasks */

    const directClientTasks =
      getLocalClientTasks(
        clientId
      );

    const combined = [
      ...serverClientTasks,
      ...localClientTasks,
      ...directClientTasks,
    ];

    /* Remove duplicate tasks */

    const uniqueTasks = [];
    const seen = new Set();

    combined.forEach(
      (task, index) => {
        const id =
          task._id ||
          task.id ||
          `task-${index}`;

        if (
          !seen.has(String(id))
        ) {
          seen.add(
            String(id)
          );

          uniqueTasks.push(
            task
          );
        }
      }
    );

    return uniqueTasks;
  };

  /* =======================================================
     CALCULATE CLIENT PROGRESS
  ======================================================= */

  const getClientProgress = (
    clientId
  ) => {
    const tasks =
      getClientTasks(
        clientId
      );

    const total =
      tasks.length;

    const completed =
      tasks.filter(
        (task) =>
          Boolean(
            task.completed
          ) ||
          String(
            task.status || ""
          ).toLowerCase() ===
            "completed"
      ).length;

    if (total === 0) {
      return {
        total: 0,
        completed: 0,
        progress: 0,
      };
    }

    const progress =
      Math.round(
        (completed / total) *
          100
      );

    return {
      total,
      completed,
      progress,
    };
  };

  /* =======================================================
     CALCULATE TIME TRACKED
  ======================================================= */

  const getClientTime = (
    clientId
  ) => {
    const clientProjects =
      getClientProjects(
        clientId
      );

    const projectIds =
      new Set(
        clientProjects.map(
          (project) =>
            String(project._id)
        )
      );

    let totalSeconds = 0;

    timeLogs.forEach(
      (log) => {
        const projectId =
          log.project?._id ||
          log.project;

        if (
          projectIds.has(
            String(projectId)
          )
        ) {
          totalSeconds +=
            Number(
              log.duration
            ) || 0;
        }
      }
    );

    return totalSeconds;
  };

  /* =======================================================
     CLIENT DISPLAY DATA
  ======================================================= */

  const getClientDisplayData = (
    client
  ) => {
    const meta =
      clientMeta[
        client._id
      ] || {};

    const budget =
      Number(
        client.budget ??
          meta.budget ??
          0
      );

    const received =
      Number(
        client.received ??
          meta.received ??
          0
      );

    const pending =
      Math.max(
        budget - received,
        0
      );

    const status =
      client.status ||
      meta.status ||
      "In Progress";

    const deadline =
      client.deadline ||
      meta.deadline ||
      "";

    const progress =
      getClientProgress(
        client._id
      );

    const timeSeconds =
      getClientTime(
        client._id
      );

    return {
      budget,
      received,
      pending,
      status,
      deadline,
      progress,
      timeSeconds,
    };
  };

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const openProjects = (
    client
  ) => {
    navigate("/projects", {
      state: {
        clientId:
          client._id,

        clientName:
          client.name,
      },
    });
  };


/* =======================================================
   OPEN TASKS PAGE
======================================================= */

const openTasks = (client) => {
  navigate("/tasks", {
    state: {
      clientId: client._id,
      clientName: client.name,
    },
  });
};

  const startTimer = (
    client
  ) => {
    navigate("/time", {
      state: {
        clientId:
          client._id,

        clientName:
          client.name,
      },
    });
  };

  const createInvoice = (
    client
  ) => {
    navigate(
      "/invoices/create",
      {
        state: {
          clientId:
            client._id,

          clientName:
            client.name,
        },
      }
    );
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="clients-page">
      <div className="clients-container">

        {/* BACK BUTTON */}

        <button
          type="button"
          className="clients-back-btn"
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
            type="button"
            className="add-client-btn"
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
              setShowForm(true);
            }}
          >
            <Plus size={18} />
            <span>Add Client</span>
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="clients-error">
            {error}
          </div>
        )}

        {/* SEARCH */}

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
                setSearch(
                  event.target.value
                )
              }
            />
          </div>
        </div>

        {/* CLIENT FORM */}

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

              {/* NAME */}

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

              {/* STATUS */}

              <div className="client-form-group">
                <label className="client-form-label">
                  Status
                </label>

                <select
                  className="client-form-input"
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

              {/* BUDGET */}

              <div className="client-form-group">
                <label className="client-form-label">
                  Budget (₹)
                </label>

                <input
                  className="client-form-input"
                  type="number"
                  min="0"
                  name="budget"
                  value={form.budget}
                  onChange={handleChange}
                  placeholder="25000"
                />
              </div>

              {/* RECEIVED */}

              <div className="client-form-group">
                <label className="client-form-label">
                  Received (₹)
                </label>

                <input
                  className="client-form-input"
                  type="number"
                  min="0"
                  name="received"
                  value={form.received}
                  onChange={handleChange}
                  placeholder="10000"
                />
              </div>

              {/* DEADLINE */}

              <div className="client-form-group">
                <label className="client-form-label">
                  Deadline
                </label>

                <input
                  className="client-form-input"
                  type="date"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
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
                  value={
                    form.defaultHourlyRate
                  }
                  onChange={handleChange}
                  placeholder="Hourly rate"
                />
              </div>

              {/* ADDRESS */}

              <div className="client-form-group client-form-full-width">
                <label className="client-form-label">
                  Address
                </label>

                <input
                  className="client-form-input"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Agra, UP"
                />
              </div>

              {/* BUTTONS */}

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

        {/* CLIENT LIST */}

        {loading ? (
          <div className="clients-empty">
            <p>
              Loading clients...
            </p>
          </div>
        ) : filteredClients.length ===
          0 ? (
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

            {filteredClients.map(
              (client) => {
                const data =
                  getClientDisplayData(
                    client
                  );

                const isExpanded =
                  Boolean(
                    expandedClients[
                      client._id
                    ]
                  );

                const localTasks =
                  getLocalClientTasks(
                    client._id
                  );

                return (
                  <div
                    key={client._id}
                    className={`client-card ${
                      isExpanded
                        ? "client-card-expanded"
                        : "client-card-collapsed"
                    }`}
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
                            handleEdit(
                              client
                            )
                          }
                          title="Edit Client"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          className="client-action-btn client-delete-btn"
                          onClick={() =>
                            handleDelete(
                              client._id
                            )
                          }
                          title="Delete Client"
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>
                    </div>

                    {/* STATUS */}

                    <div className="client-status-row">

                      <span className="client-status-label">
                        Status:
                      </span>

                      <span
                        className={`client-status-badge ${
                          data.status
                            .toLowerCase()
                            .replace(
                              /\s+/g,
                              "-"
                            )
                        }`}
                      >
                        {data.status}
                      </span>

                    </div>

                    {/* EMAIL + PHONE SAME LINE */}

                    <div className="client-contact-row">

                      {client.email && (
                        <a
                          href={`mailto:${client.email}`}
                          className="client-contact-item"
                        >
                          <Mail size={17} />

                          <span>
                            {client.email}
                          </span>
                        </a>
                      )}

                      {client.phone && (
                        <a
                          href={`tel:${client.phone}`}
                          className="client-contact-item"
                        >
                          <Phone size={17} />

                          <span>
                            {client.phone}
                          </span>
                        </a>
                      )}

                    </div>

                    {/* LOCATION */}

                    {client.address && (
                      <div className="client-location">

                        <MapPin size={17} />

                        <span>
                          {client.address}
                        </span>

                      </div>
                    )}

                  {/* =================================================
    DETAILS
================================================= */}

<div
  className={`client-extra-details ${
    isExpanded ? "show" : "hide"
  }`}
>

  {/* =================================================
      FINANCIAL
  ================================================= */}

  <div className="client-financial-grid">

    <div className="client-financial-item">

      <span>
        Budget
      </span>

      <strong>
        {formatCurrency(data.budget)}
      </strong>

    </div>

    <div className="client-financial-item">

      <span>
        Received
      </span>

      <strong className="client-received">
        {formatCurrency(data.received)}
      </strong>

    </div>

    <div className="client-financial-item">

      <span>
        Pending
      </span>

      <strong className="client-pending">
        {formatCurrency(data.pending)}
      </strong>

    </div>

  </div>


  {/* =================================================
      DEADLINE
  ================================================= */}

  <div className="client-deadline">

    <CalendarDays size={18} />

    <span>
      Deadline:
    </span>

    <strong>
      {formatDate(data.deadline)}
    </strong>

  </div>


  {/* =================================================
      AUTOMATIC PROGRESS
  ================================================= */}

  <div className="client-progress-section">

    <div className="client-progress-header">

      <span>
        Progress
      </span>

      <strong>
        {data.progress.progress}%
      </strong>

    </div>

    <div className="client-progress-bar">

      <div
        className="client-progress-fill"
        style={{
          width: `${data.progress.progress}%`,
        }}
      />

    </div>

    <div className="client-progress-text">

      {data.progress.completed}{" "}
      of{" "}
      {data.progress.total}{" "}
      tasks completed

    </div>

  </div>


  {/* =================================================
      TASK + TIME SUMMARY
  ================================================= */}

  <div className="client-work-summary">

    


    <div className="client-work-item">

      <Clock3 size={19} />

      <div>

        <span>
          Time Tracked
        </span>

        <strong>
          {formatSeconds(data.timeSeconds)}
        </strong>

      </div>

    </div>

  </div>


  


  {/* =================================================
      ADD TASK FORM
      YE BHI DETAILS KE ANDAR HAI
  ================================================= */}

  


</div>


{/* =================================================
    SHOW / HIDE DETAILS
    YE DETAILS DIV KE BAHAR RAHEGA
================================================= */}

<button
  type="button"
  className="client-show-more-btn"
  onClick={() =>
    toggleClientDetails(client._id)
  }
>

  {isExpanded ? (

    <>

      <ChevronUp size={16} />

      Hide Details

    </>

  ) : (

    <>

      <ChevronDown size={16} />

      Show Details

    </>

  )}

</button>


{/* =================================================
    ACTION BUTTONS
================================================= */}

                    {/* ACTION BUTTONS */}

                    <div className="client-quick-actions">

                     
                      {/* VIEW PROJECTS */}

                      <button
                        type="button"
                        onClick={() =>
                          openProjects(
                            client
                          )
                        }
                      >
                        <FolderKanban
                          size={16}
                        />

                        View Projects
                      </button>



<button
  type="button"
  onClick={() =>
    openTasks(client)
  }
>
  <ListTodo size={16} />
  Tasks
</button>



                      {/* START TIMER */}

                      <button
                        type="button"
                        onClick={() =>
                          startTimer(
                            client
                          )
                        }
                      >
                        <Play size={16} />
                        Start Timer
                      </button>

                      {/* CREATE INVOICE */}

                      <button
                        type="button"
                        onClick={() =>
                          createInvoice(
                            client
                          )
                        }
                      >
                        <Receipt
                          size={16}
                        />

                        Create Invoice
                      </button>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default Clients;