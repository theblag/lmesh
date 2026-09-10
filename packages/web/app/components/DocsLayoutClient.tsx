"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "./ThemeContext";
import { ThemeToggle } from "./ThemeToggle";
import {
  GitHubLogoIcon,
  HamburgerMenuIcon,
  Cross2Icon
} from "@radix-ui/react-icons";
import { Footer } from "./Footer";

export function DocsLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isQuickstart = pathname === "/docs";
  const isCli = pathname === "/docs/cli";
  const isControls = pathname === "/docs/controls";
  const isArchitecture = pathname === "/docs/architecture";

  // Reset window scroll position when pathname changes, or scroll to hash if present
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const targetId = window.location.hash.replace("#", "");
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        setTimeout(() => {
          targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 80);
        return;
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    const [targetPath, hash] = href.split("#");
    if (!hash) {
      if (mobileMenuOpen) setMobileMenuOpen(false);
      return;
    }

    if (!targetPath || targetPath === pathname) {
      e.preventDefault();
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.pushState(null, "", `#${hash}`);
      }
      if (mobileMenuOpen) setMobileMenuOpen(false);
    } else {
      if (mobileMenuOpen) setMobileMenuOpen(false);
    }
  };

  const handleSectionClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string
  ) => {
    if (pathname === path) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.pushState(null, "", path);
      if (mobileMenuOpen) setMobileMenuOpen(false);
    } else {
      if (mobileMenuOpen) setMobileMenuOpen(false);
    }
  };

  return (
    <ThemeProvider>
      <div className="w-full min-h-screen bg-(--background) text-(--foreground) bg-grid-pattern relative flex flex-col selection:bg-(--selection-bg) selection:text-(--selection-fg) transition-colors duration-200">

        {/* Subtle background glow */}
        <div className="absolute top-[-10%] left-[50%] translate-x-[-50%] w-150 h-75 bg-(--glow-color) rounded-full blur-[120px] pointer-events-none" />

        {/* Top Navbar */}
        <header className="sticky top-0 w-full h-16 shrink-0 border-b border-(--border-color) bg-(--background)/90 backdrop-blur-md z-40 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-md text-(--text-muted) hover:text-(--foreground) border border-(--border-color)"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <Cross2Icon className="w-4 h-4" /> : <HamburgerMenuIcon className="w-4 h-4" />}
            </button>
            <Link href="/" className="flex items-center">
              <img src="/lmesh-logo-favicon.png" alt="LMESH" className="h-8 sm:h-9 w-auto object-contain theme-logo" />
            </Link>
            <span className="hidden sm:inline-block text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-(--border-color) bg-(--card-bg) text-(--text-muted)">
              docs
            </span>
          </div>

          <nav className="flex items-center gap-3 sm:gap-6 text-xs font-sans">
            <Link
              href="/"
              className="text-(--text-muted) hover:text-(--foreground) transition-colors hidden sm:inline-block"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="text-(--text-muted) hover:text-(--foreground) transition-colors"
            >
              Dashboard
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-(--text-muted) hover:text-(--foreground) transition-colors flex items-center gap-1.5"
            >
              <GitHubLogoIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <ThemeToggle />
          </nav>
        </header>

        {/* Docs Container */}
        <div className="w-full max-w-7xl mx-auto flex-1 flex px-4 sm:px-8">

          {/* Left Sidebar Navigation */}
          <aside
            className={`fixed md:sticky top-16 z-30 w-64 shrink-0 h-[calc(100vh-4rem)] overflow-y-auto docs-scrollbar bg-(--background) md:bg-transparent pt-8 pb-12 pr-6 transition-transform duration-200 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
              }`}
          >
            <div className="space-y-8 font-sans text-xs">

              {/* Section 1: Getting Started */}
              <div>
                <Link
                  href="/docs"
                  onClick={(e) => handleSectionClick(e, "/docs")}
                  className={`font-mono text-[11px] uppercase tracking-wider font-semibold mb-3 flex items-center justify-between transition-colors ${isQuickstart ? "text-(--foreground)" : "text-(--text-subtle) hover:text-(--foreground)"
                    }`}
                >
                  <span>1. Getting Started</span>
                </Link>

                <ul className="space-y-1.5 border-l border-(--border-color) pl-3">
                  <li>
                    <Link
                      href="/docs#overview"
                      onClick={(e) => handleAnchorClick(e, "/docs#overview")}
                      className={`block py-0.5 transition-colors ${isQuickstart
                          ? "text-(--foreground) font-medium border-l-2 border-(--foreground) -ml-[13px] pl-3"
                          : "text-(--text-muted) hover:text-(--foreground)"
                        }`}
                    >
                      Quick Start
                    </Link>
                  </li>
                  {isQuickstart && (
                    <>
                      <li>
                        <a
                          href="/docs#prerequisites"
                          onClick={(e) => handleAnchorClick(e, "/docs#prerequisites")}
                          className="block text-(--text-muted) hover:text-(--foreground) py-0.5 transition-colors"
                        >
                          Prerequisites
                        </a>
                      </li>
                      <li>
                        <a
                          href="/docs#installation"
                          onClick={(e) => handleAnchorClick(e, "/docs#installation")}
                          className="block text-(--text-muted) hover:text-(--foreground) py-0.5 transition-colors"
                        >
                          Installation
                        </a>
                      </li>
                      <li>
                        <a
                          href="/docs#authentication"
                          onClick={(e) => handleAnchorClick(e, "/docs#authentication")}
                          className="block text-(--text-muted) hover:text-(--foreground) py-0.5 transition-colors"
                        >
                          Authentication
                        </a>
                      </li>
                      <li>
                        <a
                          href="/docs#first-session"
                          onClick={(e) => handleAnchorClick(e, "/docs#first-session")}
                          className="block text-(--text-muted) hover:text-(--foreground) py-0.5 transition-colors"
                        >
                          Starting a Session
                        </a>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* Section 2: CLI Reference */}
              <div>
                <Link
                  href="/docs/cli"
                  onClick={(e) => handleSectionClick(e, "/docs/cli")}
                  className={`font-mono text-[11px] uppercase tracking-wider font-semibold mb-3 flex items-center justify-between transition-colors ${isCli ? "text-(--foreground)" : "text-(--text-subtle) hover:text-(--foreground)"
                    }`}
                >
                  <span>2. CLI Reference</span>
                </Link>

                <ul className="space-y-1.5 border-l border-(--border-color) pl-3">
                  <li>
                    <Link
                      href="/docs/cli"
                      onClick={(e) => handleSectionClick(e, "/docs/cli")}
                      className={`block py-0.5 transition-colors ${isCli
                          ? "text-(--foreground) font-medium border-l-2 border-(--foreground) -ml-[13px] pl-3"
                          : "text-(--text-muted) hover:text-(--foreground)"
                        }`}
                    >
                      Command Overview
                    </Link>
                  </li>
                  {isCli && (
                    <>
                      <li>
                        <a
                          href="/docs/cli#cli-login"
                          onClick={(e) => handleAnchorClick(e, "/docs/cli#cli-login")}
                          className="block text-(--text-muted) hover:text-(--foreground) py-0.5 transition-colors"
                        >
                          lmesh login
                        </a>
                      </li>
                      <li>
                        <a
                          href="/docs/cli#cli-share"
                          onClick={(e) => handleAnchorClick(e, "/docs/cli#cli-share")}
                          className="block text-(--text-muted) hover:text-(--foreground) py-0.5 transition-colors"
                        >
                          lmesh share
                        </a>
                      </li>
                      <li>
                        <a
                          href="/docs/cli#cli-whoami"
                          onClick={(e) => handleAnchorClick(e, "/docs/cli#cli-whoami")}
                          className="block text-(--text-muted) hover:text-(--foreground) py-0.5 transition-colors"
                        >
                          lmesh whoami
                        </a>
                      </li>
                      <li>
                        <a
                          href="/docs/cli#cli-logout"
                          onClick={(e) => handleAnchorClick(e, "/docs/cli#cli-logout")}
                          className="block text-(--text-muted) hover:text-(--foreground) py-0.5 transition-colors"
                        >
                          lmesh logout
                        </a>
                      </li>
                      <li>
                        <a
                          href="/docs/cli#cli-flags"
                          onClick={(e) => handleAnchorClick(e, "/docs/cli#cli-flags")}
                          className="block text-(--text-muted) hover:text-(--foreground) py-0.5 transition-colors"
                        >
                          Command Flags
                        </a>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* Section 3: Controls & Hotkeys */}
              <div>
                <Link
                  href="/docs/controls"
                  onClick={(e) => handleSectionClick(e, "/docs/controls")}
                  className={`font-mono text-[11px] uppercase tracking-wider font-semibold mb-3 flex items-center justify-between transition-colors ${isControls ? "text-(--foreground)" : "text-(--text-subtle) hover:text-(--foreground)"
                    }`}
                >
                  <span>3. Controls & Hotkeys</span>
                </Link>

                <ul className="space-y-1.5 border-l border-(--border-color) pl-3">
                  <li>
                    <Link
                      href="/docs/controls"
                      onClick={(e) => handleSectionClick(e, "/docs/controls")}
                      className={`block py-0.5 transition-colors ${isControls
                          ? "text-(--foreground) font-medium border-l-2 border-(--foreground) -ml-[13px] pl-3"
                          : "text-(--text-muted) hover:text-(--foreground)"
                        }`}
                    >
                      Hotkey Matrix
                    </Link>
                  </li>
                  {isControls && (
                    <>
                      <li>
                        <a
                          href="/docs/controls#safety-mode"
                          onClick={(e) => handleAnchorClick(e, "/docs/controls#safety-mode")}
                          className="block text-(--text-muted) hover:text-(--foreground) py-0.5 transition-colors"
                        >
                          Safety Mode (Ctrl+S)
                        </a>
                      </li>
                      <li>
                        <a
                          href="/docs/controls#session-termination"
                          onClick={(e) => handleAnchorClick(e, "/docs/controls#session-termination")}
                          className="block text-(--text-muted) hover:text-(--foreground) py-0.5 transition-colors"
                        >
                          Termination (Ctrl+])
                        </a>
                      </li>
                      <li>
                        <a
                          href="/docs/controls#terminal-sync"
                          onClick={(e) => handleAnchorClick(e, "/docs/controls#terminal-sync")}
                          className="block text-(--text-muted) hover:text-(--foreground) py-0.5 transition-colors"
                        >
                          Viewport Sync
                        </a>
                      </li>
                      <li>
                        <a
                          href="/docs/controls#control-handover"
                          onClick={(e) => handleAnchorClick(e, "/docs/controls#control-handover")}
                          className="block text-(--text-muted) hover:text-(--foreground) py-0.5 transition-colors"
                        >
                          Token Handover
                        </a>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* Section 4: Architecture */}
              <div>
                <Link
                  href="/docs/architecture"
                  onClick={(e) => handleSectionClick(e, "/docs/architecture")}
                  className={`font-mono text-[11px] uppercase tracking-wider font-semibold mb-3 flex items-center justify-between transition-colors ${isArchitecture ? "text-(--foreground)" : "text-(--text-subtle) hover:text-(--foreground)"
                    }`}
                >
                  <span>4. Architecture</span>
                </Link>

                <ul className="space-y-1.5 border-l border-(--border-color) pl-3">
                  <li>
                    <Link
                      href="/docs/architecture"
                      onClick={(e) => handleSectionClick(e, "/docs/architecture")}
                      className={`block py-0.5 transition-colors ${isArchitecture
                          ? "text-(--foreground) font-medium border-l-2 border-(--foreground) -ml-[13px] pl-3"
                          : "text-(--text-muted) hover:text-(--foreground)"
                        }`}
                    >
                      Package Ecosystem
                    </Link>
                  </li>
                  {isArchitecture && (
                    <>
                      <li>
                        <a
                          href="/docs/architecture#data-flow"
                          onClick={(e) => handleAnchorClick(e, "/docs/architecture#data-flow")}
                          className="block text-(--text-muted) hover:text-(--foreground) py-0.5 transition-colors"
                        >
                          Data Flow
                        </a>
                      </li>
                      <li>
                        <a
                          href="/docs/architecture#protocol"
                          onClick={(e) => handleAnchorClick(e, "/docs/architecture#protocol")}
                          className="block text-(--text-muted) hover:text-(--foreground) py-0.5 transition-colors"
                        >
                          Wire Protocol
                        </a>
                      </li>
                      <li>
                        <a
                          href="/docs/architecture#security-model"
                          onClick={(e) => handleAnchorClick(e, "/docs/architecture#security-model")}
                          className="block text-(--text-muted) hover:text-(--foreground) py-0.5 transition-colors"
                        >
                          Security Model
                        </a>
                      </li>
                      <li>
                        <a
                          href="/docs/architecture#scaling"
                          onClick={(e) => handleAnchorClick(e, "/docs/architecture#scaling")}
                          className="block text-(--text-muted) hover:text-(--foreground) py-0.5 transition-colors"
                        >
                          Horizontal Scaling
                        </a>
                      </li>
                    </>
                  )}
                </ul>
              </div>

            </div>
          </aside>

          {/* Dynamic Page Content */}
          <div className="flex-1 min-w-0 flex">
            {children}
          </div>

        </div>

        {/* Full-width Footer across the entire page */}
        <Footer />

      </div>
    </ThemeProvider>
  );
}
