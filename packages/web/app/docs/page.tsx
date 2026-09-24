"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckIcon,
  CopyIcon,
  ArrowRightIcon,
  DesktopIcon,
  LockClosedIcon,
  InfoCircledIcon
} from "@radix-ui/react-icons";

export default function QuickstartDocsPage() {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"npm" | "pnpm" | "yarn">("npm");

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
      {/* Main Article Content */}
      <main id="docs-content-container" className="flex-1 min-w-0 py-10 pb-24 font-sans">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-(--text-subtle) uppercase tracking-wider mb-4">
          <Link href="/docs" className="hover:text-(--foreground) transition-colors">Docs</Link>
          <span>/</span>
          <span>Getting Started</span>
          <span>/</span>
          <span className="text-(--foreground)">Quick Start</span>
        </div>

        {/* Title Section */}
        <div id="overview" className="space-y-3 pb-8 border-b border-(--border-color) scroll-mt-20">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded border border-(--border-color) bg-(--card-bg) text-(--text-subtle)">
              SECTION 01
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-(--text-subtle)">
              Getting Started
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-(--foreground) font-sans">
            Quick Start Guide
          </h1>
          <p className="text-sm sm:text-base text-(--text-muted) max-w-2xl leading-relaxed">
            LMESH enables developers to share their local terminal session with collaborators directly through any modern web browser. Follow this guide to install the CLI, authenticate with GitHub, and launch your first live session.
          </p>
        </div>

        {/* Step 1: Prerequisites */}
        <section id="prerequisites" className="pt-10 space-y-4 scroll-mt-20">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded border border-(--border-color) bg-(--card-bg) text-(--text-subtle)">
              STEP 01
            </span>
            <h2 className="text-xl font-bold tracking-tight text-(--foreground)">
              Prerequisites
            </h2>
          </div>
          <p className="text-sm text-(--text-muted) leading-relaxed">
            Before getting started, make sure your local workstation meets the following runtime requirements:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-lg border border-(--border-color) bg-(--card-bg) space-y-1.5">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold text-(--foreground)">
                <DesktopIcon className="w-4 h-4 text-(--text-muted)" />
                <span>Host Environment</span>
              </div>
              <p className="text-xs text-(--text-muted) leading-relaxed">
                Node.js 20.x or newer installed on macOS, Linux, or Windows (PowerShell / Windows Terminal with ConPTY).
              </p>
            </div>

            <div className="p-4 rounded-lg border border-(--border-color) bg-(--card-bg) space-y-1.5">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold text-(--foreground)">
                <LockClosedIcon className="w-4 h-4 text-(--text-muted)" />
                <span>Collaborator Browser</span>
              </div>
              <p className="text-xs text-(--text-muted) leading-relaxed">
                Zero installations required. Collaborators join via any modern browser (Chrome, Firefox, Safari, Edge).
              </p>
            </div>
          </div>
        </section>

        {/* Step 2: Installation */}
        <section id="installation" className="pt-12 space-y-4 scroll-mt-20">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded border border-(--border-color) bg-(--card-bg) text-(--text-subtle)">
              STEP 02
            </span>
            <h2 className="text-xl font-bold tracking-tight text-(--foreground)">
              Installation
            </h2>
          </div>
          <p className="text-sm text-(--text-muted) leading-relaxed">
            Install the LMESH CLI globally using your package manager of choice:
          </p>

          {/* Terminal Snippet Box with Tabs */}
          <div className="rounded-xl border border-[#232630] bg-[#0c0d12] overflow-hidden text-[#ededed] selection:bg-white/25 selection:text-white">
            <div className="flex items-center justify-between border-b border-[#1f212a] px-4 py-2.5 bg-[#13151c] text-xs font-mono select-none">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveTab("npm")}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    activeTab === "npm"
                      ? "bg-[#2c3140] text-white font-semibold"
                      : "text-[#7f8494] hover:text-[#d1d5db]"
                  }`}
                >
                  npm
                </button>
                <button
                  onClick={() => setActiveTab("pnpm")}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    activeTab === "pnpm"
                      ? "bg-[#2c3140] text-white font-semibold"
                      : "text-[#7f8494] hover:text-[#d1d5db]"
                  }`}
                >
                  pnpm
                </button>
                <button
                  onClick={() => setActiveTab("yarn")}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    activeTab === "yarn"
                      ? "bg-[#2c3140] text-white font-semibold"
                      : "text-[#7f8494] hover:text-[#d1d5db]"
                  }`}
                >
                  yarn
                </button>
              </div>
              <button
                onClick={() =>
                  handleCopy(
                    activeTab === "npm"
                      ? "npm install -g lmesh"
                      : activeTab === "pnpm"
                      ? "pnpm add -g lmesh"
                      : "yarn global add lmesh",
                    "install"
                  )
                }
                className="flex items-center gap-1.5 text-[#8e93a0] hover:text-white transition-colors cursor-pointer"
              >
                {copiedCmd === "install" ? (
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
            <div className="p-4 font-mono text-xs overflow-x-auto text-[#f1f1f1] flex items-center gap-2.5 bg-[#0c0d12]">
              <span className="text-[#555a68] select-none font-semibold">$</span>
              <code className="text-[#f1f1f1] font-mono tracking-tight">
                {activeTab === "npm" && "npm install -g lmesh"}
                {activeTab === "pnpm" && "pnpm add -g lmesh"}
                {activeTab === "yarn" && "yarn global add lmesh"}
              </code>
            </div>
          </div>

          <p className="text-xs text-(--text-subtle) pt-1">
            Verify the installation by running <code className="font-mono text-(--foreground) bg-(--card-bg) px-1.5 py-0.5 rounded border border-(--border-color)">lmesh --version</code> in your terminal.
          </p>
        </section>

        {/* Step 3: Authentication */}
        <section id="authentication" className="pt-12 space-y-4 scroll-mt-20">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded border border-(--border-color) bg-(--card-bg) text-(--text-subtle)">
              STEP 03
            </span>
            <h2 className="text-xl font-bold tracking-tight text-(--foreground)">
              Authentication
            </h2>
          </div>
          <p className="text-sm text-(--text-muted) leading-relaxed">
            LMESH uses the <strong>GitHub OAuth Device Flow</strong> for easier passwordless CLI authorization. You don't need to manually create or copy personal access tokens.
          </p>

          {/* Command Code Box */}
          <div className="rounded-xl border border-[#232630] bg-[#0c0d12] overflow-hidden text-[#ededed] selection:bg-white/25 selection:text-white">
            <div className="flex items-center justify-between border-b border-[#1f212a] px-4 py-2.5 bg-[#13151c] text-xs font-mono select-none">
              <span className="text-[#8e93a0] text-[11px] font-medium">bash</span>
              <button
                onClick={() => handleCopy("lmesh login", "login")}
                className="flex items-center gap-1.5 text-[#8e93a0] hover:text-white transition-colors cursor-pointer"
              >
                {copiedCmd === "login" ? (
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
            <div className="p-4 font-mono text-xs overflow-x-auto text-[#f1f1f1] flex items-center gap-2.5 bg-[#0c0d12]">
              <span className="text-[#555a68] select-none font-semibold">$</span>
              <code className="text-[#f1f1f1] font-mono tracking-tight">lmesh login</code>
            </div>
          </div>

          {/* What happens next visual */}
          <div className="p-4 rounded-lg border border-(--border-color) bg-(--card-bg)/60 space-y-2">
            <div className="font-mono text-xs text-(--foreground) font-semibold">
              What happens when you run this command:
            </div>
            <ol className="list-decimal list-inside space-y-1 text-xs text-(--text-muted) leading-relaxed">
              <li>The CLI generates a unique 8-character verification code (e.g. <code className="font-mono text-(--foreground)">XXXX-YYYY</code>).</li>
              <li>Your browser automatically opens GitHub's device activation page.</li>
              <li>Enter the one-time code and click <strong>Authorize</strong>.</li>
              <li>The CLI automatically detects approval and writes your session token to <code className="font-mono text-(--foreground)">~/.lmesh/auth.json</code>.</li>
            </ol>
          </div>
        </section>

        {/* Step 4: Starting a Session */}
        <section id="first-session" className="pt-12 space-y-4 scroll-mt-20">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded border border-(--border-color) bg-(--card-bg) text-(--text-subtle)">
              STEP 04
            </span>
            <h2 className="text-xl font-bold tracking-tight text-(--foreground)">
              Starting Your First Session
            </h2>
          </div>
          <p className="text-sm text-(--text-muted) leading-relaxed">
            Once authenticated, share your active shell session with a single command:
          </p>

          {/* Command Code Box */}
          <div className="rounded-xl border border-[#232630] bg-[#0c0d12] overflow-hidden text-[#ededed] selection:bg-white/25 selection:text-white">
            <div className="flex items-center justify-between border-b border-[#1f212a] px-4 py-2.5 bg-[#13151c] text-xs font-mono select-none">
              <span className="text-[#8e93a0] text-[11px] font-medium">bash</span>
              <button
                onClick={() => handleCopy("lmesh share", "share")}
                className="flex items-center gap-1.5 text-[#8e93a0] hover:text-white transition-colors cursor-pointer"
              >
                {copiedCmd === "share" ? (
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
            <div className="p-4 font-mono text-xs overflow-x-auto text-[#f1f1f1] flex items-center gap-2.5 bg-[#0c0d12]">
              <span className="text-[#555a68] select-none font-semibold">$</span>
              <code className="text-[#f1f1f1] font-mono tracking-tight">lmesh share</code>
            </div>
          </div>

          {/* Simulated Output Card */}
          <div className="rounded-xl border border-[#232630] bg-[#0c0d12] overflow-hidden font-mono text-xs text-[#ededed] selection:bg-white/25 selection:text-white">
            <div className="px-4 py-2.5 border-b border-[#1f212a] bg-[#13151c] text-[#8e93a0] text-[11px] flex items-center justify-between select-none">
              <span className="text-[#8e93a0] text-[11px] font-medium">terminal preview</span>
            </div>
            <div className="p-4 space-y-2 leading-relaxed bg-[#0c0d12]">
              <div className="text-[#8e93a0]"><span className="text-[#555a68] select-none mr-2 font-semibold">$</span>lmesh share</div>
              <div className="text-[#8e93a0]">Authenticated as <span className="text-cyan-400 font-semibold">@octocat</span></div>
              <div className="text-[#8e93a0]">Connecting to relay server...</div>
              <div className="text-emerald-400 font-semibold">Session created successfully!</div>
              <div className="pt-2 text-[#8e93a0]">Share this link with collaborators:</div>
              <div className="text-[#38bdf8] underline font-semibold tracking-wide select-all">
                https://lmesh.vercel.app/x7k2m9p
              </div>
              <div className="text-[#555a68] text-[11px] pt-2">
                (Type 'exit' or press Ctrl+] to end session • Ctrl+S for Private Mode)
              </div>
            </div>
          </div>
        </section>

        {/* Note / Callout Box */}
        <div className="my-10 p-5 rounded-lg border border-(--border-color) bg-(--card-bg) flex items-start gap-3.5">
          <InfoCircledIcon className="w-5 h-5 text-(--foreground) shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <div className="font-semibold text-(--foreground)">Private Mode is Built-in</div>
            <p className="text-(--text-muted) leading-relaxed">
              Pressing <kbd className="px-1.5 py-0.5 rounded border border-(--border-color) bg-(--background) font-mono text-(--foreground)">Ctrl+S</kbd> anytime during your session toggles Private Mode. When enabled, sensitive commands and credentials such as database passwords, API tokens, and JWTs are dynamically redacted from the web audit log and collaborator streams.
            </p>
          </div>
        </div>

        {/* Bottom Section Transition / Next Step */}
        <div className="pt-8 border-t border-(--border-color) flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-(--text-muted)">
            Section 1 of 4 completed
          </div>
          <Link
            href="/docs/cli"
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-(--btn-bg) text-(--btn-fg) font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-xs"
          >
            <span>Next: CLI Reference</span>
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
            <a href="#overview" onClick={(e) => scrollToHeading(e, "overview")} className="hover:text-(--foreground) transition-colors block">
              Overview
            </a>
          </li>
          <li>
            <a href="#prerequisites" onClick={(e) => scrollToHeading(e, "prerequisites")} className="hover:text-(--foreground) transition-colors block">
              Prerequisites
            </a>
          </li>
          <li>
            <a href="#installation" onClick={(e) => scrollToHeading(e, "installation")} className="hover:text-(--foreground) transition-colors block">
              Installation
            </a>
          </li>
          <li>
            <a href="#authentication" onClick={(e) => scrollToHeading(e, "authentication")} className="hover:text-(--foreground) transition-colors block">
              Authentication
            </a>
          </li>
          <li>
            <a href="#first-session" onClick={(e) => scrollToHeading(e, "first-session")} className="hover:text-(--foreground) transition-colors block">
              Starting a Session
            </a>
          </li>
        </ul>
      </aside>
    </div>
  );
}
