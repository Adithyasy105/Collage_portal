import { PrismaClient } from "@prisma/client";
import { Readable } from 'stream';
import csv from 'csv-parser';
const prisma = new PrismaClient();

/**
 * Staff creates an assessment
 * Body: { name, date, maxMarks, weightage, sectionId, subjectId, termId }
 * Auth: staff
 */

/**
 * Staff creates an assessment
 * Body: { name, date, maxMarks, weightage, sectionId, subjectId, termId }
 * Auth: staff
 */
export const createAssessment = async (req, res) => {
  try {
    const { name, date, maxMarks, weightage, sectionId, subjectId, termId } = req.body;
    const userId = req.user.id;

    const staff = await prisma.staff.findUnique({ where: { userId } });
    if (!staff) return res.status(403).json({ message: "Staff profile required." });

    // Check if staff is assigned to this section/subject/term
    const assigned = await prisma.staffAssignment.findFirst({
      where: { staffId: staff.id, sectionId, subjectId, termId },
    });
    if (!assigned)
      return res.status(403).json({ message: "Not authorized to create assessment for this section/subject/term." });

    const assessment = await prisma.assessment.create({
      data: {
        name,
        date: new Date(date),
        maxMarks,
        weightage: weightage || null,
        sectionId,
        subjectId,
        termId,
        createdById: staff.id,
      },
    });

    res.status(201).json({ message: "Assessment created successfully.", assessment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

/**
 * Get staff's assigned sections/subjects/terms
 */
export const getStaffAssignments = async (req, res) => {
  try {
    const staff = await prisma.staff.findUnique({ where: { userId: req.user.id } });
    if (!staff) return res.status(403).json({ message: "Staff profile required." });

    const assignments = await prisma.staffAssignment.findMany({
      where: { staffId: staff.id },
      include: {
        section: true,
        subject: true,
        term: true,
      },
    });

    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};


/**
 * Staff uploads marks manually
 */
export const uploadMarks = async (req, res) => {
  try {
    const { assessmentId, marks } = req.body;
    const staffUserId = req.user.id;

    const staff = await prisma.staff.findUnique({ where: { userId: staffUserId } });
    if (!staff) return res.status(403).json({ message: "Staff profile required." });

    if (!Array.isArray(marks) || marks.length === 0)
      return res.status(400).json({ message: "Marks array is required." });

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { section: { include: { students: true } } },
    });
    if (!assessment) return res.status(404).json({ message: "Assessment not found." });
    if (assessment.createdById !== staff.id)
      return res.status(403).json({ message: "You are not authorized to upload marks." });

    const validStudentIds = assessment.section.students.map((s) => s.id);

    // Validate marks
    for (const entry of marks) {
      if (!validStudentIds.includes(entry.studentId))
        return res.status(400).json({ message: `Invalid studentId: ${entry.studentId}` });
      if (typeof entry.marksObtained !== "number" || entry.marksObtained < 0 || entry.marksObtained > assessment.maxMarks)
        return res.status(400).json({ message: `Invalid marks for student ${entry.studentId}` });
    }

    const markOps = marks.map((entry) =>
      prisma.mark.upsert({
        where: { uniq_assessment_student: { assessmentId, studentId: entry.studentId } },
        update: { marksObtained: entry.marksObtained },
        create: { assessmentId, studentId: entry.studentId, marksObtained: entry.marksObtained },
      })
    );

    const results = await prisma.$transaction(markOps);
    res.status(201).json({ message: "Marks uploaded successfully.", count: results.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

/**
 * Staff uploads marks via CSV
 */
export const uploadMarksCsv = async (req, res) => {
  if (!req.file?.buffer) return res.status(400).json({ message: "CSV file is required." });

  const { assessmentId } = req.body;
  if (!assessmentId) return res.status(400).json({ message: "assessmentId is required." });

  try {
    const staffUserId = req.user.id;
    const staff = await prisma.staff.findUnique({ where: { userId: staffUserId } });
    if (!staff) return res.status(403).json({ message: "Staff profile required." });

    const assessment = await prisma.assessment.findUnique({
      where: { id: parseInt(assessmentId) },
      include: { section: { include: { students: true } } },
    });

    if (!assessment) return res.status(404).json({ message: "Assessment not found." });
    if (assessment.createdById !== staff.id)
      return res.status(403).json({ message: "You are not authorized to upload marks." });

    const rollToId = new Map(assessment.section.students.map((s) => [s.rollNumber, s.id]));
    const marksData = [];

    const stream = Readable.from(req.file.buffer.toString());
    stream
      .pipe(csv())
      .on("data", (data) => {
        const studentId = rollToId.get(data.rollNumber);
        const marksObtained = parseInt(data.marksObtained);
        if (studentId && !isNaN(marksObtained) && marksObtained >= 0 && marksObtained <= assessment.maxMarks) {
          marksData.push({ studentId, marksObtained });
        }
      })
      .on("end", async () => {
        if (marksData.length === 0) return res.status(400).json({ message: "No valid marks found." });

        const markOps = marksData.map((m) =>
          prisma.mark.upsert({
            where: { uniq_assessment_student: { assessmentId: parseInt(assessmentId), studentId: m.studentId } },
            update: { marksObtained: m.marksObtained },
            create: { assessmentId: parseInt(assessmentId), studentId: m.studentId, marksObtained: m.marksObtained },
          })
        );

        await prisma.$transaction(markOps);
        res.status(201).json({ message: `Uploaded ${marksData.length} marks successfully.` });
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

/**
 * Staff fetches their assessments
 */
export const getMyAssessments = async (req, res) => {
  try {
    const staff = await prisma.staff.findUnique({ where: { userId: req.user.id } });
    if (!staff) return res.status(403).json({ message: "Staff profile required." });

    const assessments = await prisma.assessment.findMany({
      where: { createdById: staff.id },
      include: { section: true, subject: true, term: true },
      orderBy: { date: "desc" },
    });

    res.json(assessments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

/**
 * Get students + marks for a given assessment
 */
export const getAssessmentMarks = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const staff = await prisma.staff.findUnique({ where: { userId: req.user.id } });
    if (!staff) return res.status(403).json({ message: "Staff profile required." });

    const assessment = await prisma.assessment.findUnique({
      where: { id: parseInt(assessmentId) },
      include: { section: { include: { students: { include: { user: true } } } }, marks: true, subject: true },
    });

    if (!assessment) return res.status(404).json({ message: "Assessment not found." });
    if (assessment.createdById !== staff.id)
      return res.status(403).json({ message: "Not authorized." });

    const students = assessment.section.students.map((s) => ({
      studentId: s.id,
      rollNumber: s.rollNumber,
      name: s.user?.name,
      photoUrl: s.photoUrl,
      marksObtained: assessment.marks.find((m) => m.studentId === s.id)?.marksObtained || null,
    }));

    res.json({
      assessment: { id: assessment.id, name: assessment.name, maxMarks: assessment.maxMarks, subject: assessment.subject.name },
      students,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};


/**
 * Student views their marks
 * Query params: ?subjectId= or none for all
 * Auth: student
 */
export const viewMyMarks = async (req, res) => {
  try {
    const userId = req.user.id;
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) {
      return res.status(404).json({ message: "Student profile not found." });
    }

    const studentId = student.id;
    const { subjectId, termId } = req.query; // <-- CORRECTED: Add termId

    const where = { studentId };

    if (subjectId) {
      where.assessment = {
        subjectId: Number(subjectId)
      };
    }
    // CORRECTED: Add the termId filter
    if (termId) {
        where.assessment = { ...where.assessment, termId: Number(termId) };
    }

    const marks = await prisma.mark.findMany({
      where,
      include: {
        assessment: {
          include: {
            subject: true,
            term: true,
            createdBy: {
              select: {
                user: {
                  select: { name: true }
                }
              }
            }
          },
        },
      },
      orderBy: { assessment: { date: "desc" } },
    });

    res.json(marks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

/**
 * Staff gets all assessments they created
 * Auth: staff
 */
