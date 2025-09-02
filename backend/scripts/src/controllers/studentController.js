import { PrismaClient } from "@prisma/client";
import { supabase } from '../config/supabaseClient.js';
const prisma = new PrismaClient();
import multer from 'multer';

// Multer setup for file uploads
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Student submits feedback for multiple staff/teachers at once (Atomic)
 * Body: { feedbacks: [{ staffId, subjectId, termId, rating, comments }] }
 * Auth: student (token)
 */
// studentController.js
// ... other imports

/**
 * Get all teachers and subjects for the student's current section and term.
 * Auth: student
 */
export const getTeachersForFeedback = async (req, res) => {
  try {
    const userId = req.user.id;
    const termId = parseInt(req.query.termId); // ✅ allow selecting term from dropdown

    const student = await prisma.student.findUnique({
      where: { userId },
      select: { id: true, sectionId: true },
    });

    if (!student || !student.sectionId) {
      return res.status(404).json({ message: "Student is not assigned to a section." });
    }

    // if termId not passed → get current active term
    let activeTermId = termId;
    if (!activeTermId) {
      const currentTerm = await prisma.academicTerm.findFirst({
        where: { endDate: { gte: new Date() } },
        orderBy: { startDate: "desc" },
      });
      if (!currentTerm) {
        return res.status(404).json({ message: "No active term found." });
      }
      activeTermId = currentTerm.id;
    }

    // fetch assignments for student’s section + term
    const assignments = await prisma.staffAssignment.findMany({
      where: { sectionId: student.sectionId, termId: activeTermId },
      include: {
        staff: { select: { id: true, user: { select: { name: true } } } },
        subject: { select: { id: true, name: true } },
      },
    });

    // fetch feedback already given
    const existingFeedback = await prisma.feedback.findMany({
      where: { studentId: student.id, termId: activeTermId },
    });

    res.json({
      assignments: assignments.map(a => ({
        staffId: a.staffId,
        subjectId: a.subjectId,
        staff: { user: { name: a.staff.user.name } },
        subject: { name: a.subject.name },
      })),
      existingFeedback,
      currentTermId: activeTermId,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Student submits feedback for multiple staff/teachers at once (Atomic)
 * Body: { feedbacks: [{ staffId, subjectId, termId, rating, comments }] }
 * Auth: student (token)
 */
export const submitBulkFeedback = async (req, res) => {
  try {
    const userId = req.user.id;
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    const { feedbacks } = req.body;
    if (!Array.isArray(feedbacks) || feedbacks.length === 0) {
      return res.status(400).json({ message: "feedbacks array required" });
    }
    
    const results = await prisma.$transaction(
      feedbacks.map(fb => {
        const { staffId, subjectId, termId, rating, comments } = fb;
        if (!staffId || !subjectId || !termId || rating === undefined) {
          throw new Error("Missing required fields in one or more feedback items.");
        }
        return prisma.feedback.create({
          data: {
            studentId: student.id,
            staffId: Number(staffId),
            subjectId: Number(subjectId),
            termId: Number(termId),
            rating: Number(rating),
            comments: comments || null,
          },
        });
      })
    );

    res.status(201).json({ message: "Bulk feedback submitted successfully", count: results.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during bulk submission. No feedback was saved.", error: err.message });
  }
};

// ... (Other student controller functions are already correct)

/**
 * Student submits feedback for a staff/teacher
 * Body: { staffId, subjectId, termId, rating, comments }
 * Auth: student (token)
 */
export const submitFeedback = async (req, res) => {
  try {
    const userId = req.user.id;
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    const { staffId, subjectId, termId, rating, comments } = req.body;
    if (!staffId || !subjectId || !termId || !rating) {
      return res.status(400).json({ message: "staffId, subjectId, termId, and rating are required" });
    }

    const feedback = await prisma.feedback.create({
      data: {
        studentId: student.id,
        staffId: Number(staffId),
        subjectId: Number(subjectId),
        termId: Number(termId),
        rating: Number(rating),
        comments: comments || null,
      },
    });
    res.status(201).json({ message: "Feedback submitted", feedback });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


/**
 * Student fills/updates their profile
 */
export const upsertStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      rollNumber, admissionYear, currentSemester, photoUrl, dob, gender,
      category, address, city, state, pincode, guardianName, guardianPhone,
      guardianEmail, programId, sectionId,
    } = req.body;

    if (!rollNumber || !admissionYear || !currentSemester || !programId) {
      return res.status(400).json({ message: "rollNumber, admissionYear, currentSemester, and programId are required" });
    }

    const existing = await prisma.student.findFirst({ where: { userId } });

    const data = {
      rollNumber, admissionYear: Number(admissionYear), currentSemester: Number(currentSemester), photoUrl,
      dob: dob ? new Date(dob) : null, gender, category, address, city, state, pincode,
      guardianName, guardianPhone, guardianEmail, programId: Number(programId), sectionId: sectionId ? Number(sectionId) : null,
      userId,
    };

    if (existing) {
      const updated = await prisma.student.update({ where: { id: existing.id }, data });
      return res.json({ message: "Profile updated", student: updated });
    } else {
      const created = await prisma.student.create({ data });
      return res.status(201).json({ message: "Profile created", student: created });
    }
  } catch (err) {
    console.error("Student Profile Error:", err);
    res.status(500).json({ message: "Error saving profile", error: err.message });
  }
};

/**
 * Get logged-in student's profile
 */
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true, email: true } },
        program: true,
        section: true,
      },
    });
    if (!student) return res.status(404).json({ message: "Student profile not found" });
    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Student dashboard summary
 */
