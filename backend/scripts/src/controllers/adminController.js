// controllers/adminController.js
import prisma from "../config/prisma.js";
import { importUsers } from "../utils/importUsers.js";
import { Readable } from "stream";
import csvParser from "csv-parser";
import bcrypt from "bcryptjs";
import { Parser as Json2csvParser } from "json2csv";

/**
 * Admin controller
 *
 * Exports:
 * - uploadUsers, uploadHolidays
 * - createUser, getUsers, updateUser, deleteUser
 * - getAllStudents, getAllStaff
 * - createDepartment, getDepartments
 * - createProgram, getPrograms
 * - createSection, getSections
 * - createTerm, getTerms
 * - createSubject, getSubjects
 * - createHoliday, getHolidays, deleteHoliday
 * - getAuditLogs
 * - getIncompleteStudents, getIncompleteStaff
 * - getFeedbackForStaff, exportFeedbackCsv
 * - getTeacherAverageRatings
 * - generateResults
 */

// -----------------------------
// Helper: parse CSV buffer into rows (array of objects)
// -----------------------------
const parseCsvBuffer = (buffer, headers = true) =>
  new Promise((resolve, reject) => {
    const rows = [];
    const stream = Readable.from(buffer);
    stream
      .pipe(csvParser({ skipLines: 0, mapHeaders: ({ header }) => header?.trim() }))
      .on("data", (data) => rows.push(data))
      .on("end", () => resolve(rows))
      .on("error", (err) => reject(err));
  });

// =============================
// USERS
// =============================
export const uploadUsers = async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ message: "CSV file required" });
    }
    const result = await importUsers(req.file.buffer, true);
    return res.json({ message: "Users imported successfully.", details: result });
  } catch (e) {
    console.error("UploadUsers Error:", e);
    return res.status(500).json({ message: "Import failed", error: e.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: (role || "STUDENT").toUpperCase(),
      },
    });

    const { password: _, ...userData } = user;
    return res.status(201).json(userData);
  } catch (e) {
    console.error("createUser:", e);
    return res.status(400).json({ message: "Failed to create user", error: e.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { student: true, staff: true },
      orderBy: { createdAt: "desc" },
    });
    return res.json(users);
  } catch (e) {
    console.error("getUsers:", e);
    return res.status(500).json({ message: "Failed to fetch users", error: e.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, email, password, role } = req.body;

    const data = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (role) data.role = role;
    if (password) data.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id },
      data,
    });

    const { password: _, ...userData } = user;
    return res.json(userData);
  } catch (e) {
    console.error("updateUser:", e);
    return res.status(400).json({ message: "Failed to update user", error: e.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.user.delete({ where: { id } });
    return res.json({ message: "User deleted" });
  } catch (e) {
    console.error("deleteUser:", e);
    return res.status(400).json({ message: "Failed to delete user", error: e.message });
  }
};

// =============================
// Get All Students / Staff
// =============================
export const getAllStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: { user: true, program: true, section: true },
    });
    return res.json(students);
  } catch (e) {
    console.error("getAllStudents:", e);
    return res.status(500).json({ message: "Failed to fetch students", error: e.message });
  }
};

export const getAllStaff = async (req, res) => {
  try {
    const staff = await prisma.staff.findMany({
      include: { user: true, department: true },
    });
    return res.json(staff);
  } catch (e) {
    console.error("getAllStaff:", e);
    return res.status(500).json({ message: "Failed to fetch staff", error: e.message });
  }
};

// =============================
// HOLIDAY MANAGEMENT
// =============================
export const createHoliday = async (req, res) => {
  try {
    const { name, date } = req.body;
    if (!name || !date) {
      return res.status(400).json({ message: "name and date are required" });
    }
    const holiday = await prisma.holiday.create({
      data: { name, date: new Date(date) },
    });
    return res.status(201).json(holiday);
  } catch (err) {
    console.error("createHoliday:", err);
    return res.status(500).json({ error: "Failed to create holiday", details: err.message });
  }
};

