"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckIcon,
  CopyIcon,
  ArrowLeftIcon,
  LayersIcon,
  LockClosedIcon,
  Share2Icon,
  CubeIcon
} from "@radix-ui/react-icons";
import InteractiveDiagramViewer from "@/app/components/InteractiveDiagramViewer";

export default function ArchitectureDocsPage() {
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
          <span className="text-(--foreground)">Architecture</span>
        </div>

        {/* Section Header */}
        <div id="arch-overview" className="scroll-mt-20 space-y-3 pb-8 border-b border-(--border-color)">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded border border-(--border-color) bg-(--card-bg) text-(--text-subtle)">
              SECTION 04
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-(--text-subtle)">
              System Internals
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-(--foreground) font-sans">
            System Architecture
          </h1>
          <p className="text-sm sm:text-base text-(--text-muted) max-w-2xl leading-relaxed">
            LMESH is designed as an event-driven, low-latency terminal streaming pipeline. Below is the technical breakdown of the monorepo packages, binary WebSocket framing, concurrency control, and security boundaries.
          </p>
        </div>

        {/* Monorepo Structure */}
        <section id="packages" className="scroll-mt-20 pt-10 space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-(--foreground)">
            Package Ecosystem
          </h2>
          <p className="text-sm text-(--text-muted) leading-relaxed">
            LMESH is structured as a TypeScript monorepo with strict module boundaries separating OS shell execution, network relaying, and browser presentation:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-lg border border-(--border-color) bg-(--card-bg) space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold text-(--foreground)">
                <CubeIcon className="w-4 h-4 text-(--text-muted)" />
                <span>packages/cli</span>
              </div>
              <p className="text-xs text-(--text-muted) leading-relaxed">
                Native host agent. Spawns local POSIX PTY / Windows ConPTY instances via <code className="font-mono text-(--foreground)">node-pty</code>, manages raw stdin/stdout streams, and captures terminal escape sequences.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-(--border-color) bg-(--card-bg) space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold text-(--foreground)">
                <Share2Icon className="w-4 h-4 text-(--text-muted)" />
                <span>packages/server</span>
              </div>
              <p className="text-xs text-(--text-muted) leading-relaxed">
                Relay broker. Manages stateful WebSocket sessions, validates authorization tokens, coordinates Redis Pub/Sub multi-instance clusters, and persists audit logs to PostgreSQL.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-(--border-color) bg-(--card-bg) space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold text-(--foreground)">
                <LayersIcon className="w-4 h-4 text-(--text-muted)" />
                <span>packages/web</span>
              </div>
              <p className="text-xs text-(--text-muted) leading-relaxed">
                Next.js client interface. Instantiates WebGL-accelerated <code className="font-mono text-(--foreground)">xterm.js</code> canvases, renders collaborative session dashboards, and manages OAuth authentication flows.
              </p>
            </div>
          </div>
        </section>

        {/* Data Pipeline Diagram */}
        <section id="data-flow" className="scroll-mt-20 pt-14 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-(--foreground) font-sans">
              Data Flow & Transmission
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-(--border-color) bg-(--card-bg) text-(--text-subtle)">
              networking
            </span>
          </div>
          <p className="text-sm text-(--text-muted) leading-relaxed">
            Data moves bidirectionally across persistent WebSocket connections with zero polling overhead:
          </p>

          <InteractiveDiagramViewer />
        </section>

        {/* WebSocket Wire Protocol */}
        <section id="protocol" className="scroll-mt-20 pt-14 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-(--foreground) font-sans">
              WebSocket Protocol Framing
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-(--border-color) bg-(--card-bg) text-(--text-subtle)">
              framing
            </span>
          </div>
          <p className="text-sm text-(--text-muted) leading-relaxed">
            LMESH envelopes all terminal control messages and binary terminal chunks into standardized JSON protocol frames:
          </p>

          <div className="rounded-xl border border-[#232630] bg-[#0c0d12] overflow-hidden text-[#ededed] selection:bg-white/25 selection:text-white">
            <div className="flex items-center justify-between border-b border-[#1f212a] px-4 py-2.5 bg-[#13151c] text-xs font-mono select-none">
              <span className="text-[#8e93a0] text-[11px] font-medium">protocol schema</span>
              <button
                onClick={() => handleCopy('{\n  "type": "input",\n  "sessionId": "x7k2m9p",\n  "payload": "ls -la\\r",\n  "timestamp": 1788944000000\n}', "proto-copy")}
                className="flex items-center gap-1.5 text-[#8e93a0] hover:text-white transition-colors cursor-pointer"
              >
                {copiedCmd === "proto-copy" ? (
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
            <div className="p-4 font-mono text-xs overflow-x-auto text-[#f1f1f1] bg-[#0c0d12]">
              <pre className="text-[#a5b4fc]">
                {`{
  "type": "input" | "output" | "resize" | "grant_control" | "revoke_control" | "safety_mode",
  "sessionId": "x7k2m9p",
  "payload": "base64_or_utf8_string",
  "meta": {
    "rows": 34,
    "cols": 120,
    "sender": "@octocat"
  },
  "timestamp": 1788944000000
}`}
              </pre>
            </div>
          </div>
        </section>

        {/* Security & Concurrency Model */}
        <section id="security-model" className="scroll-mt-20 pt-14 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-(--foreground) font-sans">
              Security & Concurrency Guarantees
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-(--border-color) bg-(--card-bg) text-(--text-subtle)">
              safeguards
            </span>
          </div>
          <p className="text-sm text-(--text-muted) leading-relaxed">
            LMESH enforces hardware and protocol safeguards to guarantee that remote terminal sharing cannot compromise the host operating system:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-lg border border-(--border-color) bg-(--card-bg) space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold text-(--foreground)">
                <LockClosedIcon className="w-4 h-4 text-(--text-muted)" />
                <span>Single-Token Write Mutex</span>
              </div>
              <p className="text-xs text-(--text-muted) leading-relaxed">
                Only one client possesses write access to the PTY stdin stream at any time. Broadcasted viewer keystrokes are dropped server-side without queuing.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-(--border-color) bg-(--card-bg) space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold text-(--foreground)">
                <LockClosedIcon className="w-4 h-4 text-(--text-muted)" />
                <span>Immediate Host Preemption</span>
              </div>
              <p className="text-xs text-(--text-muted) leading-relaxed">
                The host retains master override capability. Striking <kbd className="px-1.5 py-0.5 rounded border border-(--border-color) bg-(--background) font-mono text-(--foreground)">Escape</kbd> or <kbd className="px-1.5 py-0.5 rounded border border-(--border-color) bg-(--background) font-mono text-(--foreground)">Ctrl+]</kbd> instantly severs remote control.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-(--border-color) bg-(--card-bg) space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold text-(--foreground)">
                <LockClosedIcon className="w-4 h-4 text-(--text-muted)" />
                <span>Anti-Recursion Guard</span>
              </div>
              <p className="text-xs text-(--text-muted) leading-relaxed">
                The CLI sets <code className="font-mono text-(--foreground) bg-(--background) px-1.5 py-0.5 rounded">LMESH_ACTIVE=1</code> in the child shell environment. Any attempt to spawn nested shared shells is caught and blocked.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-(--border-color) bg-(--card-bg) space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold text-(--foreground)">
                <LockClosedIcon className="w-4 h-4 text-(--text-muted)" />
                <span>Zero Port-Forwarding</span>
              </div>
              <p className="text-xs text-(--text-muted) leading-relaxed">
                Because the host establishes an outbound WebSocket connection to the relay, no inbound firewall ports or router NAT rules need to be opened.
              </p>
            </div>
          </div>
        </section>

        {/* Horizontal Scaling with Redis */}
        <section id="scaling" className="scroll-mt-20 pt-14 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-(--foreground) font-sans">
              Horizontal Scaling via Redis
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-(--border-color) bg-(--card-bg) text-(--text-subtle)">
              cluster
            </span>
          </div>
          <p className="text-sm text-(--text-muted) leading-relaxed">
            In multi-node production setups, relay servers run statelessly behind a load balancer. When a host connects to Node A and collaborators connect to Node B, Redis Pub/Sub automatically bridges chunk broadcasting and control events with sub-millisecond propagation latency.
          </p>
        </section>

        {/* Bottom Navigation */}
        <div className="pt-12 border-t border-(--border-color) flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/docs/controls"
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-(--border-color) bg-(--card-bg) hover:bg-(--card-hover) text-(--foreground) font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Previous: Controls & Hotkeys</span>
          </Link>

          <span className="text-xs text-(--text-muted)">
            All 4 documentation sections completed
          </span>
        </div>

      </main>

      {/* Right Sidebar: On this page */}
      <aside className="hidden lg:block w-56 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto docs-scrollbar pt-10 pl-8 text-xs font-sans">
        <div className="font-mono text-[11px] uppercase tracking-wider text-(--text-subtle) font-semibold mb-3">
          On this page
        </div>
        <ul className="space-y-2 border-l border-(--border-color) pl-3 text-(--text-muted)">
          <li>
            <a href="#packages" onClick={(e) => scrollToHeading(e, "packages")} className="hover:text-(--foreground) transition-colors block">
              Package Ecosystem
            </a>
          </li>
          <li>
            <a href="#data-flow" onClick={(e) => scrollToHeading(e, "data-flow")} className="hover:text-(--foreground) transition-colors block">
              Data Flow
            </a>
          </li>
          <li>
            <a href="#protocol" onClick={(e) => scrollToHeading(e, "protocol")} className="hover:text-(--foreground) transition-colors block">
              Wire Protocol
            </a>
          </li>
          <li>
            <a href="#security-model" onClick={(e) => scrollToHeading(e, "security-model")} className="hover:text-(--foreground) transition-colors block">
              Security Model
            </a>
          </li>
          <li>
            <a href="#scaling" onClick={(e) => scrollToHeading(e, "scaling")} className="hover:text-(--foreground) transition-colors block">
              Horizontal Scaling
            </a>
          </li>
        </ul>
      </aside>
    </div>
  );
}
