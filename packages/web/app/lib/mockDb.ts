export interface LogEntry {
  id: string;
  sender: string;
  timestamp: string;
  command: string;
}

export interface RoomSession {
  id: string;
  sessionId: string;
  title: string;
  createdAt: string;
  duration: string;
  collaboratorsCount: number;
  commandsCount: number;
  status: "active" | "completed" | "archived";
  passwordProtected: boolean;
  readOnly: boolean;
  logs: LogEntry[];
}

const STORAGE_KEY = "lmesh_mock_db_sessions";

const SEED_SESSIONS: RoomSession[] = [
  {
    id: "sess-1",
    sessionId: "x7k2m9p",
    title: "Production Backend Debugging",
    createdAt: "Today at 22:15",
    duration: "42 min",
    collaboratorsCount: 3,
    commandsCount: 24,
    status: "active",
    passwordProtected: false,
    readOnly: false,
    logs: [
      { id: "l1", sender: "Host CLI", timestamp: "22:15:02", command: "lmesh share --port 3001" },
      { id: "l2", sender: "Alice (collaborator)", timestamp: "22:16:40", command: "git status" },
      { id: "l3", sender: "Bob (collaborator)", timestamp: "22:18:11", command: "npm test" },
      { id: "l4", sender: "Host CLI", timestamp: "22:22:05", command: "docker logs web-api -n 50" }
    ]
  },
  {
    id: "sess-2",
    sessionId: "bb6c1a96",
    title: "Pair Programming: Auth Refactor",
    createdAt: "Yesterday at 18:30",
    duration: "1h 15m",
    collaboratorsCount: 5,
    commandsCount: 68,
    status: "completed",
    passwordProtected: true,
    readOnly: false,
    logs: [
      { id: "l1", sender: "Host CLI", timestamp: "18:30:10", command: "lmesh share --read-only=false" },
      { id: "l2", sender: "Carol (collaborator)", timestamp: "18:45:00", command: "cat package.json" },
      { id: "l3", sender: "Host CLI", timestamp: "19:10:22", command: "git commit -m 'feat: refactor github oauth handler'" }
    ]
  },
  {
    id: "sess-3",
    sessionId: "93cd5439",
    title: "Database Migration Review",
    createdAt: "Aug 15, 2026",
    duration: "28 min",
    collaboratorsCount: 2,
    commandsCount: 12,
    status: "archived",
    passwordProtected: false,
    readOnly: true,
    logs: [
      { id: "l1", sender: "Host CLI", timestamp: "14:02:00", command: "lmesh share --read-only" },
      { id: "l2", sender: "Dave (collaborator)", timestamp: "14:15:30", command: "psql -U postgres -d app_db" }
    ]
  }
];

export const mockDb = {
  getSessions(): RoomSession[] {
    if (typeof window === "undefined") return SEED_SESSIONS;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_SESSIONS));
        return SEED_SESSIONS;
      }
      return JSON.parse(data);
    } catch {
      return SEED_SESSIONS;
    }
  },

  saveSessions(sessions: RoomSession[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error("Failed to save to mock DB:", e);
    }
  },

  createSession(title: string, passwordProtected = false, readOnly = false): RoomSession {
    const sessions = this.getSessions();
    const randomHex = Math.random().toString(36).substring(2, 9);
    const newSession: RoomSession = {
      id: `sess-${Date.now()}`,
      sessionId: randomHex,
      title: title || `Session ${randomHex}`,
      createdAt: "Just now",
      duration: "0 min",
      collaboratorsCount: 1,
      commandsCount: 0,
      status: "active",
      passwordProtected,
      readOnly,
      logs: [
        {
          id: `log-${Date.now()}`,
          sender: "Host CLI",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          command: `lmesh share ${readOnly ? "--read-only" : ""}`
        }
      ]
    };
    const updated = [newSession, ...sessions];
    this.saveSessions(updated);
    return newSession;
  },

  updateSessionStatus(id: string, status: "active" | "completed" | "archived"): RoomSession[] {
    const sessions = this.getSessions();
    const updated = sessions.map((s) => (s.id === id ? { ...s, status } : s));
    this.saveSessions(updated);
    return updated;
  },

  deleteSession(id: string): RoomSession[] {
    const sessions = this.getSessions();
    const updated = sessions.filter((s) => s.id !== id);
    this.saveSessions(updated);
    return updated;
  },

  resetDefaults(): RoomSession[] {
    this.saveSessions(SEED_SESSIONS);
    return SEED_SESSIONS;
  }
};
