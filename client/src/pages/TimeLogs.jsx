import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Eye,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./TimeLogs.css";

const TimeLogs = () => {
  const navigate = useNavigate();

  const [timeLogs, setTimeLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    loadTimeLogs();
  }, []);

  const loadTimeLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/time");

      if (response.data?.success) {
        setTimeLogs(response.data.timeLogs || []);
      } else {
        setTimeLogs(response.data?.timeLogs || []);
      }
    } catch (err) {
      console.error("Load Time Logs Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load time logs."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds) => {
    const totalSeconds = Number(seconds) || 0;

    const hours = Math.floor(totalSeconds / 3600);

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );

    const secs = totalSeconds % 60;

    return [
      String(hours).padStart(2, "0"),
      String(minutes).padStart(2, "0"),
      String(secs).padStart(2, "0"),
    ].join(":");
  };

  const getProjectName = (log) => {
    return (
      log.project?.name ||
      log.projectName ||
      log.project?.title ||
      "-"
    );
  };

  const getTaskName = (log) => {
    return (
      log.task?.title ||
      log.task?.name ||
      log.taskName ||
      "-"
    );
  };

  const getRate = (log) => {
    return Number(
      log.hourlyRate ??
        log.rate ??
        0
    );
  };

  const getAmount = (log) => {
    if (log.amount !== undefined && log.amount !== null) {
      return Number(log.amount);
    }

    const durationHours =
      (Number(log.duration) || 0) / 3600;

    return durationHours * getRate(log);
  };

  const handleView = (log) => {
    navigate(`/time-log/${log._id}`, {
      state: {
        log,
      },
    });
  };

  const handleEdit = (log) => {
    setOpenMenu(null);

    navigate("/time", {
      state: {
        editLogId: log._id,
        log,
      },
    });
  };

  const handleDelete = async (log) => {
    setOpenMenu(null);

    const confirmed = window.confirm(
      "Are you sure you want to delete this time log?"
    );

    if (!confirmed) return;

    try {
      await API.delete(`/time/${log._id}`);

      setTimeLogs((prev) =>
        prev.filter(
          (item) => item._id !== log._id
        )
      );
    } catch (err) {
      console.error("Delete Time Log Error:", err);

      alert(
        err.response?.data?.message ||
          "Failed to delete time log."
      );
    }
  };

  if (loading) {
    return (
      <div className="all-time-logs-page">
        <div className="time-logs-loading">
          Loading time logs...
        </div>
      </div>
    );
  }

  return (
    <div className="all-time-logs-page">

      {/* Header */}
      <div className="all-time-logs-top">

        <button
          type="button"
          className="all-time-logs-back"
          onClick={() => navigate("/time")}
        >
          <ArrowLeft size={18} />
          Back to Time Tracking
        </button>

        <div className="all-time-logs-title-row">
          <div>
            <h1>All Time Logs</h1>
            <p>
              View all your completed tracking sessions.
            </p>
          </div>

          
        </div>

      </div>

      {/* Error */}
      {error && (
        <div className="time-logs-error">
          {error}
        </div>
      )}

      {/* Empty */}
      {!error && timeLogs.length === 0 && (
        <div className="all-time-logs-empty">
          <h3>No Time Logs Found</h3>
          <p>
            Your completed tracking sessions will appear here.
          </p>
        </div>
      )}

      {/* Table */}
      {timeLogs.length > 0 && (
        <div className="all-time-logs-card">

          <div className="all-time-logs-card-header">
            <div>
              <h2>Time Logs</h2>
              <p>
                All completed tracking sessions
              </p>
            </div>

            <span>
             Total: {timeLogs.length} 
            </span>
          </div>

          <div className="all-time-logs-table-wrapper">

            <table className="all-time-logs-table">

              <thead>
                <tr>
                  <th>Project</th>
                  <th>Task</th>
                  <th>Date</th>
                  <th>Duration</th>
                  <th>Rate</th>
                  <th>Amount</th>
                  <th>Billed</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {timeLogs.map((log) => (
                  <tr key={log._id}>

                    <td>
                      <strong>
                        {getProjectName(log)}
                      </strong>
                    </td>

                    <td>
                      {getTaskName(log)}
                    </td>

                    <td>
                      {formatDate(
                        log.startTime ||
                          log.startedAt ||
                          log.createdAt
                      )}
                    </td>

                    <td>
                      <span className="duration-value">
                        {formatDuration(
                          log.duration
                        )}
                      </span>
                    </td>

                    <td>
                      ₹
                      {getRate(log).toFixed(2)}
                    </td>

                    <td>
                      <strong className="amount-value">
                        ₹
                        {getAmount(log).toFixed(2)}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={
                          log.billed
                            ? "all-billed"
                            : "all-unbilled"
                        }
                      >
                        {log.billed
                          ? "Billed"
                          : "Unbilled"}
                      </span>
                    </td>

                    <td>
                      <div className="all-log-actions">

                        <button
                          type="button"
                          className="all-view-btn"
                          onClick={() =>
                            handleView(log)
                          }
                        >
                          <Eye size={17} />
                          View
                        </button>

                        <div className="all-menu-wrapper">

                          <button
                            type="button"
                            className="all-menu-btn"
                            onClick={() =>
                              setOpenMenu(
                                openMenu === log._id
                                  ? null
                                  : log._id
                              )
                            }
                          >
                            <MoreVertical size={19} />
                          </button>

                          {openMenu === log._id && (
                            <div className="all-log-menu">

                              <button
                                type="button"
                                onClick={() =>
                                  handleEdit(log)
                                }
                              >
                                <Pencil size={16} />
                                Edit
                              </button>

                              <button
                                type="button"
                                className="delete-action"
                                onClick={() =>
                                  handleDelete(log)
                                }
                              >
                                <Trash2 size={16} />
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
        </div>
      )}

    </div>
  );
};

export default TimeLogs;