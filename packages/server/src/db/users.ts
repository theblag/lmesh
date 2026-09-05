import { sql } from "./client.js";
import type { UserProfile } from "../auth.js";
import type { DBUserRow } from "../types.js";

/**
 * Upsert (Insert or Update) a GitHub user profile in Neon DB
 */
export async function upsertUser(profile: UserProfile): Promise<UserProfile | null> {
  if (!sql) return null;

  try {
    const rows = await sql`
      INSERT INTO users (github_id, username, name, avatar_url, email, updated_at)
      VALUES (${profile.githubId}, ${profile.username}, ${profile.name}, ${profile.avatarUrl}, ${profile.email}, CURRENT_TIMESTAMP)
      ON CONFLICT (github_id) 
      DO UPDATE SET
        username = EXCLUDED.username,
        name = EXCLUDED.name,
        avatar_url = EXCLUDED.avatar_url,
        email = EXCLUDED.email,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, github_id, username, name, avatar_url, email;
    `;

    if (rows && rows.length > 0) {
      const row = rows[0] as DBUserRow;
      return {
        id: row.id,
        githubId: Number(row.github_id),
        username: row.username,
        name: row.name,
        avatarUrl: row.avatar_url || "",
        email: row.email,
      };
    }

    return null;
  } catch (err) {
    console.error("Failed to upsert user in Neon DB:", err);
    return null;
  }
}

/**
 * Fetch user by GitHub ID from Neon DB
 */
export async function getUserByGithubId(githubId: number): Promise<UserProfile | null> {
  if (!sql) return null;

  try {
    const rows = await sql`
      SELECT id, github_id, username, name, avatar_url, email 
      FROM users 
      WHERE github_id = ${githubId};
    `;

    if (rows && rows.length > 0) {
      const row = rows[0] as DBUserRow;
      return {
        id: row.id,
        githubId: Number(row.github_id),
        username: row.username,
        name: row.name,
        avatarUrl: row.avatar_url || "",
        email: row.email,
      };
    }

    return null;
  } catch (err) {
    console.error("Failed to fetch user from Neon DB:", err);
    return null;
  }
}
