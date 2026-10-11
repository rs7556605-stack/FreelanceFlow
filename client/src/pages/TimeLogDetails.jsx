import React, { useEffect, useState } from "react";

import {
  ArrowLeft,
  Pencil,
  Trash2,
  MoreVertical,
  Clock3,
  CalendarDays,
  DollarSign,
  Briefcase,
  CheckCircle2,
  Circle,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import API from "../services/api";

import "./TimeLogDetails.css";

const TimeLogDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // ==========================================
  // STATE
  // ==========================================

  const [log, setLog] = useState(
    location.state?.log || null
  );

  const [loading, setLoading] = useState(
    !location.state?.log
  );

  const [error, setError] = useState("");

  const [showMenu, setShowMenu] = useState(false);

  const [deleting, setDeleting] = useState(false);

  // ==========================================
  // BACK
  // ==========================================

  const handleBack = () => {
    navigate("/time-logs");
  };

  // ==========================================
  // LOAD LOG
  // ==========================================

  const loadLog = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/time");

      const logs =
        response.data?.timeLogs || [];

      const foundLog = logs.find(
        (item) =>
          String(item?._id) === String(id)
      );

      if (!foundLog) {
        setLog(null);
        setError("Time log not found.");
        return;
      }

      setLog(foundLog);
    } catch (err) {
      console.error(
        "Load Time Log Error:",
        err
      );

      setLog(null);

      setError(
        err.response?.data?.message ||
          "Failed to load time log."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    if (!id) {
      setError("Invalid time log.");
      setLoading(false);
      return;
    }

    /*
      If TimeLogs page already passed
      the complete log through navigation state,
      use it immediately.
    */

    if (location.state?.log) {
      setLog(location.state.log);
      setLoading(false);
      return;
    }

    /*
      If user directly opens:
      /time-log/:id

      then load the log from backend.
    */

    loadLog();
  }, [id, location.state]);

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  // ==========================================
  // FORMAT DURATION
  // ==========================================

  const formatDuration = (seconds) => {
    const totalSeconds = Math.max(
      0,
      Number(seconds) || 0
    );

    const hours = Math.floor(
      totalSeconds / 3600
    );

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );

    const secs = Math.floor(
      totalSeconds % 60
    );

    return [
      String(hours).padStart(2, "0"),
      String(minutes).padStart(2, "0"),
      String(secs).padStart(2, "0"),
    ].join(":");
  };

  // ==========================================
  // PROJECT NAME
  // ==========================================

  const getProjectName = () => {
    if (!log) {
      return "-";
    }

    return (
      log.project?.name ||
      log.project?.title ||
      log.projectName ||
      "-"
    );
  };

  // ==========================================
  // TASK NAME
  // ==========================================

  const getTaskName = () => {
    if (!log) {
      return "No Task";
    }

    return (
      log.task?.title ||
      log.task?.name ||
      log.taskName ||
      "No Task"
    );
  };

  // ==========================================
  // HOURLY RATE
  // ==========================================

  const getRate = () => {
    if (!log) {
      return 0;
    }

    return Number(
      log.hourlyRate ??
        log.rate ??
        0
    );
  };

  // ==========================================
  // AMOUNT
  // ==========================================

  const getAmount = () => {
    if (!log) {
      return 0;
    }

    /*
      If backend already has amount,
      use it.
    */

    if (
      log.amount !== undefined &&
      log.amount !== null
    ) {
      return Number(log.amount) || 0;
    }

    /*
      Otherwise calculate:

      duration / 3600 × hourly rate
    */

    const durationHours =
      (Number(log.duration) || 0) /
      3600;

    return durationHours * getRate();
  };

  // ==========================================
  // EDIT
  // ==========================================

  const handleEdit = () => {
    if (!log?._id) {
      return;
    }

    setShowMenu(false);

    navigate("/time", {
      state: {
        editLogId: log._id,
        log,
      },
    });
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async () => {
    if (!log?._id || deleting) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this time log?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setShowMenu(false);
      setError("");

      await API.delete(
        `/time/${log._id}`
      );

      /*
        After successful deletion,
        go back to Time Logs.
      */

      navigate("/time-logs", {
        replace: true,
        state: {
          message:
            "Time log deleted successfully.",
        },
      });
    } catch (err) {
      console.error(
        "Delete Time Log Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to delete time log."
      );

      setDeleting(false);
    }
  };

  // ==========================================
  // CLOSE MENU WHEN CLICKING OUTSIDE
  // ==========================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        !event.target.closest(
          ".details-action-wrapper"
        )
      ) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener(
        "mousedown",
        handleOutsideClick
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [showMenu]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="time-details-page">
        <div className="time-details-container">

          <button
            type="button"
            className="details-back-btn"
            onClick={handleBack}
          >
            <ArrowLeft size={18} />
            Back to Time Logs
          </button>

          <div className="time-details-loading">

            <div className="details-loading-icon">
              <Clock3 size={34} />
            </div>

            <h2>
              Loading Time Log...
            </h2>

            <p>
              Please wait while we load the details.
            </p>

          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error || !log) {
    return (
      <div className="time-details-page">

        <div className="time-details-container">

          <button
            type="button"
            className="details-back-btn"
            onClick={handleBack}
          >
            <ArrowLeft size={18} />
            Back to Time Logs
          </button>

          <div className="details-error">

            <div className="details-error-icon">
              !
            </div>

            <h2>
              Time Log Not Found
            </h2>

            <p>
              {error ||
                "This time log could not be found."}
            </p>

            <button
              type="button"
              onClick={handleBack}
              className="details-error-back"
            >
              Back to Time Logs
            </button>

          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // VALUES
  // ==========================================

  const projectName = getProjectName();

  const taskName = getTaskName();

  const hourlyRate = getRate();

  const amount = getAmount();

  const billed = Boolean(log.billed);

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="time-details-page">

      <div className="time-details-container">

        {/* ========================================
            TOP BAR
        ======================================== */}

        <div className="details-topbar">

          <button
            type="button"
            className="details-back-btn"
            onClick={handleBack}
          >
            <ArrowLeft size={18} />
            <span>
              Back to Time Logs
            </span>
          </button>

          {/* ACTION MENU */}

          <div className="details-action-wrapper">

            <button
              type="button"
              className="details-more-btn"
              onClick={() =>
                setShowMenu(
                  (previous) =>
                    !previous
                )
              }
              title="Actions"
              aria-label="Actions"
            >
              <MoreVertical size={21} />
            </button>

            {showMenu && (
              <div className="details-action-menu">

                <button
                  type="button"
                  onClick={handleEdit}
                  disabled={!log.endTime}
                >
                  <Pencil size={16} />
                  Edit
                </button>

                <button
                  type="button"
                  className="danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <Trash2 size={16} />

                  {deleting
                    ? "Deleting..."
                    : "Delete"}
                </button>

              </div>
            )}

          </div>

        </div>

        {/* ========================================
            ERROR MESSAGE
        ======================================== */}

        {error && (
          <div className="details-inline-error">
            {error}
          </div>
        )}

        {/* ========================================
            HEADER
        ======================================== */}

        <div className="time-details-header">

          <div className="details-header-content">

            <span className="details-label">
              TIME LOG DETAILS
            </span>

            <h1>
              {projectName !== "-"
                ? projectName
                : "Time Log"}
            </h1>

            <p>
              Complete details of this
              working session.
            </p>

          </div>

          {/* BILLING STATUS */}

          <div
            className={
              billed
                ? "details-status billed"
                : "details-status unbilled"
            }
          >
            {billed ? (
              <>
                <CheckCircle2 size={17} />
                Billed
              </>
            ) : (
              <>
                <Circle size={17} />
                Unbilled
              </>
            )}
          </div>

        </div>

        {/* ========================================
            SUMMARY
        ======================================== */}

        <div className="details-summary-grid">

          {/* DURATION */}

          <div className="details-summary-card">

            <div className="summary-icon">
              <Clock3 size={21} />
            </div>

            <div>
              <span>
                Duration
              </span>

              <strong>
                {formatDuration(
                  log.duration
                )}
              </strong>
            </div>

          </div>

          {/* HOURLY RATE */}

          <div className="details-summary-card">

            <div className="summary-icon">
              <DollarSign size={21} />
            </div>

            <div>
              <span>
                Hourly Rate
              </span>

              <strong>
                ₹
                {hourlyRate.toFixed(2)}
              </strong>
            </div>

          </div>

          {/* TOTAL AMOUNT */}

          <div className="details-summary-card">

            <div className="summary-icon">
              <DollarSign size={21} />
            </div>

            <div>
              <span>
                Total Amount
              </span>

              <strong>
                ₹
                {amount.toFixed(2)}
              </strong>
            </div>

          </div>

        </div>

        {/* ========================================
            SESSION INFORMATION
        ======================================== */}

        <div className="details-card">

          <div className="details-card-header">

            <div>
              <h2>
                Session Information
              </h2>

              <p>
                Detailed information
                about this time entry.
              </p>
            </div>

          </div>

          <div className="details-info-grid">

            {/* PROJECT */}

            <div className="details-info-item">

              <div className="info-icon">
                <Briefcase size={19} />
              </div>

              <div>
                <span>
                  Project
                </span>

                <strong>
                  {projectName}
                </strong>
              </div>

            </div>

            {/* TASK */}

            <div className="details-info-item">

              <div className="info-icon">
                <Clock3 size={19} />
              </div>

              <div>
                <span>
                  Task
                </span>

                <strong>
                  {taskName}
                </strong>
              </div>

            </div>

            {/* DATE */}

            <div className="details-info-item">

              <div className="info-icon">
                <CalendarDays size={19} />
              </div>

              <div>
                <span>
                  Date
                </span>

                <strong>
                  {formatDate(
                    log.startTime ||
                      log.startedAt ||
                      log.createdAt
                  )}
                </strong>
              </div>

            </div>

            {/* START TIME */}

            <div className="details-info-item">

              <div className="info-icon">
                <Clock3 size={19} />
              </div>

              <div>
                <span>
                  Start Time
                </span>

                <strong>
                  {formatDate(
                    log.startTime ||
                      log.startedAt
                  )}
                </strong>
              </div>

            </div>

            {/* END TIME */}

            <div className="details-info-item">

              <div className="info-icon">
                <Clock3 size={19} />
              </div>

              <div>
                <span>
                  End Time
                </span>

                <strong>
                  {formatDate(
                    log.endTime
                  )}
                </strong>
              </div>

            </div>

            {/* DURATION */}

            <div className="details-info-item">

              <div className="info-icon">
                <Clock3 size={19} />
              </div>

              <div>
                <span>
                  Duration
                </span>

                <strong>
                  {formatDuration(
                    log.duration
                  )}
                </strong>
              </div>

            </div>

            {/* RATE */}

            <div className="details-info-item">

              <div className="info-icon">
                <DollarSign size={19} />
              </div>

              <div>
                <span>
                  Hourly Rate
                </span>

                <strong>
                  ₹
                  {hourlyRate.toFixed(2)}
                </strong>
              </div>

            </div>

            {/* AMOUNT */}

            <div className="details-info-item">

              <div className="info-icon">
                <DollarSign size={19} />
              </div>

              <div>
                <span>
                  Amount
                </span>

                <strong>
                  ₹
                  {amount.toFixed(2)}
                </strong>
              </div>

            </div>

            {/* BILLING */}

            <div className="details-info-item">

              <div className="info-icon">
                <CheckCircle2 size={19} />
              </div>

              <div>
                <span>
                  Billing Status
                </span>

                <strong
                  className={
                    billed
                      ? "billing-text billed-text"
                      : "billing-text unbilled-text"
                  }
                >
                  {billed
                    ? "Billed"
                    : "Unbilled"}
                </strong>
              </div>

            </div>

          </div>

        </div>

       
      </div>

    </div>
  );
};

export default TimeLogDetails;
