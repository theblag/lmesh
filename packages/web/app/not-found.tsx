"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeProvider, useTheme } from "./components/ThemeContext";
import { ThemeToggle } from "./components/ThemeToggle";
import {
  ArrowRightIcon,
  CheckIcon,
  CopyIcon,
  HomeIcon,
  ReloadIcon,
  GitHubLogoIcon,
  ExclamationTriangleIcon,
  RocketIcon,
} from "@radix-ui/react-icons";

// Precision-aligned ASCII 404 logo array per ASCII_ART_GUIDE.md
const ASCII_404_BANNER = [
  "   ███   ███ ██████████  ███   ███  ",
  "  ███░░░███ ███░░░░███  ███░░░███ ",
  "  ███  ░███ ███   ░███  ███  ░███ ",
  "  █████████ ███   ░███  █████████ ",
  "  ░░░░░░███ ███   ░███  ░░░░░░███ ",
  "        ███ ███░░░░███        ███ ",
  "        ███ ██████████        ███ ",
].join("\n");

interface LogEntry {
  type: "input" | "output" | "error" | "system" | "matrix";
  text: string;
}

const INITIAL_LOGS: LogEntry[] = [
  { type: "system", text: "Connecting to relay server (relay.lmesh.dev:443)..." },
  { type: "error", text: "Error 404: Session not found (session id expired or closed by host)" },
  { type: "system", text: "Rescue shell ready. Type 'help' for available recovery commands." },
];

