import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Play,
  Square,
  Trash2,
  Clock3,
  RefreshCw,
  Plus,
  X,
  Pencil,
  MoreVertical,
  Eye,
  Users,
  FolderKanban,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import API from "../services/api";

import "./TimeTracking.css";

const TimeTracking = () => {
  const navigate = useNavigate();
  const location = useLocation();



  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);

  const [activeTimer, setActiveTimer] = useState(null);

  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTask, setSelectedTask] = useState("");

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showManualForm, setShowManualForm] =
    useState(false);

  const [editingLogId, setEditingLogId] =
    useState(null);

  const [openActionMenu, setOpenActionMenu] =
    useState(null);

  const [manualForm, setManualForm] = useState({
    project: "",
    task: "",
    startTime: "",
    endTime: "",
    hourlyRate: "",
    billed: false,
  });

  

  useEffect(() => {
    loadInitialData();
  }, []);



  useEffect(() => {
    const state = location.state;

    if (!state) return;

    // Message
    if (state.message) {
      setMessage(state.message);

      setTimeout(() => {
        setMessage("");
      }, 2500);
    }

    // Edit request from Time Log Details / All Logs
    if (state.editLogId && state.log) {
      handleEditLog(state.log);
    }

    // Clear navigation state
    window.history.replaceState(
      {},
      document.title
    );
  }, [location.state]);


  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        !event.target.closest(".log-menu-wrapper")
      ) {
        setOpenActionMenu(null);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);



  const loadInitialData = async () => {
    setError("");

    try {
      await Promise.all([
        loadProjects(),
        loadTimeLogs(),
        loadActiveTimer(),
      ]);
    } catch (error) {
      console.error(
        "Initial Data Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load data"
      );
    }
  };

 

  const loadProjects = async () => {
    const response = await API.get("/projects");

    if (response.data.success) {
      setProjects(
        response.data.projects || []
      );
    }
  };



const loadTasks = async (projectId) => {
  if (!projectId) {
    setTasks([]);
    return;
  }

  try {
    const response = await API.get(
      `/tasks?project=${projectId}`
    );

    if (response.data.success) {
      const receivedTasks =
        response.data.tasks || [];

      // ONLY SELECTED PROJECT TASKS
      const projectTasks = receivedTasks.filter(
        (task) => {
          const taskProjectId =
            task.projectId ||
            task.project?._id ||
            task.project?.id ||
            task.project;

          return (
            taskProjectId &&
            String(taskProjectId) ===
              String(projectId)
          );
        }
      );

      setTasks(projectTasks);
    } else {
      setTasks([]);
    }
  } catch (error) {
    console.error(
      "Load Tasks Error:",
      error
    );

    setTasks([]);
  }
};


  const loadTimeLogs = async () => {
    const response = await API.get("/time");

    if (response.data.success) {
      setTimeLogs(
        response.data.timeLogs || []
      );
    }
  };


  const loadActiveTimer = async () => {
    const response = await API.get(
      "/time/active"
    );

    if (
      response.data.success &&
      response.data.timer
    ) {
      const timer = response.data.timer;

      setActiveTimer(timer);

      if (timer.project?._id) {
        setSelectedProject(
          timer.project._id
        );

        await loadTasks(
          timer.project._id
        );
      }

      if (timer.task?._id) {
        setSelectedTask(
          timer.task._id
        );
      }

      calculateElapsedTime(
        timer.startTime
      );
    } else {
      setActiveTimer(null);
      setElapsedSeconds(0);
    }
  };



  const calculateElapsedTime = (
    startTime
  ) => {
    if (!startTime) {
      setElapsedSeconds(0);
      return;
    }

    const seconds = Math.max(
      0,
      Math.floor(
        (Date.now() -
          new Date(startTime).getTime()) /
          1000
      )
    );

    setElapsedSeconds(seconds);
  };


  useEffect(() => {
    if (!activeTimer) {
      return;
    }

    const interval = setInterval(() => {
      calculateElapsedTime(
        activeTimer.startTime
      );
    }, 1000);

    return () =>
      clearInterval(interval);
  }, [activeTimer]);



  const handleBack = () => {
  navigate("/", { replace: true });
};


  const handleRefresh = async () => {
    if (refreshing) {
      return;
    }

    try {
      setRefreshing(true);
      setError("");

      await Promise.all([
        loadProjects(),
        loadTimeLogs(),
        loadActiveTimer(),
      ]);

      setMessage(
        "Data refreshed successfully"
      );

      setTimeout(() => {
        setMessage("");
      }, 2500);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to refresh data"
      );
    } finally {
      setRefreshing(false);
    }
  };




