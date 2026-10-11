
import React, { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();

  const { login } = useAuth();

  // ==========================================
  // FORM
  // ==========================================

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // ==========================================
  // STATES
  // ==========================================

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  // ==========================================
  // EMAIL VALIDATION
  // ==========================================

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email.trim()
    );
  };

  // ==========================================
  // CHANGE
  // ==========================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Clear error while typing
    if (error) {
      setError("");
    }
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const email = form.email
      .trim()
      .toLowerCase();

    const password = form.password;

    // ========================================
    // EMAIL REQUIRED
    // ========================================

    if (!email) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    // ========================================
    // EMAIL FORMAT
    // ========================================

    if (!isValidEmail(email)) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    // ========================================
    // PASSWORD REQUIRED
    // ========================================

    if (!password) {
      setError(
        "Please enter your password."
      );
      return;
    }

    // ========================================
    // PASSWORD LENGTH
    // ========================================

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    setLoading(true);

    try {
      // ======================================
      // LOGIN THROUGH AUTH CONTEXT
      // ======================================

      await login(
        email,
        password
      );

      // ======================================
      // SUCCESS
      // ======================================

      navigate("/");
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      const message =
        error.response?.data?.message ||
        error.message ||
        "Invalid email or password.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RETURN
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8">

        {/* =====================================
            HEADER
        ===================================== */}

        <div className="text-center mb-8">

          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
            🔐
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Welcome Back
          </h1>

          <p className="text-slate-500 mt-2">
            Login to FreelanceFlow
          </p>

        </div>

        {/* =====================================
            ERROR
        ===================================== */}

        {error && (
          <div
            className="
              mb-5
              bg-red-50
              border
              border-red-200
              text-red-600
              px-4
              py-3
              rounded-lg
              text-sm
              flex
              items-start
              gap-2
            "
          >

            <span className="text-base">
              ⚠️
            </span>

            <span>
              {error}
            </span>

          </div>
        )}

        {/* =====================================
            LOGIN FORM
        ===================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* ===================================
              EMAIL
          =================================== */}

          <div>

            <label
              htmlFor="login-email"
              className="block text-sm font-medium mb-2 text-slate-700"
            >
              Email
            </label>

            <input
              id="login-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              disabled={loading}
              required
              className="
                w-full
                border
                border-slate-300
                rounded-lg
                px-4
                py-3
                outline-none
                transition
                focus:ring-2
                focus:ring-blue-500
                focus:border-blue-500
                disabled:bg-slate-100
                disabled:cursor-not-allowed
              "
            />

          </div>

          {/* ===================================
              PASSWORD
          =================================== */}

          <div>

            {/* PASSWORD LABEL + FORGOT */}

            <div className="flex items-center justify-between mb-2">

              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <Link
                to="/forgot-password"
                className="
                  text-sm
                  text-blue-600
                  hover:text-blue-700
                  font-medium
                  transition
                "
              >
                Forgot Password?
              </Link>

            </div>

            {/* PASSWORD INPUT */}

            <div className="relative">

              <input
                id="login-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                required
                className="
                  w-full
                  border
                  border-slate-300
                  rounded-lg
                  px-4
                  py-3
                  pr-12
                  outline-none
                  transition
                  focus:ring-2
                  focus:ring-blue-500
                  focus:border-blue-500
                  disabled:bg-slate-100
                  disabled:cursor-not-allowed
                "
              />

              {/* SHOW / HIDE */}

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (previous) =>
                      !previous
                  )
                }
                disabled={loading}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-500
                  hover:text-slate-700
                  transition
                  disabled:opacity-50
                "
              >
                {showPassword
                  ? "🙈"
                  : "👁️"}
              </button>

            </div>

          </div>

          {/* ===================================
              LOGIN BUTTON
          =================================== */}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-blue-600
              hover:bg-blue-700
              active:bg-blue-800
              text-white
              py-3
              rounded-lg
              font-semibold
              transition
              flex
              items-center
              justify-center
              gap-2
              disabled:opacity-60
              disabled:cursor-not-allowed
            "
          >

            {loading ? (
              <>
                <span
                  className="
                    w-5
                    h-5
                    border-2
                    border-white
                    border-t-transparent
                    rounded-full
                    animate-spin
                  "
                />

                Logging in...
              </>
            ) : (
              "Login"
            )}

          </button>

        </form>

        {/* =====================================
            SECURITY NOTE
        ===================================== */}

        <div className="mt-5 text-center">

          <p className="text-xs text-slate-400">
            🔒 Your login credentials are securely
            verified.
          </p>

        </div>

        {/* =====================================
            REGISTER
        ===================================== */}

        <p className="text-center text-sm text-slate-500 mt-6">

          Don't have an account?{" "}

          <Link
            to="/register"
            className="
              text-blue-600
              font-semibold
              hover:text-blue-700
              transition
            "
          >
            Create Account
          </Link>

        </p>

      </div>

    </div>
  );
};

export default Login;
