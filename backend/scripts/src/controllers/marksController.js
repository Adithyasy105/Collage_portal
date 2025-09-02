import { PrismaClient } from "@prisma/client";
import { Readable } from 'stream';
import csv from 'csv-parser';
const prisma = new PrismaClient();

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
    if (!staff) {
      return res.status(403).json({ message: "Staff profile required." });
    }

    const assigned = await prisma.staffAssignment.findFirst({
      where: {
        staffId: staff.id,
        sectionId,
        subjectId,
        termId,
      },
    });
    if (!assigned) {
      return res.status(403).json({ message: "Not authorized to create an assessment for this section/subject/term." });
    }

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
 * Staff uploads or updates marks for an assessment
 * Body: { assessmentId, marks: [{ studentId, marksObtained }] }
 * Auth: staff
 */
export const uploadMarks = async (req, res) => {
  try {
    const staffUserId = req.user.id;
    const staff = await prisma.staff.findUnique({ where: { userId: staffUserId } });
    if (!staff) {
      return res.status(403).json({ message: "Staff profile required." });
    }

    const { assessmentId, marks } = req.body;
    if (!Array.isArray(marks) || marks.length === 0) {
      return res.status(400).json({ message: "Marks array is required and must not be empty." });
    }

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        section: {
          include: {
            enrollments: {
              where: { status: "ACTIVE" },
              select: { studentId: true },
            },
          },
        },
      },
    });

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found." });
    }
    if (assessment.createdById !== staff.id) {
      return res.status(403).json({ message: "You are not authorized to upload marks for this assessment." });
    }

    const validStudentIds = assessment.section.enrollments.map(e => e.studentId);
    
    for (const entry of marks) {
      if (!validStudentIds.includes(entry.studentId)) {
        return res.status(400).json({ message: `Invalid studentId: ${entry.studentId}. Student is not enrolled in the correct section.` });
      }
      if (typeof entry.marksObtained !== 'number' || entry.marksObtained < 0 || entry.marksObtained > assessment.maxMarks) {
        return res.status(400).json({ message: `Invalid marksObtained for student ${entry.studentId}. Must be a number between 0 and ${assessment.maxMarks}.` });
      }
    }

    const markOps = marks.map(entry =>
      prisma.mark.upsert({
        where: { uniq_assessment_student: { assessmentId, studentId: entry.studentId } },
        update: { marksObtained: entry.marksObtained },
        create: {
          assessmentId: assessmentId,
          studentId: entry.studentId,
          marksObtained: entry.marksObtained,
        },
      })
    );

    const results = await prisma.$transaction(markOps);
    res.status(201).json({ message: "Marks uploaded successfully.", count: results.length, records: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

/**
 * Staff uploads marks for an assessment via a CSV file.
 * POST /api/marks/upload-csv
 */
export const uploadMarksCsv = async (req, res) => {
    if (!req.file || !req.file.buffer) {
        return res.status(400).json({ message: "CSV file is required." });
    }

    const { assessmentId } = req.body;
    if (!assessmentId) {
        return res.status(400).json({ message: "assessmentId is required in the form data." });
    }

    const staffUserId = req.user.id;
    const staff = await prisma.staff.findUnique({ where: { userId: staffUserId } });
    if (!staff) {
        return res.status(403).json({ message: "Staff profile required." });
    }

    const assessment = await prisma.assessment.findUnique({
        where: { id: parseInt(assessmentId) },
        include: {
            section: {
                include: {
                    students: {
                        select: { id: true, rollNumber: true }
                    }
                }
            }
        }
    });

    if (!assessment) {
        return res.status(404).json({ message: "Assessment not found." });
    }
    if (assessment.createdById !== staff.id) {
        return res.status(403).json({ message: "You are not authorized to upload marks for this assessment." });
    }

    const validStudents = assessment.section.students;
    const rollNumberToStudentIdMap = new Map(validStudents.map(s => [s.rollNumber, s.id]));

    const marksData = [];
    const stream = Readable.from(req.file.buffer.toString());

    stream
        .pipe(csv())
        .on('data', (data) => {
            const studentId = rollNumberToStudentIdMap.get(data.rollNumber);
            if (studentId && data.marksObtained !== undefined) {
                const marksObtained = parseInt(data.marksObtained);
                if (!isNaN(marksObtained) && marksObtained >= 0 && marksObtained <= assessment.maxMarks) {
                    marksData.push({ studentId, marksObtained });
                } else {
                    console.warn(`Skipping invalid marks for roll number ${data.rollNumber}.`);
                }
            } else {
                console.warn(`Skipping record with invalid roll number or marks: ${JSON.stringify(data)}`);
            }
        })
        .on('end', async () => {
            if (marksData.length === 0) {
                return res.status(400).json({ message: "No valid marks found in the CSV file." });
            }

            const markOps = marksData.map(mark =>
                prisma.mark.upsert({
                    where: { uniq_assessment_student: { assessmentId: parseInt(assessmentId), studentId: mark.studentId } },
                    update: { marksObtained: mark.marksObtained },
                    create: {
                        assessmentId: parseInt(assessmentId),
                        studentId: mark.studentId,
                        marksObtained: mark.marksObtained,
                    },
                })
            );

            try {
                await prisma.$transaction(markOps);
                res.status(201).json({ message: `Successfully uploaded ${marksData.length} marks from CSV.` });
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: "Server error during transaction.", error: err.message });
            }
        });
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