import React, { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import API from "../services/api";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email =
    location.state?.email || "";

  const [otp, setOtp] = useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const cleanOTP =
      otp.trim();

    if (!email) {
      setError(
        "Email verification session expired. Please try again."
      );
      return;
    }

    if (!/^\d{6}$/.test(cleanOTP)) {
      setError(
        "Please enter a valid 6-digit OTP."
      );
      return;
    }

    setLoading(true);

    try {
      await API.post(
        "/auth/verify-reset-otp",
        {
          email,
          otp: cleanOTP,
        }
      );

      navigate(
        "/reset-password",
        {
          state: {
            email,
            otp: cleanOTP,
          },
        }
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Invalid or expired OTP."
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
            Verify OTP
          </h1>

          <p className="text-slate-500 mt-2">
            Enter the 6-digit OTP sent to
          </p>

          <p className="font-semibold text-slate-800 mt-1 break-all">
            {email}
          </p>

        </div>

        {error && (
          <div className="mb-5 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <div>

            <label className="block text-sm font-medium mb-2">
              Verification OTP
            </label>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value.replace(
                    /\D/g,
                    ""
                  )
                )
              }
              placeholder="Enter 6-digit OTP"
              autoComplete="one-time-code"
              required
              className="w-full border rounded-lg px-4 py-3 text-center text-xl tracking-[0.4em] outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-60"
          >
            {loading
              ? "Verifying..."
              : "Verify OTP"}
          </button>

        </form>

        <p className="text-center text-sm text-slate-500 mt-6">

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

export default VerifyOTP;