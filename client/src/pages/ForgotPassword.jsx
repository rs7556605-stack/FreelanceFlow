import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Gmail validation
  const isValidGmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(
      email.trim()
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!isValidGmail(cleanEmail)) {
      setError(
        "Please enter a valid Gmail address."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await API.post(
        "/auth/forgot-password",
        {
          email: cleanEmail,
        }
      );

      setMessage(
        response.data.message ||
          "OTP has been sent to your email."
      );

      setTimeout(() => {
        navigate("/verify-otp", {
          state: {
            email: cleanEmail,
          },
        });
      }, 1000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to send OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <div className="text-center mb-8">

          <h1 className="text-3xl font-bold text-slate-900">
            Forgot Password
          </h1>

          <p className="text-slate-500 mt-2">
            Enter your Gmail to receive a verification OTP
          </p>

        </div>

        {error && (
          <div className="mb-5 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 bg-green-50 text-green-600 p-3 rounded-lg text-sm">
            {message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <div>

            <label className="block text-sm font-medium mb-2">
              Gmail Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="example@gmail.com"
              autoComplete="email"
              required
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-60"
          >
            {loading
              ? "Sending OTP..."
              : "Send OTP"}
          </button>

        </form>

        <p className="text-center text-sm text-slate-500 mt-6">

          Remember your password?{" "}

          <Link
            to="/login"
            className="text-blue-600 font-semibold"
          >
            Back to Login
          </Link>

        </p>

      </div>

    </div>
  );
};

export default ForgotPassword;