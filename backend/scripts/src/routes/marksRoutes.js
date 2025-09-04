import express from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createAssessment, uploadMarks, viewMyMarks,uploadMarksCsv,getMyAssessments,getAssessmentMarks,getStaffAssignments } from "../controllers/marksController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Staff creates assessment (JSON body)
router.post("/assessment", authMiddleware(["staff"]), createAssessment);
// Staff uploads marks (JSON body)
router.post("/upload", authMiddleware(["staff"]), uploadMarks);
// Student views marks
router.get("/my", authMiddleware(["student"]), viewMyMarks);
// Staff uploads marks via CSV file
router.post("/upload-csv", authMiddleware(["staff"]), upload.single("file"), uploadMarksCsv);

// Staff gets all created assessments
router.get("/my-assessments", authMiddleware(["staff"]), getMyAssessments);

// Get students + marks for assessment
router.get("/:assessmentId/marks", authMiddleware(["staff"]), getAssessmentMarks);

// Get staff assignments
router.get("/assignments", authMiddleware(["staff"]), getStaffAssignments);


export default router;