// backend/scripts/importUsers.js
import fs from "fs";
import csvParser from "csv-parser";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "./mailer.js"; // adjust path if needed
import { Readable } from "stream";
import crypto from "crypto";

const prisma = new PrismaClient();

/**
 * importUsers(csvInput, sendMails = true)
 * - csvInput: path string to CSV file OR Buffer/string content
 * - CSV header expected: name,email,rollNumber,role,programId,sectionId,departmentId
 *
 * Returns: { createdCount, created[], skipped[], invalid[], errors[] }
 */
export async function importUsers(csvInput, sendMails = true) {
  const rows = [];
  const invalidRows = [];

  // create readable stream from path or buffer/string
  const stream =
    typeof csvInput === "string" && fs.existsSync(csvInput)
      ? fs.createReadStream(csvInput)
      : Readable.from(String(csvInput));

  // parse CSV (trim headers)
  await new Promise((resolve, reject) => {
    stream
      .pipe(csvParser({ mapHeaders: ({ header }) => header?.trim() }))
      .on("data", (row) => rows.push(row))
      .on("end", resolve)
      .on("error", reject);
  });

  if (!rows.length) {
    return {
      createdCount: 0,
      created: [],
      skipped: [],
      invalid: [{ reason: "CSV empty or invalid" }],
      errors: [],
    };
  }

  const created = [];
  const skipped = []; // duplicates, not processed
  const invalid = [];
  const errors = [];
  const emailTasks = []; // collect email sending promises

  for (const rawRow of rows) {
    // normalize + trim fields and ensure consistent keys
    const row = Object.fromEntries(
      Object.entries(rawRow).map(([k, v]) => [k.trim(), String(v ?? "").trim()])
    );

    const name = row.name;
    const email = row.email;
    const rollNumber = row.rollNumber;
    const role = (row.role || "STUDENT").toUpperCase();
    const programId = row.programId ? parseInt(row.programId, 10) : null;
    const sectionId = row.sectionId ? parseInt(row.sectionId, 10) : null;
    const departmentId = row.departmentId ? parseInt(row.departmentId, 10) : null;

    // basic validation
    if (!name || !email || !role || !rollNumber) {
      invalid.push({ ...row, reason: "Missing required fields (name,email,role,rollNumber)" });
      continue;
    }
    if (!["STUDENT", "STAFF", "ADMIN"].includes(role)) {
      invalid.push({ ...row, reason: "Invalid role (must be STUDENT, STAFF or ADMIN)" });
      continue;
    }
    if (role === "STUDENT" && (!programId || !sectionId)) {
      invalid.push({ ...row, reason: "STUDENT must have programId and sectionId" });
      continue;
    }
    if (role === "STAFF" && !departmentId) {
      invalid.push({ ...row, reason: "STAFF must have departmentId" });
      continue;
    }

    // stronger random password
    const rawPassword = crypto.randomBytes(6).toString("base64url"); // ~8 chars url-safe

    try {
      // run atomic create per user
      const result = await prisma.$transaction(async (tx) => {
        // if email exists skip (return sentinel to handle outside transaction)
        const existingUser = await tx.user.findUnique({ where: { email } });
        if (existingUser) {
          return { skipped: true, reason: "Duplicate email" };
        }

        // validate referenced FK existence INSIDE transaction
        if (role === "STUDENT") {
          const prog = await tx.program.findUnique({ where: { id: programId } });
          if (!prog) throw new Error(`Invalid programId: ${programId}`);
          const sec = await tx.section.findUnique({ where: { id: sectionId } });
          if (!sec) throw new Error(`Invalid sectionId: ${sectionId}`);
        }
        if (role === "STAFF") {
          const dept = await tx.department.findUnique({ where: { id: departmentId } });
          if (!dept) throw new Error(`Invalid departmentId: ${departmentId}`);
        }

        // check unique rollNumber / employeeId where applicable
        if (role === "STUDENT") {
          const existingStudent = await tx.student.findUnique({ where: { rollNumber } });
          if (existingStudent) {
            throw new Error(`Duplicate rollNumber: ${rollNumber}`);
          }
        }
        if (role === "STAFF") {
          const existingStaff = await tx.staff.findUnique({ where: { employeeId: rollNumber } });
          if (existingStaff) {
            throw new Error(`Duplicate employeeId: ${rollNumber}`);
          }
        }

        // hash password
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        // create user record
        const createdUser = await tx.user.create({
          data: {
            name,
            email,
            role,
            password: hashedPassword,
          },
        });

        // create dependent record
        if (role === "STUDENT") {
          await tx.student.create({
            data: {
              userId: createdUser.id,
              rollNumber,
              admissionYear: new Date().getFullYear(),
              currentSemester: 1,
              programId,
              sectionId,
            },
          });
        } else if (role === "STAFF") {
          await tx.staff.create({
            data: {
              userId: createdUser.id,
              employeeId: rollNumber,
              departmentId,
              designation: "Teacher",
            },
          });
        } // ADMIN: nothing else needed

        return { createdUser, rawPassword };
      }); // end transaction

      if (result?.skipped) {
        skipped.push({ email, reason: result.reason });
        continue;
      }

      // success: collect created info
      created.push({ id: result.createdUser.id, email, name, role });

      // enqueue email send (do not await here)
      if (sendMails) {
        const subject = "Your account has been created";
        const html = `
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your account has been created.</p>
          <p><strong>Login:</strong> ${email}</p>
          <p><strong>Password:</strong> ${result.rawPassword}</p>
          <p>Please change your password after first login.</p>
        `;
        // push promise but catch errors later
        emailTasks.push(
          sendEmail(email, subject, html).catch((err) => {
            // return error info instead of throwing
            return { email, ok: false, error: err.message };
          })
        );
      }
    } catch (err) {
      // DB or validation error for this row
      console.error(`Import error for ${email}:`, err.message);
      errors.push({ email, reason: err.message });
    }
  } // end for rows

  // await all email tasks and collect results
  if (emailTasks.length) {
    const emailResults = await Promise.allSettled(emailTasks);
    emailResults.forEach((r, idx) => {
      if (r.status === "fulfilled") {
        if (r.value && r.value.ok === false) {
          // our sendEmail catch returned an object
          errors.push({ email: r.value.email, reason: `Email failed: ${r.value.error}` });
        } else {
          // success: log id/email if needed (no-op)
        }
      } else {
        // unexpected rejection
        errors.push({ email: "unknown", reason: `Email promise rejected: ${r.reason}` });
      }
    });
  }

  return {
    createdCount: created.length,
    created,
    skipped,
    invalid,
    errors,
  };
}

export default importUsers;
