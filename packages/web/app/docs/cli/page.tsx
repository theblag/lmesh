"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckIcon,
  CopyIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from "@radix-ui/react-icons";

export default function CliDocsPage() {
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
          <span className="text-(--foreground)">CLI Reference</span>
        </div>

        {/* Section Header */}
        <div id="cli-overview" className="space-y-3 pb-8 border-b border-(--border-color) scroll-mt-20">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded border border-(--border-color) bg-(--card-bg) text-(--text-subtle)">
              SECTION 02
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-(--text-subtle)">
              Command-Line Tool
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-(--foreground) font-sans">
            CLI Reference
          </h1>
          <p className="text-sm sm:text-base text-(--text-muted) max-w-2xl leading-relaxed">
            The LMESH CLI connects your local operating system shell (POSIX PTY / ConPTY) to the relay server via secure WebSockets. Below is the complete syntax, flag specifications, and practical usage examples for all subcommands.
          </p>
        </div>

        {/* Global Syntax */}
        <div className="pt-10 space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-(--foreground)">
            Command Syntax
          </h2>
          <p className="text-sm text-(--text-muted) leading-relaxed">
            All LMESH commands follow standard POSIX command-line formatting:
          </p>
          <div className="rounded-xl border border-[#232630] bg-[#0c0d12] overflow-hidden text-[#ededed] selection:bg-white/25 selection:text-white">
            <div className="flex items-center justify-between border-b border-[#1f212a] px-4 py-2.5 bg-[#13151c] text-xs font-mono select-none">
              <span className="text-[#8e93a0] text-[11px] font-medium">syntax</span>
            </div>
            <div className="p-4 font-mono text-xs overflow-x-auto text-[#f1f1f1] flex items-center gap-2.5 bg-[#0c0d12]">
              <span className="text-[#555a68] select-none font-semibold">$</span>
              <code className="text-[#f1f1f1] font-mono tracking-tight">lmesh &lt;command&gt; [options]</code>
            </div>
          </div>

          {/* Subcommand Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <a href="#cli-login" className="p-4 rounded-lg border border-(--border-color) bg-(--card-bg) hover:bg-(--card-hover) transition-colors space-y-1 block">
              <div className="font-mono text-xs font-semibold text-(--foreground)">lmesh login</div>
              <p className="text-xs text-(--text-muted)">Authenticate CLI identity via GitHub Device Authorization Flow.</p>
            </a>
            <a href="#cli-share" className="p-4 rounded-lg border border-(--border-color) bg-(--card-bg) hover:bg-(--card-hover) transition-colors space-y-1 block">
              <div className="font-mono text-xs font-semibold text-(--foreground)">lmesh share [options]</div>
              <p className="text-xs text-(--text-muted)">Spawn a local pseudo-terminal and stream live over WebSockets.</p>
            </a>
            <a href="#cli-whoami" className="p-4 rounded-lg border border-(--border-color) bg-(--card-bg) hover:bg-(--card-hover) transition-colors space-y-1 block">
              <div className="font-mono text-xs font-semibold text-(--foreground)">lmesh whoami</div>
              <p className="text-xs text-(--text-muted)">Display active authenticated GitHub profile and credentials status.</p>
            </a>
            <a href="#cli-logout" className="p-4 rounded-lg border border-(--border-color) bg-(--card-bg) hover:bg-(--card-hover) transition-colors space-y-1 block">
              <div className="font-mono text-xs font-semibold text-(--foreground)">lmesh logout</div>
              <p className="text-xs text-(--text-muted)">Revoke and clear locally stored credentials from disk.</p>
            </a>
          </div>
        </div>

        {/* lmesh login */}
        <section id="cli-login" className="pt-14 space-y-4 scroll-mt-20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-(--foreground) font-mono">
              lmesh login
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-(--border-color) bg-(--card-bg) text-(--text-subtle)">
              auth
            </span>
          </div>
          <p className="text-sm text-(--text-muted) leading-relaxed">
            Initiates GitHub OAuth Device Authorization. The CLI prints a one-time 8-character user code and automatically opens GitHub's verification page. Once authorized, an encrypted JWT is saved to <code className="font-mono text-(--foreground) bg-(--card-bg) px-1.5 py-0.5 rounded border border-(--border-color)">~/.lmesh/auth.json</code>.
          </p>

          <div className="rounded-xl border border-[#232630] bg-[#0c0d12] overflow-hidden text-[#ededed] selection:bg-white/25 selection:text-white">
            <div className="flex items-center justify-between border-b border-[#1f212a] px-4 py-2.5 bg-[#13151c] text-xs font-mono select-none">
              <span className="text-[#8e93a0] text-[11px] font-medium">bash</span>
              <button
                onClick={() => handleCopy("lmesh login", "cmd-login")}
                className="flex items-center gap-1.5 text-[#8e93a0] hover:text-white transition-colors cursor-pointer"
              >
                {copiedCmd === "cmd-login" ? (
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
        </section>

        {/* lmesh share */}
        <section id="cli-share" className="pt-14 space-y-4 scroll-mt-20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-(--foreground) font-mono">
              lmesh share
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-(--border-color) bg-(--card-bg) text-(--text-subtle)">
              core
            </span>
          </div>
          <p className="text-sm text-(--text-muted) leading-relaxed">
            Spawns your operating system's native pseudo-terminal (POSIX PTY on macOS/Linux, ConPTY on Windows) and initiates a real-time WebSocket session. Collaborators join via the generated browser URL.
          </p>

          <div className="rounded-xl border border-[#232630] bg-[#0c0d12] overflow-hidden text-[#ededed] selection:bg-white/25 selection:text-white">
            <div className="flex items-center justify-between border-b border-[#1f212a] px-4 py-2.5 bg-[#13151c] text-xs font-mono select-none">
              <span className="text-[#8e93a0] text-[11px] font-medium">bash</span>
              <button
                onClick={() => handleCopy("lmesh share [options]", "cmd-share")}
                className="flex items-center gap-1.5 text-[#8e93a0] hover:text-white transition-colors cursor-pointer"
              >
                {copiedCmd === "cmd-share" ? (
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
              <code className="text-[#f1f1f1] font-mono tracking-tight">lmesh share [options]</code>
            </div>
          </div>

          {/* Share Examples */}
          <div className="space-y-3 pt-2">
            <div className="font-mono text-xs font-semibold text-(--foreground)">
              Common Usage Scenarios:
            </div>

            {/* Example 1: Local Session */}
            <div className="p-4 rounded-lg border border-(--border-color) bg-(--card-bg) space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-(--foreground)">1. Default Local Session</span>
              </div>
              <div className="px-3.5 py-2.5 rounded-lg border border-[#232630] bg-[#0c0d12] font-mono text-xs text-[#f1f1f1] flex items-center justify-between gap-2 selection:bg-white/25 selection:text-white">
                <div className="flex items-center gap-2 overflow-x-auto">
                  <span className="text-[#555a68] select-none font-semibold">$</span>
                  <code className="text-[#f1f1f1] font-mono">lmesh share</code>
                </div>
                <button
                  onClick={() => handleCopy("lmesh share", "ex-local")}
                  className="flex items-center gap-1 text-[#8e93a0] hover:text-white transition-colors cursor-pointer shrink-0"
                  title="Copy command"
                >
                  {copiedCmd === "ex-local" ? (
                    <>
                      <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[10px] text-emerald-400 font-sans">Copied</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-sans">Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-(--text-muted) leading-relaxed">
                Connects to the default relay server at <code className="font-mono text-(--foreground)">localhost:3001</code> and generates a join URL for <code className="font-mono text-(--foreground)">localhost:3000</code>.
              </p>
            </div>

            {/* Example 2: Password Protection */}
            <div className="p-4 rounded-lg border border-(--border-color) bg-(--card-bg) space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-(--foreground)">2. Password-Protected Session</span>
              </div>
              <div className="px-3.5 py-2.5 rounded-lg border border-[#232630] bg-[#0c0d12] font-mono text-xs text-[#f1f1f1] flex items-center justify-between gap-2 selection:bg-white/25 selection:text-white">
                <div className="flex items-center gap-2 overflow-x-auto">
                  <span className="text-[#555a68] select-none font-semibold">$</span>
                  <code className="text-[#f1f1f1] font-mono">lmesh share --password mySecretPass123</code>
                </div>
                <button
                  onClick={() => handleCopy("lmesh share --password mySecretPass123", "ex-pwd")}
                  className="flex items-center gap-1 text-[#8e93a0] hover:text-white transition-colors cursor-pointer shrink-0"
                  title="Copy command"
                >
                  {copiedCmd === "ex-pwd" ? (
                    <>
                      <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[10px] text-emerald-400 font-sans">Copied</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-sans">Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-(--text-muted) leading-relaxed">
                Requires all joining collaborators to enter this passphrase before accessing the terminal output.
              </p>
            </div>

            {/* Example 3: Read-Only */}
            <div className="p-4 rounded-lg border border-(--border-color) bg-(--card-bg) space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-(--foreground)">3. Read-Only Broadcast Mode</span>
              </div>
              <div className="px-3.5 py-2.5 rounded-lg border border-[#232630] bg-[#0c0d12] font-mono text-xs text-[#f1f1f1] flex items-center justify-between gap-2 selection:bg-white/25 selection:text-white">
                <div className="flex items-center gap-2 overflow-x-auto">
                  <span className="text-[#555a68] select-none font-semibold">$</span>
                  <code className="text-[#f1f1f1] font-mono">lmesh share --readonly</code>
                </div>
                <button
                  onClick={() => handleCopy("lmesh share --readonly", "ex-ro")}
                  className="flex items-center gap-1 text-[#8e93a0] hover:text-white transition-colors cursor-pointer shrink-0"
                  title="Copy command"
                >
                  {copiedCmd === "ex-ro" ? (
                    <>
                      <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[10px] text-emerald-400 font-sans">Copied</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-sans">Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-(--text-muted) leading-relaxed">
                Collaborators join strictly as viewers. Remote control requests and keyboard input are disabled.
              </p>
            </div>

            {/* Example 4: Direct Cloud Relay */}
            <div className="p-4 rounded-lg border border-(--border-color) bg-(--card-bg) space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-(--foreground)">4. Cloud Relay Connection</span>
              </div>
              <div className="px-3.5 py-2.5 rounded-lg border border-[#232630] bg-[#0c0d12] font-mono text-xs text-[#f1f1f1] flex items-center justify-between gap-2 selection:bg-white/25 selection:text-white">
                <div className="flex items-center gap-2 overflow-x-auto">
                  <span className="text-[#555a68] select-none font-semibold">$</span>
                  <code className="text-[#f1f1f1] font-mono">lmesh share --url wss://relay.yourdomain.com</code>
                </div>
                <button
                  onClick={() => handleCopy("lmesh share --url wss://relay.yourdomain.com", "ex-url")}
                  className="flex items-center gap-1 text-[#8e93a0] hover:text-white transition-colors cursor-pointer shrink-0"
                  title="Copy command"
                >
                  {copiedCmd === "ex-url" ? (
                    <>
                      <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[10px] text-emerald-400 font-sans">Copied</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-sans">Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-(--text-muted) leading-relaxed">
                Connects directly to your hosted production relay server and prints the production web URL (<code className="font-mono text-(--foreground)">https://lmesh.vercel.app/[id]</code>).
              </p>
            </div>
          </div>
        </section>

        {/* lmesh whoami */}
        <section id="cli-whoami" className="pt-14 space-y-4 scroll-mt-20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-(--foreground) font-mono">
              lmesh whoami
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-(--border-color) bg-(--card-bg) text-(--text-subtle)">
              utility
            </span>
          </div>
          <p className="text-sm text-(--text-muted) leading-relaxed">
            Inspects your local credentials configuration and outputs the active GitHub username, user ID, and auth status.
          </p>

          <div className="rounded-xl border border-[#232630] bg-[#0c0d12] overflow-hidden text-[#ededed] selection:bg-white/25 selection:text-white">
            <div className="flex items-center justify-between border-b border-[#1f212a] px-4 py-2.5 bg-[#13151c] text-xs font-mono select-none">
              <span className="text-[#8e93a0] text-[11px] font-medium">bash</span>
              <button
                onClick={() => handleCopy("lmesh whoami", "cmd-whoami")}
                className="flex items-center gap-1.5 text-[#8e93a0] hover:text-white transition-colors cursor-pointer"
              >
                {copiedCmd === "cmd-whoami" ? (
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
              <code className="text-[#f1f1f1] font-mono tracking-tight">lmesh whoami</code>
            </div>
          </div>
        </section>

        {/* lmesh logout */}
        <section id="cli-logout" className="pt-14 space-y-4 scroll-mt-20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-(--foreground) font-mono">
              lmesh logout
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-(--border-color) bg-(--card-bg) text-(--text-subtle)">
              utility
            </span>
          </div>
          <p className="text-sm text-(--text-muted) leading-relaxed">
            Safely removes the stored JWT token and user profile from <code className="font-mono text-(--foreground) bg-(--card-bg) px-1.5 py-0.5 rounded border border-(--border-color)">~/.lmesh/auth.json</code>.
          </p>

          <div className="rounded-xl border border-[#232630] bg-[#0c0d12] overflow-hidden text-[#ededed] selection:bg-white/25 selection:text-white">
            <div className="flex items-center justify-between border-b border-[#1f212a] px-4 py-2.5 bg-[#13151c] text-xs font-mono select-none">
              <span className="text-[#8e93a0] text-[11px] font-medium">bash</span>
              <button
                onClick={() => handleCopy("lmesh logout", "cmd-logout")}
                className="flex items-center gap-1.5 text-[#8e93a0] hover:text-white transition-colors cursor-pointer"
              >
                {copiedCmd === "cmd-logout" ? (
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
              <code className="text-[#f1f1f1] font-mono tracking-tight">lmesh logout</code>
            </div>
          </div>
        </section>

        {/* Command Flags Reference Table */}
        <section id="cli-flags" className="pt-14 space-y-4 scroll-mt-20">
          <h2 className="text-xl font-bold tracking-tight text-(--foreground)">
            Command Flags & Options
          </h2>
          <p className="text-sm text-(--text-muted) leading-relaxed">
            Summary of all command-line flags accepted by <code className="font-mono text-(--foreground) bg-(--card-bg) px-1.5 py-0.5 rounded border border-(--border-color)">lmesh share</code>:
          </p>

          <div className="rounded-lg border border-(--border-color) overflow-hidden bg-(--card-bg)">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans min-w-155">
                <thead className="bg-(--background)/50 border-b border-(--border-color) font-mono text-[11px] uppercase tracking-wider text-(--text-subtle)">
                  <tr>
                    <th className="py-3 px-4 whitespace-nowrap w-35">Flag</th>
                    <th className="py-3 px-4 whitespace-nowrap w-17.5">Alias</th>
                    <th className="py-3 px-4 whitespace-nowrap w-20">Type</th>
                    <th className="py-3 px-4 whitespace-nowrap w-22.5">Default</th>
                    <th className="py-3 px-4 min-w-60">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border-color) text-(--text-muted)">
                  <tr>
                    <td className="py-3 px-4 font-mono font-semibold text-(--foreground) whitespace-nowrap">--port</td>
                    <td className="py-3 px-4 font-mono whitespace-nowrap">-p</td>
                    <td className="py-3 px-4 font-mono text-(--text-subtle) whitespace-nowrap">number</td>
                    <td className="py-3 px-4 font-mono text-(--text-subtle) whitespace-nowrap">3001</td>
                    <td className="py-3 px-4">Port of the relay WebSocket server.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono font-semibold text-(--foreground) whitespace-nowrap">--host</td>
                    <td className="py-3 px-4 font-mono whitespace-nowrap">-h</td>
                    <td className="py-3 px-4 font-mono text-(--text-subtle) whitespace-nowrap">string</td>
                    <td className="py-3 px-4 font-mono text-(--text-subtle) whitespace-nowrap">localhost</td>
                    <td className="py-3 px-4">Hostname of the relay WebSocket server.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono font-semibold text-(--foreground) whitespace-nowrap">--url</td>
                    <td className="py-3 px-4 font-mono whitespace-nowrap">-u</td>
                    <td className="py-3 px-4 font-mono text-(--text-subtle) whitespace-nowrap">string</td>
                    <td className="py-3 px-4 font-mono text-(--text-subtle) whitespace-nowrap">none</td>
                    <td className="py-3 px-4">Direct WebSocket URL override (e.g. wss://relay.example.com).</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono font-semibold text-(--foreground) whitespace-nowrap">--password</td>
                    <td className="py-3 px-4 font-mono whitespace-nowrap">-w</td>
                    <td className="py-3 px-4 font-mono text-(--text-subtle) whitespace-nowrap">string</td>
                    <td className="py-3 px-4 font-mono text-(--text-subtle) whitespace-nowrap">none</td>
                    <td className="py-3 px-4">Passphrase required for collaborators to join the session.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono font-semibold text-(--foreground) whitespace-nowrap">--readonly</td>
                    <td className="py-3 px-4 font-mono whitespace-nowrap">-r</td>
                    <td className="py-3 px-4 font-mono text-(--text-subtle) whitespace-nowrap">boolean</td>
                    <td className="py-3 px-4 font-mono text-(--text-subtle) whitespace-nowrap">false</td>
                    <td className="py-3 px-4">Start session in read-only broadcast mode (no control requests).</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono font-semibold text-(--foreground) whitespace-nowrap">--help</td>
                    <td className="py-3 px-4 font-mono whitespace-nowrap">-h</td>
                    <td className="py-3 px-4 font-mono text-(--text-subtle) whitespace-nowrap">boolean</td>
                    <td className="py-3 px-4 font-mono text-(--text-subtle) whitespace-nowrap">false</td>
                    <td className="py-3 px-4">Print usage guide and options list to stdout.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono font-semibold text-(--foreground) whitespace-nowrap">--version</td>
                    <td className="py-3 px-4 font-mono whitespace-nowrap">-V</td>
                    <td className="py-3 px-4 font-mono text-(--text-subtle) whitespace-nowrap">boolean</td>
                    <td className="py-3 px-4 font-mono text-(--text-subtle) whitespace-nowrap">false</td>
                    <td className="py-3 px-4">Display the installed CLI version number.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Bottom Section 2 Navigation */}
        <div className="pt-12 border-t border-(--border-color) flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/docs"
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-(--border-color) bg-(--card-bg) hover:bg-(--card-hover) text-(--foreground) font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Previous: Quick Start</span>
          </Link>

          <Link
            href="/docs/controls"
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-(--btn-bg) text-(--btn-fg) font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-xs"
          >
            <span>Next: Controls & Hotkeys</span>
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
            <a href="#cli-overview" onClick={(e) => scrollToHeading(e, "cli-overview")} className="hover:text-(--foreground) transition-colors block">
              Command Syntax
            </a>
          </li>
          <li>
            <a href="#cli-login" onClick={(e) => scrollToHeading(e, "cli-login")} className="hover:text-(--foreground) transition-colors block">
              lmesh login
            </a>
          </li>
          <li>
            <a href="#cli-share" onClick={(e) => scrollToHeading(e, "cli-share")} className="hover:text-(--foreground) transition-colors block">
              lmesh share
            </a>
          </li>
          <li>
            <a href="#cli-whoami" onClick={(e) => scrollToHeading(e, "cli-whoami")} className="hover:text-(--foreground) transition-colors block">
              lmesh whoami
            </a>
          </li>
          <li>
            <a href="#cli-logout" onClick={(e) => scrollToHeading(e, "cli-logout")} className="hover:text-(--foreground) transition-colors block">
              lmesh logout
            </a>
          </li>
          <li>
            <a href="#cli-flags" onClick={(e) => scrollToHeading(e, "cli-flags")} className="hover:text-(--foreground) transition-colors block">
              Options Reference
            </a>
          </li>
        </ul>
      </aside>
    </div>
  );
}
