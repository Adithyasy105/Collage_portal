import prisma from "../config/prisma.js";
import { importUsers } from "../utils/importUsers.js";
import { Readable } from 'stream';
import csv from 'csv-parser';
import multer from "multer";
/**
 * =============================
 * USERS
 * =============================
 */

// POST /api/admin/upload-users
export const uploadUsers = async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ message: "CSV file required" });
    }
    await importUsers(req.file.buffer, true);
    res.json({ message: "Users imported successfully." });
  } catch (e) {
    console.error("UploadUsers Error:", e);
    res.status(500).json({ message: "Import failed", error: e.message });
  }
};

// POST /api/admin/users
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Explicitly pick allowed fields to create the user
    const user = await prisma.user.create({ 
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "STUDENT" // Default role to STUDENT if not provided
      }
    });

    // You may want to prevent an admin from creating other admins through the API unless a specific check is performed.

    // 4. Do NOT send the password back
    const { password: _, ...userData } = user;
    res.status(201).json(userData);
  } catch (e) {
    res.status(400).json({ message: "Failed to create user", error: e.message });
  }
};

// Corrected updateUser
export const updateUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { name, email, role } = req.body; // Explicitly pick updatable fields

    // You might need a more complex update logic for password changes

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, email, role }, // Pass only the explicitly allowed fields
    });

    const { password: _, ...userData } = user;
    res.json(userData);
  } catch (e) {
    res.status(400).json({ message: "Failed to update user", error: e.message });
  }
};

// GET /api/admin/users
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { student: true, staff: true },
    });
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch users", error: e.message });
  }
};

// PUT /api/admin/users/:id

// DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "User deleted" });
  } catch (e) {
    res.status(400).json({ message: "Failed to delete user", error: e.message });
  }
};



// =============================
// Get All Students
// =============================
export const getAllStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: { user: true }, // also fetch linked user info
    });
    res.json(students);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch students", error: e.message });
  }
};

// =============================
// Get All Staff
// =============================
export const getAllStaff = async (req, res) => {
  try {
    const staff = await prisma.staff.findMany({
      include: { user: true, department: true }, // also fetch linked user + department
    });
    res.json(staff);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch staff", error: e.message });
  }
};

/**
 * =============================
 * MASTER DATA (Department, Program, Section, Term, Subject)
 * =============================
 */

export const createDepartment = async (req, res) => {
  try {
    const dep = await prisma.department.create({ data: req.body });
    res.status(201).json(dep);
  } catch (e) {
    res.status(400).json({ message: "Failed to create department", error: e.message });
  }
};

export const getDepartments = async (req, res) => {
  const deps = await prisma.department.findMany({ include: { programs: true } });
  res.json(deps);
};

export const createProgram = async (req, res) => {
  try {
    const prog = await prisma.program.create({ data: req.body });
    res.status(201).json(prog);
  } catch (e) {
    res.status(400).json({ message: "Failed to create program", error: e.message });
  }
};

export const getPrograms = async (req, res) => {
  const progs = await prisma.program.findMany({ include: { department: true } });
  res.json(progs);
};

export const createSection = async (req, res) => {
  try {
    const sec = await prisma.section.create({ data: req.body });
    res.status(201).json(sec);
  } catch (e) {
    res.status(400).json({ message: "Failed to create section", error: e.message });
  }
};

export const getSections = async (req, res) => {
  const secs = await prisma.section.findMany({ include: { program: true } });
  res.json(secs);
};

export const createTerm = async (req, res) => {
  try {
    const term = await prisma.academicTerm.create({
      data: {
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
      },
    });
    res.status(201).json(term);
  } catch (e) {
    res.status(400).json({ message: "Failed to create term", error: e.message });
  }
};

export const getTerms = async (req, res) => {
  const terms = await prisma.academicTerm.findMany();
  res.json(terms);
};

export const createSubject = async (req, res) => {
  try {
    const subj = await prisma.subject.create({ data: req.body });
    res.status(201).json(subj);
  } catch (e) {
    res.status(400).json({ message: "Failed to create subject", error: e.message });
  }
};

export const getSubjects = async (req, res) => {
  const subs = await prisma.subject.findMany({ include: { program: true } });
  res.json(subs);
};

/**
 * =============================
 * AUDIT
 * =============================
 */
export const getAuditLogs = async (req, res) => {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    include: { actor: true, staff: true },
  });
  res.json(logs);
};


// =============================
// Profile Completion Summary
// =============================

// Students with incomplete profiles
export const getIncompleteStudents = async (req, res) => {
  try {
    // Define required fields for completion (empty string or 0 means incomplete)
    const students = await prisma.student.findMany({
      where: {
        OR: [
          { rollNumber: "" },
          { admissionYear: 0 },
          { currentSemester: 0 },
          { programId: 0 },
        ],
      },
      include: { user: true, program: true, section: true },
    });
    res.json({ count: students.length, students });
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch incomplete students", error: e.message });
  }
};