export const dashboard = async (req, res) => {
  try {
    // find student id
    const userId = req.user.id;
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const studentId = student.id;

    // 1) Attendance summary per subject (percentage)
    const attendanceRows = await prisma.attendance.groupBy({
      by: ["subjectId", "status"],
      where: { studentId },
      _count: { status: true },
    });
    // Transform into subject -> {present, total}
    const subjectCounts = {};
    for (const r of attendanceRows) {
      const sid = r.subjectId;
      subjectCounts[sid] = subjectCounts[sid] || { present: 0, total: 0 };
      subjectCounts[sid].total += r._count.status;
      if (r.status === "PRESENT") subjectCounts[sid].present += r._count.status;
    }
    // build array with subject info
    const subjects = await prisma.subject.findMany({
      where: { id: { in: Object.keys(subjectCounts).map(Number) } },
      select: { id: true, name: true, code: true },
    });
    const attendanceSummary = subjects.map(s => {
      const counts = subjectCounts[s.id] || { present: 0, total: 0 };
      const percent = counts.total ? (counts.present / counts.total) * 100 : null;
      return { subjectId: s.id, subjectName: s.name, subjectCode: s.code, present: counts.present, total: counts.total, percentage: percent };
    });

    // overall attendance
    const overall = attendanceSummary.filter(a => a.percentage !== null);
    const overallPercent = overall.length ? (overall.reduce((acc, a) => acc + a.percentage, 0) / overall.length) : null;

    // 2) Marks summary: latest marks per assessment and overall average
    const marks = await prisma.mark.findMany({
      where: { studentId },
      include: {
        assessment: { select: { id: true, name: true, subjectId: true, maxMarks: true } },
      },
    });
    // group by subject
    const marksBySubject = {};
    for (const m of marks) {
      const subj = m.assessment.subjectId;
      marksBySubject[subj] = marksBySubject[subj] || { obtained: 0, max: 0, count: 0, items: [] };
      marksBySubject[subj].obtained += m.marksObtained;
      marksBySubject[subj].max += m.assessment.maxMarks;
      marksBySubject[subj].count++;
      marksBySubject[subj].items.push({ assessment: m.assessment.name, obtained: m.marksObtained, max: m.assessment.maxMarks });
    }
    const marksSummary = [];
    for (const [subjId, v] of Object.entries(marksBySubject)) {
      marksSummary.push({ subjectId: Number(subjId), obtained: v.obtained, max: v.max, items: v.items, percentage: v.max ? (v.obtained / v.max) * 100 : null });
    }

    res.json({
      attendanceSummary,
      overallAttendancePercent: overallPercent,
      marksSummary,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
/**
 * Uploads a student's profile photo to Supabase.
 */
export const uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) return res.status(404).json({ message: "Student profile not found" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Debugging: Check the student record
    console.log("Student Record:", student);

    // CORRECTED: Add a try...catch around the delete operation
    if (student.photoUrl) {
      try {
        const existingFileName = student.photoUrl.split('/').pop();
        console.log("Attempting to delete old photo:", existingFileName);
        const { error: deleteError } = await supabase.storage.from('profiles').remove([existingFileName]);
        if (deleteError) {
          console.error("Supabase delete error:", deleteError);
          // Don't throw here; we can still upload the new photo
        }
      } catch (deleteErr) {
        console.error("Error during old photo deletion:", deleteErr);
      }
    }
    
    // Upload new photo
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `student_${student.id}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      throw new Error(uploadError.message);
    }
    
    const { publicUrl } = supabase.storage
      .from('profiles')
      .getPublicUrl(fileName).data;

    await prisma.student.update({
      where: { id: student.id },
      data: { photoUrl: publicUrl },
    });

    res.json({ message: "Photo uploaded", photoUrl: publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Photo upload failed", error: err.message });
  }
};

export const getTerms = async (req, res) => {
    try {
        const terms = await prisma.academicTerm.findMany({
            orderBy: { startDate: "desc" }
        });
        res.json(terms);
    } catch (e) {
        res.status(500).json({ message: "Failed to fetch terms", error: e.message });
    }
};