export const getHolidays = async (req, res) => {
  try {
    const holidays = await prisma.holiday.findMany({ orderBy: { date: "asc" } });
    return res.json(holidays);
  } catch (e) {
    console.error("getHolidays:", e);
    return res.status(500).json({ message: "Failed to fetch holidays", error: e.message });
  }
};

export const updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, date } = req.body;
    
    const updated = await prisma.holiday.update({
      where: { id: Number(id) },
      data: {
        name,
        date: new Date(date),
      },
    });
    return res.json(updated);
  } catch (e) {
    console.error("updateHoliday:", e);
    return res.status(400).json({ message: "Failed to update holiday", error: e.message });
  }
};

export const deleteHoliday = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.holiday.delete({ where: { id } });
    return res.json({ message: "Holiday deleted" });
  } catch (e) {
    console.error("deleteHoliday:", e);
    return res.status(400).json({ message: "Failed to delete holiday", error: e.message });
  }
};

export const uploadHolidays = async (req, res) => {
  try {
    if (!req.file?.buffer) return res.status(400).json({ message: "CSV file required" });
    const rows = await parseCsvBuffer(req.file.buffer);

    // Expect rows with at least: name, date (ISO or recognizable)
    const created = [];
    const errors = [];
    for (const r of rows) {
      try {
        if (!r.name || !r.date) throw new Error("Missing name or date");
        const d = new Date(r.date);
        if (isNaN(d)) throw new Error("Invalid date: " + r.date);
        const record = await prisma.holiday.create({
          data: { name: r.name.trim(), date: d },
        });
        created.push(record);
      } catch (err) {
        errors.push({ row: r, error: err.message });
      }
    }
    return res.json({ createdCount: created.length, created, errors });
  } catch (e) {
    console.error("uploadHolidays:", e);
    return res.status(500).json({ message: "Failed to upload holidays", error: e.message });
  }
};

// =============================
// MASTER DATA (Department, Program, Section, Term, Subject)
// =============================
export const createDepartment = async (req, res) => {
  try {
    const dep = await prisma.department.create({ data: req.body });
    return res.status(201).json(dep);
  } catch (e) {
    console.error("createDepartment:", e);
    return res.status(400).json({ message: "Failed to create department", error: e.message });
  }
};

export const getDepartments = async (req, res) => {
  try {
    const deps = await prisma.department.findMany({ include: { programs: true, staff: true } });
    return res.json(deps);
  } catch (e) {
    console.error("getDepartments:", e);
    return res.status(500).json({ message: "Failed to fetch departments", error: e.message });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name } = req.body;
    
    const updated = await prisma.department.update({
      where: { id: Number(id) },
      data: { code, name },
      include: { programs: true, staff: true },
    });
    return res.json(updated);
  } catch (e) {
    console.error("updateDepartment:", e);
    return res.status(400).json({ message: "Failed to update department", error: e.message });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.department.delete({ where: { id: Number(id) } });
    return res.json({ message: "Department deleted successfully" });
  } catch (e) {
    console.error("deleteDepartment:", e);
    return res.status(400).json({ message: "Failed to delete department", error: e.message });
  }
};

export const createProgram = async (req, res) => {
  try {
    const prog = await prisma.program.create({ data: req.body });
    return res.status(201).json(prog);
  } catch (e) {
    console.error("createProgram:", e);
    return res.status(400).json({ message: "Failed to create program", error: e.message });
  }
};

export const getPrograms = async (req, res) => {
  try {
    const progs = await prisma.program.findMany({ include: { department: true } });
    return res.json(progs);
  } catch (e) {
    console.error("getPrograms:", e);
    return res.status(500).json({ message: "Failed to fetch programs", error: e.message });
  }
};

export const updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, durationSemesters, departmentId } = req.body;
    
    const updated = await prisma.program.update({
      where: { id: Number(id) },
      data: {
        code,
        name,
        durationSemesters: Number(durationSemesters),
        departmentId: Number(departmentId),
      },
      include: { department: true },
    });
    return res.json(updated);
  } catch (e) {
    console.error("updateProgram:", e);
    return res.status(400).json({ message: "Failed to update program", error: e.message });
  }
};

