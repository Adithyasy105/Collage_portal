import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { upsertStaffProfile, dashboard, getMyProfile ,uploadProfilePhoto,getMyFeedback} from "../controllers/staffController.js";

const router = express.Router();

router.post("/profile", authMiddleware(["staff"]), upsertStaffProfile);
router.get("/profile", authMiddleware(["staff"]), getMyProfile);
router.get("/dashboard", authMiddleware(["staff"]), dashboard);

// Add this route for photo upload
router.post("/photo", authMiddleware(["staff"]), uploadProfilePhoto);

router.get("/my-feedback", authMiddleware(["staff"]), getMyFeedback);

export default router;
