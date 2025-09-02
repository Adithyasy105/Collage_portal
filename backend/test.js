import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Create a student
  const student = await prisma.student.create({
    data: {
      rollNumber: "CS2025001",
      course: "B.Tech",
      year: 3,
      department: "Computer Science",
    },
  });

  console.log("✅ Student created:", student);

  // 2. Create a user linked to this student
  const user = await prisma.user.create({
    data: {
      name: "Adithya",
      email: "adithya@example.com",
      password: "hashedpassword123", // 🔐 hash in real app
      role: "STUDENT",
      studentId: student.id, // link to student
    },
  });

  console.log("✅ User created with linked student:", user);
}

main()
  .catch((e) => console.error("❌ Error:", e))
  .finally(async () => {
    await prisma.$disconnect();
  });