export const deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.program.delete({ where: { id: Number(id) } });
    return res.json({ message: "Program deleted successfully" });
  } catch (e) {
    console.error("deleteProgram:", e);
    return res.status(400).json({ message: "Failed to delete program", error: e.message });
  }
};

export const createSection = async (req, res) => {
  try {
    const sec = await prisma.section.create({ data: req.body });
    return res.status(201).json(sec);
  } catch (e) {
    console.error("createSection:", e);
    return res.status(400).json({ message: "Failed to create section", error: e.message });
  }
};

export const getSections = async (req, res) => {
  try {
    const secs = await prisma.section.findMany({ include: { program: true } });
    return res.json(secs);
  } catch (e) {
    console.error("getSections:", e);
    return res.status(500).json({ message: "Failed to fetch sections", error: e.message });
  }
};

export const updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, academicYear, semester, shift, programId } = req.body;
    
    const updated = await prisma.section.update({
      where: { id: Number(id) },
      data: {
        name,
        academicYear,
        semester: Number(semester),
        shift: shift || null,
        programId: Number(programId),
      },
      include: { program: true },
    });
    return res.json(updated);
  } catch (e) {
    console.error("updateSection:", e);
    return res.status(400).json({ message: "Failed to update section", error: e.message });
  }
};

export const deleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.section.delete({ where: { id: Number(id) } });
    return res.json({ message: "Section deleted successfully" });
  } catch (e) {
    console.error("deleteSection:", e);
    return res.status(400).json({ message: "Failed to delete section", error: e.message });
  }
};

export const createTerm = async (req, res) => {
  try {
    const { startDate, endDate, ...rest } = req.body;
    const term = await prisma.academicTerm.create({
      data: {
        ...rest,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });
    return res.status(201).json(term);
  } catch (e) {
    console.error("createTerm:", e);
    return res.status(400).json({ message: "Failed to create term", error: e.message });
  }
};

export const getTerms = async (req, res) => {
  try {
    const terms = await prisma.academicTerm.findMany({ orderBy: { startDate: "desc" } });
    return res.json(terms);
  } catch (e) {
    console.error("getTerms:", e);
    return res.status(500).json({ message: "Failed to fetch terms", error: e.message });
  }
};

export const updateTerm = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate } = req.body;
    
    const updated = await prisma.academicTerm.update({
      where: { id: Number(id) },
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });
    return res.json(updated);
  } catch (e) {
    console.error("updateTerm:", e);
    return res.status(400).json({ message: "Failed to update term", error: e.message });
  }
};

export const deleteTerm = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.academicTerm.delete({ where: { id: Number(id) } });
    return res.json({ message: "Term deleted successfully" });
  } catch (e) {
    console.error("deleteTerm:", e);
    return res.status(400).json({ message: "Failed to delete term", error: e.message });
  }
};

export const createSubject = async (req, res) => {
  try {
    const subj = await prisma.subject.create({ data: req.body });
    return res.status(201).json(subj);
  } catch (e) {
    console.error("createSubject:", e);
    return res.status(400).json({ message: "Failed to create subject", error: e.message });
  }
};

export const getSubjects = async (req, res) => {
  try {
    const subs = await prisma.subject.findMany({ include: { program: true } });
    return res.json(subs);
  } catch (e) {
    console.error("getSubjects:", e);
    return res.status(500).json({ message: "Failed to fetch subjects", error: e.message });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, semester, theoryHours, practicalHours, programId } = req.body;
    
    const updated = await prisma.subject.update({
      where: { id: Number(id) },
      data: {
        code,
        name,
        semester: Number(semester),
        theoryHours: Number(theoryHours),
        practicalHours: Number(practicalHours),
        programId: Number(programId),
      },
      include: { program: true },
    });
    return res.json(updated);
  } catch (e) {
    console.error("updateSubject:", e);
    return res.status(400).json({ message: "Failed to update subject", error: e.message });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.subject.delete({ where: { id: Number(id) } });
    return res.json({ message: "Subject deleted successfully" });
  } catch (e) {
    console.error("deleteSubject:", e);
    return res.status(400).json({ message: "Failed to delete subject", error: e.message });
  }
};

