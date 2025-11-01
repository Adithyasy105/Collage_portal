// server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

// Routes (adjust paths if your files live elsewhere)
import authRoutes from "./scripts/src/routes/authRoutes.js";
import studentRoutes from "./scripts/src/routes/studentRoutes.js";
import staffRoutes from "./scripts/src/routes/staffRoutes.js";
import adminRoutes from "./scripts/src/routes/adminRoutes.js";
import attendanceRoutes from "./scripts/src/routes/attendanceRoutes.js";
import marksRoutes from "./scripts/src/routes/marksRoutes.js";

import admissionRoutes from "./scripts/src/routes/admissionRoutes.js";
import contactRoutes from "./scripts/src/routes/contactRoutes.js";
import leaveRoutes from "./scripts/src/routes/leaveRoutes.js";

import { startAttendanceAlertJob } from "./scripts/src/jobs/attendanceAlerts.js"; // <-- NEW

const app = express();

// --- Middleware ---
// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://collage-portal-h9kw84t0h-adithyasy105s-projects.vercel.app",
    "https://collage-portal-r5j6.onrender.com",
    "https://collage-portal-h9kw84t0h-adithyasy105s-projects.vercel.app",
    "https://collage-portal-5sh1rnifb-adithyasy105s-projects.vercel.app/",
    "https://collage-portal-sigma.vercel.app/",
    process.env.FRONTEND_URL
  ].filter(Boolean), // Remove any undefined values
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json({ limit: "10mb" })); // parse JSON
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // parse form data
app.use(morgan("dev")); // request logging

// Optional: small health check
app.get("/", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

// --- API routes ---
app.use("/api/auth", authRoutes);           // login / forgot / reset / me
app.use("/api/students", studentRoutes);    // student profile, dashboard, marks, attendance (student endpoints)
app.use("/api/staff", staffRoutes);         // staff profile, create sessions, mark attendance, assessments
app.use("/api/admin", adminRoutes);         // admin CSV upload, management
app.use("/api/attendance", attendanceRoutes); // alternate attendance endpoints (optional)
app.use("/api/marks", marksRoutes); // marks endpoints (if separate)

// Routes
app.use("/api/admissions", admissionRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/leave", leaveRoutes);

startAttendanceAlertJob()

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler (simple)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  res.status(status).json({ message, details: process.env.NODE_ENV === "development" ? err.stack : undefined });
});

// Start server
const PORT = parseInt(process.env.PORT || "5000", 10);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
