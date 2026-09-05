"use client";

import { useState, useEffect } from "react";
import { 
  ClockIcon, 
  PersonIcon, 
  DownloadIcon, 
  CopyIcon, 
  CheckIcon, 
  ExternalLinkIcon,
  Cross2Icon,
  MagnifyingGlassIcon,
  CounterClockwiseClockIcon,
  PlusIcon,
  TrashIcon,
  LockClosedIcon,
  ResetIcon
} from "@radix-ui/react-icons";
import { mockDb, RoomSession } from "../lib/mockDb";
import { cleanAnsi } from "../lib/ansi";

interface HostDashboardProps {
  userProfile?: {
    username: string;
    avatar_url?: string;
    avatarUrl?: string;
  };
  authToken?: string | null;
  stats?: {
    totalSessions: number;
    activeSessions: number;
    totalCollaborators: number;
  } | null;
  isLoading?: boolean;
}

export function HostDashboard({ userProfile, authToken, stats, isLoading: isProfileLoading }: HostDashboardProps) {
  const [sessions, setSessions] = useState<RoomSession[]>([]);
  const [isSessionsLoading, setIsSessionsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Audit Logs Modal state
  const [selectedSessionLogs, setSelectedSessionLogs] = useState<RoomSession | null>(null);
  const [fetchedLogs, setFetchedLogs] = useState<any[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Create Room modal state
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState("");
  const [newRoomPassword, setNewRoomPassword] = useState(false);
  const [newRoomReadOnly, setNewRoomReadOnly] = useState(false);

  const handleOpenLogs = (session: RoomSession) => {
    setSelectedSessionLogs(session);
    setFetchedLogs([]);
    if (authToken) {
      setIsLogsLoading(true);
      fetch(`http://localhost:3001/api/dashboard/sessions/${session.sessionId}/logs`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.logs && Array.isArray(data.logs)) {
            const cleaned = data.logs
              .map((l: any) => ({
                ...l,
                command: cleanAnsi(l.command)
              }))
              .filter((l: any) => l.command && l.command.trim().length > 0);
            setFetchedLogs(cleaned);
          } else {
            setFetchedLogs([]);
          }
        })
        .catch(() => setFetchedLogs([]))
        .finally(() => setIsLogsLoading(false));
    }
  };

  const handleCopyScript = () => {
    const scriptContent = fetchedLogs
      .map((l) => {
        const sender = (l.senderName || 'user').replace(/^@+/, '');
        return `# Executed by @${sender} at ${new Date(l.executedAt).toLocaleTimeString()}\n${cleanAnsi(l.command)}`;
      })
      .join("\n\n");
    navigator.clipboard.writeText(scriptContent);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };


  useEffect(() => {
    if (authToken) {
      setIsSessionsLoading(true);
      fetch("http://localhost:3001/api/dashboard/sessions", {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.sessions && Array.isArray(data.sessions)) {
            const mappedSessions: RoomSession[] = data.sessions.map((s: any) => ({
              id: s.id,
              title: `Session ${s.sessionCode}`,
              sessionId: s.sessionCode,
              status: s.status === "active" ? "active" : "completed",
              createdAt: new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              duration: s.endedAt ? "Ended" : "Live now",
              collaboratorsCount: s.participantCount || 0,
              commandsCount: 0,
              passwordProtected: s.hasPassword || false,
              readOnly: s.isReadonly || false,
              logs: []
            }));
            setSessions(mappedSessions);
          } else {
            setSessions([]);
          }
        })
        .catch(() => {
          setSessions([]);
        })
        .finally(() => setIsSessionsLoading(false));
    } else {
      setSessions([]);
      setIsSessionsLoading(false);
    }
  }, [authToken]);

  const isLoading = isProfileLoading || isSessionsLoading;



  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const filteredSessions = sessions.filter(
    (s) =>
      s.sessionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE) || 1;
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCopyLink = (sessionId: string) => {
    const url = `${window.location.origin}/${sessionId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(sessionId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomTitle.trim()) return;
    const created = mockDb.createSession(newRoomTitle.trim(), newRoomPassword, newRoomReadOnly);
    setSessions(mockDb.getSessions());
    setNewRoomTitle("");
    setNewRoomPassword(false);
    setNewRoomReadOnly(false);
    setIsCreatingRoom(false);
  };

  const handleDeleteSession = (session: RoomSession) => {
    setSessions((prev) => prev.filter((s) => s.id !== session.id));
    if (selectedSessionLogs?.id === session.id) {
      setSelectedSessionLogs(null);
    }
    if (authToken) {
      fetch(`http://localhost:3001/api/dashboard/sessions/${session.sessionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }).catch((err) => console.error("Error deleting session:", err));
    }
  };

  const handleUpdateStatus = (session: RoomSession, status: "active" | "completed" | "archived") => {
    setSessions((prev) =>
      prev.map((s) => (s.id === session.id ? { ...s, status: status === "active" ? "active" : "completed" } : s))
    );
    if (authToken && status === "completed") {
      fetch(`http://localhost:3001/api/dashboard/sessions/${session.sessionId}/end`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }).catch((err) => console.error("Error ending session:", err));
    }
  };

  const handleResetDefaults = () => {
    const defaultData = mockDb.resetDefaults();
    setSessions(defaultData);
  };

  return (
    <div className="w-full max-w-5xl px-4 sm:px-8 py-8 space-y-8 font-sans">
      
      {/* User Header Profile Banner */}
      <div className="p-6 rounded-xl bg-(--card-bg) border border-(--border-color) flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {userProfile?.username ? (
            <img
              src={`https://github.com/${userProfile.username}.png`}
              alt={userProfile.username}
              className="w-14 h-14 rounded-full border border-(--border-color) object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-(--background) border border-(--border-color) flex items-center justify-center text-(--foreground)">
              <PersonIcon className="w-6 h-6" />
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-(--foreground) tracking-tight">
                {userProfile ? `@${userProfile.username}` : "GitHub Developer (Mock)"}
              </h1>
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                Verified Host
              </span>
            </div>
            <p className="text-xs text-(--text-muted) leading-relaxed">
              Managing hosted live terminal sessions & real-time collaboration channels.
            </p>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsCreatingRoom(true)}
            className="px-4 py-2 rounded-lg bg-(--btn-bg) text-(--btn-fg) hover:opacity-90 transition-opacity text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <PlusIcon className="w-4 h-4" />
            New Hosted Room
          </button>
          <button
            onClick={handleResetDefaults}
            title="Reset to default mock sessions"
            className="p-2 rounded-lg border border-(--border-color) bg-(--card-bg) hover:bg-(--card-hover) text-(--text-subtle) hover:text-(--foreground) transition-colors cursor-pointer text-xs"
          >
            <ResetIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-(--card-bg) border border-(--border-color) space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-(--text-subtle)">Total Hosted Sessions</span>
            <CounterClockwiseClockIcon className="w-4 h-4 text-(--text-subtle)" />
          </div>
          {isLoading ? (
            <div className="h-9 w-20 bg-(--border-color)/40 rounded-lg animate-pulse my-1" />
          ) : (
            <div className="text-3xl font-bold text-(--foreground) tracking-tight">
              {stats ? stats.totalSessions : sessions.length}
            </div>
          )}
          <p className="text-[11px] text-(--text-muted)">Persisted in Neon DB</p>
        </div>

        <div className="p-5 rounded-xl bg-(--card-bg) border border-(--border-color) space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-(--text-subtle)">Collaborators Reached</span>
            <PersonIcon className="w-4 h-4 text-(--text-subtle)" />
          </div>
          {isLoading ? (
            <div className="h-9 w-20 bg-(--border-color)/40 rounded-lg animate-pulse my-1" />
          ) : (
            <div className="text-3xl font-bold text-(--foreground) tracking-tight">
              {stats ? stats.totalCollaborators : sessions.reduce((acc, s) => acc + s.collaboratorsCount, 0)}
            </div>
          )}
          <p className="text-[11px] text-(--text-muted)">Unique active connections</p>
        </div>

        <div className="p-5 rounded-xl bg-(--card-bg) border border-(--border-color) space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-(--text-subtle)">Active Live Rooms</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          {isLoading ? (
            <div className="h-9 w-20 bg-(--border-color)/40 rounded-lg animate-pulse my-1" />
          ) : (
            <div className="text-3xl font-bold text-emerald-400 tracking-tight">
              {stats ? stats.activeSessions : sessions.filter((s) => s.status === "active").length}
            </div>
          )}
          <p className="text-[11px] text-(--text-muted)">Ready for inbound traffic</p>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="space-y-4">
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-(--foreground) tracking-tight">
              Hosted Terminal Rooms
            </h2>
            <p className="text-xs text-(--text-muted)">
              Overview of past and active terminal sessions.
            </p>
          </div>

          <div className="relative flex items-center max-w-xs w-full">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3.5 text-(--text-subtle) pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, ID or status..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-(--card-bg) border border-(--border-color) rounded-lg pl-9 pr-3 py-2 text-xs text-(--foreground) placeholder:text-(--text-subtle) focus:outline-none focus:border-(--foreground) transition-colors"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="rounded-xl border border-(--border-color) bg-(--card-bg) overflow-hidden shadow-xs">
          <div className="p-4 border-b border-(--border-subtle) flex items-center justify-between bg-(--background)/50">
            <span className="text-xs font-semibold text-(--foreground) tracking-tight">
              Session Inventory
            </span>
            <span className="text-xs text-(--text-subtle)">
              {isLoading ? "Loading sessions..." : `Showing ${paginatedSessions.length} of ${filteredSessions.length} rooms (Page ${currentPage} of ${totalPages})`}
            </span>
          </div>

          <div className="divide-y divide-(--border-subtle)">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between gap-4 animate-pulse">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-48 bg-(--border-color)/40 rounded" />
                      <div className="h-3 w-32 bg-(--border-color)/30 rounded" />
                    </div>
                    <div className="h-8 w-24 bg-(--border-color)/40 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <p className="text-xs font-medium text-(--foreground)">No hosted rooms found</p>
                <p className="text-xs text-(--text-subtle)">Run <code className="px-1.5 py-0.5 rounded bg-(--background) border border-(--border-color) text-emerald-400 font-mono">lmesh share</code> in your terminal to start a session!</p>
              </div>
            ) : (

              paginatedSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-(--card-hover) transition-colors"
                >
                  {/* Left Room Details */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-sm font-semibold text-(--foreground) tracking-tight">
                        {session.title}
                      </span>

                      {/* Clean ID badge */}
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-(--background) border border-(--border-color) text-(--text-muted)">
                        {session.sessionId}
                      </span>

                      {/* Status Badges */}
                      {session.status === "active" && (
                        <span className="text-[10px] font-medium tracking-wide px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Live Active
                        </span>
                      )}
                      {session.status === "completed" && (
                        <span className="text-[10px] font-medium tracking-wide px-2.5 py-0.5 rounded-full bg-(--background) border border-(--border-color) text-(--text-muted)">
                          Completed
                        </span>
                      )}
                      {session.status === "archived" && (
                        <span className="text-[10px] font-medium tracking-wide px-2.5 py-0.5 rounded-full bg-(--background) border border-(--border-color) text-(--text-subtle)">
                          Archived
                        </span>
                      )}

                      {session.passwordProtected && (
                        <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                          <LockClosedIcon className="w-3 h-3" />
                          Protected
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-(--text-muted)">
                      <span className="flex items-center gap-1.5">
                        <ClockIcon className="w-3.5 h-3.5 text-(--text-subtle)" />
                        {session.createdAt} ({session.duration})
                      </span>
                      <span className="flex items-center gap-1.5">
                        <PersonIcon className="w-3.5 h-3.5 text-(--text-subtle)" />
                        {session.collaboratorsCount} user{session.collaboratorsCount > 1 ? "s" : ""}
                      </span>
                      <span className="text-(--text-subtle)">
                        {session.commandsCount} commands run
                      </span>
                    </div>
                  </div>

                  {/* Right Action Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopyLink(session.sessionId)}
                      className="px-3 py-1.5 rounded-lg border border-(--border-color) bg-(--background) hover:bg-(--card-bg) text-(--text-muted) hover:text-(--foreground) transition-colors cursor-pointer text-xs font-medium flex items-center gap-1.5"
                      title="Copy Session Link"
                    >
                      {copiedId === session.sessionId ? (
                        <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <CopyIcon className="w-3.5 h-3.5" />
                      )}
                      <span>Copy Link</span>
                    </button>

                    <button
                      onClick={() => handleOpenLogs(session)}
                      className="px-3 py-1.5 rounded-lg border border-(--border-color) bg-(--background) hover:bg-(--card-bg) text-(--foreground) transition-colors cursor-pointer text-xs font-medium flex items-center gap-1.5"
                      title="View Session Audit Logs"
                    >
                      <DownloadIcon className="w-3.5 h-3.5 text-(--text-subtle)" />
                      <span>Logs</span>
                    </button>

                    {session.status === "active" ? (
                      <button
                        onClick={() => handleUpdateStatus(session, "completed")}
                        className="px-3 py-1.5 rounded-lg border border-(--border-color) bg-(--background) hover:bg-(--card-bg) text-(--text-muted) hover:text-(--foreground) transition-colors cursor-pointer text-xs font-medium"
                      >
                        End Session
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDeleteSession(session)}
                        className="p-2 rounded-lg border border-(--border-color) bg-(--background) hover:bg-red-500/10 hover:border-red-500/30 text-(--text-subtle) hover:text-red-400 transition-colors cursor-pointer text-xs"
                        title="Delete Session"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-(--border-subtle) flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-(--text-subtle) font-sans bg-(--background)/30">
              <div>
                Showing Page <span className="font-semibold text-(--foreground)">{currentPage}</span> of{" "}
                <span className="font-semibold text-(--foreground)">{totalPages}</span> ({filteredSessions.length} total rooms)
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-(--border-color) bg-(--card-bg) hover:bg-(--card-hover) text-(--foreground) disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium cursor-pointer"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg border border-(--border-color) bg-(--card-bg) hover:bg-(--card-hover) text-(--foreground) disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create New Mock Room */}
      {isCreatingRoom && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-(--card-bg) border border-(--border-color) rounded-xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-(--border-subtle) pb-3">
              <h3 className="text-base font-semibold text-(--foreground)">
                Create Mock Hosted Room
              </h3>
              <button
                onClick={() => setIsCreatingRoom(false)}
                className="p-1 rounded text-(--text-muted) hover:text-(--foreground) transition-colors cursor-pointer"
              >
                <Cross2Icon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-(--text-subtle)">
                  Room Title / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Feature Branch Code Review"
                  value={newRoomTitle}
                  onChange={(e) => setNewRoomTitle(e.target.value)}
                  className="w-full bg-(--background) border border-(--border-color) rounded-lg px-3.5 py-2 text-xs text-(--foreground) placeholder:text-(--text-subtle) focus:outline-none focus:border-(--foreground) transition-colors"
                  required
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2.5 text-xs text-(--text-muted) cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newRoomPassword}
                    onChange={(e) => setNewRoomPassword(e.target.checked)}
                    className="rounded border-(--border-color) bg-(--background) text-(--foreground) focus:ring-0"
                  />
                  <span>Require Password Access</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-(--text-muted) cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newRoomReadOnly}
                    onChange={(e) => setNewRoomReadOnly(e.target.checked)}
                    className="rounded border-(--border-color) bg-(--background) text-(--foreground) focus:ring-0"
                  />
                  <span>Read-Only mode (Collaborators cannot type commands)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-(--border-subtle)">
                <button
                  type="button"
                  onClick={() => setIsCreatingRoom(false)}
                  className="px-4 py-2 rounded-lg border border-(--border-color) text-xs text-(--text-muted) hover:text-(--foreground) hover:bg-(--card-hover) transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-(--btn-bg) text-(--btn-fg) hover:opacity-90 font-semibold text-xs transition-opacity cursor-pointer shadow-xs"
                >
                  Create Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Read-Only Terminal Replay UI */}
      {selectedSessionLogs && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0d1117] border border-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 font-mono">
            
            {/* macOS Window Title Bar */}
            <div className="px-4 py-3 bg-[#161b22] border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                </div>
                <span className="text-xs text-gray-400 font-sans ml-2">
                  Terminal Replay — <code className="text-emerald-400 font-mono">{selectedSessionLogs.sessionId}</code>
                </span>
              </div>

              <div className="flex items-center gap-3">
                {fetchedLogs.length > 0 && (
                  <button
                    onClick={handleCopyScript}
                    className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] font-sans transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedScript ? (
                      <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <CopyIcon className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedScript ? "Copied Script!" : "Copy Bash Script"}</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedSessionLogs(null)}
                  className="p-1 rounded text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <Cross2Icon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Read-Only Terminal Body */}
            <div className="p-4 h-80 overflow-y-auto space-y-2 text-xs text-gray-200 select-text">
              {isLogsLoading ? (
                <div className="p-8 text-center text-gray-500 font-sans text-xs animate-pulse">
                  Loading session audit logs from Neon DB...
                </div>
              ) : fetchedLogs.length === 0 ? (
                <div className="p-8 text-center text-gray-500 font-sans text-xs">
                  No recorded commands found for session <code className="text-gray-400">{selectedSessionLogs.sessionId}</code>.
                </div>
              ) : (
                fetchedLogs.map((log: any, idx: number) => (
                  <div key={log.id || idx} className="flex items-start gap-3 hover:bg-white/5 p-1 rounded transition-colors group">
                    <span className="text-[10px] text-gray-500 select-none w-6 text-right shrink-0 pt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-[10px] text-gray-500 font-sans select-none shrink-0 pt-0.5">
                      [{new Date(log.executedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                    </span>
                    {(() => {
                      const rawSender = (log.senderName || 'Host').replace(/^@+/, '');
                      const isHostSender = rawSender.toLowerCase().includes('host') || (userProfile?.username && rawSender.toLowerCase() === userProfile.username.toLowerCase());
                      return (
                        <span className="text-xs font-semibold text-emerald-400 shrink-0 font-sans flex items-center gap-1">
                          <span>@{rawSender}</span>
                          {isHostSender && (
                            <span className="text-[10px] text-emerald-500/80 font-normal font-mono">(Host)</span>
                          )}
                        </span>
                      );
                    })()}
                    <span className="text-emerald-500 font-semibold select-none">$</span>
                    <code className="text-gray-100 flex-1 break-all font-mono">
                      {log.command}
                    </code>
                  </div>
                ))
              )}
            </div>

            {/* Terminal Status Footer */}
            <div className="px-4 py-2 bg-[#161b22] border-t border-gray-800 flex items-center justify-between text-[11px] font-sans text-gray-400">
              <span>Read-Only Terminal Audit Session</span>
              <span>{fetchedLogs.length} command{fetchedLogs.length !== 1 ? 's' : ''} executed</span>
            </div>

          </div>
        </div>
      )}


    </div>
  );
}
