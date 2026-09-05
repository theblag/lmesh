import { sql } from "./client.js";
import type { DBParticipantRow } from "../types.js";

/**
 * Record a participant joining a session in Neon DB
 */
export async function addParticipant(
  sessionCode: string,
  displayName: string,
  userId: string | null = null,
  role: "host" | "collaborator" | "viewer" = "viewer"
): Promise<DBParticipantRow | null> {
  if (!sql) return null;

  try {
    const sessions = await sql`
      SELECT id FROM sessions WHERE session_code = ${sessionCode};
    `;

    if (!sessions || sessions.length === 0) return null;
    const sessionId = sessions[0]!.id;

    const rows = await sql`
      INSERT INTO session_participants (session_id, user_id, display_name, role)
      VALUES (${sessionId}, ${userId}, ${displayName}, ${role})
      RETURNING id, session_id, user_id, display_name, role, joined_at, left_at;
    `;

    if (rows && rows.length > 0) {
      return rows[0] as DBParticipantRow;
    }
    return null;
  } catch (err) {
    console.error("Failed to add participant in Neon DB:", err);
    return null;
  }
}

/**
 * Mark a participant as left when they disconnect
 */
export async function markParticipantLeft(
  sessionCode: string,
  displayName: string
): Promise<boolean> {
  if (!sql) return false;

  try {
    await sql`
      UPDATE session_participants
      SET left_at = CURRENT_TIMESTAMP
      WHERE session_id = (SELECT id FROM sessions WHERE session_code = ${sessionCode})
        AND display_name = ${displayName}
        AND left_at IS NULL;
    `;
    return true;
  } catch (err) {
    console.error("Failed to mark participant left in Neon DB:", err);
    return false;
  }
}

/**
 * Update a participant's role (e.g. viewer -> collaborator when control is granted/revoked)
 */
export async function updateParticipantRole(
  sessionCode: string,
  displayName: string,
  newRole: "host" | "collaborator" | "viewer"
): Promise<boolean> {
  if (!sql) return false;

  try {
    await sql`
      UPDATE session_participants
      SET role = ${newRole}
      WHERE session_id = (SELECT id FROM sessions WHERE session_code = ${sessionCode})
        AND display_name = ${displayName}
        AND left_at IS NULL;
    `;
    return true;
  } catch (err) {
    console.error("Failed to update participant role in Neon DB:", err);
    return false;
  }
}
