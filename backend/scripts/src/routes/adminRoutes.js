import express from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { sendDailyAttendanceAlerts } from "../jobs/attendanceAlerts.js";
import {
  uploadUsers,
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  getAllStudents,
  getAllStaff,
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
  createProgram,
  getPrograms,
  updateProgram,
  deleteProgram,
  createSection,
  getSections,
  updateSection,
  deleteSection,
  createTerm,
  getTerms,
  updateTerm,
  deleteTerm,
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
  getAuditLogs,
  getIncompleteStudents,
  getIncompleteStaff,
  getFeedbackForStaff,
  exportFeedbackCsv,
  getTeacherAverageRatings,
  createHoliday,
  getHolidays,
  updateHoliday,
  deleteHoliday,
  uploadHolidays,
  generateResults,
  getStaffAssignments,
  createStaffAssignment,
  updateStaffAssignment,
  deleteStaffAssignment,
  fixStaffAssignmentSequence,
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
router.put("/holidays/:id", authMiddleware(["admin"]), updateHoliday);
router.delete("/holidays/:id", authMiddleware(["admin"]), deleteHoliday);
router.post("/holidays/upload", authMiddleware(["admin"]), upload.single("file"), uploadHolidays);

// =========================================================
// MASTER DATA
// =========================================================
router.post("/departments", authMiddleware(["admin"]), createDepartment);
router.get("/departments", authMiddleware(["admin"]), getDepartments);
router.put("/departments/:id", authMiddleware(["admin"]), updateDepartment);
router.delete("/departments/:id", authMiddleware(["admin"]), deleteDepartment);

router.post("/programs", authMiddleware(["admin"]), createProgram);
router.get("/programs", authMiddleware(["admin"]), getPrograms);
router.put("/programs/:id", authMiddleware(["admin"]), updateProgram);
router.delete("/programs/:id", authMiddleware(["admin"]), deleteProgram);

router.post("/sections", authMiddleware(["admin"]), createSection);
router.get("/sections", authMiddleware(["admin"]), getSections);
router.put("/sections/:id", authMiddleware(["admin"]), updateSection);
router.delete("/sections/:id", authMiddleware(["admin"]), deleteSection);

router.post("/terms", authMiddleware(["admin"]), createTerm);
router.get("/terms", authMiddleware(["admin"]), getTerms);
router.put("/terms/:id", authMiddleware(["admin"]), updateTerm);
router.delete("/terms/:id", authMiddleware(["admin"]), deleteTerm);

router.post("/subjects", authMiddleware(["admin"]), createSubject);
router.get("/subjects", authMiddleware(["admin"]), getSubjects);
router.put("/subjects/:id", authMiddleware(["admin"]), updateSubject);
router.delete("/subjects/:id", authMiddleware(["admin"]), deleteSubject);

// =========================================================
// AUDIT & ANALYTICS
// =========================================================
router.get("/audit-logs", authMiddleware(["admin"]), getAuditLogs);

router.get("/students/incomplete", authMiddleware(["admin"]), getIncompleteStudents);
router.get("/staff/incomplete", authMiddleware(["admin"]), getIncompleteStaff);

router.get("/feedback", authMiddleware(["admin"]), getFeedbackForStaff);
router.get("/feedback/export", authMiddleware(["admin"]), exportFeedbackCsv);
router.get("/feedback/analytics/teacher-averages", authMiddleware(["admin"]), getTeacherAverageRatings);

// =========================================================
// RESULTS
// =========================================================
router.post("/generate-results", authMiddleware(["admin"]), generateResults);

// =========================================================
// STAFF ASSIGNMENTS
// =========================================================
router.get("/staff-assignments", authMiddleware(["admin"]), getStaffAssignments);
router.post("/staff-assignments", authMiddleware(["admin"]), createStaffAssignment);
router.put("/staff-assignments/:id", authMiddleware(["admin"]), updateStaffAssignment);
router.delete("/staff-assignments/:id", authMiddleware(["admin"]), deleteStaffAssignment);
router.post("/staff-assignments/fix-sequence", authMiddleware(["admin"]), fixStaffAssignmentSequence);

// =========================================================
// TEST JOB TRIGGER (REMOVE IN PRODUCTION)
// =========================================================
router.get("/trigger-alerts", authMiddleware(["admin"]), async (req, res) => {
  try {
    await sendDailyAttendanceAlerts();
    res.json({ message: "Attendance alerts job manually triggered." });
  } catch (error) {
    res.status(500).json({ message: "Failed to trigger job", error: error.message });
  }
});

export default router;