const handleProjectChange = async (event) => {
  const projectId = event.target.value;

  setSelectedProject(projectId);

 
  setSelectedTask("");

  setTasks([]);

  setError("");

  if (projectId) {
    await loadTasks(projectId);
  }
};



  const handleStartTimer = async () => {
    if (!selectedProject) {
      setError(
        "Please select a project first."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await API.post(
        "/time/start",
        {
          project: selectedProject,
          task: selectedTask || null,
        }
      );

      if (response.data.success) {
        setActiveTimer(
          response.data.timer
        );

        setElapsedSeconds(0);

        await loadTimeLogs();

        setMessage(
          "Timer started successfully"
        );
      }
    } catch (error) {
      console.error(
        "Start Timer Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to start timer"
      );
    } finally {
      setLoading(false);
    }
  };

 

  const handleStopTimer = async () => {
    if (!activeTimer?._id) {
      return;
    }

    const timerId =
      activeTimer._id;

    const previousTimer =
      activeTimer;

    const previousElapsed =
      elapsedSeconds;

    // Immediate UI stop
    setActiveTimer(null);
    setElapsedSeconds(0);
    setError("");
    setLoading(false);

    setMessage(
      "Stopping timer..."
    );

    try {
      const response =
        await API.put(
          `/time/stop/${timerId}`
        );

      if (response.data.success) {
        await loadTimeLogs();

        setMessage(
          "Timer stopped successfully"
        );

        setTimeout(() => {
          setMessage("");
        }, 2500);
      } else {
        throw new Error(
          response.data.message ||
            "Failed to stop timer"
        );
      }
    } catch (error) {
      console.error(
        "Stop Timer Error:",
        error
      );

      // Restore timer if API failed
      setActiveTimer(
        previousTimer
      );

      setElapsedSeconds(
        previousElapsed
      );

      setError(
        error.response?.data?.message ||
          "Failed to stop timer"
      );

      setMessage("");
    }
  };

  
  const handleManualChange = (
    field,
    value
  ) => {
    setManualForm(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );
  };



  const handleManualProjectChange =
    async (event) => {
      const projectId =
        event.target.value;

      setManualForm(
        (previous) => ({
          ...previous,
          project: projectId,
          task: "",
        })
      );

      setTasks([]);

      if (projectId) {
        await loadTasks(projectId);
      }
    };



  const formatDateTimeLocal = (
    date
  ) => {
    if (!date) {
      return "";
    }

    const d = new Date(date);

    const year =
      d.getFullYear();

    const month = String(
      d.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      d.getDate()
    ).padStart(2, "0");

    const hours = String(
      d.getHours()
    ).padStart(2, "0");

    const minutes = String(
      d.getMinutes()
    ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };



  const handleViewLog = (log) => {
    setOpenActionMenu(null);

    navigate(
      `/time-log/${log._id}`,
      {
        state: {
          log,
        },
      }
    );
  };

 

  const handleViewAllLogs = () => {
    setOpenActionMenu(null);
    navigate("/time-logs");
  };



  const handleEditLog = async (
    log
  ) => {
    if (!log?.endTime) {
      setError(
        "Stop the timer before editing."
      );

      return;
    }

    setError("");
    setOpenActionMenu(null);

    setEditingLogId(log._id);

    setManualForm({
      project:
        log.project?._id || "",

      task:
        log.task?._id || "",

      startTime:
        formatDateTimeLocal(
          log.startTime
        ),

      endTime:
        formatDateTimeLocal(
          log.endTime
        ),

      hourlyRate:
        log.hourlyRate ?? "",

      billed:
        Boolean(log.billed),
    });

    if (log.project?._id) {
      await loadTasks(
        log.project._id
      );
    }

    setShowManualForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };



  const handleCancelManual = () => {
    setShowManualForm(false);
    setEditingLogId(null);

    setManualForm({
      project: "",
      task: "",
      startTime: "",
      endTime: "",
      hourlyRate: "",
      billed: false,
    });

    setTasks([]);
  };

 

  const handleManualSubmit =
    async (event) => {
      event.preventDefault();

      setError("");

      const {
        project,
        task,
        startTime,
        endTime,
        hourlyRate,
        billed,
      } = manualForm;

      if (!project) {
        setError(
          "Please select a project."
        );

        return;
      }

      if (!startTime || !endTime) {
        setError(
          "Start time and end time are required."
        );

        return;
      }

      const start =
        new Date(startTime);

      const end =
        new Date(endTime);

      if (end <= start) {
        setError(
          "End time must be after start time."
        );

        return;
      }

      try {
        setLoading(true);

        const payload = {
          project,
          task: task || null,
          startTime,
          endTime,
          hourlyRate:
            hourlyRate === ""
              ? undefined
              : Number(hourlyRate),
          billed,
        };

        let response;

        if (editingLogId) {
          response =
            await API.put(
              `/time/manual/${editingLogId}`,
              payload
            );
        } else {
          response =
            await API.post(
              "/time/manual",
              payload
            );
        }

        if (response.data.success) {
          setMessage(
            editingLogId
              ? "Manual time log updated successfully."
              : "Manual time log created successfully."
          );

          handleCancelManual();

          await loadTimeLogs();

          setTimeout(() => {
            setMessage("");
          }, 2500);
        }
      } catch (error) {
        console.error(
          "Manual Time Error:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to save time log"
        );
      } finally {
        setLoading(false);
      }
    };


  const handleDeleteLog = async (
    id
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this time log?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setOpenActionMenu(null);

      await API.delete(
        `/time/${id}`
      );

      await loadTimeLogs();

      setMessage(
        "Time log deleted successfully"
      );

      setTimeout(() => {
        setMessage("");
      }, 2500);
    } catch (error) {
      console.error(
        "Delete Time Log Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to delete time log"
      );
    } finally {
      setLoading(false);
    }
  };

 

  const formatTime = (
    seconds
  ) => {
    const total =
      Number(seconds) || 0;

    const hrs = Math.floor(
      total / 3600
    );

    const mins = Math.floor(
      (total % 3600) / 60
    );

    const secs =
      total % 60;

    return [
      hrs,
      mins,
      secs,
    ]
      .map((value) =>
        String(value).padStart(
          2,
          "0"
        )
      )
      .join(":");
  };


  const formatDate = (
    date
  ) => {
    if (!date) {
      return "-";
    }

    return new Date(
      date
    ).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };



  return (
    <div className="time-page">
      <div className="time-container">


        <div className="time-topbar">

          <button
            type="button"
            className="time-back-btn"
            onClick={handleBack}
          >
            <ArrowLeft size={19} />
            Back
          </button>

          <button
            type="button"
            className="refresh-time-btn"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              size={18}
              className={
                refreshing
                  ? "refresh-spinning"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>

       

        <div className="time-header">

          <div>
            <h1>
              Time Tracking
            </h1>

            <p>
              Track your working
              hours and calculate
              your earnings.
            </p>
          </div>

        </div>

    
        {error && (
          <div className="time-error">
            {error}
          </div>
        )}

       

        {message && (
          <div className="time-success">
            {message}
          </div>
        )}

        

        <div className="timer-card">

          <div className="timer-card-header">

            <div>
              <h2>
                <Clock3 size={23} />
                Timer
              </h2>

              <p>
                Start tracking your
                project work.
              </p>
            </div>

          </div>

          {!activeTimer ? (
            <>
              <div className="timer-form">

                {/* PROJECT */}

                <div className="timer-field">

                  <label>
                    Project
                  </label>

                  <select
                    value={
                      selectedProject
                    }
                    onChange={
                      handleProjectChange
                    }
                  >
                    <option value="">
                      Select Project
                    </option>

                    {projects.map(
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

                {/* TASK */}

                <div className="timer-field">

                  <label>
                    Task
                  </label>

                  <select
                    value={
                      selectedTask
                    }
                    onChange={(e) =>
                      setSelectedTask(
                        e.target.value
                      )
                    }
                    disabled={
                      !selectedProject
                    }
                  >
                    <option value="">
                      No Task
                    </option>

                    {tasks.map(
                      (task) => (
                        <option
                          key={
                            task._id
                          }
                          value={
                            task._id
                          }
                        >
                          {
                            task.title
                          }
                        </option>
                      )
                    )}
                  </select>

                </div>

              </div>

              {/* START */}

              <button
                type="button"
                className="start-timer-btn"
                onClick={
                  handleStartTimer
                }
                disabled={loading}
              >
                <Play
                  size={20}
                  fill="currentColor"
                />

                {loading
                  ? "Starting..."
                  : "Start Timer"}
              </button>
            </>
          ) : (

            /* ACTIVE TIMER */

            <div className="active-timer">

              <div className="active-status">
                <span className="live-dot" />
                Timer Running
              </div>

              <div className="stopwatch">
                {formatTime(
                  elapsedSeconds
                )}
              </div>

              <div className="active-project">

                <strong>
                  {
                    activeTimer
                      .project
                      ?.name
                  }
                </strong>

                {activeTimer.task
                  ?.title && (
                  <span>
                    {
                      activeTimer
                        .task
                        .title
                    }
                  </span>
                )}

              </div>

              <button
                type="button"
                className="stop-timer-btn"
                onClick={
                  handleStopTimer
                }
                disabled={false}
              >
                <Square
                  size={18}
                  fill="currentColor"
                />

                Stop Timer
              </button>

            </div>
          )}

        </div>


        <div className="manual-log-section">

          <div className="manual-log-header">

            <div>
              <h2>
                {editingLogId
                  ? "Edit Manual Time Entry"
                  : "Manual Time Entry"}
              </h2>

              <p>
                {editingLogId
                  ? "Update your existing time entry."
                  : "Add working hours manually."}
              </p>
            </div>

            <button
              type="button"
              className="manual-log-toggle"
              onClick={() => {
                if (
                  showManualForm
                ) {
                  handleCancelManual();
                } else {
                  setShowManualForm(
                    true
                  );
                }
              }}
            >
              {showManualForm ? (
                <>
                  <X size={18} />
                  Close
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Add Manual Log
                </>
              )}
            </button>

          </div>

          {showManualForm && (
            <form
              className="manual-log-form"
              onSubmit={
                handleManualSubmit
              }
            >

              {/* PROJECT */}

              <div className="manual-field">

                <label>
                  Project
                </label>

                <select
                  value={
                    manualForm.project
                  }
                  onChange={
                    handleManualProjectChange
                  }
                  required
                >
                  <option value="">
                    Select Project
                  </option>

                  {projects.map(
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

              {/* TASK */}

              <div className="manual-field">

                <label>
                  Task
                </label>

                <select
                  value={
                    manualForm.task
                  }
                  onChange={(e) =>
                    handleManualChange(
                      "task",
                      e.target.value
                    )
                  }
                  disabled={
                    !manualForm.project
                  }
                >
                  <option value="">
                    No Task
                  </option>

                  {tasks.map(
                    (task) => (
                      <option
                        key={
                          task._id
                        }
                        value={
                          task._id
                        }
                      >
                        {
                          task.title
                        }
                      </option>
                    )
                  )}
                </select>

              </div>

              {/* START */}

              <div className="manual-field">

                <label>
                  Start Time
                </label>

                <input
                  type="datetime-local"
                  value={
                    manualForm.startTime
                  }
                  onChange={(e) =>
                    handleManualChange(
                      "startTime",
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              {/* END */}

              <div className="manual-field">

                <label>
                  End Time
                </label>

                <input
                  type="datetime-local"
                  value={
                    manualForm.endTime
                  }
                  onChange={(e) =>
                    handleManualChange(
                      "endTime",
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              {/* RATE */}

              <div className="manual-field">

                <label>
                  Hourly Rate
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    manualForm.hourlyRate
                  }
                  placeholder="Example: 500"
                  onChange={(e) =>
                    handleManualChange(
                      "hourlyRate",
                      e.target.value
                    )
                  }
                />

              </div>

              {/* BILLED */}

              <div className="manual-billed">

                <label>

                  <input
                    type="checkbox"
                    checked={
                      manualForm.billed
                    }
                    onChange={(e) =>
                      handleManualChange(
                        "billed",
                        e.target.checked
                      )
                    }
                  />

                  Mark as billed

                </label>

              </div>

              {/* ACTION */}

              <div className="manual-form-actions">

                <button
                  type="submit"
                  className="manual-save-btn"
                  disabled={loading}
                >
                  {editingLogId ? (
                    <Pencil
                      size={18}
                    />
                  ) : (
                    <Plus
                      size={18}
                    />
                  )}

                  {loading
                    ? "Saving..."
                    : editingLogId
                    ? "Update Time Log"
                    : "Save Time Log"}
                </button>

              </div>

            </form>
          )}

        </div>

        

        <div className="logs-card">

          <div className="logs-header">

            <div>
              <h2>
                Time Logs
              </h2>

              <p>
                Your completed
                tracking sessions.
              </p>
            </div>

            <div className="logs-header-actions">

             

              {/* VIEW ALL */}

              {timeLogs.length > 0 && (
                <button
                  type="button"
                  className="view-all-logs-btn"
                  onClick={
                    handleViewAllLogs
                  }
                >
                  View All
                </button>
              )}

            </div>

          </div>

          {timeLogs.length === 0 ? (

            <div className="empty-logs">

              <Clock3 size={42} />

              <h3>
                No time logs yet
              </h3>

              <p>
                Start a timer or
                add a manual entry.
              </p>

            </div>

          ) : (

            <div className="logs-table-wrapper">

              <table className="logs-table">

                <thead>
                  <tr>

                    <th>
                      Project
                    </th>

                    <th>
                      Task
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Duration
                    </th>

                    <th>
                      Rate
                    </th>

                    <th>
                      Amount
                    </th>

                    <th>
                      Billed
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {/* ONLY 2 LOGS ON MAIN PAGE */}

                  {timeLogs
                    .slice(0, 2)
                    .map((log) => (

                    <tr
                      key={
                        log._id
                      }
                    >

                      <td>
                        {
                          log.project
                            ?.name ||
                          "-"
                        }
                      </td>

                      <td>
                        {
                          log.task
                            ?.title ||
                          "-"
                        }
                      </td>

                      <td>
                        {formatDate(
                          log.startTime
                        )}
                      </td>

                      <td>
                        {formatTime(
                          Number(
                            log.duration ||
                              0
                          )
                        )}
                      </td>

                      <td>
                        ₹
                        {Number(
                          log.hourlyRate ||
                            0
                        ).toFixed(2)}
                      </td>

                      <td>
                        <strong>
                          ₹
                          {Number(
                            log.amount ||
                              0
                          ).toFixed(2)}
                        </strong>
                      </td>

                      <td>

                        <span
                          className={
                            log.billed
                              ? "billed-badge"
                              : "unbilled-badge"
                          }
                        >
                          {log.billed
                            ? "Billed"
                            : "Unbilled"}
                        </span>

                      </td>

                      {/* ACTION */}

                      <td>

                        <div className="log-actions">

                          {/* VIEW */}

                          <button
                            type="button"
                            className="view-log-btn"
                            onClick={() =>
                              handleViewLog(
                                log
                              )
                            }
                            title="View Details"
                          >
                            <Eye
                              size={17}
                            />

                            <span>
                              View
                            </span>
                          </button>

                          {/* THREE DOT */}

                          <div className="log-menu-wrapper">

                            <button
                              type="button"
                              className="log-menu-btn"
                              onClick={() =>
                                setOpenActionMenu(
                                  openActionMenu ===
                                    log._id
                                    ? null
                                    : log._id
                                )
                              }
                              title="More"
                            >
                              <MoreVertical
                                size={19}
                              />
                            </button>

                            {openActionMenu ===
                              log._id && (
                              <div className="log-action-menu">

                                {/* EDIT */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEditLog(
                                      log
                                    )
                                  }
                                  disabled={
                                    loading ||
                                    !log.endTime
                                  }
                                >
                                  <Pencil
                                    size={16}
                                  />

                                  Edit
                                </button>

                                {/* DELETE */}

                                <button
                                  type="button"
                                  className="danger"
                                  onClick={() =>
                                    handleDeleteLog(
                                      log._id
                                    )
                                  }
                                  disabled={
                                    loading
                                  }
                                >
                                  <Trash2
                                    size={16}
                                  />

                                  Delete
                                </button>

                              </div>
                            )}

                          </div>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>
 

 <div className="client-project-actions">
  <button
    type="button"
    className="time-client-btn"
    onClick={() => navigate("/clients")}
  >
    <Users size={18} />
    <span>Client</span>
  </button>

  <button
    type="button"
    className="time-project-btn"
    onClick={() => navigate("/projects")}
  >
    <FolderKanban size={18} />
    <span>Project</span>
  </button>
</div>

</div>
    
    
  );
};

export default TimeTracking;
