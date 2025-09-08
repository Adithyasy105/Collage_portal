import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { 
  createAdmission, 
  getAdmissions, 
  updateAdmissionStatus, 
  deleteAdmission 
} from "../controllers/admissionController.js";

const router = express.Router();

// Public
router.post("/", createAdmission);

// Admin
router.get("/", authMiddleware(["staff"]), getAdmissions);
router.patch("/:id", authMiddleware(["staff"]), updateAdmissionStatus);
router.delete("/:id", authMiddleware(["staff"]), deleteAdmission);

export default router;
