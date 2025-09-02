import express from "express";
import { login, forgotPassword, resetPassword, me } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Get logged in user info + profile completion
router.get("/me", authMiddleware(["student", "staff", "admin"]), me);

export default router;
