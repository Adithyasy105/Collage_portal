import cron from "node-cron";
import prisma from "../config/prisma.js";
import { sendEmail } from "../utils/mailer.js";
import { sendSms } from "../utils/sms.js";

/**
 * Checks if a given date is a holiday by querying the database.
 * This is the single source of truth for official holidays.
 * @param {Date} date The date to check.
 * @returns {Promise<boolean>} A promise that resolves to true if it's a holiday, otherwise false.
 */
const isHoliday = async (date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const holiday = await prisma.holiday.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
    return !!holiday;
  } catch (error) {
    console.error("Error checking for holiday:", error);
    return false;
  }
};

const getTodaysDateRange = () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  return { startOfToday, endOfToday };
};

const buildEmailContent = (studentName, attendanceRecords) => {
  const absentOrLateClasses = attendanceRecords.filter(
    (a) => a.status === "ABSENT" || a.status === "LATE"
  );
  
  if (absentOrLateClasses.length === 0) {
    return null;
  }

  const header = `
    <h2>Daily Attendance Report for ${studentName}</h2>
    <p>Dear Guardian,</p>
    <p>This is to inform you about your ward's attendance today, ${new Date().toLocaleDateString()}.</p>
  `;
  
  const tableRows = attendanceRecords
    .map((record) => {
        // Add your console.log here to see the raw data
        const formattedTime = record.session.scheduledAt.toLocaleTimeString('en-IN', {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone: "UTC"   // 👈 force UTC so 18:32 → 6:32 PM
        });
        console.log("Formatted scheduledAt:", formattedTime);
        console.log("Raw scheduledAt from DB:", record.session.scheduledAt);

        return `
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${record.subject.name}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${formattedTime}</td>
                <td style="border: 1px solid #ddd; padding: 8px; color: ${record.status === 'PRESENT' ? 'green' : 'red'}; font-weight: bold;">${record.status}</td>
            </tr>
        `;
    })
    .join("");

  const table = `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Subject</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Class Time</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  `;

  const footer = `
    <p>This is an automated message. Please contact the college administration for any queries.</p>
    <p>Sincerely,</p>
    <p>College Administration</p>
  `;
  
  return `
    ${header}
    <p>You have received this email because your ward was marked as <b>${absentOrLateClasses[0].status.toLowerCase()}</b> for at least one class today.</p>
    ${table}
    ${footer}
  `;
};

/**
 * Main function to send attendance alerts to guardians
 */
export const sendDailyAttendanceAlerts = async () => {
  console.log("⏰ Running daily attendance alert job...");

  // CORRECTED: Await the async isHoliday function
  const todayIsHoliday = await isHoliday(new Date());
  if (todayIsHoliday) {
    console.log("✅ Today is a holiday. Skipping attendance alerts.");
    return;
  }

  const { startOfToday, endOfToday } = getTodaysDateRange();
  
  try {
    const studentsWithAttendance = await prisma.student.findMany({
      where: {
        attendance: {
          some: {
            status: { in: ["ABSENT", "LATE"] },
            markedAt: { gte: startOfToday, lte: endOfToday },
          },
        },
      },
      include: {
        user: { select: { name: true } },
        attendance: {
          where: {
            markedAt: { gte: startOfToday, lte: endOfToday },
          },
          include: {
            subject: { select: { name: true } },
            session: { select: { scheduledAt: true } },
          },
        },
      },
    });

    console.log(`🔎 Found ${studentsWithAttendance.length} students with a record of absence or lateness today.`);
    
    for (const student of studentsWithAttendance) {
      const guardianEmail = student.guardianEmail;
      const guardianPhone = student.guardianPhone;
      const studentName = student.user?.name || "Student";
      
      const emailHtml = buildEmailContent(studentName, student.attendance);
      const smsMessage = `Daily Attendance Report: Your ward, ${studentName}, was marked absent or late for one or more classes today. Please check the attendance portal for details.`;

      const [emailSent, smsSent] = await Promise.all([
        guardianEmail ? sendEmail(guardianEmail, "Daily Attendance Alert", emailHtml) : false,
        guardianPhone ? sendSms(guardianPhone, smsMessage) : false
      ]);
      
      await prisma.messageLog.create({
        data: {
          studentId: student.id,
          messageType: "ABSENCE_ALERT",
          channel: "EMAIL",
          status: emailSent ? "SENT" : "FAILED",
          payload: { studentName, records: student.attendance },
        },
      });

      await prisma.messageLog.create({
        data: {
          studentId: student.id,
          messageType: "ABSENCE_ALERT",
          channel: "SMS",
          status: smsSent ? "SENT" : "FAILED",
          payload: { studentName },
        },
      });
    }

    console.log("✅ Daily attendance alert job finished successfully.");
  } catch (err) {
    console.error("❌ An error occurred during the daily attendance alert job:", err);
  }
};

/**
 * The main function to start the cron job.
 */
export const startAttendanceAlertJob = () => {
  // Cron schedule: '0 18 * * *' runs every day at 6:10 PM
  cron.schedule('52 17 * * *', () => {
    sendDailyAttendanceAlerts();
  }, {
    timezone: "Asia/Kolkata" // Set to your desired timezone
  });
  console.log("Job scheduled: Daily attendance alerts will be sent at 6:00 PM.");
};