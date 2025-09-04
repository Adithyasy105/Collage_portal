
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Staff fills/updates profile
 * Body: { employeeId, designation, departmentId, phone, emailAlt, qualification, joiningDate, photoUrl }
 */
export const upsertStaffProfile = async (req, res) => {
  try {
    const userId = req.user.id; // logged-in user ID (from middleware)
    const {
      employeeId,
      departmentId,  // must be an integer FK
      designation,
      phone,
      emailAlt,
      qualification,
      photoUrl,
      joiningDate,
    } = req.body;

    // ✅ Validate required fields
    if (!employeeId || !departmentId || !designation) {
      return res.status(400).json({
        message: "employeeId, departmentId, and designation are required",
      });
    }

    // ✅ Check if staff profile already exists
    const existing = await prisma.staff.findUnique({
      where: { userId },
    });

    if (existing) {
      // ✅ Update staff profile
      const updated = await prisma.staff.update({
        where: { id: existing.id },
        data: {
          employeeId,
          designation,
          phone,
          emailAlt,
          qualification,
          photoUrl,
          departmentId: Number(departmentId),
          joiningDate: joiningDate ? new Date(joiningDate) : null,
        },
      });
      return res.json({ message: "Profile updated", staff: updated });
    }

    // ✅ Create new staff profile
    const created = await prisma.staff.create({
      data: {
        employeeId,
        designation,
        phone,
        emailAlt,
        qualification,
        photoUrl,
        departmentId: Number(departmentId),
        joiningDate: joiningDate ? new Date(joiningDate) : null,
        userId// link staff to user
      },
    });

    return res.status(201).json({ message: "Profile created", staff: created });
  } catch (err) {
    console.error("Staff Profile Error:", err);
    res
      .status(500)
      .json({ message: "Error saving profile", error: err.message });
  }
};

/**
 * Get logged-in staff's profile
 */
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const staff = await prisma.staff.findUnique({
      where: { userId },
      include: { 
        department: true,
        user: { select: { id: true, name: true, email: true } }  // 👈 include user
      },
    });
    if (!staff) return res.status(404).json({ message: "Staff profile not found" });
    res.json(staff);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Staff dashboard: show assignments and upcoming sessions
 */
export const dashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const staff = await prisma.staff.findUnique({ where: { userId } });
    if (!staff) return res.status(404).json({ message: "Staff profile not found" });

    const staffId = staff.id;

    // assignments
    const assignments = await prisma.staffAssignment.findMany({
      where: { staffId, active: true },
      include: { subject: true, section: true, term: true },
    });

    // upcoming sessions (next 10)
    const sessions = await prisma.classSession.findMany({
      where: { takenByStaffId: staffId, scheduledAt: { gte: new Date() } },
      orderBy: { scheduledAt: "asc" },
      take: 10,
      include: { subject: true, section: true, term: true },
    });

    res.json({ assignments, upcomingSessions: sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



import multer from 'multer';
import { supabase } from '../config/supabaseClient.js';

const upload = multer({ storage: multer.memoryStorage() });

export const uploadProfilePhoto = [
  upload.single('photo'),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const staff = await prisma.staff.findUnique({ where: { userId } });
      if (!staff) return res.status(404).json({ message: "Staff profile not found" });

      if (!req.file) return res.status(400).json({ message: "No file uploaded" });

      // Upload to Supabase Storage
      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `staff_${staff.id}_${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('profiles') // bucket name
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (error) throw error;

      // Get public URL
      const { publicUrl } = supabase.storage
        .from('profiles')
        .getPublicUrl(fileName).data;

      // Save URL to staff profile
      await prisma.staff.update({
        where: { id: staff.id },
        data: { photoUrl: publicUrl },
      });

      res.json({ message: "Photo uploaded", photoUrl: publicUrl });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Photo upload failed", error: err.message });
    }
  }
];


/**
 * Staff views feedback submitted about them.
 * This endpoint fetches all feedback where the staffId matches the logged-in staff member.
 * Auth: staff
 */
export const getMyFeedback = async (req, res) => {
  try {
    const userId = req.user.id;
    const staff = await prisma.staff.findUnique({ where: { userId } });
    if (!staff) {
      // The user is authenticated but does not have a staff profile
      return res.status(404).json({ message: "Staff profile not found." });
    }

    const feedbacks = await prisma.feedback.findMany({
      where: { staffId: staff.id },
      include: {
        student: { 
          // Correctly selecting the student's name from the related User model
          select: {
            id: true, 
            rollNumber: true, 
            user: { 
                select: { name: true } 
            }
          } 
        },
        subject: { select: { id: true, name: true } },
        term: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: "desc" } // Order by newest feedback first
    });

    res.json({ feedbacks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};