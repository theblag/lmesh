import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL || "";

if (!DATABASE_URL) {
  console.warn("⚠️ DATABASE_URL is not set in packages/server/.env. Database queries will be skipped.");
}

// Initialize Neon serverless SQL client
export const sql = DATABASE_URL ? neon(DATABASE_URL) : null;
