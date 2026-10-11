import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Clock3,
  FolderKanban,
  CheckSquare,
  CalendarDays,
  AlertCircle,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import API from "../services/api";

import "./UpcomingDeadlines.css";

// =====================================================
// UPCOMING DEADLINES PAGE
// =====================================================

const UpcomingDeadlines = () => {
  const navigate = useNavigate();

  const [deadlines, setDeadlines] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =====================================================
  // LOAD UPCOMING DEADLINES
  // =====================================================

  const loadDeadlines = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(
        "/dashboard/summary"
      );

      console.log(
        "Upcoming Deadlines Response:",
        response.data
      );

      if (response.data?.success) {
        const apiDeadlines =
          Array.isArray(
            response.data
              ?.upcomingDeadlines
          )
            ? response.data
                .upcomingDeadlines
            : [];

        // -------------------------------------------------
        // IMPORTANT
        // NO slice(0, 2)
        // NO slice(0, 5)
        //
        // Deadline page shows ALL deadlines
        // returned by backend.
        // -------------------------------------------------

        setDeadlines(
          apiDeadlines
        );
      } else {
        setDeadlines([]);

        setError(
          response.data?.message ||
            "Failed to load upcoming deadlines."
        );
      }
    } catch (error) {
      console.error(
        "Upcoming Deadlines Error:",
        error
      );

      setDeadlines([]);

      setError(
        error.response?.data
          ?.message ||
          "Failed to load upcoming deadlines."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadDeadlines();
  }, []);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // DAYS LEFT
  // =====================================================

  const getDaysLeft = (date) => {
    if (!date) {
      return null;
    }

    const targetDate =
      new Date(date);

    targetDate.setHours(
      0,
      0,
      0,
      0
    );

    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const difference =
      targetDate.getTime() -
      today.getTime();

    return Math.ceil(
      difference /
        (1000 *
          60 *
          60 *
          24)
    );
  };

  // =====================================================
  // COUNTDOWN
  // =====================================================

  const getCountdown = (date) => {
    const daysLeft =
      getDaysLeft(date);

    if (daysLeft === null) {
      return {
        text: "No deadline",
        className: "normal",
      };
    }

    // ---------------------------------------------------
    // OVERDUE
    // ---------------------------------------------------

    if (daysLeft < 0) {
      const days =
        Math.abs(daysLeft);

      return {
        text: `${days} day${
          days !== 1
            ? "s"
            : ""
        } overdue`,
        className: "overdue",
      };
    }

    // ---------------------------------------------------
    // TODAY
    // ---------------------------------------------------

    if (daysLeft === 0) {
      return {
        text: "Due today",
        className: "today",
      };
    }

    // ---------------------------------------------------
    // TOMORROW
    // ---------------------------------------------------

    if (daysLeft === 1) {
      return {
        text: "1 day left",
        className: "urgent",
      };
    }

    // ---------------------------------------------------
    // WITHIN 7 DAYS
    // ---------------------------------------------------

    if (daysLeft <= 7) {
      return {
        text: `${daysLeft} days left`,
        className: "soon",
      };
    }

    // ---------------------------------------------------
    // NORMAL
    // ---------------------------------------------------

    return {
      text: `${daysLeft} days left`,
      className: "normal",
    };
  };

  // =====================================================
  // OPEN DEADLINE
  // =====================================================

  // =====================================================
// OPEN DEADLINE
// =====================================================

