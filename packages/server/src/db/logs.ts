import { sql } from "./client.js";

export interface DBCommandLog {
  id: string;
  sessionCode: string;
  senderName: string;
  command: string;
  executedAt: Date;
}

/**
 * Log a command execution event into Neon DB command_logs table
 */
export async function logCommand(
  sessionCode: string,
  senderName: string,
  command: string
): Promise<boolean> {
  if (!sql || !command || !command.trim()) return false;

  try {
    // 1. Fetch session ID
    const sessionRows = await sql`
      SELECT id FROM sessions WHERE session_code = ${sessionCode} LIMIT 1;
    `;
    if (!sessionRows || sessionRows.length === 0) return false;
    const sessionId = sessionRows[0]!.id;

    // 2. Insert into command_logs using executor_name & command_text
    await sql`
      INSERT INTO command_logs (session_id, executor_name, command_text)
      VALUES (${sessionId}, ${senderName}, ${command.trim()});
    `;

    return true;
  } catch (err) {
    console.error("Failed to log command to Neon DB:", err);
    return false;
  }
}

/**
 * Fetch recorded command execution logs for a session
 */
export async function getSessionLogs(sessionCode: string): Promise<DBCommandLog[]> {
  if (!sql) return [];

  try {
    const rows = await sql`
      SELECT 
        l.id,
        s.session_code,
        l.executor_name AS sender_name,
        l.command_text AS command,
        l.executed_at
      FROM command_logs l
      JOIN sessions s ON l.session_id = s.id
      WHERE s.session_code = ${sessionCode}
      ORDER BY l.executed_at ASC;
    `;

    return rows.map((row: any) => ({
      id: row.id,
      sessionCode: row.session_code,
      senderName: row.sender_name,
      command: row.command,
      executedAt: row.executed_at,
    }));
  } catch (err) {
    console.error("Failed to fetch session command logs from Neon DB:", err);
    return [];
  }
}