// Staff with incomplete profiles
export const getIncompleteStaff = async (req, res) => {
  try {
    // Define required fields for completion (empty string or 0 means incomplete)
    const staff = await prisma.staff.findMany({
      where: {
        OR: [
          { employeeId: "" },
          { departmentId: 0 },
          { designation: "" },
        ],
      },
      include: { user: true, department: true },
    });
    res.json({ count: staff.length, staff });
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch incomplete staff", error: e.message });
  }
};

// =============================
// Feedback for a specific staff/teacher (with student info)
// =============================
export const getFeedbackForStaff = async (req, res) => {
  try {
    const { staffId, departmentId, sectionId, fromDate, toDate } = req.query;
    if (!staffId) {
      return res.status(400).json({ message: "staffId is required" });
    }

    // Build where clause for filtering
    const where = {
      staffId: Number(staffId),
    };
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }
    if (sectionId) {
      where.student = { sectionId: Number(sectionId) };
    }
    if (departmentId) {
      where.student = where.student || {};
      where.student.program = { departmentId: Number(departmentId) };
    }

    const feedbacks = await prisma.feedback.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            rollNumber: true,
            user: { select: { name: true } },
            section: { select: { name: true } },
            program: { select: { department: { select: { name: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format for frontend table
    const result = feedbacks.map(fb => ({
      studentName: fb.student.user?.name,
      rollNumber: fb.student.rollNumber,
      department: fb.student.program?.department?.name,
      section: fb.student.section?.name,
      rating: fb.rating,
      comments: fb.comments,
      date: fb.createdAt,
    }));

    res.json({ count: result.length, feedback: result });
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch feedback", error: e.message });
  }
};

// =============================
// Analytics: Average feedback rating per teacher
// =============================
export const getTeacherAverageRatings = async (req, res) => {
  try {
    const { termId } = req.query;
    // Build where clause for optional term filter
    const where = {};
    if (termId) where.termId = Number(termId);

    // Group by staffId and calculate average rating and count
    const grouped = await prisma.feedback.groupBy({
      by: ["staffId"],
      where,
      _avg: { rating: true },
      _count: { rating: true },
    });

    // Get teacher info: name, photo, department
    const staffIds = grouped.map(g => g.staffId);
    const staffList = await prisma.staff.findMany({
      where: { id: { in: staffIds } },
      select: {
        id: true,
        photoUrl: true,
        user: { select: { name: true } },
        department: { select: { name: true } },
      },
    });
    const staffMap = Object.fromEntries(
      staffList.map(s => [s.id, {
        teacherName: s.user?.name || "Unknown",
        photoUrl: s.photoUrl || null,
        department: s.department?.name || null
      }])
    );

    // Format and sort
    const result = grouped.map(g => ({
      staffId: g.staffId,
      teacherName: staffMap[g.staffId]?.teacherName,
      photoUrl: staffMap[g.staffId]?.photoUrl,
      department: staffMap[g.staffId]?.department,
      averageRating: Number(g._avg.rating?.toFixed(2)),
      feedbackCount: g._count.rating
    })).sort((a, b) => b.averageRating - a.averageRating);

    res.json(result);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch teacher average ratings", error: e.message });
  }
};
import { Parser as Json2csvParser } from "json2csv";
// =============================
// Export feedback for a staff as CSV
// =============================
export const exportFeedbackCsv = async (req, res) => {
  try {
    const { staffId, departmentId, sectionId, fromDate, toDate } = req.query;
    if (!staffId) {
      return res.status(400).json({ message: "staffId is required" });
    }
    // Build where clause for filtering
    const where = {
      staffId: Number(staffId),
    };
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }
    if (sectionId) {
      where.student = { sectionId: Number(sectionId) };
    }
    if (departmentId) {
      where.student = where.student || {};
      where.student.program = { departmentId: Number(departmentId) };
    }

    const feedbacks = await prisma.feedback.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            rollNumber: true,
            user: { select: { name: true } },
            section: { select: { name: true } },
            program: { select: { department: { select: { name: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format for CSV
    const data = feedbacks.map(fb => ({
      studentName: fb.student.user?.name,
      rollNumber: fb.student.rollNumber,
      department: fb.student.program?.department?.name,
      section: fb.student.section?.name,
      rating: fb.rating,
      comments: fb.comments,
      date: fb.createdAt,
    }));

    const fields = ["studentName", "rollNumber", "department", "section", "rating", "comments", "date"];
    const json2csv = new Json2csvParser({ fields });
    const csv = json2csv.parse(data);

    res.header("Content-Type", "text/csv");
    res.attachment("feedback.csv");
    return res.send(csv);
  } catch (e) {
    res.status(500).json({ message: "Failed to export feedback as CSV", error: e.message });
  }
};

 // Make sure multer is imported

const upload = multer({ storage: multer.memoryStorage() });

// ... (Your other existing admin functions)

/**
 * Admin creates a new holiday.
 * POST /api/admin/holidays
 */
export const createHoliday = async (req, res) => {
  try {
    const { name, date } = req.body;
    if (!name || !date) {
      return res.status(400).json({ message: "Name and date are required." });
    }
    const holiday = await prisma.holiday.create({
      data: {
        name,
        date: new Date(date),
      },
    });
    res.status(201).json(holiday);
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(409).json({ message: "A holiday already exists on this date." });
    }
    console.error(e);
    res.status(500).json({ message: "Failed to create holiday", error: e.message });
  }
};

/**
 * Admin gets all holidays.
 * GET /api/admin/holidays
 */
export const getHolidays = async (req, res) => {
  try {
    const holidays = await prisma.holiday.findMany({
      orderBy: { date: "asc" }
    });
    res.json(holidays);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch holidays", error: e.message });
  }
};

/**
 * Admin deletes a holiday.
 * DELETE /api/admin/holidays/:id
 */
export const deleteHoliday = async (req, res) => {
  try {
    const holidayId = parseInt(req.params.id);
    await prisma.holiday.delete({ where: { id: holidayId } });
    res.json({ message: "Holiday deleted successfully." });
  } catch (e) {
    res.status(404).json({ message: "Holiday not found or failed to delete." });
  }
};

/**
 * Admin uploads a CSV file to bulk-add holidays.
 * POST /api/admin/holidays/upload
 */
export const uploadHolidays = async (req, res) => {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ message: "CSV file is required." });
  }

  const holidays = [];
  const invalidRecords = [];
  const stream = Readable.from(req.file.buffer.toString());

  stream
    .pipe(csv())
    .on('data', (data) => {
      if (data.name && data.date) {
        holidays.push({
          name: data.name.trim(),
          date: new Date(data.date.trim()),
        });
      } else {
        invalidRecords.push(data);
      }
    })
    .on('end', async () => {
      if (holidays.length === 0 && invalidRecords.length === 0) {
        return res.status(400).json({ message: "CSV file is empty or missing 'name' and 'date' columns." });
      }
      
      const upsertOps = holidays.map(holiday => 
        prisma.holiday.upsert({
          where: { date: holiday.date },
          update: { name: holiday.name },
          create: { name: holiday.name, date: holiday.date },
        })
      );
      
      try {
        await prisma.$transaction(upsertOps);
        res.status(200).json({
          message: `${holidays.length} holiday(s) imported successfully.`,
          invalidRecords,
        });
      } catch (error) {
        console.error("Bulk holiday import failed:", error);
        res.status(500).json({
          message: "An error occurred during bulk import. No holidays were added.",
          error: error.message,
        });
      }
    });
};



// ... (Other admin controller functions)

/**
 * Admin generates final results for a term.
 * POST /api/admin/generate-results
 * Body: { termId: 1 }
 * Auth: ADMIN
 */
export const generateResults = async (req, res) => {
  try {
    const { termId } = req.body;
    if (!termId) return res.status(400).json({ message: "termId is required." });

    // 1. Find all active enrollments for the given term
    const enrollments = await prisma.enrollment.findMany({
      where: { termId: Number(termId), status: 'ACTIVE' },
      include: { student: true, section: true }
    });

    if (enrollments.length === 0) return res.status(404).json({ message: "No active students found for this term." });

    // 2. Process each student
    const resultRecords = await prisma.$transaction(
      enrollments.map(async (enrollment) => {
        const studentId = enrollment.studentId;
        const programId = enrollment.section.programId;

        // Fetch all marks for the student in this term
        const marks = await prisma.mark.findMany({
          where: {
            studentId,
            assessment: { termId: Number(termId) }
          },
          include: { assessment: true }
        });

        // Calculate totals
        let totalMarks = 0;
        let maxMarks = 0;
        const breakdown = {};

        for (const mark of marks) {
          totalMarks += mark.marksObtained;
          maxMarks += mark.assessment.maxMarks;

          const subjectCode = mark.assessment.subjectId; // Use subject ID or code
          if (!breakdown[subjectCode]) {
            breakdown[subjectCode] = { obtained: 0, max: 0 };
          }
          breakdown[subjectCode].obtained += mark.marksObtained;
          breakdown[subjectCode].max += mark.assessment.maxMarks;
        }

        const percentage = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;
        const grade = percentage >= 75 ? 'A' : percentage >= 60 ? 'B' : 'C'; // Example grading logic

        // 3. Create the Result record
        await prisma.result.upsert({
          where: { uniq_student_term_result: { studentId, termId: Number(termId) } },
          update: { totalMarks, maxMarks, percentage, grade, publishedAt: new Date(), breakdown },
          create: {
            studentId, termId: Number(termId), programId,
            totalMarks, maxMarks, percentage, grade, publishedAt: new Date(), breakdown
          }
        });
        
        // 4. Update the student's current semester and enrollment status
        await prisma.student.update({
            where: { id: studentId },
            data: { currentSemester: { increment: 1 } }
        });
        await prisma.enrollment.update({
            where: { id: enrollment.id },
            data: { status: 'COMPLETED' }
        });

        return { studentId, percentage };
      })
    );

    res.status(200).json({ message: "Results generated and students promoted.", count: resultRecords.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating results", error: err.message });
  }
};