import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { 
  createContact, 
  getContacts, 
  updateContactStatus, 
  deleteContact 
} from "../controllers/contactController.js";

const router = express.Router();

// Public
router.post("/", createContact);

// Admin
router.get("/", authMiddleware(["staff"]), getContacts);
router.patch("/:id", authMiddleware(["staff"]), updateContactStatus);
router.delete("/:id", authMiddleware(["staff"]), deleteContact);

export default router;
