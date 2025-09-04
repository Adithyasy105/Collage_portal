// routes/attendanceRoutes.js
import express from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createSession,
  markAttendance,
  viewAttendance,
  attendanceSummary,
  getSectionStudents,
  uploadAttendanceCsv,
  getMySessions
} from "../controllers/attendanceController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Staff creates a class session
router.post("/session", authMiddleware(["staff"]), createSession);

// Staff uploads attendance via CSV
router.post("/upload-csv", authMiddleware(["staff"]), upload.single("file"), uploadAttendanceCsv);

// Get sessions created by this staff
router.get("/my-sessions", authMiddleware(["staff"]), getMySessions);

// Staff marks attendance manually
router.post("/mark", authMiddleware(["staff"]), markAttendance);

// Students endpoints
router.get("/my", authMiddleware(["student"]), viewAttendance);
router.get("/summary", authMiddleware(["student"]), attendanceSummary);

// Fetch students in a section — supports query and param
router.get("/students", authMiddleware(["staff"]), getSectionStudents);
router.get("/students/:sectionId", authMiddleware(["staff"]), getSectionStudents);

export default router;