// =============================
// AUDIT
// =============================
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      include: { actor: true, staff: true },
      take: 1000,
    });
    return res.json(logs);
  } catch (e) {
    console.error("getAuditLogs:", e);
    return res.status(500).json({ message: "Failed to fetch audit logs", error: e.message });
  }
};

// =============================
// Profile Completion Summary
// =============================
export const getIncompleteStudents = async (req, res) => {
  try {
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
    return res.json({ count: students.length, students });
  } catch (e) {
    console.error("getIncompleteStudents:", e);
    return res.status(500).json({ message: "Failed to fetch incomplete students", error: e.message });
  }
};

export const getIncompleteStaff = async (req, res) => {
  try {
    const staff = await prisma.staff.findMany({
      where: {
        OR: [{ employeeId: "" }, { departmentId: 0 }, { designation: "" }],
      },
      include: { user: true, department: true },
    });
    return res.json({ count: staff.length, staff });
  } catch (e) {
    console.error("getIncompleteStaff:", e);
    return res.status(500).json({ message: "Failed to fetch incomplete staff", error: e.message });
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

    const result = feedbacks.map((fb) => ({
      studentName: fb.student.user?.name,
      rollNumber: fb.student.rollNumber,
      department: fb.student.program?.department?.name,
      section: fb.student.section?.name,
      rating: fb.rating,
      comments: fb.comments,
      date: fb.createdAt,
    }));

    return res.json({ count: result.length, feedback: result });
  } catch (e) {
    console.error("getFeedbackForStaff:", e);
    return res.status(500).json({ message: "Failed to fetch feedback", error: e.message });
  }
};

// =============================
// Analytics: Average feedback rating per teacher
// =============================
export const getTeacherAverageRatings = async (req, res) => {
  try {
    const { termId } = req.query;
    const where = {};
    if (termId) where.termId = Number(termId);

    const grouped = await prisma.feedback.groupBy({
      by: ["staffId"],
      where,
      _avg: { rating: true },
      _count: { rating: true },
    });

    const staffIds = grouped.map((g) => g.staffId);
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
      staffList.map((s) => [
        s.id,
        {
          teacherName: s.user?.name || "Unknown",
          photoUrl: s.photoUrl || null,
          department: s.department?.name || null,
        },
      ])
    );

    const result = grouped
      .map((g) => ({
        staffId: g.staffId,
        teacherName: staffMap[g.staffId]?.teacherName,
        photoUrl: staffMap[g.staffId]?.photoUrl,
        department: staffMap[g.staffId]?.department,
        averageRating: Number(g._avg.rating?.toFixed(2)),
        feedbackCount: g._count.rating,
      }))
      .sort((a, b) => b.averageRating - a.averageRating);

    return res.json(result);
  } catch (e) {
    console.error("getTeacherAverageRatings:", e);
    return res.status(500).json({ message: "Failed to fetch teacher average ratings", error: e.message });
  }
};

