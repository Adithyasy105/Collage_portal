import express from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createAssessment, uploadMarks, viewMyMarks,uploadMarksCsv } from "../controllers/marksController.js";

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

export default router;