// backend/scripts/importUsers.js
import fs from "fs";
import csvParser from "csv-parser";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "./mailer.js";
import { Readable } from "stream";

const prisma = new PrismaClient();

export async function importUsers(csvInput, sendMails = true) {
  const usersToImport = [];
  const invalidRecords = [];

  return new Promise((resolve, reject) => {
    let stream;
    if (typeof csvInput === "string") {
      stream = fs.createReadStream(csvInput);
    } else {
      stream = Readable.from(csvInput.toString());
    }

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        if (row.name && row.email && row.role && row.rollNumber) {
          const role = row.role.trim().toUpperCase();

          if (["STUDENT", "STAFF", "ADMIN"].includes(role)) {
            const rawPassword = Math.random().toString(36).slice(-8);

            const userData = {
              name: row.name.trim(),
              email: row.email.trim(),
              role,
              rollNumber: row.rollNumber.trim(),
              rawPassword,
              programId: row.programId ? parseInt(row.programId) : null,
              sectionId: row.sectionId ? parseInt(row.sectionId) : null,
              departmentId: row.departmentId
                ? parseInt(row.departmentId)
                : null,
            };

            if (
              (role === "STUDENT" &&
                (!userData.programId || !userData.sectionId)) ||
              (role === "STAFF" && !userData.departmentId)
            ) {
              invalidRecords.push({
                ...row,
                reason:
                  role === "STUDENT"
                    ? "Missing programId or sectionId"
                    : "Missing departmentId",
              });
            } else {
              usersToImport.push(userData);
            }
          } else {
            invalidRecords.push({
              ...row,
              reason: "Invalid role. Must be STUDENT or STAFF.",
            });
          }
        } else {
          invalidRecords.push({
            ...row,
            reason: "Missing required fields (name, email, rollNumber, role).",
          });
        }
      })
      .on("end", async () => {
        if (usersToImport.length === 0) {
          return reject({
            message: "No valid users found in the CSV.",
            details: invalidRecords,
          });
        }

        try {
          const createdRecords = await prisma.$transaction(async (tx) => {
            const created = [];

            for (const user of usersToImport) {
              // check duplicates (email)
              const existingUser = await tx.user.findUnique({
                where: { email: user.email },
              });
              if (existingUser) {
                console.warn(
                  `⚠️ User with email ${user.email} already exists. Skipping...`
                );
                invalidRecords.push({ ...user, reason: "Duplicate email" });
                continue;
              }

              const hashedPassword = await bcrypt.hash(user.rawPassword, 10);

              const createdUser = await tx.user.create({
                data: {
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  password: hashedPassword,
                },
              });

              if (user.role === "STUDENT") {
                const existingStudent = await tx.student.findUnique({
                  where: { rollNumber: user.rollNumber },
                });

                if (existingStudent) {
                  console.warn(
                    `⚠️ Student with rollNumber ${user.rollNumber} already exists. Skipping student record.`
                  );
                  invalidRecords.push({
                    ...user,
                    reason: "Duplicate rollNumber",
                  });
                  continue;
                }

                await tx.student.create({
                  data: {
                    userId: createdUser.id,
                    rollNumber: user.rollNumber,
                    admissionYear: 2025,
                    currentSemester: 1,
                    programId: user.programId,
                    sectionId: user.sectionId,
                  },
                });
              } else if (user.role === "STAFF") {
                await tx.staff.create({
                  data: {
                    userId: createdUser.id,
                    employeeId: user.rollNumber,
                    departmentId: user.departmentId,
                    designation: "Teacher",
                  },
                });
              } else if (role === "ADMIN") {
                // just create user record
                await tx.user.create({
                  data: {
                    name: user.name,
                    email: user.email,
                    role: "ADMIN",
                    password: hashedPassword,
                  },
                });
              }

              // ✅ Send email after transaction commit
              created.push({ ...createdUser, rawPassword: user.rawPassword });
            }

            return created;
          });

          // send emails outside the transaction (safe)
          if (sendMails) {
            for (const user of createdRecords) {
              try {
                const subject = "Your Login Credentials";
                const htmlContent = `
                  <p>Hello <b>${user.name}</b>,</p>
                  <p>Your account has been created successfully.</p>
                  <p><b>Login Email:</b> ${user.email}</p>
                  <p><b>Password:</b> ${user.rawPassword}</p>
                  <br/>
                  <p style="color:gray;">Please keep this password safe.<br/>- Admin</p>`;
                await sendEmail(user.email, subject, htmlContent);
                console.log(`✅ Email sent to ${user.email}`);
              } catch (mailErr) {
                console.error(
                  `❌ Failed to send email to ${user.email}: ${mailErr.message}`
                );
              }
            }
          }

          resolve({
            createdCount: createdRecords.length,
            message: "Users imported successfully (duplicates skipped).",
            details: invalidRecords,
          });
        } catch (error) {
          reject({
            createdCount: 0,
            message: "Error during transaction import.",
            error: error.message,
            details: invalidRecords,
          });
        }
      })
      .on("error", (err) => reject(err));
  });
}
