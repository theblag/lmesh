"use client";

import { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeftIcon, 
  EnterIcon, 
  KeyboardIcon, 
  PersonIcon, 
  Share1Icon,
  GearIcon,
  LockClosedIcon,
  DownloadIcon} from "@radix-ui/react-icons";

import { ThemeProvider } from "../components/ThemeContext";
import { ThemeToggle } from "../components/ThemeToggle";
import { TerminalToolbar } from "../components/TerminalToolbar";
import { SessionSettingsModal } from "../components/SessionSettingsModal";
import { CommandLogDrawer, LogEntry } from "../components/CommandLogDrawer";
import { CommandApprovalModal, PendingRequest } from "../components/CommandApprovalModal";
import { ShareSessionModal } from "../components/ShareSessionModal";
import NotFound from "../not-found";

interface Collaborator {
  id: string;
  name: string;
  role: "host" | "collaborator" | "viewer";
  hasControl: boolean;
}

export default function SessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const router = useRouter();
  
  // Unwrap params using React.use()
  const { sessionId } = use(params);

  // Session existence status
  const [sessionStatus, setSessionStatus] = useState<"checking" | "found" | "not_found">("checking");

  // Onboarding username & security state
  const [username, setUsername] = useState("");
  const [sessionPasswordInput, setSessionPasswordInput] = useState("");
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [joiningError] = useState("");

  useEffect(() => {
    if (!sessionId) return;

    let isMounted = true;
    setSessionStatus("checking");

    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";
    fetch(`${serverUrl}/api/sessions/${sessionId}/info`)
      .then(async (res) => {
        if (!isMounted) return;
        if (res.status === 404 || !res.ok) {
          setSessionStatus("not_found");
          return;
        }
        const data = await res.json();
        if (!data || data.exists === false) {
          setSessionStatus("not_found");
        } else {
          setRequiresPassword(!!data.hasPassword);
          setSessionStatus("found");
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setSessionStatus("not_found");
      });

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  // Session state
  const [clientId, setClientId] = useState<string | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [controlHolderId, setControlHolderId] = useState<string | null>(null);
  const [hasControl, setHasControl] = useState(false);
  const [isReadOnlySession, setIsReadOnlySession] = useState(false);
  const [socketStatus, setSocketStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [isHost, setIsHost] = useState(false);

  // Safety Mode State (Redacts sensitive commands in audit logging)
  const [safetyMode, setSafetyMode] = useState(false);
  const safetyModeRef = useRef(false);

  useEffect(() => {
    safetyModeRef.current = safetyMode;
  }, [safetyMode]);

  // UI Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Terminal Preference States
  const [fontSize, setFontSize] = useState(13);
  const [cursorStyle, setCursorStyle] = useState<"block" | "underline" | "bar">("block");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [terminalTheme, setTerminalTheme] = useState("dark");
  const [e2eEncrypted, setE2eEncrypted] = useState(false);

  // Audit Logs & Pending Approvals
  const [commandLogs, setCommandLogs] = useState<LogEntry[]>([
    {
      id: "log-1",
      timestamp: "20:04:12",
      userName: "Host CLI",
      userRole: "host",
      command: "lmesh share --port 3001",
      status: "executed"
    },
    {
      id: "log-2",
      timestamp: "20:05:01",
      userName: "Alice",
      userRole: "collaborator",
      command: "git status",
      status: "executed"
    }
  ]);

  const [pendingApproval, setPendingApproval] = useState<PendingRequest | null>(null);

  // DOM elements references
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<any>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const inputBufferRef = useRef("");
  const hasControlRef = useRef(false);

  // Keep hasControlRef updated with state
  useEffect(() => {
    hasControlRef.current = hasControl;
  }, [hasControl]);

  // Handle Joining
  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsJoined(true);
    }
  };

  // Setup WebSocket and Terminal
  useEffect(() => {
    if (!isJoined || !username || !sessionId) return;

    let active = true;
    let fitAddon: any;

    const wsUrl = `ws://localhost:3001`;
    setSocketStatus("connecting");
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    // Load Terminal dynamically to avoid SSR execution crashes
    async function setupTerminal() {
      try {
        const { Terminal } = await import("@xterm/xterm");
        const { FitAddon } = await import("@xterm/addon-fit");
        await import("@xterm/xterm/css/xterm.css");

        if (!active) return;

        const term = new Terminal({
          cursorBlink: true,
          cursorStyle: cursorStyle,
          scrollback: 10000,
          convertEol: true,
          smoothScrollDuration: 100,
          theme: {
            background: "#030303",
            foreground: "#ededed",
            cursor: "#ffffff",
            selectionBackground: "rgba(255, 255, 255, 0.2)",
            black: "#000000",
            red: "#ff5555",
            green: "#50fa7b",
            yellow: "#f1fa8c",
            blue: "#bd93f9",
            magenta: "#ff79c6",
            cyan: "#ffffff",
            white: "#bbbbbb"
          },
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: fontSize,
          lineHeight: 1.4,
        });

        fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        const sendResize = () => {
          if (fitAddon && term) {
            try {
              fitAddon.fit();
              if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                  type: "terminal_resize",
                  payload: { cols: term.cols, rows: term.rows }
                }));
              }
            } catch (e) {}
          }
        };

        if (terminalContainerRef.current) {
          term.open(terminalContainerRef.current);
          setTimeout(sendResize, 100);
        }

        termRef.current = term;

        // Listen to local typing input inside xterm.js
        term.onData((data) => {
          if (socket.readyState === WebSocket.OPEN && hasControlRef.current) {
            socket.send(JSON.stringify({
              type: "terminal_data",
              payload: { 
                data,
                isSafetyMode: safetyModeRef.current
              }
            }));

            // Track input for real-time command audit logs
            if (data === "\r" || data === "\n") {
              const cmd = inputBufferRef.current.trim();
              if (cmd.length > 0) {
                const now = new Date();
                const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const newEntry: LogEntry = {
                  id: `log-${Date.now()}`,
                  timestamp: timeStr,
                  userName: username,
                  userRole: isHost ? "host" : "collaborator",
                  command: safetyModeRef.current ? "[REDACTED - SAFETY MODE]" : cmd,
                  status: "executed"
                };
                setCommandLogs((prev) => [newEntry, ...prev]);
              }
              inputBufferRef.current = "";
            } else if (data === "\x7f" || data === "\b") {
              inputBufferRef.current = inputBufferRef.current.slice(0, -1);
            } else if (data === "\x03") {
              inputBufferRef.current = "";
            } else if (data.length === 1 && data >= " ") {
              inputBufferRef.current += data;
            }
          }
        });

        // Handle browser resize
        window.addEventListener("resize", sendResize);

        return () => {
          window.removeEventListener("resize", sendResize);
        };
      } catch (err) {
        console.error("Failed to load terminal bundle:", err);
      }
    }

    setupTerminal();

    socket.onopen = () => {
      setSocketStatus("connected");
      // Join the session
      socket.send(JSON.stringify({
        type: "session_join",
        payload: {
          sessionId,
          name: username,
          password: sessionPasswordInput || undefined
        }
      }));
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case "session_joined": {
            const { clientId: id, role } = message.payload;
            setClientId(id);
            if (role === "host") {
              setIsHost(true);
            }
            if (termRef.current) {
              termRef.current.writeln(`\x1b[37mConnected to session: ${sessionId}\x1b[0m`);
              termRef.current.writeln(`\x1b[37mYou joined as: ${role.toUpperCase()}\x1b[0m\r\n`);
            }
            break;
          }

          case "session_update": {
            const { collaborators: list, controlHolderId: holderId } = message.payload;
            setCollaborators(list);
            setControlHolderId(holderId);
            break;
          }

          case "terminal_data": {
            // Write stream data received from host shell to client screen
            if (termRef.current && message.payload.data) {
              termRef.current.write(message.payload.data);
            }
            break;
          }

          case "control_request": {
            if (isHost && message.payload?.clientId) {
              const client = collaborators.find(c => c.id === message.payload.clientId);
              setPendingApproval({
                id: message.payload.clientId,
                type: "control_request",
                clientName: client ? client.name : "Collaborator",
                timestamp: new Date().toLocaleTimeString()
              });
            }
            break;
          }

          case "error": {
            const errorMsg = message.payload.message;
            if (errorMsg.includes("read-only")) {
              setIsReadOnlySession(true);
            }
            if (termRef.current) {
              termRef.current.writeln(`\r\n\x1b[31m[Error] ${errorMsg}\x1b[0m`);
            }
            break;
          }
        }
      } catch (err) {
        console.error("Failed to parse websocket message:", err);
      }
    };

    socket.onclose = () => {
      setSocketStatus("disconnected");
      if (termRef.current) {
        termRef.current.writeln("\r\n\x1b[31mConnection closed. Host disconnected or session terminated.\x1b[0m");
      }
    };

    socket.onerror = () => {
      setSocketStatus("disconnected");
    };

    return () => {
      active = false;
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (termRef.current) {
        termRef.current.dispose();
      }
    };
  }, [isJoined, username, sessionId]);

  // Sync typing permission token state
  useEffect(() => {
    if (clientId && controlHolderId) {
      const activeControl = clientId === controlHolderId;
      setHasControl(activeControl);
      if (termRef.current) {
        if (activeControl) {
          termRef.current.writeln("\r\n\x1b[32m[LMESH] Keyboard control granted. You can type now.\x1b[0m");
        } else {
          termRef.current.writeln("\r\n\x1b[33m[LMESH] Keyboard control revoked. Read-only view.\x1b[0m");
        }
      }
    } else {
      setHasControl(false);
    }
  }, [clientId, controlHolderId]);

  // Sync font size changes dynamically
  useEffect(() => {
    if (termRef.current) {
      termRef.current.options.fontSize = fontSize;
    }
  }, [fontSize]);

  const requestControl = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "control_request",
        payload: {}
      }));
      if (termRef.current) {
        termRef.current.writeln("\r\n\x1b[37m[LMESH] Control request sent to host...\x1b[0m");
      }
    }
  };

  const handleGrantControl = (targetClientId: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "control_grant",
        payload: { clientId: targetClientId }
      }));
    }
    setPendingApproval(null);
  };

  const handleRevokeControl = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "control_revoke",
        payload: {}
      }));
    }
  };

  const handleSendKeySequence = (keySeq: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && hasControlRef.current) {
      socketRef.current.send(JSON.stringify({
        type: "terminal_data",
        payload: { data: keySeq }
      }));
    }
  };

  const handleClearTerminal = () => {
    if (termRef.current) {
      termRef.current.clear();
    }
  };

  const handleCopyBuffer = () => {
    if (termRef.current) {
      const selection = termRef.current.getSelection();
      if (selection) {
        navigator.clipboard.writeText(selection);
      }
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Check session validity
  if (sessionStatus === "checking") {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-bg-dark bg-grid-pattern flex flex-col items-center justify-center text-white selection:bg-white selection:text-black">
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-black/40 border border-white/10 backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs text-neutral-300">Connecting to session relay...</span>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (sessionStatus === "not_found") {
    return <NotFound />;
  }

  // Render Onboarding form if username is empty
  if (!isJoined) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-bg-dark bg-grid-pattern flex flex-col items-center justify-center px-6 py-8 selection:bg-white selection:text-black text-white transition-colors duration-200">
          <div className="absolute top-[10%] left-[50%] translate-x-[-50%] w-100 h-100 bg-white/3 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="w-full max-w-sm bg-[#09090b]/80 backdrop-blur-xl border border-white/10 rounded-xl p-8 space-y-6 z-10 shadow-2xl">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                <h2 className="text-xl font-semibold tracking-tight text-white font-sans">Join Terminal</h2>
              </div>
              <p className="text-xs text-white/50 font-sans leading-relaxed">
                Enter your details to join live session <code className="text-white font-mono bg-white/6 border border-white/10 px-1.5 py-0.5 rounded text-[11px]">{sessionId}</code>
              </p>
            </div>

            <form onSubmit={handleOnboardingSubmit} className="space-y-4 font-sans">
              <div className="space-y-2">
                <label htmlFor="name-input" suppressHydrationWarning className="block text-xs font-sans font-medium text-white/70">
                  Display Name
                </label>
                <input
                  id="name-input"
                  type="text"
                  maxLength={20}
                  placeholder="e.g. Alice"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  suppressHydrationWarning
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-all font-sans"
                  required
                  autoFocus
                />
              </div>

              {/* Password protection input - ONLY rendered if session requires password */}
              {requiresPassword && (
                <div className="space-y-2">
                  <label htmlFor="password-input" className="block text-xs font-sans font-medium text-white/70 items-center justify-between">
                    <span>Session Password</span>
                    <span className="text-[10px] text-amber-400 font-medium">(Required)</span>
                  </label>
                  <input
                    id="password-input"
                    type="password"
                    placeholder="Enter session password"
                    value={sessionPasswordInput}
                    onChange={(e) => setSessionPasswordInput(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-all font-sans"
                    required
                  />
                </div>
              )}
              
              {joiningError && <p className="text-xs text-rose-400 font-sans">{joiningError}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="flex-1 border border-white/10 hover:bg-white/6 text-white/80 hover:text-white px-4 py-2.5 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-white hover:bg-white/90 text-black px-4 py-2.5 rounded-lg text-xs font-sans font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow"
                >
                  Join
                  <EnterIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen md:h-screen bg-bg-dark flex flex-col items-center justify-between text-white overflow-y-auto md:overflow-hidden transition-colors duration-200 font-sans">
        
        {/* Workspace Header bar */}
        <header className="w-full h-14 bg-[#09090b]/90 backdrop-blur-md border-b border-white/8 px-6 flex items-center justify-between shrink-0 select-none font-sans">
          
          {/* Left header controls */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/")} 
              className="text-white/60 hover:text-white transition-colors cursor-pointer p-1.5 rounded-md hover:bg-white/8"
              title="Leave Session"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-2.5 border-l border-white/10 pl-4">
              <span className={`w-2 h-2 rounded-full ${
                socketStatus === "connected" ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-rose-500"
              }`} />
              <span className="text-xs text-white/60 font-sans tracking-tight">
                Session: <span className="font-mono text-white font-medium bg-white/6 border border-white/10 px-2 py-0.5 rounded text-[11px]">{sessionId}</span>
              </span>

              {/* Share Trigger */}
              <button
                onClick={() => setIsShareOpen(true)}
                className="ml-1 p-1.5 rounded-md hover:bg-white/8 text-white/60 hover:text-white transition-colors cursor-pointer"
                title="Share Session Link"
              >
                <Share1Icon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* E2EE indicator badge */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-sans font-medium transition-colors cursor-pointer ${
                e2eEncrypted 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" 
                  : "bg-white/4 border-white/10 text-white/60 hover:text-white"
              }`}
              title="Click to configure E2EE Encryption"
            >
              <LockClosedIcon className="w-3.5 h-3.5" />
              {e2eEncrypted ? "E2EE Secured" : "Encrypted Ready"}
            </button>
          </div>

          {/* Right header presence, control state, settings gear & theme toggle */}
          <div className="flex items-center gap-4">
            
            {/* Status info/controls */}
            <div className="flex items-center gap-2">
              {hasControl ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-sans text-xs rounded-full font-medium">
                    <KeyboardIcon className="w-3.5 h-3.5" />
                    Active Typing
                  </span>
                  {isHost && (
                    <button
                      onClick={handleRevokeControl}
                      className="text-xs font-sans text-rose-400 hover:text-rose-300 font-medium cursor-pointer"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ) : isReadOnlySession ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/4 border border-white/10 text-white/50 font-sans text-xs rounded-full font-medium">
                  Read-Only
                </span>
              ) : (
                <button
                  onClick={requestControl}
                  disabled={socketStatus !== "connected" || collaborators.some(c => c.hasControl)}
                  className="bg-white text-black hover:bg-white/90 px-3.5 py-1 rounded-md font-sans text-xs font-semibold tracking-tight transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-xs"
                >
                  Request Control
                </button>
              )}
            </div>

            {/* Collaborator counter list */}
            <div className="flex items-center gap-2 border-l border-white/10 pl-4">
              <PersonIcon className="w-3.5 h-3.5 text-white/50" />
              <span className="font-mono text-xs text-white/70 font-medium">{collaborators.length + 1}</span>
            </div>

            {/* Audit Log Drawer Trigger */}
            <button
              onClick={() => setIsLogDrawerOpen(true)}
              className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/8 transition-colors cursor-pointer relative"
              title="View Command Audit Log"
            >
              <DownloadIcon className="w-4 h-4 rotate-180" />
            </button>

            {/* Settings Modal Trigger */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/8 transition-colors cursor-pointer"
              title="Session Settings"
            >
              <GearIcon className="w-4 h-4" />
            </button>

            {/* Safety Mode Active Badge */}
            {safetyMode && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border border-amber-500/40 bg-amber-500/10 text-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                SAFETY MODE
              </span>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </header>

      {/* Workspace central layout */}
      <main className="w-full flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Terminal Area with Floating Action Toolbar */}
        <div className="flex-1 h-full min-h-87.5 bg-bg-dark flex flex-col relative overflow-hidden">
          {/* Quick Action Toolbar */}
          <TerminalToolbar
            hasControl={hasControl}
            isReadOnly={isReadOnlySession}
            safetyMode={safetyMode}
            onToggleSafetyMode={() => setSafetyMode(prev => !prev)}
            onRequestControl={requestControl}
            onReleaseControl={handleRevokeControl}
            onClearTerminal={handleClearTerminal}
            onCopyBuffer={handleCopyBuffer}
            onToggleFullscreen={handleToggleFullscreen}
            onZoomIn={() => setFontSize(prev => Math.min(20, prev + 1))}
            onZoomOut={() => setFontSize(prev => Math.max(10, prev - 1))}
            onSendKey={handleSendKeySequence}
          />
          
          {/* xterm canvas container - UNTOUCHED TERMINAL CANVAS */}
          <div className="flex-1 w-full h-full relative">
            <div ref={terminalContainerRef} className="w-full h-full absolute inset-0" />
          </div>
        </div>

        {/* Sidebar Panel for active users & host controls */}
        <aside className="w-full md:w-64 border-t md:border-t-0 md:border-l border-white/8 bg-[#070709] flex flex-col p-5 space-y-6 shrink-0 select-none overflow-y-auto font-sans">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-sans font-semibold tracking-tight text-white/40 uppercase">Collaborators</span>
              <span className="text-[11px] font-sans font-medium text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
            
            <div className="space-y-2">
              {/* Host is always present */}
              <div className="flex items-center justify-between font-sans text-xs py-1.5 px-2 rounded-lg bg-white/2 border border-white/4">
                <span className="text-white font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white/80" />
                  Host CLI
                </span>
                <span className="text-[10px] bg-white/10 border border-white/20 text-white/90 px-2 py-0.5 rounded-md font-sans font-medium">
                  Host
                </span>
              </div>

              {/* Connected clients */}
              {collaborators.map((c) => (
                <div key={c.id} className="flex items-center justify-between font-sans text-xs py-1.5 px-2 rounded-lg hover:bg-white/4 transition-colors">
                  <span className={`flex items-center gap-2 ${
                    c.id === clientId ? "text-white font-semibold" : "text-white/70"
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      c.hasControl ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" : "bg-white/20"
                    }`} />
                    {c.name} {c.id === clientId && "(You)"}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {c.hasControl ? (
                      <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-md font-sans font-medium">
                        Control
                      </span>
                    ) : (
                      <span className="text-[10px] bg-white/5 text-white/40 px-2 py-0.5 rounded-md font-sans font-medium">
                        View
                      </span>
                    )}

                    {/* Host quick action controls */}
                    {isHost && c.id !== clientId && (
                      <button
                        onClick={() => handleGrantControl(c.id)}
                        className="text-xs font-sans text-emerald-400 hover:text-emerald-300 font-medium px-1 transition-colors"
                        title="Grant Control to user"
                      >
                        Grant
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/8 pt-6 space-y-4">
            <span className="text-xs font-sans font-semibold tracking-tight text-white/40 uppercase">Host Relay Status</span>
            <div className="space-y-2 text-xs font-sans text-white/60">
              <div className="flex justify-between py-1 border-b border-white/4">
                <span>Relay Engine:</span>
                <span className="text-white font-medium">Express / WS</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/4">
                <span>Encryption:</span>
                <span className="text-emerald-400 font-medium">AES-256</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Control Mode:</span>
                <span className="text-white font-medium">{isReadOnlySession ? "Read-Only" : "Token Passing"}</span>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Render Modals and Drawers */}
      <SessionSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isHost={isHost}
        readOnly={isReadOnlySession}
        onToggleReadOnly={(val) => setIsReadOnlySession(val)}
        e2eEncrypted={e2eEncrypted}
        onToggleE2E={(val) => setE2eEncrypted(val)}
        terminalTheme={terminalTheme}
        onSelectTheme={(theme) => setTerminalTheme(theme)}
        fontSize={fontSize}
        onChangeFontSize={(size) => setFontSize(size)}
        cursorStyle={cursorStyle}
        onChangeCursorStyle={(style) => setCursorStyle(style)}
        soundEnabled={soundEnabled}
        onToggleSound={(val) => setSoundEnabled(val)}
      />

      <CommandLogDrawer
        isOpen={isLogDrawerOpen}
        onClose={() => setIsLogDrawerOpen(false)}
        logs={commandLogs}
      />

      <ShareSessionModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        sessionId={sessionId}
      />

      <CommandApprovalModal
        request={pendingApproval}
        onApprove={(id) => handleGrantControl(id)}
        onDeny={() => setPendingApproval(null)}
      />

    </div>
    </ThemeProvider>
  );
}

