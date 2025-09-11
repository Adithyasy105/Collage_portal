// backend/scripts/createUsers.js
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import importUsers from "./src/utils/importUsers.js";

dotenv.config();

// __dirname workaround for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  try {
    // look for user.csv in the same folder as this script
    const csvPath = path.join(__dirname, "user.csv");
    console.log("Using CSV file:", csvPath);

    const result = await importUsers(csvPath, true);

    console.log("=== Import Summary ===");
    console.log("Created:", result.createdCount);
    if (result.created.length) {
      console.table(result.created.map((c) => ({ id: c.id, email: c.email, role: c.role })));
    }
    if (result.skipped.length) {
      console.log("Skipped (duplicates):", result.skipped);
    }
    if (result.invalid.length) {
      console.log("Invalid rows:", result.invalid);
    }
    if (result.errors.length) {
      console.log("Errors:", result.errors);
    }

    process.exit(0);
  } catch (err) {
    console.error("Fatal import error:", err);
    process.exit(1);
  }
})();
