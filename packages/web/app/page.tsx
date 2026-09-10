"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TerminalSimulation } from "./components/TerminalSimulation";
import { FeaturesSection } from "./components/FeaturesSection";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { UseCasesSection } from "./components/UseCasesSection";
import { Footer } from "./components/Footer";
import { ThemeProvider } from "./components/ThemeContext";
import { ThemeToggle } from "./components/ThemeToggle";
import {
  ArrowRightIcon,
  CheckIcon,
  CopyIcon,
  GitHubLogoIcon,
  PersonIcon
} from "@radix-ui/react-icons";
import { SERVER_URL } from "./lib/config";

interface UserProfile {
  id?: string;
  username: string;
  avatar_url?: string;
  email?: string;
}

export default function Home() {
  const [sessionId, setSessionId] = useState("");
  const [copied, setCopied] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 1. Check for token in URL query parameter (OAuth callback redirect)
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get("token");

      if (tokenFromUrl) {
        localStorage.setItem("lmesh_auth_token", tokenFromUrl);
        setAuthToken(tokenFromUrl);
        // Clean URL query parameter
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        const savedToken = localStorage.getItem("lmesh_auth_token");
        if (savedToken) {
          setAuthToken(savedToken);
        }
      }
    }
  }, []);

  useEffect(() => {
    // 2. Fetch authenticated profile if token is available
    if (authToken) {
      fetch(`${SERVER_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })
        .then((res) => {
          if (!res.ok) throw new Error("Invalid token");
          return res.json();
        })
        .then((data) => {
          if (data.user) {
            setUserProfile(data.user);
          }
        })
        .catch(() => {
          // Token invalid or expired
          localStorage.removeItem("lmesh_auth_token");
          setAuthToken(null);
          setUserProfile(null);
        });
    }
  }, [authToken]);

  const handleLogout = () => {
    localStorage.removeItem("lmesh_auth_token");
    setAuthToken(null);
    setUserProfile(null);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionId.trim()) {
      router.push(`/${sessionId.trim()}`);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText("npm install -g lmesh");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ThemeProvider>
      <div className="w-full min-h-screen bg-(--background) text-(--foreground) bg-grid-pattern relative flex flex-col items-center justify-between selection:bg-(--selection-bg) selection:text-(--selection-fg) overflow-x-hidden transition-colors duration-200">

        {/* Subtle background glow */}
        <div className="absolute top-[-10%] left-[50%] translate-x-[-50%] w-150 h-75 bg-(--glow-color) rounded-full blur-[120px] pointer-events-none" />

        {/* Header */}
        <header className="w-full max-w-5xl px-4 sm:px-8 h-16 flex items-center justify-between border-b border-(--border-subtle) z-10">
          <Link href="/" className="flex items-center">
            <img src="/lmesh-logo-favicon.png" alt="LMESH" className="h-8 sm:h-9 w-auto object-contain theme-logo" />
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/docs"
              className="text-xs text-(--text-muted) hover:text-(--foreground) transition-colors font-sans tracking-tight"
            >
              Docs
            </Link>
            <Link
              href="/dashboard"
              className="text-xs text-(--text-muted) hover:text-(--foreground) transition-colors font-sans tracking-tight"
            >
              Dashboard
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-(--text-muted) hover:text-(--foreground) transition-colors font-sans tracking-tight flex items-center gap-1.5"
            >
              <GitHubLogoIcon className="w-3.5 h-3.5" />
              GitHub
            </a>
            {userProfile ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-xs font-semibold text-(--foreground) bg-(--card-bg) border border-(--border-color) px-3 py-1.5 rounded-lg hover:bg-(--card-hover) transition-colors"
              >
                {userProfile.avatar_url ? (
                  <img src={userProfile.avatar_url} alt={userProfile.username} className="w-4 h-4 rounded-full" />
                ) : (
                  <PersonIcon className="w-3.5 h-3.5" />
                )}
                <span>@{userProfile.username}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-xs font-semibold text-(--btn-fg) bg-(--btn-bg) hover:opacity-90 px-3.5 py-1.5 rounded-lg transition-opacity flex items-center gap-1.5 shadow-xs"
              >
                <span>Sign In</span>
                <ArrowRightIcon className="w-3 h-3" />
              </Link>
            )}
            <ThemeToggle />
          </nav>
        </header>

        {/* Hero Section */}
        <main className="w-full max-w-5xl px-4 sm:px-8 py-12 md:pt-24 md:pb-16 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center z-10">

          {/* Left Copy */}
          <div className="md:col-span-6 space-y-8 text-left">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter leading-none text-(--foreground) font-sans">
                Live multi-user execution shell.
              </h1>
              <p className="text-(--text-muted) text-sm md:text-base leading-relaxed max-w-[45ch] font-sans">
                Share your terminal instantly over secure WebSockets. Allow collaborators to view or type directly from their browsers.
              </p>
            </div>

            {/* Quick copy command */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-(--text-subtle)">Install the tool</span>
              <div className="flex items-center justify-between bg-(--card-bg) border border-(--border-color) rounded-md px-4 py-3 font-mono text-xs max-w-sm">
                <span className="text-(--foreground) font-medium">npm install -g lmesh</span>
                <button
                  onClick={handleCopy}
                  className="text-(--text-subtle) hover:text-(--foreground) transition-colors cursor-pointer"
                  title="Copy install command"
                >
                  {copied ? <CheckIcon className="w-4 h-4 text-(--foreground)" /> : <CopyIcon className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[10px] font-mono text-(--text-subtle)">Then run: <code className="text-(--text-muted)">lmesh share</code></span>
            </div>

            {/* Join Session Box */}
            <div className="border-t border-(--border-color) pt-8 max-w-sm">
              <form onSubmit={handleJoin} className="space-y-3">
                <label htmlFor="session-input" className="block text-[10px] font-mono uppercase tracking-wider text-(--text-subtle)">
                  Join a session
                </label>
                <div className="flex gap-2">
                  <input
                    id="session-input"
                    type="text"
                    placeholder="Enter session ID (e.g. x7k2m9p)"
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    className="flex-1 bg-(--card-bg) border border-(--border-color) rounded-md px-3.5 py-2.5 font-mono text-xs text-(--foreground) placeholder:text-(--text-subtle) focus:outline-none focus:border-(--foreground) transition-colors min-w-0"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-(--btn-bg) hover:opacity-90 text-(--btn-fg) px-4 py-2.5 rounded-md font-mono text-xs font-semibold flex items-center gap-1.5 transition-opacity cursor-pointer shrink-0"
                  >
                    Join
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>

            {/* Host Authentication / Developer Access */}
            <div className="border-t border-(--border-color) pt-6 max-w-sm space-y-3 font-sans">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-(--text-subtle) font-medium">
                  Host Authentication
                </span>
                <span className="text-[11px] text-emerald-400 font-medium">CLI OAuth</span>
              </div>

              <div className="p-4 rounded-lg bg-(--card-bg) border border-(--border-color) space-y-3">
                {userProfile ? (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {userProfile.avatar_url ? (
                          <img
                            src={userProfile.avatar_url}
                            alt={userProfile.username}
                            className="w-6 h-6 rounded-full border border-(--border-color)"
                          />
                        ) : (
                          <PersonIcon className="w-4 h-4 text-emerald-400" />
                        )}
                        <span className="font-semibold text-(--foreground)">@{userProfile.username}</span>
                      </div>
                      <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                        Authenticated
                      </span>
                    </div>
                    <p className="text-xs text-(--text-muted) leading-relaxed">
                      Your identity is active. View your hosted rooms and management options on your dashboard.
                    </p>
                    <div className="flex gap-2">
                      <Link
                        href="/dashboard"
                        className="flex-1 py-2 px-3 rounded bg-(--btn-bg) text-(--btn-fg) font-semibold text-xs text-center hover:opacity-90 transition-opacity"
                      >
                        Open Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="py-2 px-3 rounded border border-(--border-color) hover:bg-(--card-hover) text-(--text-muted) hover:text-(--foreground) text-xs transition-colors cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-(--text-muted) leading-relaxed">
                      Authenticate your GitHub identity to host terminal sessions and view your room dashboard.
                    </p>
                    <div className="space-y-2">
                      <Link
                        href="/login"
                        className="w-full py-2.5 px-4 rounded-md bg-(--btn-bg) text-(--btn-fg) hover:opacity-90 text-xs font-semibold flex items-center justify-center gap-2 transition-opacity cursor-pointer shadow-xs font-sans"
                      >
                        <GitHubLogoIcon className="w-4 h-4" />
                        <span>Login with GitHub</span>
                      </Link>

                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Simulated Terminal */}
          <div className="md:col-span-6 w-full flex items-center justify-center min-w-0">
            <TerminalSimulation />
          </div>
        </main>

        {/* Additional Sections */}
        <FeaturesSection />
        <HowItWorksSection />
        <UseCasesSection />

        {/* Footer */}
        <Footer />
      </div>
    </ThemeProvider>
  );
}

