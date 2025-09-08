import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Create admission form
export const createAdmission = async (req, res) => {
  try {
    const { name, email, phone, course } = req.body;
    const admission = await prisma.admissionForm.create({
      data: { name, email, phone, course },
    });
    res.status(201).json(admission);
  } catch (err) {
    res.status(500).json({ error: "Failed to submit admission form" });
  }
};

// Admin: get all admissions
export const getAdmissions = async (req, res) => {
  try {
    const admissions = await prisma.admissionForm.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(admissions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch admissions" });
  }
};

// Admin: update status
export const updateAdmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await prisma.admissionForm.update({
      where: { id: Number(id) },
      data: { status },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update admission status" });
  }
};

// Admin: delete
export const deleteAdmission = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.admissionForm.delete({ where: { id: Number(id) } });
    res.json({ message: "Admission deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete admission" });
  }
};
