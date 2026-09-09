"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckIcon,
  CopyIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  LockClosedIcon,
  CrossCircledIcon,
  UpdateIcon,
  CursorArrowIcon
} from "@radix-ui/react-icons";

export default function ControlsDocsPage() {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const scrollToHeading = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <div className="w-full flex">
      {/* Main Content Area */}
      <main id="docs-content-container" className="flex-1 min-w-0 py-10 pb-24 font-sans">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-(--text-subtle) uppercase tracking-wider mb-4">
          <Link href="/docs" className="hover:text-(--foreground) transition-colors">Docs</Link>
          <span>/</span>
          <span className="text-(--foreground)">Controls & Hotkeys</span>
        </div>

        {/* Section Header */}
        <div id="controls-overview" className="space-y-3 pb-8 border-b border-(--border-color) scroll-mt-20">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded border border-(--border-color) bg-(--card-bg) text-(--text-subtle)">
              SECTION 03
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-(--text-subtle)">
              Session Management
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-(--foreground) font-sans">
            Controls & Hotkeys
          </h1>
          <p className="text-sm sm:text-base text-(--text-muted) max-w-2xl leading-relaxed">
            LMESH provides low-level keyboard hotkeys, automated PTY synchronization hooks, and collaborative token-passing mechanisms to manage active shell sessions securely without leaving your terminal.
          </p>
        </div>

        {/* Quick Hotkey Matrix */}
        <div className="pt-10 space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-(--foreground)">
            Hotkey Quick Reference
          </h2>
          <p className="text-sm text-(--text-muted) leading-relaxed">
            These hotkeys are captured directly by the host CLI input stream and intercepted before reaching the child shell process:
          </p>

          <div className="rounded-lg border border-(--border-color) overflow-hidden bg-(--card-bg)">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans min-w-155">
                <thead className="bg-(--background)/50 border-b border-(--border-color) font-mono text-[11px] uppercase tracking-wider text-(--text-subtle)">
                  <tr>
                    <th className="py-3 px-4 whitespace-nowrap w-40">Shortcut</th>
                    <th className="py-3 px-4 whitespace-nowrap w-30">Scope</th>
                    <th className="py-3 px-4 whitespace-nowrap w-35">Action</th>
                    <th className="py-3 px-4 min-w-60">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border-color) text-(--text-muted)">
                  <tr>
                    <td className="py-3 px-4 font-mono font-semibold text-(--foreground) whitespace-nowrap">
                      <kbd className="px-1.5 py-0.5 rounded border border-(--border-color) bg-(--background) font-mono text-(--foreground)">Ctrl+S</kbd>
                    </td>
                    <td className="py-3 px-4 font-mono whitespace-nowrap">Host CLI</td>
                    <td className="py-3 px-4 font-mono text-(--text-subtle) whitespace-nowrap">Toggle Safety</td>
                    <td className="py-3 px-4">Enables or disables automatic secrets redaction in collaborator viewports and audit logs.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono font-semibold text-(--foreground) whitespace-nowrap">
                      <kbd className="px-1.5 py-0.5 rounded border border-(--border-color) bg-(--background) font-mono text-(--foreground)">Ctrl+]</kbd>
                    </td>
                    <td className="py-3 px-4 font-mono whitespace-nowrap">Host CLI</td>
                    <td className="py-3 px-4 font-mono text-(--text-subtle) whitespace-nowrap">Terminate</td>
                    <td className="py-3 px-4">Immediately tears down the active WebSocket stream and terminates the native PTY session.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono font-semibold text-(--foreground) whitespace-nowrap">
                      <kbd className="px-1.5 py-0.5 rounded border border-(--border-color) bg-(--background) font-mono text-(--foreground)">exit</kbd>
                    </td>
                    <td className="py-3 px-4 font-mono whitespace-nowrap">Shell Process</td>
                    <td className="py-3 px-4 font-mono text-(--text-subtle) whitespace-nowrap">Process Exit</td>
                    <td className="py-3 px-4">Standard shell exit command. Triggers SIGHUP signal propagation and closes the session.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono font-semibold text-(--foreground) whitespace-nowrap">
                      <kbd className="px-1.5 py-0.5 rounded border border-(--border-color) bg-(--background) font-mono text-(--foreground)">Escape</kbd>
                    </td>
                    <td className="py-3 px-4 font-mono whitespace-nowrap">Host CLI</td>
                    <td className="py-3 px-4 font-mono text-(--text-subtle) whitespace-nowrap">Revoke Control</td>
                    <td className="py-3 px-4">Instantly reclaims terminal write access back to the host, demoting collaborators to viewers.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Safety Mode Detail */}
        <section id="safety-mode" className="pt-14 space-y-4 scroll-mt-20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-(--foreground) font-sans">
              Safety Mode (Ctrl+S)
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-(--border-color) bg-(--card-bg) text-(--text-subtle)">
              security
            </span>
          </div>
          <p className="text-sm text-(--text-muted) leading-relaxed">
            During live pairing, hosts often need to inspect environment variables, run migration scripts containing database connection URIs, or copy sensitive tokens. Safety Mode acts as an in-stream redaction proxy between the local PTY stdout and the outbound WebSocket relay.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-lg border border-(--border-color) bg-(--card-bg) space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold text-(--foreground)">
                <LockClosedIcon className="w-4 h-4 text-(--text-muted)" />
                <span>Pattern-Matched Redaction</span>
              </div>
              <p className="text-xs text-(--text-muted) leading-relaxed">
                Automatically scans stdout chunks for regex patterns matching AWS access keys, GitHub personal access tokens, OpenAI API keys, private RSA keys, and JWT signatures.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-(--border-color) bg-(--card-bg) space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold text-(--foreground)">
                <CursorArrowIcon className="w-4 h-4 text-(--text-muted)" />
                <span>Audit Log Masking</span>
              </div>
              <p className="text-xs text-(--text-muted) leading-relaxed">
                Masked strings are replaced with <code className="font-mono text-(--foreground) bg-(--background) px-1.5 py-0.5 rounded">[REDACTED]</code> before chunks are pushed to PostgreSQL session history tables.
              </p>
            </div>
          </div>

          {/* Terminal Snippet Box */}
          <div className="rounded-xl border border-[#232630] bg-[#0c0d12] overflow-hidden text-[#ededed] selection:bg-white/25 selection:text-white">
            <div className="flex items-center justify-between border-b border-[#1f212a] px-4 py-2.5 bg-[#13151c] text-xs font-mono select-none">
              <span className="text-[#8e93a0] text-[11px] font-medium">terminal preview</span>
              <button
                onClick={() => handleCopy("export DATABASE_URL=postgres://user:[REDACTED]@db.internal:5432/prod", "cmd-safety")}
                className="flex items-center gap-1.5 text-[#8e93a0] hover:text-white transition-colors cursor-pointer"
              >
                {copiedCmd === "cmd-safety" ? (
                  <>
                    <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <CopyIcon className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-4 font-mono text-xs overflow-x-auto text-[#f1f1f1] space-y-1 bg-[#0c0d12]">
              <div className="text-[#8e93a0]">
                <span className="text-[#555a68] select-none font-semibold mr-2">$</span>
                export DATABASE_URL=postgres://user:[REDACTED]@db.internal:5432/prod
              </div>
              <div className="text-[#555a68] text-[11px]">
                [lmesh] Safety Mode active • 1 sensitive credential redacted from collaborator stream
              </div>
            </div>
          </div>
        </section>

        {/* Session Termination Detail */}
        <section id="session-termination" className="pt-14 space-y-4 scroll-mt-20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-(--foreground) font-sans">
              Session Termination (Ctrl+])
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-(--border-color) bg-(--card-bg) text-(--text-subtle)">
              lifecycle
            </span>
          </div>
          <p className="text-sm text-(--text-muted) leading-relaxed">
            When you conclude collaboration, you can disconnect all connected web clients and destroy the relay session using either the escape chord or the shell exit command:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-lg border border-(--border-color) bg-(--card-bg) space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold text-(--foreground)">
                <CrossCircledIcon className="w-4 h-4 text-(--text-muted)" />
                <span>Instant Kill (Ctrl+])</span>
              </div>
              <p className="text-xs text-(--text-muted) leading-relaxed">
                Immediately broadcasts a session termination payload over WebSocket, closes the server room, and returns the host shell to ordinary non-shared operation.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-(--border-color) bg-(--card-bg) space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold text-(--foreground)">
                <UpdateIcon className="w-4 h-4 text-(--text-muted)" />
                <span>Graceful Shell Exit</span>
              </div>
              <p className="text-xs text-(--text-muted) leading-relaxed">
                Typing <code className="font-mono text-(--foreground)">exit</code> inside the terminal sends an EOF (End of File) signal to your underlying shell, naturally terminating both the PTY process and the session.
              </p>
            </div>
          </div>
        </section>

        {/* Terminal Redraw & Sync Detail */}
        <section id="terminal-sync" className="pt-14 space-y-4 scroll-mt-20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-(--foreground) font-sans">
              Terminal Redraw & Viewport Sync
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-(--border-color) bg-(--card-bg) text-(--text-subtle)">
              rendering
            </span>
          </div>
          <p className="text-sm text-(--text-muted) leading-relaxed">
            Collaborative terminal streaming faces a physical challenge: browser windows and desktop terminal windows have differing column and row geometries. LMESH synchronizes viewport dimensions without distorting full-screen TUI programs such as Vim, Nano, or htop.
          </p>

          <div className="rounded-lg border border-(--border-color) bg-(--card-bg) p-4 space-y-3">
            <div className="font-mono text-xs font-semibold text-(--foreground)">
              How Window Sizing is Arbitrated:
            </div>
            <ol className="list-decimal list-inside space-y-2 text-xs text-(--text-muted) leading-relaxed">
              <li>
                <strong>Host Authority:</strong> The host's physical terminal window dimensions (<code className="font-mono text-(--foreground)">cols</code> and <code className="font-mono text-(--foreground)">rows</code>) define the authoritative PTY size.
              </li>
              <li>
                <strong>Viewport Clamping:</strong> Collaborator browser viewports instantiate an xterm.js canvas fitted with dynamic letterboxing when client monitors are larger or smaller than the host terminal.
              </li>
              <li>
                <strong>Window Change Signal:</strong> When the host resizes their terminal window, the CLI emits a <code className="font-mono text-(--foreground)">SIGWINCH</code> event to the PTY and pushes a resize frame over WebSocket to redraw collaborator viewports immediately.
              </li>
            </ol>
          </div>
        </section>

        {/* Input Sharing & Handover */}
        <section id="control-handover" className="pt-14 space-y-4 scroll-mt-20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-(--foreground) font-sans">
              Input Token Handover
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-(--border-color) bg-(--card-bg) text-(--text-subtle)">
              collaboration
            </span>
          </div>
          <p className="text-sm text-(--text-muted) leading-relaxed">
            To prevent simultaneous keystroke collisions and command corruption, LMESH implements a <strong>Single-Token Write Mutex</strong>. Collaborators begin in read-only observation mode.
          </p>

          <div className="rounded-lg border border-(--border-color) bg-(--card-bg) p-4 space-y-3">
            <div className="font-mono text-xs font-semibold text-(--foreground)">
              Control Request Workflow:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
              <div className="p-3 rounded border border-(--border-color) bg-(--background)/60 space-y-1">
                <div className="font-mono font-semibold text-(--foreground)">1. Request</div>
                <p className="text-(--text-muted)">Collaborator clicks "Request Control" in the web toolbar.</p>
              </div>
              <div className="p-3 rounded border border-(--border-color) bg-(--background)/60 space-y-1">
                <div className="font-mono font-semibold text-(--foreground)">2. Approval</div>
                <p className="text-(--text-muted)">Host approves prompt in CLI or browser dashboard.</p>
              </div>
              <div className="p-3 rounded border border-(--border-color) bg-(--background)/60 space-y-1">
                <div className="font-mono font-semibold text-(--foreground)">3. Write Access</div>
                <p className="text-(--text-muted)">Token transfers to collaborator. Host retains instant revoke with Escape.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Navigation */}
        <div className="pt-12 border-t border-(--border-color) flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/docs/cli"
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-(--border-color) bg-(--card-bg) hover:bg-(--card-hover) text-(--foreground) font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Previous: CLI Reference</span>
          </Link>

          <Link
            href="/docs/architecture"
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-(--btn-bg) text-(--btn-fg) font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-xs"
          >
            <span>Next: Architecture</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

      </main>

      {/* Right Sidebar: On this page */}
      <aside className="hidden lg:block w-56 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto docs-scrollbar pt-10 pl-8 text-xs font-sans">
        <div className="font-mono text-[11px] uppercase tracking-wider text-(--text-subtle) font-semibold mb-3">
          On this page
        </div>
        <ul className="space-y-2 border-l border-(--border-color) pl-3 text-(--text-muted)">
          <li>
            <a href="#controls-overview" onClick={(e) => scrollToHeading(e, "controls-overview")} className="hover:text-(--foreground) transition-colors block">
              Hotkey Matrix
            </a>
          </li>
          <li>
            <a href="#safety-mode" onClick={(e) => scrollToHeading(e, "safety-mode")} className="hover:text-(--foreground) transition-colors block">
              Safety Mode (Ctrl+S)
            </a>
          </li>
          <li>
            <a href="#session-termination" onClick={(e) => scrollToHeading(e, "session-termination")} className="hover:text-(--foreground) transition-colors block">
              Termination (Ctrl+])
            </a>
          </li>
          <li>
            <a href="#terminal-sync" onClick={(e) => scrollToHeading(e, "terminal-sync")} className="hover:text-(--foreground) transition-colors block">
              Viewport Sync
            </a>
          </li>
          <li>
            <a href="#control-handover" onClick={(e) => scrollToHeading(e, "control-handover")} className="hover:text-(--foreground) transition-colors block">
              Token Handover
            </a>
          </li>
        </ul>
      </aside>
    </div>
  );
}
