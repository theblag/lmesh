import { Router } from "express";
import { verifyToken } from "../auth.js";
import { getUserSessions, getUserDashboardStats, getSessionLogs, endDBSession, deleteDBSession } from "../db/index.js";

const router = Router();

/**
 * Middleware: Verify Bearer JWT Token and extract user profile
 */
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.substring(7);
  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: "Invalid or expired authorization token" });
  }

  req.user = user;
  next();
}

/**
 * 1. GET /api/dashboard/stats - User profile and aggregated stats
 */
router.get("/stats", authenticateToken, async (req: any, res) => {
  try {
    const stats = await getUserDashboardStats(req.user.id);
    res.json({
      user: req.user,
      stats,
    });
  } catch (err: any) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 2. GET /api/dashboard/sessions - List of sessions hosted by the user
 */
router.get("/sessions", authenticateToken, async (req: any, res) => {
  try {
    const sessions = await getUserSessions(req.user.id);
    res.json({ sessions });
  } catch (err: any) {
    console.error("Error fetching user sessions:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 3. GET /api/dashboard/sessions/:sessionCode/logs - Audit logs for a specific session
 */
router.get("/sessions/:sessionCode/logs", authenticateToken, async (req: any, res) => {
  const { sessionCode } = req.params;
  try {
    const logs = await getSessionLogs(sessionCode);
    res.json({ logs });
  } catch (err: any) {
    console.error("Error fetching session logs:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 4. PATCH /api/dashboard/sessions/:sessionCode/end - End an active session
 */
router.patch("/sessions/:sessionCode/end", authenticateToken, async (req: any, res) => {
  const { sessionCode } = req.params;
  try {
    const success = await endDBSession(sessionCode);
    res.json({ success });
  } catch (err: any) {
    console.error("Error ending session:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 5. DELETE /api/dashboard/sessions/:sessionCode - Delete session and records
 */
router.delete("/sessions/:sessionCode", authenticateToken, async (req: any, res) => {
  const { sessionCode } = req.params;
  try {
    const success = await deleteDBSession(sessionCode);
    res.json({ success });
  } catch (err: any) {
    console.error("Error deleting session:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
