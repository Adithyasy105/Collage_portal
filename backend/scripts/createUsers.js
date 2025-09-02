// scripts/createUser.js
import dotenv from "dotenv";
import { importUsers } from "../scripts/src/utils/importUsers.js";

dotenv.config();

(async () => {
  try {
    await importUsers("user.csv"); // path to CSV in the folder
  } catch (err) {
    console.error("❌ Failed to import users:", err.message);
  }
})();