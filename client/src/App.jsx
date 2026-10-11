import React, { useEffect } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import TimeTracking from "./pages/TimeTracking";
import Invoices from "./pages/Invoices";
import CreateInvoice from "./pages/CreateInvoice";
import InvoiceDetails from "./pages/InvoiceDetails";
import EditInvoice from "./pages/EditInvoice";

import Contact from "./components/Contact";
import Settings from "./pages/Settings";
import AboutMe from "./pages/AboutMe";
import UpcomingDeadlines from "./pages/UpcomingDeadlines";
import TimeLogDetails from "./pages/TimeLogDetails";
import TimeLogs from "./pages/TimeLogs";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";

const App = () => {
  // ==========================================
  // GLOBAL THEME
  // ==========================================

  useEffect(() => {
    const savedTheme =
      localStorage.getItem("freelanceflow-theme") || "light";

    document.documentElement.setAttribute(
      "data-theme",
      savedTheme
    );
  }, []);

  return (
  <AuthProvider>
    <BrowserRouter
  basename={
    window.location.hostname === "rs7556605-stack.github.io"
      ? "/FreelanceFlow"
      : "/"
  }
>
      <Routes>
          {/* ==========================================
              PUBLIC ROUTES
          ========================================== */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/contact"
            element={<Contact />}
          />

          {/* ==========================================
              PROTECTED ROUTES
          ========================================== */}

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <Clients />
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            }
          />

          <Route
            path="/time"
            element={
              <ProtectedRoute>
                <TimeTracking />
              </ProtectedRoute>
            }
          />
          <Route path="/time-logs" element={<TimeLogs />} />

<Route
  path="/time-log/:id"
  element={<TimeLogDetails />}
/>

          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <Invoices />
              </ProtectedRoute>
            }
          />

          <Route
            path="/invoices/create"
            element={
              <ProtectedRoute>
                <CreateInvoice />
              </ProtectedRoute>
            }
          />

          <Route
            path="/invoices/:id/edit"
            element={
              <ProtectedRoute>
                <EditInvoice />
              </ProtectedRoute>
            }
          />

          <Route
            path="/invoices/:id"
            element={
              <ProtectedRoute>
                <InvoiceDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <AboutMe />
              </ProtectedRoute>
            }
          />



          <Route
  path="/upcoming-deadlines"
  element={<UpcomingDeadlines />}
/>


<Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>

<Route
  path="/verify-otp"
  element={<VerifyOTP />}
/>

<Route
  path="/reset-password"
  element={<ResetPassword />}
/>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;