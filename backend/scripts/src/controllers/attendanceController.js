import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Helper: Check staff assignment for section/subject/term
 */
async function isStaffAssigned(staffId, sectionId, subjectId, termId) {
  return await prisma.staffAssignment.findFirst({
    where: { staffId, sectionId, subjectId, termId }
  });
}

/**
 * Helper: Get enrolled students for section/term, filtering for active students.
 */
async function getSectionStudents(sectionId, termId) {
  return await prisma.enrollment.findMany({
    where: { sectionId, termId, status: "ACTIVE" }, // Added status filter
    select: { studentId: true }
  });
}

/**
 * Staff creates a class session (or schedule)
 * Body: { sectionId, subjectId, termId, scheduledAt, durationMin, room }
 * Auth: staff
 */
export const createSession = async (req, res) => {
  try {
    const staffUserId = req.user.id;
    const staff = await prisma.staff.findUnique({ where: { userId: staffUserId } });
    if (!staff) return res.status(403).json({ message: "Staff profile required." });

    const { sectionId, subjectId, termId, scheduledAt, durationMin, room } = req.body;

    // Validate staff assignment
    const assigned = await isStaffAssigned(staff.id, sectionId, subjectId, termId);
    if (!assigned) return res.status(403).json({ message: "Not assigned to this section/subject/term." });

    // Manual overlap check (correct for current schema)
    const newSessionStarts = new Date(scheduledAt);
    const newSessionEnds = new Date(newSessionStarts.getTime() + durationMin * 60000);

    const existingSessions = await prisma.classSession.findMany({
      where: {
        sectionId,
        subjectId,
        termId,
        // The query range is wider than the session duration to ensure we catch all potential overlaps
        scheduledAt: {
          lte: newSessionEnds,
          gte: new Date(newSessionStarts.getTime() - (3 * 60 * 60 * 1000)), // A reasonable buffer, e.g., 3 hours
        }
      }
    });

    const hasOverlap = existingSessions.some(session => {
      const existingSessionEnds = new Date(session.scheduledAt.getTime() + session.durationMin * 60000);
      return (newSessionStarts < existingSessionEnds && newSessionEnds > session.scheduledAt);
    });

    if (hasOverlap) return res.status(409).json({ message: "Session overlaps with an existing session." });

    const session = await prisma.classSession.create({
      data: {
        sectionId,
        subjectId,
        termId,
        scheduledAt: newSessionStarts,
        durationMin,
        room,
        takenByStaffId: staff.id
      },
    });

    res.status(201).json({ message: "Session created.", session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

/**
 * Mark attendance for a session (staff only)
 * Body: { sessionId, attendance: [{ studentId, status }] }
 */
export const markAttendance = async (req, res) => {
  try {
    const staffUserId = req.user.id;
    const staff = await prisma.staff.findUnique({ where: { userId: staffUserId } });
    if (!staff) return res.status(403).json({ message: "Staff profile required." });

    const { sessionId, attendance } = req.body;
    if (!Array.isArray(attendance) || attendance.length === 0) return res.status(400).json({ message: "Attendance array is required and must not be empty." });

    const session = await prisma.classSession.findUnique({ where: { id: sessionId } });
    if (!session) return res.status(404).json({ message: "Session not found." });

    if (session.takenByStaffId !== staff.id) {
      return res.status(403).json({ message: "Only the session creator can mark attendance." });
    }

    // Get valid, ACTIVE students for section/term
    const validStudents = await getSectionStudents(session.sectionId, session.termId);
    const validIds = validStudents.map(s => s.studentId);

    const validStatuses = ["PRESENT", "ABSENT", "LATE", "EXCUSED"];
    for (const entry of attendance) {
      if (!validIds.includes(entry.studentId)) {
        return res.status(400).json({ message: `Invalid studentId: ${entry.studentId}.` });
      }
      if (!validStatuses.includes(entry.status)) {
        return res.status(400).json({ message: `Invalid status: ${entry.status}. Must be one of: ${validStatuses.join(", ")}` });
      }
    }

    const attendanceOps = attendance.map(entry =>
      prisma.attendance.upsert({
        where: { uniq_session_student: { sessionId, studentId: entry.studentId } },
        update: { status: entry.status, markedAt: new Date() },
        create: { sessionId, studentId: entry.studentId, subjectId: session.subjectId, status: entry.status }
      })
    );
    const results = await prisma.$transaction(attendanceOps);

    res.json({ message: "Attendance marked.", count: results.length, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

/**
 * Student view attendance for subject or overall
 * Query params: ?subjectId= or none for all
 * Auth: student
 */
// GET /api/student/attendance/my
export const viewAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const student = await prisma.student.findUnique({ where: { userId } });

    if (!student) {
      return res.status(404).json({ message: "Student profile not found." });
    }

    const { subjectId, termId } = req.query;

    const where = { studentId: student.id };

    if (subjectId) {
      where.subjectId = Number(subjectId);
    }
    if (termId) {
      // ✅ Correct filtering
      where.session = { termId: Number(termId) };
    }

    const records = await prisma.attendance.findMany({
      where,
      include: {
        subject: { select: { id: true, name: true, code: true } },
        session: {
          select: {
            id: true,
            scheduledAt: true,
            section: { select: { name: true, academicYear: true } },
            term: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { markedAt: "desc" },
    });

    res.json(records);
  } catch (err) {
    console.error("viewAttendance error:", err);
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};


// GET /api/student/attendance/summary
export const attendanceSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const student = await prisma.student.findUnique({ where: { userId } });

    if (!student) {
      return res.status(404).json({ message: "Student profile not found." });
    }

    const { termId } = req.query;

    const where = { studentId: student.id };
    if (termId) {
      where.session = { termId: Number(termId) }; // ✅ Correct
    }

    const allAttendance = await prisma.attendance.findMany({
      where,
      select: { subjectId: true, status: true },
    });

    let grandTotal = 0, grandPresent = 0;
    const subjectMap = new Map();

    for (const record of allAttendance) {
      if (!subjectMap.has(record.subjectId)) {
        subjectMap.set(record.subjectId, {
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
        });
      }
      const s = subjectMap.get(record.subjectId);
      s.total++;
      if (record.status === "PRESENT") s.present++;
      if (record.status === "ABSENT") s.absent++;
      if (record.status === "LATE") s.late++;
      if (record.status === "EXCUSED") s.excused++;

      grandTotal++;
      if (record.status === "PRESENT") grandPresent++;
    }

    const subjects = await prisma.subject.findMany({
      where: { id: { in: Array.from(subjectMap.keys()) } },
      select: { id: true, name: true, code: true },
    });
    const subjectDetailsMap = new Map(subjects.map((s) => [s.id, s]));

    const summary = Array.from(subjectMap.entries()).map(
      ([subjectId, counts]) => ({
        subjectId,
        subjectName: subjectDetailsMap.get(subjectId)?.name,
        subjectCode: subjectDetailsMap.get(subjectId)?.code,
        total: counts.total,
        present: counts.present,
        absent: counts.absent,
        late: counts.late,
        excused: counts.excused,
        percentage: counts.total
          ? Math.round((counts.present / counts.total) * 100)
          : 0,
      })
    );

    const overallPercent = grandTotal
      ? Math.round((grandPresent / grandTotal) * 100)
      : 0;

    res.json({ overallPercent, subjects: summary });
  } catch (err) {
    console.error("attendanceSummary error:", err);
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};


// controllers/attendanceController.js
// ... (your existing imports and functions)
import { Readable } from 'stream';
import csv from 'csv-parser';

/**
 * Staff uploads attendance via a CSV file.
 * POST /api/attendance/upload-csv
 * Assumes a CSV with 'rollNumber' and 'status' columns.
 * Auth: staff
 */
export const uploadAttendanceCsv = async (req, res) => {
    if (!req.file || !req.file.buffer) {
        return res.status(400).json({ message: "CSV file is required." });
    }

    const { sessionId } = req.body;
    if (!sessionId) {
        return res.status(400).json({ message: "sessionId is required in the form data." });
    }

    const staffUserId = req.user.id;
    const staff = await prisma.staff.findUnique({ where: { userId: staffUserId } });
    if (!staff) {
        return res.status(403).json({ message: "Staff profile required." });
    }

    const session = await prisma.classSession.findUnique({
        where: { id: parseInt(sessionId) },
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

    if (!session) {
        return res.status(404).json({ message: "Session not found." });
    }
    if (session.takenByStaffId !== staff.id) {
        return res.status(403).json({ message: "Only the session creator can upload attendance." });
    }

    const validStudents = session.section.students;
    const rollNumberToStudentIdMap = new Map(validStudents.map(s => [s.rollNumber, s.id]));
    const validStatuses = new Set(["PRESENT", "ABSENT", "LATE", "EXCUSED"]);

    const attendanceData = [];
    const stream = Readable.from(req.file.buffer.toString());

    stream
        .pipe(csv())
        .on('data', (data) => {
            const studentId = rollNumberToStudentIdMap.get(data.rollNumber);
            const status = data.status?.toUpperCase().trim();
            if (studentId && validStatuses.has(status)) {
                attendanceData.push({ studentId, status });
            } else {
                console.warn(`Skipping record with invalid roll number or status: ${JSON.stringify(data)}`);
            }
        })
        .on('end', async () => {
            if (attendanceData.length === 0) {
                return res.status(400).json({ message: "No valid attendance records found in the CSV file." });
            }

            const attendanceOps = attendanceData.map(record =>
                prisma.attendance.upsert({
                    where: { uniq_session_student: { sessionId: parseInt(sessionId), studentId: record.studentId } },
                    update: { status: record.status },
                    create: {
                        sessionId: parseInt(sessionId),
                        studentId: record.studentId,
                        subjectId: session.subjectId,
                        status: record.status,
                    },
                })
            );

            try {
                await prisma.$transaction(attendanceOps);
                res.status(201).json({ message: `Successfully uploaded ${attendanceData.length} attendance records from CSV.` });
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: "Server error during transaction.", error: err.message });
            }
        });
};