const openDeadline = (item) => {

  // ===================================================
  // PROJECT
  // ===================================================

  if (item.type === "Project") {

    navigate("/projects", {
      state: {
        highlightProjectId: item._id,
      },
    });

    return;
  }

  // ===================================================
  // TASK
  // ===================================================

  if (item.type === "Task") {

    navigate("/tasks", {
      state: {
        highlightTaskId: item._id,
      },
    });

    return;
  }
};
  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="upcoming-deadlines-page">
        <div className="upcoming-deadlines-container">
          <div className="upcoming-deadlines-loading">
            <Clock3 size={24} />

            <span>
              Loading upcoming deadlines...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="upcoming-deadlines-page">
      <div className="upcoming-deadlines-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="upcoming-deadlines-header">

          {/* BACK */}

          <button
            type="button"
            className="upcoming-deadlines-back"
            onClick={() =>
              navigate(-1)
            }
          >
            <ArrowLeft size={18} />

            <span>
              Back
            </span>
          </button>

          {/* TITLE */}

          <div className="upcoming-deadlines-title-area">

            <div className="upcoming-deadlines-title-icon">
              <CalendarDays
                size={24}
              />
            </div>

            <div>
              <h1>
                Upcoming Deadlines
              </h1>

              <p>
                Projects and tasks
                that need your
                attention
              </p>
            </div>

          </div>

          {/* REFRESH */}

          <button
            type="button"
            className="upcoming-deadlines-refresh"
            onClick={
              loadDeadlines
            }
          >
            Refresh
          </button>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="upcoming-deadlines-error">

            <AlertCircle
              size={20}
            />

            <div>

              <strong>
                Failed to load
                upcoming deadlines
              </strong>

              <p>
                {error}
              </p>

              <button
                type="button"
                onClick={
                  loadDeadlines
                }
              >
                Try Again
              </button>

            </div>

          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!error &&
          deadlines.length ===
            0 && (
            <div className="upcoming-deadlines-empty">

              <div className="upcoming-deadlines-empty-icon">
                <CheckSquare
                  size={32}
                />
              </div>

              <h2>
                No Upcoming
                Deadlines
              </h2>

              <p>
                You don't have
                any upcoming
                project or task
                deadlines.
              </p>

              <div className="upcoming-deadlines-empty-actions">

                <Link to="/projects">
                  View Projects
                </Link>

                <Link to="/tasks">
                  View Tasks
                </Link>

              </div>

            </div>
          )}

        {/* =================================================
            ALL DEADLINES LIST
        ================================================= */}

        {!error &&
          deadlines.length > 0 && (
            <div className="upcoming-deadlines-list">

              {deadlines.map(
                (item) => {
                  const countdown =
                    getCountdown(
                      item.date
                    );

                  const isProject =
                    item.type ===
                    "Project";

                  return (
                    <div
                      key={`${item.type}-${item._id}`}
                      className={`upcoming-deadline-card ${countdown.className}`}
                    >

                      {/* =================================================
                          ICON
                      ================================================= */}

                      <div
                        className={`upcoming-deadline-icon ${
                          isProject
                            ? "project"
                            : "task"
                        }`}
                      >
                        {isProject ? (
                          <FolderKanban
                            size={22}
                          />
                        ) : (
                          <CheckSquare
                            size={22}
                          />
                        )}
                      </div>

                      {/* =================================================
                          CONTENT
                      ================================================= */}

                      <div className="upcoming-deadline-content">

                        <div className="upcoming-deadline-title-row">

                          <h2>
                            {item.title}
                          </h2>

                          <span
                            className={`upcoming-deadline-type ${
                              isProject
                                ? "project"
                                : "task"
                            }`}
                          >
                            {item.type}
                          </span>

                        </div>

                        <p className="upcoming-deadline-related">

                          {isProject
                            ? item.clientName ||
                              "Unknown Client"
                            : item.projectName ||
                              "Unknown Project"}

                        </p>

                        {/* MOBILE DATE */}

                        <div className="upcoming-deadline-date-mobile">

                          <CalendarDays
                            size={15}
                          />

                          <span>
                            Due:{" "}
                            {formatDate(
                              item.date
                            )}
                          </span>

                        </div>

                      </div>

                      {/* =================================================
                          RIGHT SIDE
                      ================================================= */}

                      <div className="upcoming-deadline-right">

                        <div className="upcoming-deadline-date">

                          <span>
                            Due:{" "}
                            {formatDate(
                              item.date
                            )}
                          </span>

                        </div>

                        <div
                          className={`upcoming-deadline-countdown ${countdown.className}`}
                        >
                          <span className="countdown-dot" />

                          {countdown.text}
                        </div>

                        {/* OPEN */}

                        <button
                          type="button"
                          className="upcoming-deadline-open"
                          onClick={() =>
                            openDeadline(
                              item
                            )
                          }
                        >
                          Open
                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        {/* =================================================
            FOOTER
        ================================================= */}

        {!error &&
          deadlines.length > 0 && (
            <div className="upcoming-deadlines-footer">

              <span>
                Showing{" "}
                {deadlines.length}{" "}
                upcoming deadline
                {deadlines.length !==
                1
                  ? "s"
                  : ""}
              </span>

              <div>

                <Link to="/projects">
                  Projects
                </Link>

                <Link to="/tasks">
                  Tasks
                </Link>

              </div>

            </div>
          )}

      </div>
    </div>
  );
};

export default UpcomingDeadlines;