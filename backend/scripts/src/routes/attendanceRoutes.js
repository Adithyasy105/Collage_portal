import express from "express";
import multer from "multer"; // <-- Add this import
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createSession, markAttendance, viewAttendance, attendanceSummary, uploadAttendanceCsv } from "../controllers/attendanceController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // <-- Add this line

// Staff creates a class session
router.post("/session", authMiddleware(["staff"]), createSession);

// Staff uploads attendance via CSV file
router.post("/upload-csv", authMiddleware(["staff"]), upload.single("file"), uploadAttendanceCsv);

// Staff marks attendance
router.post("/mark", authMiddleware(["staff"]), markAttendance);

// Student views own attendance
router.get("/my", authMiddleware(["student"]), viewAttendance);

router.get("/summary", authMiddleware(["student"]), attendanceSummary);

export default router;