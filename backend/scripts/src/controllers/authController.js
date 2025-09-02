import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "../utils/mailer.js";

const prisma = new PrismaClient();

/**
 * Login user
 */
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role.toLowerCase() },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token,user:{id:user.id,name:user.name,role: user.role.toLowerCase()}});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Forgot password: send reset link
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal whether user exists
      return res.status(200).json({ message: "If email exists, reset link sent" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    const subject = "Password Reset Request";
    const htmlContent = `
      <p>Hello ${user.name || ""},</p>
      <p>You requested a password reset. Click the link below:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link expires in 1 hour.</p>
      <p>If you did not request this, ignore this email.</p>
    `;

    await sendEmail(user.email, subject, htmlContent);
    res.json({ message: "If email exists, reset link sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Reset password using token
 */
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const tokenRecord = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { password: hashedPassword },
    });

    await prisma.passwordResetToken.delete({ where: { id: tokenRecord.id } });

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



// return basic auth info + profileCompleted flag and linked student/staff record ids
// ... (your other imports)

export const me = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, name: true, role: true,
        // CORRECTED: Select all fields needed for the profile completion check
        student: { select: { 
          id: true, rollNumber: true, programId: true, dob: true, gender: true,
          category: true, address: true, city: true, state: true, pincode: true,
          guardianName: true, guardianPhone: true, guardianEmail: true 
        }},
        staff: { select: { id: true, employeeId: true, departmentId: true } },
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    // CORRECTED: Simplified and more robust profile completion check
    let profileCompleted = false;
    if (user.role === "STUDENT" && user.student) {
        // A profile is considered complete if all these key fields are not null
        const student = user.student;
        if (student.rollNumber && student.programId && student.guardianEmail) {
            profileCompleted = true;
        }
    } else if (user.role === "STAFF" && user.staff) {
        if (user.staff.employeeId && user.staff.departmentId) {
            profileCompleted = true;
        }
    } else if (user.role === "ADMIN") {
        profileCompleted = true;
    }

    res.json({ user, profileCompleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};