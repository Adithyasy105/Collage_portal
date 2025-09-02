import express from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware.js";
// ... (your existing imports)
import { sendDailyAttendanceAlerts } from "../jobs/attendanceAlerts.js"; // <-- Import the job function

// ... (your existing router setup)
import {
  uploadUsers,
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  createDepartment,
  getDepartments,
  createProgram,
  getPrograms,
  createSection,
  getSections,
  createTerm,
  getTerms,
  createSubject,
  getSubjects,
  getAuditLogs,
  getAllStudents,
  getAllStaff,
  getIncompleteStudents,
  getIncompleteStaff,
  getFeedbackForStaff,
  exportFeedbackCsv,
  getTeacherAverageRatings,
  createHoliday,
  getHolidays,
  deleteHoliday,
  uploadHolidays
} from "../controllers/adminController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// =========================================================
// USERS
// =========================================================
router.post("/upload-users", authMiddleware(["admin"]), upload.single("file"), uploadUsers);
router.post("/users", authMiddleware(["admin"]), createUser);
router.get("/users", authMiddleware(["admin"]), getUsers);
router.put("/users/:id", authMiddleware(["admin"]), updateUser);
router.delete("/users/:id", authMiddleware(["admin"]), deleteUser);

router.get("/students", authMiddleware(["admin"]), getAllStudents);

router.get("/staff", authMiddleware(["admin"]), getAllStaff);

// =========================================================
// HOLIDAY MANAGEMENT
// =========================================================
router.post("/holidays", authMiddleware(["admin"]), createHoliday);
router.get("/holidays", authMiddleware(["admin"]), getHolidays);
router.delete("/holidays/:id", authMiddleware(["admin"]), deleteHoliday);
router.post("/holidays/upload", authMiddleware(["admin"]), upload.single("file"), uploadHolidays);

// =========================================================
// MASTER DATA
// =========================================================
router.post("/departments", authMiddleware(["admin"]), createDepartment);
router.get("/departments", authMiddleware(["admin"]), getDepartments);

router.post("/programs", authMiddleware(["admin"]), createProgram);
router.get("/programs", authMiddleware(["admin"]), getPrograms);

router.post("/sections", authMiddleware(["admin"]), createSection);
router.get("/sections", authMiddleware(["admin"]), getSections);

router.post("/terms", authMiddleware(["admin"]), createTerm);
router.get("/terms", authMiddleware(["admin"]), getTerms);

router.post("/subjects", authMiddleware(["admin"]), createSubject);
router.get("/subjects", authMiddleware(["admin"]), getSubjects);

// =========================================================
// AUDIT & ANALYTICS
// =========================================================
router.get("/audit-logs", authMiddleware(["admin"]), getAuditLogs);

router.get("/students/incomplete", authMiddleware(["admin"]), getIncompleteStudents);
router.get("/staff/incomplete", authMiddleware(["admin"]), getIncompleteStaff);

router.get("/feedback", authMiddleware(["admin"]), getFeedbackForStaff);
router.get("/feedback/export", authMiddleware(["admin"]), exportFeedbackCsv);
router.get("/feedback/analytics/teacher-averages", authMiddleware(["admin"]), getTeacherAverageRatings);




// This is a temporary endpoint for testing ONLY. Remove it in production.
router.get("/trigger-alerts", authMiddleware(["admin"]), async (req, res) => {
  try {
    // Manually call the main job function
    await sendDailyAttendanceAlerts();
    res.json({ message: "Attendance alerts job manually triggered. Check server console for logs." });
  } catch (error) {
    res.status(500).json({ message: "Failed to trigger job.", error: error.message });
  }
});

// ... (your existing exports)

export default router;