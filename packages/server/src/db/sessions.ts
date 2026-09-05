import { sql } from "./client.js";
import type { DBSessionRow } from "../types.js";

export interface DashboardSessionSummary {
  id: string;
  sessionCode: string;
  isReadonly: boolean;
  hasPassword: boolean;
  status: "active" | "ended";
  createdAt: Date;
  endedAt: Date | null;
  participantCount: number;
}

export interface DashboardStats {
  totalSessions: number;
  activeSessions: number;
  totalCollaborators: number;
}

/**
 * Insert a new session record into Neon DB sessions table
 */
export async function createDBSession(
  sessionCode: string,
  hostUserId: string | null,
  isReadonly: boolean = false,
  hasPassword: boolean = false,
  passwordHash: string | null = null
): Promise<DBSessionRow | null> {
  if (!sql) return null;

  try {
    const rows = await sql`
      INSERT INTO sessions (session_code, host_id, is_readonly, has_password, password_hash, status)
      VALUES (${sessionCode}, ${hostUserId}, ${isReadonly}, ${hasPassword}, ${passwordHash}, 'active')
      RETURNING id, session_code, host_id, is_readonly, has_password, password_hash, status, created_at, ended_at;
    `;

    if (rows && rows.length > 0) {
      return rows[0] as DBSessionRow;
    }
    return null;
  } catch (err) {
    console.error("Failed to create session in Neon DB:", err);
    return null;
  }
}

/**
 * Mark a session as ended when host disconnects
 */
export async function endDBSession(sessionCode: string): Promise<boolean> {
  if (!sql) return false;

  try {
    await sql`
      UPDATE sessions 
      SET status = 'ended', ended_at = CURRENT_TIMESTAMP 
      WHERE session_code = ${sessionCode};
    `;
    return true;
  } catch (err) {
    console.error("Failed to end session in Neon DB:", err);
    return false;
  }
}

/**
 * Fetch all sessions hosted by a specific user (safely matches UUID, GitHub ID, or Username)
 */
export async function getUserSessions(hostDbId: string): Promise<DashboardSessionSummary[]> {
  if (!sql || !hostDbId) return [];

  try {
    const rows = await sql`
      SELECT 
        s.id,
        s.session_code,
        s.is_readonly,
        s.has_password,
        s.status,
        s.created_at,
        s.ended_at,
        COUNT(p.id)::int AS participant_count
      FROM sessions s
      LEFT JOIN session_participants p ON s.id = p.session_id
      WHERE s.host_id IN (
        SELECT id FROM users 
        WHERE id::text = ${hostDbId} 
           OR github_id::text = ${hostDbId} 
           OR username = ${hostDbId}
      )
      GROUP BY s.id, s.session_code, s.is_readonly, s.has_password, s.status, s.created_at, s.ended_at
      ORDER BY s.created_at DESC;
    `;

    return rows.map((row: any) => ({
      id: row.id,
      sessionCode: row.session_code,
      isReadonly: row.is_readonly,
      hasPassword: row.has_password,
      status: row.status,
      createdAt: row.created_at,
      endedAt: row.ended_at,
      participantCount: Number(row.participant_count || 0),
    }));
  } catch (err) {
    console.error("Failed to fetch user sessions for dashboard:", err);
    return [];
  }
}

/**
 * Aggregated dashboard statistics for a host user (safely matches UUID, GitHub ID, or Username)
 */
export async function getUserDashboardStats(hostDbId: string): Promise<DashboardStats> {
  if (!sql || !hostDbId) {
    return { totalSessions: 0, activeSessions: 0, totalCollaborators: 0 };
  }

  try {
    const sessionStats = await sql`
      SELECT 
        COUNT(*)::int AS total_sessions,
        COUNT(*) FILTER (WHERE s.status = 'active')::int AS active_sessions
      FROM sessions s
      WHERE s.host_id IN (
        SELECT id FROM users 
        WHERE id::text = ${hostDbId} 
           OR github_id::text = ${hostDbId} 
           OR username = ${hostDbId}
      );
    `;

    const collabStats = await sql`
      SELECT COUNT(DISTINCT p.id)::int AS total_collaborators
      FROM session_participants p
      JOIN sessions s ON p.session_id = s.id
      WHERE s.host_id IN (
        SELECT id FROM users 
        WHERE id::text = ${hostDbId} 
           OR github_id::text = ${hostDbId} 
           OR username = ${hostDbId}
      );
    `;

    const totalSessions = sessionStats[0] ? Number(sessionStats[0].total_sessions || 0) : 0;
    const activeSessions = sessionStats[0] ? Number(sessionStats[0].active_sessions || 0) : 0;
    const totalCollaborators = collabStats[0] ? Number(collabStats[0].total_collaborators || 0) : 0;

    return { totalSessions, activeSessions, totalCollaborators };
  } catch (err) {
    console.error("Failed to fetch dashboard stats:", err);
    return { totalSessions: 0, activeSessions: 0, totalCollaborators: 0 };
  }
}

/**
 * Cleanup stale active sessions older than 24 hours to allow reconnection
 * during transient server restarts or network blips.
 */
export async function cleanupOrphanedSessions(): Promise<void> {
  if (!sql) return;
  try {
    await sql`
      UPDATE sessions 
      SET status = 'ended', ended_at = CURRENT_TIMESTAMP 
      WHERE status = 'active' AND created_at < NOW() - INTERVAL '24 hours';
    `;
  } catch (err) {
    console.error("Failed to cleanup stale sessions:", err);
  }
}

/**
 * Delete a session record and its associated data from Neon DB
 */
export async function deleteDBSession(sessionCode: string): Promise<boolean> {
  if (!sql) return false;
  try {
    const sessionRows = await sql`SELECT id FROM sessions WHERE session_code = ${sessionCode} LIMIT 1;`;
    if (!sessionRows || sessionRows.length === 0) return false;
    const sessionId = sessionRows[0]!.id;

    await sql`DELETE FROM command_logs WHERE session_id = ${sessionId};`;
    await sql`DELETE FROM session_participants WHERE session_id = ${sessionId};`;
    await sql`DELETE FROM sessions WHERE id = ${sessionId};`;
    return true;
  } catch (err) {
    console.error("Failed to delete session from Neon DB:", err);
    return false;
  }
}
