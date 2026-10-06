import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

import {
  ArrowLeft,
  User,
  Palette,
  Globe,
  Bell,
  Shield,
  Lock,
  LogOut,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Crown,
  Check,
  Users,
  Receipt,
  BarChart3,
} from "lucide-react";

import "./Settings.css";

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // ==========================================
  // PROFILE
  // ==========================================

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  // ==========================================
  // PLAN
  // ==========================================

  const currentPlan =
    user?.plan === "Pro" ? "Pro" : "Free";

  // ==========================================
  // SETTINGS
  // ==========================================

  const [theme, setTheme] = useState(() => {
    return (
      localStorage.getItem("freelanceflow-theme") ||
      "light"
    );
  });

  const [language, setLanguage] = useState(() => {
    return (
      localStorage.getItem("freelanceflow-language") ||
      "English"
    );
  });

  const [notifications, setNotifications] = useState(() => {
    return (
      localStorage.getItem(
        "freelanceflow-notifications"
      ) !== "false"
    );
  });

  const [profileVisibility, setProfileVisibility] =
    useState(() => {
      return (
        localStorage.getItem(
          "freelanceflow-profile-visibility"
        ) || "private"
      );
    });

  // ==========================================
  // PASSWORD
  // ==========================================

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // ==========================================
  // LOADING
  // ==========================================

  const [profileLoading, setProfileLoading] =
    useState(false);

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  // ==========================================
  // MESSAGES
  // ==========================================

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // MESSAGE HELPERS
  // ==========================================

  const showMessage = (text) => {
    setMessage(text);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const showError = (text) => {
    setError(text);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // APPLY GLOBAL THEME
  // ==========================================

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    localStorage.setItem(
      "freelanceflow-theme",
      theme
    );
  }, [theme]);

  // ==========================================
  // UPDATE PROFILE STATE
  // ==========================================

  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
  }, [user]);

  // ==========================================
  // BACK BUTTON
  // ==========================================

  const handleBack = () => {
    navigate(-1);
  };

  // ==========================================
  // SAVE PROFILE
  // ==========================================

  const handleProfileSave = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      showError("Name is required.");
      return;
    }

    if (cleanName.length < 2) {
      showError(
        "Name must contain at least 2 characters."
      );
      return;
    }

    if (!cleanEmail) {
      showError("Email is required.");
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      showError(
        "Please enter a valid email address."
      );
      return;
    }

    try {
      setProfileLoading(true);

      const response = await API.put("/profile", {
        name: cleanName,
      });

      if (response.data.success) {
        if (response.data.user) {
          localStorage.setItem(
            "user",
            JSON.stringify(response.data.user)
          );
        }

        showMessage(
          "Profile updated successfully."
        );
      } else {
        showError(
          response.data.message ||
            "Failed to update profile."
        );
      }
    } catch (error) {
      console.error(
        "Profile Update Error:",
        error
      );

      showError(
        error.response?.data?.message ||
          "Failed to update profile."
      );
    } finally {
      setProfileLoading(false);
    }
  };

  // ==========================================
  // THEME
  // ==========================================

  const handleThemeChange = (event) => {
    const value = event.target.value;

    setTheme(value);

    document.documentElement.setAttribute(
      "data-theme",
      value
    );

    localStorage.setItem(
      "freelanceflow-theme",
      value
    );

    showMessage(
      value === "dark"
        ? "Dark theme enabled."
        : "Light theme enabled."
    );
  };

  // ==========================================
  // LANGUAGE
  // ==========================================

  const handleLanguageChange = (event) => {
    const value = event.target.value;

    setLanguage(value);

    localStorage.setItem(
      "freelanceflow-language",
      value
    );

    window.dispatchEvent(
      new Event("languageChanged")
    );

    showMessage(
      `${value} language selected.`
    );
  };

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  const handleNotificationChange = () => {
    const newValue = !notifications;

    setNotifications(newValue);

    localStorage.setItem(
      "freelanceflow-notifications",
      String(newValue)
    );

    window.dispatchEvent(
      new Event("notificationsChanged")
    );

    showMessage(
      newValue
        ? "Notifications enabled."
        : "Notifications disabled."
    );
  };

  // ==========================================
  // PRIVACY
  // ==========================================

  const handlePrivacyChange = (event) => {
    const value = event.target.value;

    setProfileVisibility(value);

    localStorage.setItem(
      "freelanceflow-profile-visibility",
      value
    );

    window.dispatchEvent(
      new Event("privacyChanged")
    );

    showMessage(
      value === "public"
        ? "Your profile is now public."
        : "Your profile is now private."
    );
  };

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  const handlePasswordChange = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      showError(
        "Please fill all password fields."
      );
      return;
    }

    if (newPassword.length < 6) {
      showError(
        "New password must be at least 6 characters."
      );
      return;
    }

    if (newPassword === currentPassword) {
      showError(
        "New password must be different from your current password."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showError(
        "New passwords do not match."
      );
      return;
    }

    try {
      setPasswordLoading(true);

      const response = await API.put(
        "/auth/change-password",
        {
          currentPassword,
          newPassword,
        }
      );

      if (response.data.success) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);

        showMessage(
          "Password changed successfully."
        );
      } else {
        showError(
          response.data.message ||
            "Failed to change password."
        );
      }
    } catch (error) {
      console.error(
        "Password Change Error:",
        error
      );

      showError(
        error.response?.data?.message ||
          "Failed to change password."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmed) {
      return;
    }

    logout();
  };

  // ==========================================
  // DELETE ACCOUNT
  // ==========================================

  const handleDeleteAccount = async () => {
    const firstConfirm = window.confirm(
      "Are you sure you want to delete your account?"
    );

    if (!firstConfirm) {
      return;
    }

    const secondConfirm = window.confirm(
      "This action cannot be undone. Your account data may be permanently deleted. Continue?"
    );

    if (!secondConfirm) {
      return;
    }

    try {
      setDeleteLoading(true);

      const response = await API.delete(
        "/auth/account"
      );

      if (response.data.success) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        logout();
      } else {
        showError(
          response.data.message ||
            "Failed to delete account."
        );
      }
    } catch (error) {
      console.error(
        "Delete Account Error:",
        error
      );

      showError(
        error.response?.data?.message ||
          "Failed to delete account."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="settings-page">

      {/* BACK BUTTON */}

      <button
        type="button"
        className="settings-back-btn"
        onClick={handleBack}
      >
        <ArrowLeft size={18} />
        <span>Back</span>
      </button>

      {/* HEADER */}

      <div className="settings-header">
        <h1>Settings</h1>

        <p>
          Manage your FreelanceFlow account
          and preferences.
        </p>
      </div>

      {/* SUCCESS MESSAGE */}

      {message && (
        <div className="settings-success-message">
          {message}
        </div>
      )}

      {/* ERROR MESSAGE */}

      {error && (
        <div className="settings-error-message">
          {error}
        </div>
      )}

      {/* ========================================
          PROFILE DETAILS
      ======================================== */}

      <div className="settings-card">

        <div className="settings-card-header">

          <div className="settings-section-icon">
            <User size={20} />
          </div>

          <div>
            <h2>Profile Details</h2>

            <p>
              Update your personal account
              information.
            </p>
          </div>

        </div>

        <form
          className="settings-form"
          onSubmit={handleProfileSave}
        >

          <div className="settings-input-group">

            <label>Name</label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Enter your name"
              disabled={profileLoading}
            />

          </div>

          <div className="settings-input-group">

            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your email"
              disabled={profileLoading}
            />

          </div>

          <div className="settings-profile-info">

            <span>Current Plan</span>

            <strong
              className={`dashboard-plan-badge ${
                currentPlan === "Pro"
                  ? "pro"
                  : "free"
              }`}
            >
              {currentPlan} Plan
            </strong>

          </div>

          <button
            type="submit"
            className="settings-primary-btn"
            disabled={profileLoading}
          >
            <Save size={17} />

            {profileLoading
              ? "Saving..."
              : "Save Profile"}
          </button>

        </form>

      </div>

      {/* ========================================
          PLAN & BILLING
      ======================================== */}

      <div className="settings-card">

        <div className="settings-card-header">

          <div className="settings-section-icon">
            <Crown size={20} />
          </div>

          <div>
            <h2>Plan & Billing</h2>

            <p>
              Choose the plan that fits your
              freelance workflow.
            </p>
          </div>

        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
            marginTop: "20px",
          }}
        >

          {/* FREE PLAN */}

          <div
            style={{
              border:
                currentPlan === "Free"
                  ? "2px solid #64748b"
                  : "1px solid #cbd5e1",
              borderRadius: "14px",
              padding: "22px",
              background:
                currentPlan === "Free"
                  ? "rgba(100, 116, 139, 0.08)"
                  : "transparent",
            }}
          >

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                marginBottom: "12px",
              }}
            >

              <h3
                style={{
                  margin: 0,
                  fontSize: "20px",
                }}
              >
                Free
              </h3>

              {currentPlan === "Free" && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  <Check size={14} />
                  Current
                </span>
              )}

            </div>

            <div
              style={{
                fontSize: "28px",
                fontWeight: 800,
                marginBottom: "18px",
              }}
            >
              ₹0
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  marginLeft: "5px",
                }}
              >
                / forever
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                <Users size={16} />
                <span>
                  Maximum 2 Clients
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                <BarChart3 size={16} />
                <span>
                  Basic Dashboard
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                <Check size={16} />
                <span>
                  Project Management
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                <Check size={16} />
                <span>
                  Time Tracking
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                <Receipt size={16} />
                <span>
                  Basic Invoices
                </span>
              </div>

            </div>

          </div>

          {/* PRO PLAN */}

          <div
            style={{
              border:
                currentPlan === "Pro"
                  ? "2px solid #059669"
                  : "1px solid #a7f3d0",
              borderRadius: "14px",
              padding: "22px",
              background:
                currentPlan === "Pro"
                  ? "rgba(5, 150, 105, 0.08)"
                  : "transparent",
            }}
          >

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                marginBottom: "12px",
              }}
            >

              <h3
                style={{
                  margin: 0,
                  fontSize: "20px",
                }}
              >
                Pro
              </h3>

              {currentPlan === "Pro" && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#059669",
                  }}
                >
                  <Check size={14} />
                  Current
                </span>
              )}

            </div>

            <div
              style={{
                fontSize: "28px",
                fontWeight: 800,
                marginBottom: "18px",
              }}
            >
              ₹499
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  marginLeft: "5px",
                }}
              >
                / month
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                <Users size={16} />
                <span>
                  Unlimited Clients
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                <BarChart3 size={16} />
                <span>
                  Advanced Dashboard
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                <Check size={16} />
                <span>
                  Unlimited Projects
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                <Check size={16} />
                <span>
                  Advanced Time Tracking
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                <Receipt size={16} />
                <span>
                  PDF Invoicing
                </span>
              </div>

            </div>

            {currentPlan === "Free" && (
              <button
                type="button"
                className="settings-primary-btn"
                style={{
                  marginTop: "20px",
                  width: "100%",
                }}
                onClick={() =>
                  showMessage(
                    "Pro upgrade will be available after payment integration."
                  )
                }
              >
                <Crown size={17} />
                Upgrade to Pro
              </button>
            )}

          </div>

        </div>

      </div>

      {/* ========================================
          APPEARANCE
      ======================================== */}

      <div className="settings-card">

        <div className="settings-card-header">

          <div className="settings-section-icon">
            <Palette size={20} />
          </div>

          <div>
            <h2>Appearance</h2>

            <p>
              Customize how FreelanceFlow looks.
            </p>
          </div>

        </div>

        <div className="settings-row">

          <div>
            <h3>Theme</h3>

            <p>
              Choose your preferred application
              theme.
            </p>
          </div>

          <select
            value={theme}
            onChange={handleThemeChange}
          >
            <option value="light">
              Light
            </option>

            <option value="dark">
              Dark
            </option>
          </select>

        </div>

      </div>

      {/* ========================================
          LANGUAGE
      ======================================== */}

      <div className="settings-card">

        <div className="settings-card-header">

          <div className="settings-section-icon">
            <Globe size={20} />
          </div>

          <div>
            <h2>Language</h2>

            <p>
              Choose your preferred language.
            </p>
          </div>

        </div>

        <div className="settings-row">

          <div>
            <h3>Application Language</h3>

            <p>
              Your language preference is saved.
            </p>
          </div>

          <select
            value={language}
            onChange={handleLanguageChange}
          >
            <option value="English">
              English
            </option>

            <option value="Hindi">
              Hindi
            </option>

            <option value="Hinglish">
              Hinglish
            </option>
          </select>

        </div>

      </div>

      {/* ========================================
          NOTIFICATIONS
      ======================================== */}

      <div className="settings-card">

        <div className="settings-card-header">

          <div className="settings-section-icon">
            <Bell size={20} />
          </div>

          <div>
            <h2>Notifications</h2>

            <p>
              Control your notification
              preferences.
            </p>
          </div>

        </div>

        <div className="settings-row">

          <div>
            <h3>Email Notifications</h3>

            <p>
              Receive important updates and
              reminders.
            </p>
          </div>

          <button
            type="button"
            className={`settings-toggle ${
              notifications
                ? "active"
                : ""
            }`}
            onClick={
              handleNotificationChange
            }
          >
            <span></span>
          </button>

        </div>

      </div>

      {/* ========================================
          PRIVACY
      ======================================== */}

      <div className="settings-card">

        <div className="settings-card-header">

          <div className="settings-section-icon">
            <Shield size={20} />
          </div>

          <div>
            <h2>Privacy</h2>

            <p>
              Control your profile visibility.
            </p>
          </div>

        </div>

        <div className="settings-row">

          <div>
            <h3>Profile Visibility</h3>

            <p>
              Choose whether your profile
              is public or private.
            </p>
          </div>

          <select
            value={profileVisibility}
            onChange={handlePrivacyChange}
          >
            <option value="private">
              Private
            </option>

            <option value="public">
              Public
            </option>
          </select>

        </div>

      </div>

      {/* ========================================
          SECURITY
      ======================================== */}

      <div className="settings-card">

        <div className="settings-card-header">

          <div className="settings-section-icon">
            <Lock size={20} />
          </div>

          <div>
            <h2>Security</h2>

            <p>
              Keep your FreelanceFlow account
              secure.
            </p>
          </div>

        </div>

        <form
          className="settings-form"
          onSubmit={handlePasswordChange}
        >

          {/* CURRENT PASSWORD */}

          <div className="settings-password-field">

            <label>
              Current Password
            </label>

            <div>

              <input
                type={
                  showCurrentPassword
                    ? "text"
                    : "password"
                }
                value={currentPassword}
                onChange={(event) =>
                  setCurrentPassword(
                    event.target.value
                  )
                }
                placeholder="Enter current password"
                disabled={passwordLoading}
              />

              <button
                type="button"
                onClick={() =>
                  setShowCurrentPassword(
                    !showCurrentPassword
                  )
                }
              >
                {showCurrentPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>

            </div>

          </div>

          {/* NEW PASSWORD */}

          <div className="settings-password-field">

            <label>
              New Password
            </label>

            <div>

              <input
                type={
                  showNewPassword
                    ? "text"
                    : "password"
                }
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(
                    event.target.value
                  )
                }
                placeholder="Minimum 6 characters"
                disabled={passwordLoading}
              />

              <button
                type="button"
                onClick={() =>
                  setShowNewPassword(
                    !showNewPassword
                  )
                }
              >
                {showNewPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>

            </div>

          </div>

          {/* CONFIRM PASSWORD */}

          <div className="settings-password-field">

            <label>
              Confirm New Password
            </label>

            <div>

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                placeholder="Confirm new password"
                disabled={passwordLoading}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>

            </div>

          </div>

          <button
            type="submit"
            className="settings-primary-btn"
            disabled={passwordLoading}
          >
            <Lock size={17} />

            {passwordLoading
              ? "Changing..."
              : "Change Password"}
          </button>

        </form>

      </div>

      {/* ========================================
          SESSION
      ======================================== */}

      <div className="settings-card">

        <div className="settings-card-header">

          <div className="settings-section-icon">
            <LogOut size={20} />
          </div>

          <div>
            <h2>Session</h2>

            <p>
              Manage your current login session.
            </p>
          </div>

        </div>

        <div className="settings-row">

          <div>
            <h3>Logout</h3>

            <p>
              Sign out from your FreelanceFlow
              account.
            </p>
          </div>

          <button
            type="button"
            className="settings-secondary-btn"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Logout
          </button>

        </div>

      </div>

      {/* ========================================
          DANGER ZONE
      ======================================== */}

      <div className="settings-card settings-danger-card">

        <div className="settings-card-header">

          <div className="settings-danger-icon">
            <Trash2 size={20} />
          </div>

          <div>
            <h2>Danger Zone</h2>

            <p>
              Permanently delete your
              FreelanceFlow account.
            </p>
          </div>

        </div>

        <div className="settings-row">

          <div>
            <h3>Delete Account</h3>

            <p>
              This action cannot be undone.
            </p>
          </div>

          <button
            type="button"
            className="settings-delete-btn"
            onClick={handleDeleteAccount}
            disabled={deleteLoading}
          >
            <Trash2 size={16} />

            {deleteLoading
              ? "Deleting..."
              : "Delete Account"}
          </button>

        </div>

      </div>

    </div>
  );
};

export default Settings;