// =============================
// Export feedback for a staff as CSV
// =============================
export const exportFeedbackCsv = async (req, res) => {
  try {
    const { staffId, departmentId, sectionId, fromDate, toDate } = req.query;
    if (!staffId) {
      return res.status(400).json({ message: "staffId is required" });
    }

    const where = { staffId: Number(staffId) };
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

    const data = feedbacks.map((fb) => ({
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
    console.error("exportFeedbackCsv:", e);
    return res.status(500).json({ message: "Failed to export feedback as CSV", error: e.message });
  }
};

// =============================
// RESULTS generation
// - This implementation sums marks for assessments within the specified term,
//   groups by student and creates/updates Result rows (one per student per term).
// - Accepts query/body: termId (required), programId (optional).
// - It will compute total obtained, total max, percentage, and upsert Result.
// =============================
export const generateResults = async (req, res) => {
  try {
    const { termId, programId } = req.body || req.query;
    if (!termId)
      return res.status(400).json({ message: "termId is required" });

    // 1) Find assessments in the term
    const assessments = await prisma.assessment.findMany({
      where: { termId: Number(termId) },
      select: { id: true, maxMarks: true, sectionId: true, subjectId: true },
    });

    if (!assessments.length) {
      return res
        .status(400)
        .json({ message: "No assessments found for the term" });
    }

    const assessmentIds = assessments.map((a) => a.id);

    // 2) Gather marks for these assessments
    const marks = await prisma.mark.findMany({
      where: { assessmentId: { in: assessmentIds } },
      include: {
        assessment: { select: { maxMarks: true, sectionId: true } },
        student: { select: { id: true, programId: true } },
      },
    });

    // Optional filter by programId
    const filteredMarks = programId
      ? marks.filter((m) => m.student.programId === Number(programId))
      : marks;

    // 3) Aggregate per student
    const studentMap = new Map(); // studentId -> { obtainedSum, maxSum, termId, programId }
    for (const m of filteredMarks) {
      const sid = m.studentId;
      const prev =
        studentMap.get(sid) || {
          obtainedSum: 0,
          maxSum: 0,
          studentId: sid,
          termId: Number(termId),
          programId: m.student.programId,
        };
      prev.obtainedSum += Number(m.marksObtained || 0);
      prev.maxSum += Number(m.assessment?.maxMarks || 0);
      studentMap.set(sid, prev);
    }

    // 4) Prepare results to upsert
    const resultsToUpsert = Array.from(studentMap.values()).map((s) => {
      const percentage = s.maxSum > 0 ? (s.obtainedSum / s.maxSum) * 100 : 0;
      const grade =
        percentage >= 75
          ? "A"
          : percentage >= 60
          ? "B"
          : percentage >= 50
          ? "C"
          : "F";

      return {
        studentId: s.studentId,
        termId: Number(termId),
        programId: s.programId,
        totalMarks: Math.round(s.obtainedSum),
        maxMarks: Math.round(s.maxSum),
        percentage: Number(percentage.toFixed(2)),
        grade,
        publishedAt: new Date(),
        breakdown: null,
      };
    });

    // 5) Upsert using correct compound unique
    const txOps = resultsToUpsert.map((r) =>
      prisma.result.upsert({
        where: {
          uniq_student_term_result: {
            studentId: r.studentId,
            termId: r.termId,
          },
        },
        update: {
          totalMarks: r.totalMarks,
          maxMarks: r.maxMarks,
          percentage: r.percentage,
          grade: r.grade,
          publishedAt: r.publishedAt,
          breakdown: r.breakdown,
        },
        create: r,
      })
    );

    const created = await prisma.$transaction(txOps);

    return res.json({
      message: "Results generated/updated",
      count: created.length,
      results: created,
    });
  } catch (e) {
    console.error("generateResults:", e);
    return res
      .status(500)
      .json({ message: "Failed to generate results", error: e.message });
  }
};

// =============================
// STAFF ASSIGNMENTS
// =============================
export const getStaffAssignments = async (req, res) => {
  try {
    const assignments = await prisma.staffAssignment.findMany({
      include: {
        staff: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            department: {
              select: {
                name: true,
              },
            },
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        section: {
          select: {
            id: true,
            name: true,
            academicYear: true,
            program: {
              select: {
                name: true,
              },
            },
          },
        },
        term: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { termId: "desc" },
        { sectionId: "asc" },
        { subjectId: "asc" },
      ],
    });

    return res.json(assignments);
  } catch (e) {
    console.error("getStaffAssignments:", e);
    return res.status(500).json({ message: "Failed to fetch assignments", error: e.message });
  }
};

export const createStaffAssignment = async (req, res) => {
  try {
    const { staffId, subjectId, sectionId, termId, active = true, id } = req.body;

    // Explicitly remove id if present to prevent auto-increment conflicts
    if (id !== undefined) {
      console.warn("ID field provided in request body, ignoring it for auto-increment");
    }

    if (!staffId || !subjectId || !sectionId || !termId) {
      return res.status(400).json({ message: "staffId, subjectId, sectionId, and termId are required." });
    }

    // Check if assignment already exists
    const existing = await prisma.staffAssignment.findUnique({
      where: {
        uniq_assignment: {
          staffId: Number(staffId),
          subjectId: Number(subjectId),
          sectionId: Number(sectionId),
          termId: Number(termId),
        },
      },
    });

    if (existing) {
      return res.status(409).json({ message: "This assignment already exists." });
    }

    // Create without id field - let Prisma auto-generate it
    const assignment = await prisma.staffAssignment.create({
      data: {
        staffId: Number(staffId),
        subjectId: Number(subjectId),
        sectionId: Number(sectionId),
        termId: Number(termId),
        active: active === true || active === "true",
        // Explicitly do NOT include id - let database auto-increment handle it
      },
      include: {
        staff: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            department: {
              select: {
                name: true,
              },
            },
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        section: {
          select: {
            id: true,
            name: true,
            academicYear: true,
            program: {
              select: {
                name: true,
              },
            },
          },
        },
        term: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(201).json(assignment);
  } catch (e) {
    console.error("createStaffAssignment:", e);
    
    // Handle specific Prisma errors
    if (e.code === 'P2002') {
      if (e.meta?.target?.includes('id')) {
        return res.status(500).json({ 
          message: "Database sequence error. Please contact administrator to reset the StaffAssignment ID sequence.",
          error: "ID sequence is out of sync with existing data",
          code: e.code
        });
      } else {
        // This is the compound unique constraint
        return res.status(409).json({ 
          message: "This assignment already exists.",
          error: e.message,
          code: e.code
        });
      }
    }
    
    return res.status(400).json({ message: "Failed to create assignment", error: e.message, code: e.code });
  }
};

export const updateStaffAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    const assignment = await prisma.staffAssignment.update({
      where: { id: Number(id) },
      data: {
        active: active === true || active === "true",
      },
      include: {
        staff: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            department: {
              select: {
                name: true,
              },
            },
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        section: {
          select: {
            id: true,
            name: true,
            academicYear: true,
            program: {
              select: {
                name: true,
              },
            },
          },
        },
        term: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.json(assignment);
  } catch (e) {
    console.error("updateStaffAssignment:", e);
    return res.status(400).json({ message: "Failed to update assignment", error: e.message });
  }
};

export const deleteStaffAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.staffAssignment.delete({
      where: { id: Number(id) },
    });

    return res.json({ message: "Assignment deleted successfully." });
  } catch (e) {
    console.error("deleteStaffAssignment:", e);
    return res.status(400).json({ message: "Failed to delete assignment", error: e.message });
  }
};

// Fix sequence for StaffAssignment table
export const fixStaffAssignmentSequence = async (req, res) => {
  try {
    // Get the max ID from the table
    const maxIdResult = await prisma.$queryRaw`
      SELECT COALESCE(MAX(id), 0) as max_id FROM "StaffAssignment"
    `;
    
    const maxId = maxIdResult[0]?.max_id || 0;
    const nextId = Number(maxId) + 1;

    // Reset the sequence to the next available ID
    await prisma.$executeRaw`
      SELECT setval(pg_get_serial_sequence('"StaffAssignment"', 'id'), ${nextId}, true)
    `;

    return res.json({ 
      message: "Sequence fixed successfully",
      maxId: maxId,
      nextId: nextId
    });
  } catch (e) {
    console.error("fixStaffAssignmentSequence:", e);
    return res.status(500).json({ 
      message: "Failed to fix sequence", 
      error: e.message 
    });
  }
};


export default {
  uploadUsers,
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  getAllStudents,
  getAllStaff,
  createDepartment,
  getDepartments,
  createProgram,
  getPrograms,
  createSection,
  getSections,
  createTerm,
  getTerms,
  createSubject,
  getSubjects,
  getAuditLogs,
  getIncompleteStudents,
  getIncompleteStaff,
  getFeedbackForStaff,
  exportFeedbackCsv,
  getTeacherAverageRatings,
  createHoliday,
  getHolidays,
  updateHoliday,
  deleteHoliday,
  uploadHolidays,
  generateResults,
  getStaffAssignments,
  createStaffAssignment,
  updateStaffAssignment,
  deleteStaffAssignment,
  fixStaffAssignmentSequence,
  updateDepartment,
  deleteDepartment,
  updateProgram,
  deleteProgram,
  updateSection,
  deleteSection,
  updateTerm,
  deleteTerm,
  updateSubject,
  deleteSubject,
};
