// src/utils/passwords.js
import bcrypt from "bcryptjs";

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

export async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export function generateRandomPassword(len = 8) {
  return Math.random().toString(36).slice(-len);
}
