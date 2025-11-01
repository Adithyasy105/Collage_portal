import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getStaffForLeave,
  submitLeaveApplication,
  getStudentLeaveApplications,
  getStaffLeaveApplications,
  updateLeaveApplicationStatus
} from "../controllers/leaveController.js";
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Student routes
router.get("/staff", authMiddleware(["student"]), getStaffForLeave);
router.post("/submit", authMiddleware(["student"]), upload.single('letter'), submitLeaveApplication);
router.get("/my-applications", authMiddleware(["student"]), getStudentLeaveApplications);

// Staff routes - IMPORTANT: Put specific routes before parameterized routes
router.get("/applications", authMiddleware(["staff"]), getStaffLeaveApplications);
// Parameterized route - must come after specific routes
router.put("/:applicationId/status", authMiddleware(["staff"]), updateLeaveApplicationStatus);

export default router;
