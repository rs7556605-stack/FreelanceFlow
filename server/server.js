const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

const connectDB = require("./config/db");

// ==========================================
// ROUTES
// ==========================================

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const clientRoutes = require("./routes/clientRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const timeRoutes = require("./routes/timeRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const contactRoutes = require("./routes/contactRoutes");
const profileRoutes = require("./routes/profileRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// ==========================================
// DATABASE
// ==========================================

connectDB();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

// Increased JSON payload limit
// Required for Base64 profile images
app.use(express.json({ limit: "10mb" }));

// Support URL-encoded payloads
app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// ==========================================
// ROOT
// ==========================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FreelanceFlow API is running 🚀",
  });
});

// ==========================================
// ROUTES
// ==========================================

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/time", timeRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ==========================================
// SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`FreelanceFlow Server running on port ${PORT}`);
});