function NotFoundContent() {
  const router = useRouter();
  const { toggleTheme, theme } = useTheme();

  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [matrixActive, setMatrixActive] = useState(false);
  const [sessionInput, setSessionInput] = useState("");
  const [copied, setCopied] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Auto scroll to bottom when terminal logs update
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs, matrixActive]);

  // Matrix Rain Canvas Effect
  useEffect(() => {
    if (!matrixActive || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 600;
    canvas.height = 200;

    const katakana = "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const rainDrops: number[] = Array(columns).fill(1);

    let animationId: number;

    const render = () => {
      ctx.fillStyle = "rgba(3, 3, 3, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#22c55e";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < rainDrops.length; i++) {
        const text = katakana.charAt(Math.floor(Math.random() * katakana.length));
        ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

        if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          rainDrops[i] = 0;
        }
        rainDrops[i]++;
      }
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [matrixActive]);

  const executeCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    // Add to command history
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    const newLogs: LogEntry[] = [{ type: "input", text: trimmed }];
    const cmd = trimmed.toLowerCase();

    switch (cmd) {
      case "help":
        newLogs.push({
          type: "output",
          text: `LMESH Rescue Shell (v1.0.4) - Available Utilities:
  ls           - List lost session artifact files
  cat 404.txt  - Print session crash diagnostic log
  ping         - Test ping to relay.lmesh.dev server
  matrix       - Toggle Cyber Green Matrix rain stream
  theme        - Toggle light/dark UI color scheme
  reconnect    - Return to LMESH home page (lmesh.dev)
  whoami       - Display current session credentials
  sudo         - Execute command with root privileges
  clear        - Reset rescue terminal output buffer`,
        });
        break;

      case "ls":
        newLogs.push({
          type: "output",
          text: `-rw-r--r--  1 guest  lmesh   404B  Sep 06 22:45  404.txt\n-rw-r--r--  1 guest  lmesh  1024B  Sep 06 22:45  session.sock (EXPIRED)\n-rw-r--r--  1 guest  lmesh   128B  Sep 06 22:45  lost_packets.log`,
        });
        break;

      case "cat 404.txt":
        newLogs.push({
          type: "output",
          text: `=================================================\nLMESH CRASH DIAGNOSTIC REPORT\n-------------------------------------------------\nReason     : HTTP 404 - Session ID Not Found\nStatus     : Terminated or Expired\nRelay Node : relay.lmesh.dev [0 active peers]\nDiagnostic : The host closed the socket connection or\n             the session short-code expired from Redis.\nRecovery   : Type 'reconnect' or click Return Home.\n=================================================`,
        });
        break;

      case "ping":
      case "ping server":
      case "ping relay.lmesh.dev":
        newLogs.push({
          type: "output",
          text: `PING relay.lmesh.dev (104.21.88.1): 56 data bytes\nRequest timeout for icmp_seq 0\nRequest timeout for icmp_seq 1\nRequest timeout for icmp_seq 2\n--- relay.lmesh.dev ping statistics ---\n3 packets transmitted, 0 packets received, 100.0% packet loss`,
        });
        break;

      case "matrix":
        setMatrixActive((prev) => !prev);
        newLogs.push({
          type: "matrix",
          text: matrixActive ? "[SYSTEM] Matrix rain animation deactivated." : "[SYSTEM] Matrix rain stream initiated! 🟢",
        });
        break;

      case "theme":
        toggleTheme();
        newLogs.push({
          type: "output",
          text: `[SYSTEM] Color theme toggled to: ${theme === "dark" ? "LIGHT" : "DARK"} mode.`,
        });
        break;

      case "reconnect":
      case "home":
      case "cd ~":
      case "cd /":
        newLogs.push({ type: "system", text: "[RECOVERY] Redirecting to LMESH Home Page..." });
        setTimeout(() => router.push("/"), 700);
        break;

      case "whoami":
        newLogs.push({
          type: "output",
          text: `guest (Collaborator - Disconnected state)`,
        });
        break;

      case "sudo":
      case "sudo su":
        newLogs.push({
          type: "error",
          text: `guest is not in the sudoers file. This incident will be logged and reported to the LMESH Host.`,
        });
        break;

      case "clear":
        setLogs(INITIAL_LOGS);
        setInput("");
        return;

      default:
        newLogs.push({
          type: "error",
          text: `lmesh-shell: command not found: '${trimmed}'. Type 'help' for available rescue commands.`,
        });
        break;
    }

    setLogs((prev) => [...prev, ...newLogs]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeCommand(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const nextIndex = historyIndex + 1 < history.length ? historyIndex + 1 : historyIndex;
        setHistoryIndex(nextIndex);
        setInput(history[history.length - 1 - nextIndex] || "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInput(history[history.length - 1 - nextIndex] || "");
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput("");
      }
    }
  };

  const handleJoinSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionInput.trim()) {
      router.push(`/${sessionInput.trim()}`);
    }
  };

  const handleCopyInstall = () => {
    navigator.clipboard.writeText("npm install -g lmesh");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-(--background) text-(--foreground) font-sans selection:bg-(--selection-bg) selection:text-(--selection-fg) transition-colors duration-200">
      {/* Header Bar */}
      <header className="w-full border-b border-(--border-color) bg-(--background)/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center font-bold text-white shadow-inner group-hover:scale-105 transition-transform text-sm">
              &gt;_
            </div>
            <span className="font-bold text-lg tracking-tight">
              LMESH
            </span>
          </Link>

          <div className="flex items-center gap-3">
            

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-md border border-(--border-color) hover:bg-(--card-hover) transition-colors text-(--text-muted) hover:text-(--foreground)"
              title="View on GitHub"
            >
              <GitHubLogoIcon className="w-4 h-4" />
            </a>

            <ThemeToggle />

            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-(--border-color) bg-(--card-bg) hover:bg-(--card-hover) transition-colors"
            >
              <HomeIcon className="w-3.5 h-3.5" />
              Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col gap-8">
 {/* Banner Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-(--border-color) bg-(--card-bg) text-amber-400">
            <ExclamationTriangleIcon className="w-3.5 h-3.5" />
            HTTP ERROR 404
          </div>

          <div className="flex justify-center my-2">
            <div
              style={{ fontFamily: 'Consolas, "Courier New", monospace' }}
              className="text-emerald-500 dark:text-emerald-400 whitespace-pre leading-none text-[10px] sm:text-xs md:text-sm font-bold tracking-normal select-none overflow-x-auto p-2"
            >
              {ASCII_404_BANNER}
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Session Lost in Hyperspace
          </h1>

          <p className="text-sm sm:text-base text-(--text-muted) max-w-lg mx-auto">
            The collaborative shell session you are looking for does not exist, has expired, or was ended by the host.
          </p>
        </div>

        {/* Authentic Interactive Terminal Window */}
        <div
          className="w-full bg-[#141414] border border-[#1e1e1e] rounded-xl overflow-hidden flex flex-col shadow-2xl font-fira"
        >
          {/* macOS style top bar */}
          <div className="w-full bg-[#1a1a1a] px-4 py-3 flex items-center justify-between border-b border-[#1e1e1e] shrink-0 select-none">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            </div>
            <span className="text-[11px] text-[#555] font-mono">bash — 80x24</span>
            <div className="w-10 flex justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

          {/* Matrix Rain View Canvas (If Matrix Active) */}
          {matrixActive && (
            <div className="relative w-full h-36 bg-black border-b border-neutral-800 overflow-hidden">
              <canvas ref={canvasRef} className="w-full h-full block" />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-green-950/80 border border-green-700/50 text-[10px] text-green-400 font-mono">
                MATRIX STREAM ACTIVE
              </div>
            </div>
          )}

          {/* Terminal content buffer */}
          <div
            className="p-4 sm:p-5 font-mono text-[12px] leading-relaxed min-h-[250px] max-h-[380px] overflow-y-auto cursor-text space-y-1 select-text"
            onClick={() => inputRef.current?.focus()}
          >
            {logs.map((log, index) => (
              <div key={index}>
                {log.type === "input" && (
                  <div className="flex items-start flex-wrap">
                    <span className="text-[#555] mr-2 select-none">guest@lmesh:~$</span>
                    <span className="text-[#f0f0f0]">{log.text}</span>
                  </div>
                )}
                {log.type === "output" && (
                  <pre className="text-[#888] whitespace-pre-wrap font-mono leading-relaxed text-[12px]">{log.text}</pre>
                )}
                {log.type === "error" && (
                  <div className="text-[#ef4444] leading-relaxed text-[12px]">{log.text}</div>
                )}
                {log.type === "system" && (
                  <div className="text-[#38bdf8] leading-relaxed text-[12px]">{log.text}</div>
                )}
                {log.type === "matrix" && (
                  <div className="text-[#4ade80] font-medium leading-relaxed text-[12px]">{log.text}</div>
                )}
              </div>
            ))}

            {/* Active typing prompt line */}
            <div className="flex items-center flex-wrap pt-0.5" onClick={() => inputRef.current?.focus()}>
              <span className="text-[#555] select-none mr-2">guest@lmesh:~$</span>
              <span className="text-[#f0f0f0] flex items-center min-h-[20px]">
                {input}
                <span className="inline-block w-2 h-4 bg-[#f0f0f0] ml-0.5 align-middle animate-cursor-blink" />
              </span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="opacity-0 absolute -left-[9999px] pointer-events-none"
                autoFocus
                spellCheck={false}
              />
            </div>
            <div ref={terminalEndRef} />
          </div>

          {/* Quick Command Suggestions Bar */}
          <div className="w-full bg-[#111111] border-t border-[#1e1e1e] px-4 py-2 flex items-center gap-2 flex-wrap text-[11px] select-none">
            <span className="text-[#555] font-mono">Commands:</span>
            {[
              { label: "help", cmd: "help" },
              { label: "cat 404.txt", cmd: "cat 404.txt" },
              { label: "ls", cmd: "ls" },
              { label: "ping", cmd: "ping" },
              { label: "matrix", cmd: "matrix" },
              { label: "reconnect", cmd: "reconnect" },
            ].map((item) => (
              <button
                key={item.cmd}
                onClick={() => executeCommand(item.cmd)}
                className="px-2 py-0.5 rounded bg-[#1c1c1c] hover:bg-[#252525] border border-[#2a2a2a] text-[11px] font-mono text-[#a3a3a3] hover:text-[#f0f0f0] transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {/* Card 1: Return Home */}
          <div className="p-5 rounded-xl border border-(--border-color) bg-(--card-bg) hover:border-neutral-600 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <HomeIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm">Return Home</h3>
              <p className="text-xs text-(--text-muted)">
                Go back to the main landing page to explore live features or host a session.
              </p>
            </div>
            <Link
              href="/"
              className="w-full py-2 px-3 rounded-md bg-(--foreground) text-(--background) hover:opacity-90 font-medium text-xs text-center flex items-center justify-center gap-1.5 transition-opacity"
            >
              Back to Home
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Join Existing Session */}
          <div className="p-5 rounded-xl border border-(--border-color) bg-(--card-bg) hover:border-neutral-600 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <RocketIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm">Join Session</h3>
              <p className="text-xs text-(--text-muted)">
                Have a session code from a host? Jump directly into their active terminal.
              </p>
            </div>
            <form onSubmit={handleJoinSession} className="flex gap-2">
              <input
                type="text"
                value={sessionInput}
                onChange={(e) => setSessionInput(e.target.value)}
                placeholder="Session ID (e.g. x7k2)"
                className="flex-1 px-3 py-1.5 rounded-md border border-(--border-color) bg-(--background) text-xs focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={!sessionInput.trim()}
                className="px-3 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50 text-xs font-medium cursor-pointer transition-colors"
              >
                Join
              </button>
            </form>
          </div>

          {/* Card 3: Start Host CLI */}
          <div className="p-5 rounded-xl border border-(--border-color) bg-(--card-bg) hover:border-neutral-600 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <ReloadIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm">Host a Session</h3>
              <p className="text-xs text-(--text-muted)">
                Share your terminal with collaborators in seconds using the official CLI.
              </p>
            </div>
            <button
              onClick={handleCopyInstall}
              className="w-full py-2 px-3 rounded-md border border-(--border-color) bg-(--card-bg) hover:bg-(--card-hover) text-xs flex items-center justify-between cursor-pointer transition-colors text-left"
            >
              <span className="truncate">npm i -g lmesh</span>
              {copied ? (
                <CheckIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <CopyIcon className="w-3.5 h-3.5 text-(--text-muted) shrink-0" />
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Sleek Minimal 404 Footer */}
      <footer className="w-full border-t border-(--border-color) py-6 text-center text-xs text-(--text-muted) font-sans mt-auto">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} LMESH — Live Multi-user Execution Shell.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-(--foreground) transition-colors">Home</Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-(--foreground) transition-colors">GitHub</a>
            <Link href="/dashboard" className="hover:text-(--foreground) transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function NotFound() {
  return (
    <ThemeProvider>
      <NotFoundContent />
    </ThemeProvider>
  );
}
