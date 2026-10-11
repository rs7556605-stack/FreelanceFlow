import React, {
  useEffect,
  useState,
} from "react";

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

  const [log, setLog] =
    useState(location.state?.log || null);

  const [loading, setLoading] =
    useState(!location.state?.log);

  const [error, setError] =
    useState("");

  const [showMenu, setShowMenu] =
    useState(false);

  // ==========================================
  // LOAD
  // ==========================================

  useEffect(() => {
    if (!id) {
      setError(
        "Invalid time log."
      );

      setLoading(false);

      return;
    }

    if (location.state?.log) {
      setLog(location.state.log);
      setLoading(false);
      return;
    }

    loadLog();
  }, [id]);

  // ==========================================
  // LOAD LOG
  // ==========================================

  const loadLog = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await API.get("/time");

      if (
        response.data.success
      ) {
        const logs =
          response.data.timeLogs || [];

        const foundLog =
          logs.find(
            (item) =>
              item._id === id
          );

        if (!foundLog) {
          setError(
            "Time log not found."
          );

          setLog(null);
        } else {
          setLog(foundLog);
        }
      } else {
        setError(
          "Failed to load time log."
        );
      }
    } catch (error) {
      console.error(
        "Load Time Log Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load time log."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DATE
  // ==========================================

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

  // ==========================================
  // DURATION
  // ==========================================

  const formatDuration = (
    seconds
  ) => {
    const totalSeconds =
      Number(seconds) || 0;

    const hours =
      Math.floor(
        totalSeconds / 3600
      );

    const minutes =
      Math.floor(
        (totalSeconds % 3600) /
          60
      );

    const secs =
      totalSeconds % 60;

    return [
      hours,
      minutes,
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

  // ==========================================
  // EDIT
  // ==========================================

  const handleEdit = () => {
    if (!log) {
      return;
    }

    setShowMenu(false);

    navigate("/time",
      {
        state: {
          editLogId:
            log._id,
          log,
        },
      }
    );
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async () => {
    if (!log?._id) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this time log?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setShowMenu(false);

      await API.delete(
        `/time/${log._id}`
      );

     navigate("/time",
        {
          replace: true,
          state: {
            message:
              "Time log deleted successfully",
          },
        }
      );
    } catch (error) {
      console.error(
        "Delete Time Log Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to delete time log."
      );
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="time-details-page">

        <div className="time-details-loading">

          <Clock3 size={34} />

          <h2>
            Loading Time Log...
          </h2>

          <p>
            Please wait while we
            load the details.
          </p>

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
  Back to Time Tracking
</button>

          <div className="details-error">
            {error ||
              "Time log not found."}
          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="time-details-page">

      <div className="time-details-container">

        {/* ==========================================
            TOP BAR
        ========================================== */}

        <div className="details-topbar">

          <button
            type="button"
            className="details-back-btn"
           onClick={handleBack}
          >
            <ArrowLeft size={18} />

            Back to Time Tracking
          </button>

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
            >
              <MoreVertical
                size={21}
              />
            </button>

            {showMenu && (
              <div className="details-action-menu">

                <button
                  type="button"
                  onClick={handleEdit}
                  disabled={
                    !log.endTime
                  }
                >
                  <Pencil size={16} />

                  Edit
                </button>

                <button
                  type="button"
                  className="danger"
                  onClick={
                    handleDelete
                  }
                >
                  <Trash2 size={16} />

                  Delete
                </button>

              </div>
            )}

          </div>

        </div>

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="time-details-header">

          <div>

            <span className="details-label">
              TIME LOG DETAILS
            </span>

            <h1>
              {log.project?.name ||
                "Time Log"}
            </h1>

            <p>
              Complete details of
              this working session.
            </p>

          </div>

          <div
            className={
              log.billed
                ? "details-status billed"
                : "details-status unbilled"
            }
          >
            {log.billed ? (
              <>
                <CheckCircle2
                  size={17}
                />

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

        {/* ==========================================
            SUMMARY
        ========================================== */}

        <div className="details-summary-grid">

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

          <div className="details-summary-card">

            <div className="summary-icon">
              <DollarSign
                size={21}
              />
            </div>

            <div>
              <span>
                Hourly Rate
              </span>

              <strong>
                ₹
                {Number(
                  log.hourlyRate ||
                    0
                ).toFixed(2)}
              </strong>
            </div>

          </div>

          <div className="details-summary-card">

            <div className="summary-icon">
              <DollarSign
                size={21}
              />
            </div>

            <div>
              <span>
                Total Amount
              </span>

              <strong>
                ₹
                {Number(
                  log.amount || 0
                ).toFixed(2)}
              </strong>
            </div>

          </div>

        </div>

        {/* ==========================================
            SESSION INFORMATION
        ========================================== */}

        <div className="details-card">

          <div className="details-card-header">

            <h2>
              Session Information
            </h2>

            <p>
              Detailed information
              about this time entry.
            </p>

          </div>

          <div className="details-info-grid">

            {/* PROJECT */}

            <div className="details-info-item">

              <div className="info-icon">
                <Briefcase
                  size={19}
                />
              </div>

              <div>

                <span>
                  Project
                </span>

                <strong>
                  {log.project?.name ||
                    "-"}
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
                  {log.task?.title ||
                    "No Task"}
                </strong>

              </div>

            </div>

            {/* DATE */}

            <div className="details-info-item">

              <div className="info-icon">
                <CalendarDays
                  size={19}
                />
              </div>

              <div>

                <span>
                  Date
                </span>

                <strong>
                  {formatDate(
                    log.startTime
                  )}
                </strong>

              </div>

            </div>

            {/* START */}

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
                    log.startTime
                  )}
                </strong>

              </div>

            </div>

            {/* END */}

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
                <DollarSign
                  size={19}
                />
              </div>

              <div>

                <span>
                  Hourly Rate
                </span>

                <strong>
                  ₹
                  {Number(
                    log.hourlyRate ||
                      0
                  ).toFixed(2)}
                </strong>

              </div>

            </div>

            {/* AMOUNT */}

            <div className="details-info-item">

              <div className="info-icon">
                <DollarSign
                  size={19}
                />
              </div>

              <div>

                <span>
                  Amount
                </span>

                <strong>
                  ₹
                  {Number(
                    log.amount || 0
                  ).toFixed(2)}
                </strong>

              </div>

            </div>

            {/* BILLING */}

            <div className="details-info-item">

              <div className="info-icon">
                <CheckCircle2
                  size={19}
                />
              </div>

              <div>

                <span>
                  Billing Status
                </span>

                <strong
                  className={
                    log.billed
                      ? "billing-text billed-text"
                      : "billing-text unbilled-text"
                  }
                >
                  {log.billed
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