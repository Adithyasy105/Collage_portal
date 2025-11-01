// controllers/attendanceController.js
import { PrismaClient } from "@prisma/client";
import { Readable } from "stream";
import csv from "csv-parser";

const prisma = new PrismaClient();

// Helper used by server-side code (not an express handler)
export async function getSectionStudentsById(sectionId) {
  return await prisma.student.findMany({
    where: { sectionId },
    select: {
      id: true,
      rollNumber: true,
      photoUrl: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { rollNumber: "asc" },
  });
}

// Controller: GET /api/attendance/students?sectionId=1  OR GET /api/attendance/students/:sectionId
export const getSectionStudents = async (req, res) => {
  try {
    // support both query and route param
    const sectionId = Number(req.query.sectionId ?? req.params.sectionId);
    if (!sectionId || Number.isNaN(sectionId)) {
      return res.status(400).json({ message: "sectionId is required and must be a number" });
    }

    const students = await getSectionStudentsById(sectionId);
    return res.json(students);
  } catch (err) {
    console.error("getSectionStudents error:", err);
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};


/* --------------------------
   Create session (unchanged, but included for completeness)
   -------------------------- */
async function isStaffAssigned(staffId, sectionId, subjectId, termId) {
  return await prisma.staffAssignment.findFirst({
    where: { staffId, sectionId, subjectId, termId },
  });
}

export const createSession = async (req, res) => {
  try {
    const staffUserId = req.user.id;
    const staff = await prisma.staff.findUnique({ where: { userId: staffUserId } });
    if (!staff) return res.status(403).json({ message: "Staff profile required." });

    const { sectionId, subjectId, termId, scheduledAt, durationMin, room } = req.body;
    const sectionIdNum = Number(sectionId);
    const subjectIdNum = Number(subjectId);
    const termIdNum = Number(termId);
    const duration = durationMin ? Number(durationMin) : 0;

    if ([sectionIdNum, subjectIdNum, termIdNum].some(isNaN)) {
      return res.status(400).json({ message: "Section, Subject, and Term IDs must be numbers." });
    }

    const assigned = await isStaffAssigned(staff.id, sectionIdNum, subjectIdNum, termIdNum);
    if (!assigned) return res.status(403).json({ message: "Not assigned to this section/subject/term." });

    const newSessionStarts = new Date(scheduledAt);
    const newSessionEnds = new Date(newSessionStarts.getTime() + duration * 60000);

    const existingSessions = await prisma.classSession.findMany({
      where: {
        sectionId: sectionIdNum,
        termId: termIdNum,
      },
    });

    const hasOverlap = existingSessions.some(session => {
      const existingDuration = session.durationMin ?? 0;
      const existingSessionEnds = new Date(session.scheduledAt.getTime() + existingDuration * 60000);
      return (newSessionStarts < existingSessionEnds && newSessionEnds > session.scheduledAt);
    });

    if (hasOverlap) {
      return res.status(409).json({ message: "Session overlaps with an existing session." });
    }

    const session = await prisma.classSession.create({
      data: {
        sectionId: sectionIdNum,
        subjectId: subjectIdNum,
        termId: termIdNum,
        scheduledAt: newSessionStarts,
        durationMin: duration,
        room,
        takenByStaffId: staff.id,
      },
    });

    return res.status(201).json({ message: "Session created.", session });
  } catch (err) {
    console.error("createSession error:", err);
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};


/* --------------------------
   Mark attendance
   -------------------------- */
export const markAttendance = async (req, res) => {
  try {
    const staffUserId = req.user.id;
    const staff = await prisma.staff.findUnique({ where: { userId: staffUserId } });
    if (!staff) return res.status(403).json({ message: "Staff profile required." });

    const { sessionId, attendance } = req.body;
    if (!Array.isArray(attendance) || attendance.length === 0)
      return res.status(400).json({ message: "Attendance array is required." });

    const session = await prisma.classSession.findUnique({ where: { id: Number(sessionId) } });
    if (!session) return res.status(404).json({ message: "Session not found." });
    if (session.takenByStaffId !== staff.id) return res.status(403).json({ message: "Only creator can mark attendance." });

    const validStudents = await getSectionStudentsById(session.sectionId);
    const validIds = validStudents.map(s => s.id);
    const validStatuses = new Set(["PRESENT", "ABSENT", "LATE", "EXCUSED"]);

    const ops = attendance.map(entry => {
      if (!validIds.includes(entry.studentId) || !validStatuses.has(entry.status)) {
        throw new Error(`Invalid entry: ${entry.studentId} ${entry.status}`);
      }
      return prisma.attendance.upsert({
        where: { uniq_session_student: { sessionId: Number(sessionId), studentId: entry.studentId } },
        update: { status: entry.status, markedAt: new Date(), subjectId: session.subjectId },
        create: { sessionId: Number(sessionId), studentId: entry.studentId, subjectId: session.subjectId, status: entry.status }
      });
    });

    const results = await prisma.$transaction(ops);
    return res.json({ message: "Attendance marked.", count: results.length, results });
  } catch (err) {
    console.error("markAttendance error:", err);
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};


/* --------------------------
   CSV upload (keeps your logic)
   -------------------------- */
export const uploadAttendanceCsv = async (req, res) => {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ message: "CSV file required." });
  }
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ message: "sessionId required." });

  const staffUserId = req.user.id;
  const staff = await prisma.staff.findUnique({ where: { userId: staffUserId } });
  if (!staff) return res.status(403).json({ message: "Staff profile required." });

  const session = await prisma.classSession.findUnique({
    where: { id: Number(sessionId) },
    include: { section: { include: { students: { select: { id: true, rollNumber: true } } } } },
  });
  if (!session) return res.status(404).json({ message: "Session not found." });
  if (session.takenByStaffId !== staff.id) return res.status(403).json({ message: "Only creator can upload attendance." });

  const rollMap = new Map(session.section.students.map(s => [s.rollNumber, s.id]));
  const validStatuses = new Set(["PRESENT", "ABSENT", "LATE", "EXCUSED"]);

  const data = [];
  const stream = Readable.from(req.file.buffer);

  stream.pipe(csv())
    .on("data", row => {
      const studentId = rollMap.get(row.rollNumber);
      const status = row.status?.toUpperCase().trim();
      if (studentId && validStatuses.has(status)) {
        data.push({ studentId, status });
      } else {
        console.warn(`Skipping record with invalid roll number or status: ${JSON.stringify(row)}`);
      }
    })
    .on("end", async () => {
      if (!data.length) return res.status(400).json({ message: "No valid records in CSV." });

      const ops = data.map(r =>
        prisma.attendance.upsert({
          where: { uniq_session_student: { sessionId: Number(sessionId), studentId: r.studentId } },
          update: { status: r.status, subjectId: session.subjectId },
          create: { sessionId: Number(sessionId), studentId: r.studentId, subjectId: session.subjectId, status: r.status },
        })
      );

      try {
        await prisma.$transaction(ops);
        return res.status(201).json({ message: `Uploaded ${data.length} records.` });
      } catch (err) {
        console.error("uploadAttendanceCsv error:", err);
        return res.status(500).json({ message: "Server error during transaction.", error: err.message });
      }
    });
};


/* --------------------------
   getMySessions — include attendance + student.user + student.photoUrl
   -------------------------- */
export const getMySessions = async (req, res) => {
  try {
    const staffUserId = req.user.id;
    const staff = await prisma.staff.findUnique({ where: { userId: staffUserId } });
    if (!staff) return res.status(403).json({ message: "Staff profile required." });

    const sessions = await prisma.classSession.findMany({
      where: { takenByStaffId: staff.id },
      include: {
        section: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
        term: { select: { id: true, name: true } },
        attendance: {
          include: {
            student: {
              select: {
                id: true,
                rollNumber: true,
                photoUrl: true,
                user: { select: { id: true, name: true } }
              }
            }
          }
        }
      },
      orderBy: { scheduledAt: "desc" },
    });

    return res.json(sessions);
  } catch (err) {
    console.error("getMySessions error:", err);
    return res.status(500).json({ message: "Server error.", error: err.message });
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
            durationMin: true,
            room: true,
            section: { select: { name: true, academicYear: true } },
            term: { select: { id: true, name: true } },
            takenBy: {
              select: {
                id: true,
                employeeId: true,
                designation: true,
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          },
        },
      },
      orderBy: { 
        session: {
          scheduledAt: "desc"
        }
      },
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