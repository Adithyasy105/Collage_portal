import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { 
  upsertStudentProfile,getTerms,
  getMyProfile, 
  dashboard,
  submitFeedback, 
  uploadProfilePhoto 
} from "../controllers/studentController.js";
// ... existing imports
import { submitBulkFeedback, getTeachersForFeedback } from "../controllers/studentController.js";
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Correct POST route for creating/updating the student profile
router.post("/profile", authMiddleware(["student"]), upsertStudentProfile);

// Correct GET route to fetch the student profile
router.get("/profile", authMiddleware(["student"]), getMyProfile);

router.get("/terms", authMiddleware(["student"]), getTerms);

// Correct GET route for the student dashboard
router.get("/dashboard", authMiddleware(["student"]), dashboard);

// New GET route for fetching teachers for feedback
router.get("/feedback-teachers", authMiddleware(["student"]), getTeachersForFeedback);

// New POST route for bulk feedback submission
router.post("/feedback/bulk", authMiddleware(["student"]), submitBulkFeedback);


router.post("/feedback", authMiddleware(["student"]), submitFeedback);

// Correct POST route for photo upload with multer middleware
router.post("/photo", authMiddleware(["student"]), upload.single('photo'), uploadProfilePhoto);

export default router;