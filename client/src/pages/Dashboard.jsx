import React, { useEffect, useState } from "react";

import {
  LogOut,
  Users,
  FolderKanban,
  Receipt,
  CheckSquare,
  Clock3,
  LayoutDashboard,
  Mail,
  Home,
  UserRound,
  Settings,
  Menu,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { Link, NavLink } from "react-router-dom";
import API from "../services/api";
import "./Dashboard.css";

const Dashboard = () => {
  const { user, logout } = useAuth();

  // ==========================================
  // DASHBOARD STATE
  // ==========================================

  const [dashboardData, setDashboardData] = useState({
    totalClients: 0,
    activeProjects: 0,
    pendingInvoiceCount: 0,
    paidInvoiceCount: 0,
    totalRevenue: 0,
    outstandingAmount: 0,
  });

  const [revenueByMonth, setRevenueByMonth] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // MOBILE SIDEBAR
  // ==========================================

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ==========================================
  // VIEW ALL DEADLINES
  // ==========================================

  const [showAllDeadlines, setShowAllDeadlines] = useState(false);

  // ==========================================
  // FETCH DASHBOARD DATA
  // ==========================================

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/dashboard/summary");

        if (response.data?.success) {
          setDashboardData(
            response.data.stats || {
              totalClients: 0,
              activeProjects: 0,
              pendingInvoiceCount: 0,
              paidInvoiceCount: 0,
              totalRevenue: 0,
              outstandingAmount: 0,
            }
          );

          setRevenueByMonth(
            response.data.revenueByMonth || []
          );

          setRecentProjects(
            response.data.recentProjects || []
          );

          setRecentInvoices(
            response.data.recentInvoices || []
          );

          setUpcomingDeadlines(
            response.data.upcomingDeadlines || []
          );
        }
      } catch (err) {
        console.error("Dashboard Error:", err);

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          logout();
          return;
        }

        setError(
          err.response?.data?.message ||
            "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [logout]);

  // ==========================================
  // FORMAT CURRENCY
  // ==========================================

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString(
      "en-IN"
    )}`;
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "No date";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==========================================
  // MAX REVENUE
  // ==========================================

  const maxRevenue = Math.max(
    ...revenueByMonth.map(
      (item) => Number(item.revenue || 0)
    ),
    1
  );

  // ==========================================
  // CLOSE MOBILE SIDEBAR
  // ==========================================

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // ==========================================
  // DASHBOARD
  // ==========================================

  return (
    <div className="dashboard-page">

      {/* ========================================
          HEADER
      ======================================== */}

      <header className="dashboard-header">
        <div className="dashboard-header-inner">

          <div className="dashboard-brand">
            <h1>FreelanceFlow</h1>
            <p>Project Management </p>
          </div>

          <div className="dashboard-header-right">

            {/* MOBILE MENU BUTTON */}

            <button
              type="button"
              className="dashboard-menu-toggle"
              onClick={() =>
                setSidebarOpen((prev) => !prev)
              }
              aria-label="Toggle sidebar"
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>

            {/* TOP NAVIGATION */}

            <nav className="dashboard-top-nav">

              <Link to="/">
                <Home size={17} />
                <span>Home</span>
              </Link>

              <Link to="/about">
                <UserRound size={17} />
                <span>About Me</span>
              </Link>

              <Link to="/contact">
                <Mail size={17} />
                <span>Contact</span>
              </Link>

            </nav>

            {/* USER AREA */}

            <div className="dashboard-user-area">
              <div className="dashboard-user-info">

                <p className="dashboard-user-name">
                  {user?.name}
                </p>

                <p className="dashboard-user-plan">
                  {user?.plan || "Free"} Plan
                </p>

              </div>
            </div>

          </div>
        </div>
      </header>

      {/* ========================================
          DASHBOARD LAYOUT
      ======================================== */}

      <div className="dashboard-layout">

        {/* ======================================
            SIDEBAR
        ====================================== */}

        <aside
          className={`dashboard-sidebar ${
            sidebarOpen ? "mobile-open" : ""
          }`}
        >

          <div className="dashboard-sidebar-title">
            <span>Workspace</span>
          </div>

          {/* DASHBOARD */}

          <NavLink
            to="/"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `dashboard-sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          {/* CLIENTS */}

          <NavLink
            to="/clients"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `dashboard-sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <Users size={18} />
            <span>Clients</span>
          </NavLink>

          {/* PROJECTS */}

          <NavLink
            to="/projects"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `dashboard-sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <FolderKanban size={18} />
            <span>Projects</span>
          </NavLink>

          {/* TASKS */}

          <NavLink
            to="/tasks"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `dashboard-sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <CheckSquare size={18} />
            <span>Tasks</span>
          </NavLink>

          {/* TIME TRACKING */}

          <NavLink
            to="/time"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `dashboard-sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <Clock3 size={18} />
            <span>Time Tracking</span>
          </NavLink>

          {/* INVOICES */}

          <NavLink
            to="/invoices"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `dashboard-sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <Receipt size={18} />
            <span>Invoices</span>
          </NavLink>

          {/* SIDEBAR BOTTOM */}

          <div className="dashboard-sidebar-bottom">



              <button
              type="button"
              onClick={() => {
                closeSidebar();
                logout();
              }}
              className="dashboard-sidebar-logout"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>

            {/* SETTINGS */}

            <NavLink
              to="/settings"
              onClick={closeSidebar}
              className={({ isActive }) =>
                `dashboard-sidebar-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              <Settings size={18} />
              <span>Settings</span>
            </NavLink>

            {/* LOGOUT */}

            

          </div>
        </aside>

        {/* ======================================
            MOBILE SIDEBAR OVERLAY
        ====================================== */}

        {sidebarOpen && (
          <div
            className="dashboard-sidebar-overlay"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}

        {/* ======================================
            MAIN CONTENT
        ====================================== */}

        <main className="dashboard-main">

          {/* ======================================
              WELCOME
          ====================================== */}

          <div className="dashboard-welcome">
            <h2>Dashboard</h2>

            <p>
              Welcome back, {user?.name}.
            </p>
          </div>

          {/* ======================================
              ERROR
          ====================================== */}

          {error && (
            <div className="dashboard-error">
              {error}
            </div>
          )}

          {/* ======================================
              STATS
          ====================================== */}

          <div className="dashboard-stats">

            {/* TOTAL CLIENTS */}

            <div className="dashboard-stat-card">
              <Users className="dashboard-stat-icon clients-icon" />

              <p className="dashboard-stat-label">
                Total Clients
              </p>

              <h3 className="dashboard-stat-value">
                {loading
                  ? "..."
                  : dashboardData.totalClients}
              </h3>
            </div>

            {/* ACTIVE PROJECTS */}

            <div className="dashboard-stat-card">
              <FolderKanban className="dashboard-stat-icon projects-icon" />

              <p className="dashboard-stat-label">
                Active Projects
              </p>

              <h3 className="dashboard-stat-value">
                {loading
                  ? "..."
                  : dashboardData.activeProjects}
              </h3>
            </div>

            {/* PENDING INVOICES */}

            <div className="dashboard-stat-card">
              <Receipt className="dashboard-stat-icon invoices-icon" />

              <p className="dashboard-stat-label">
                Pending Invoices
              </p>

              <h3 className="dashboard-stat-value">
                {loading
                  ? "..."
                  : formatCurrency(
                      dashboardData.outstandingAmount
                    )}
              </h3>

              {!loading && (
                <small className="dashboard-stat-extra">
                  {dashboardData.pendingInvoiceCount}{" "}
                  invoice
                  {dashboardData.pendingInvoiceCount !== 1
                    ? "s"
                    : ""}
                </small>
              )}
            </div>

            {/* TOTAL REVENUE */}

            <div className="dashboard-stat-card">
              <Receipt className="dashboard-stat-icon revenue-icon" />

              <p className="dashboard-stat-label">
                Total Revenue
              </p>

              <h3 className="dashboard-stat-value">
                {loading
                  ? "..."
                  : formatCurrency(
                      dashboardData.totalRevenue
                    )}
              </h3>

              {!loading && (
                <small className="dashboard-stat-extra">
                  {dashboardData.paidInvoiceCount}{" "}
                  paid invoice
                  {dashboardData.paidInvoiceCount !== 1
                    ? "s"
                    : ""}
                </small>
              )}
            </div>

            {/* OUTSTANDING */}

            <div className="dashboard-stat-card">
              <Receipt className="dashboard-stat-icon outstanding-icon" />

              <p className="dashboard-stat-label">
                Outstanding
              </p>

              <h3 className="dashboard-stat-value">
                {loading
                  ? "..."
                  : formatCurrency(
                      dashboardData.outstandingAmount
                    )}
              </h3>
            </div>

          </div>

          {/* ======================================
              REVENUE OVERVIEW
          ====================================== */}

          <div className="dashboard-financial-section">

            <div className="dashboard-financial-header">

              <div>
                <h3>Revenue Overview</h3>

                <p>
                  Paid invoice revenue for this year
                </p>
              </div>

              <div className="dashboard-financial-total">
                {loading
                  ? "..."
                  : formatCurrency(
                      dashboardData.totalRevenue
                    )}
              </div>

            </div>

            <div className="dashboard-revenue-chart">

              {revenueByMonth.length === 0 &&
              !loading ? (
                <div className="dashboard-revenue-empty">
                  No revenue data available yet.
                </div>
              ) : (
                revenueByMonth.map(
                  (item, index) => {
                    const revenue =
                      Number(
                        item.revenue || 0
                      );

                    const height =
                      revenue > 0
                        ? Math.max(
                            (revenue /
                              maxRevenue) *
                              100,
                            8
                          )
                        : 4;

                    return (
                      <div
                        className="dashboard-revenue-column"
                        key={`${item.month}-${index}`}
                      >

                        <div className="dashboard-revenue-value">
                          {revenue > 0
                            ? formatCurrency(
                                revenue
                              )
                            : ""}
                        </div>

                        <div className="dashboard-revenue-bar-wrapper">

                          <div
                            className="dashboard-revenue-bar"
                            style={{
                              height: `${height}%`,
                            }}
                            title={`${item.month}: ${formatCurrency(
                              revenue
                            )}`}
                          />

                        </div>

                        <span>
                          {item.month}
                        </span>

                      </div>
                    );
                  }
                )
              )}

            </div>
          </div>

          {/* ======================================
              RECENT PROJECTS + RECENT INVOICES
          ====================================== */}

          <div className="dashboard-overview-grid">

            {/* ==================================
                RECENT PROJECTS
            ================================== */}

            <div className="dashboard-overview-card">

              <div className="dashboard-overview-header">

                <div>
                  <h3>Recent Projects</h3>

                  <p>
                    Latest projects in your workspace
                  </p>
                </div>

                <Link
                  to="/projects"
                  className="dashboard-overview-link"
                >
                  View All
                </Link>

              </div>

              <div className="dashboard-overview-list">

                {loading ? (
                  <div className="dashboard-overview-empty">
                    Loading projects...
                  </div>
                ) : recentProjects.length === 0 ? (
                  <div className="dashboard-overview-empty">
                    No projects found yet.
                  </div>
                ) : (
                  recentProjects
                    .slice(0, 2)
                    .map((project) => (

                      <Link
                        to="/projects"
                        className="dashboard-overview-item dashboard-clickable-item"
                        key={project._id}
                        title={`Open ${project.name}`}
                      >

                        <div className="dashboard-overview-item-icon project">
                          <FolderKanban size={18} />
                        </div>

                        <div className="dashboard-overview-item-content">

                          <h4>
                            {project.name}
                          </h4>

                          <p>
                            {project.client?.name ||
                              "No client"}
                          </p>

                        </div>

                        <div className="dashboard-overview-item-right">

                          <span
                            className={`dashboard-status ${
                              project.status ===
                              "Completed"
                                ? "completed"
                                : "active"
                            }`}
                          >
                            {project.status}
                          </span>

                          {project.deadline && (
                            <small>
                              {formatDate(
                                project.deadline
                              )}
                            </small>
                          )}

                        </div>

                      </Link>
                    ))
                )}

              </div>
            </div>

            {/* ==================================
                RECENT INVOICES
            ================================== */}

            <div className="dashboard-overview-card">

              <div className="dashboard-overview-header">

                <div>
                  <h3>Recent Invoices</h3>

                  <p>
                    Latest invoices created
                  </p>
                </div>

                <Link
                  to="/invoices"
                  className="dashboard-overview-link"
                >
                  View All
                </Link>

              </div>

              <div className="dashboard-overview-list">

                {loading ? (
                  <div className="dashboard-overview-empty">
                    Loading invoices...
                  </div>
                ) : recentInvoices.length === 0 ? (
                  <div className="dashboard-overview-empty">
                    No invoices found yet.
                  </div>
                ) : (
                  recentInvoices
                    .slice(0, 2)
                    .map((invoice) => (

                      <Link
                        to={`/invoices/${invoice._id}`}
                        className="dashboard-overview-item dashboard-clickable-item"
                        key={invoice._id}
                        title={`Open ${invoice.invoiceNumber}`}
                      >

                        <div className="dashboard-overview-item-icon invoice">
                          <Receipt size={18} />
                        </div>

                        <div className="dashboard-overview-item-content">

                          <h4>
                            {invoice.invoiceNumber}
                          </h4>

                          <p>
                            {invoice.client?.name ||
                              "No client"}
                          </p>

                        </div>

                        <div className="dashboard-overview-item-right">

                          <strong>
                            {formatCurrency(
                              invoice.total
                            )}
                          </strong>

                          <span
                            className={`dashboard-status ${
                              invoice.status
                                ?.toLowerCase()
                                .replace(
                                  " ",
                                  "-"
                                )
                            }`}
                          >
                            {invoice.status}
                          </span>

                        </div>

                      </Link>
                    ))
                )}

              </div>
            </div>

          </div>

          {/* ======================================
              UPCOMING DEADLINES
          ====================================== */}

          <div className="dashboard-deadlines-card">

            {/* HEADER */}

            <div className="dashboard-overview-header">

              <div>
                <h3>
                  Upcoming Deadlines
                </h3>

                <p>
                  Projects and tasks that need your attention
                </p>
              </div>

              {/* VIEW ALL */}

              {upcomingDeadlines.length > 2 && (
                <button
                  type="button"
                  className="dashboard-overview-link dashboard-view-all-button"
                  onClick={() =>
                    setShowAllDeadlines(
                      (prev) => !prev
                    )
                  }
                >
                  {showAllDeadlines
                    ? "Show Less"
                    : "View All"}
                </button>
              )}

            </div>

            {/* DEADLINES */}

            <div className="dashboard-deadlines-list">

              {loading ? (
                <div className="dashboard-overview-empty">
                  Loading deadlines...
                </div>
              ) : upcomingDeadlines.length === 0 ? (
                <div className="dashboard-overview-empty">
                  No upcoming deadlines.
                </div>
              ) : (
                (
                  showAllDeadlines
                    ? upcomingDeadlines
                    : upcomingDeadlines.slice(0, 2)
                ).map((item) => (

                  <Link
                    to={
                      item.type === "Project"
                        ? "/projects"
                        : "/tasks"
                    }
                    className="dashboard-deadline-item dashboard-clickable-deadline"
                    key={`${item.type}-${item._id}`}
                    title={`Open ${item.type}`}
                  >

                    <div className="dashboard-deadline-icon">
                      <Clock3 size={18} />
                    </div>

                    <div className="dashboard-deadline-content">

                      <div className="dashboard-deadline-title-row">

                        <h4>
                          {item.title}
                        </h4>

                        <span
                          className={`dashboard-deadline-type ${
                            item.type?.toLowerCase()
                          }`}
                        >
                          {item.type}
                        </span>

                      </div>

                      <p>
                        {item.type === "Project"
                          ? item.clientName
                          : item.projectName}
                      </p>

                    </div>

                    <div className="dashboard-deadline-date">

                      <span>
                        {formatDate(item.date)}
                      </span>

                    </div>

                  </Link>

                ))
              )}

            </div>

          </div>

        </main>
      </div>
    </div>
  );
};

export default Dashboard;