import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Create contact form
export const createContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const contact = await prisma.contactForm.create({
      data: { name, email, message },
    });
    res.status(201).json(contact);
  } catch (err) {
    res.status(500).json({ error: "Failed to submit contact form" });
  }
};

// Admin: get all contacts
export const getContacts = async (req, res) => {
  try {
    const contacts = await prisma.contactForm.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
};

// Admin: update status
export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await prisma.contactForm.update({
      where: { id: Number(id) },
      data: { status },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update contact status" });
  }
};

// Admin: delete
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.contactForm.delete({ where: { id: Number(id) } });
    res.json({ message: "Contact deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete contact" });
  }
};
