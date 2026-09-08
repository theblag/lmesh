"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HostDashboard } from "../components/HostDashboard";
import { ThemeProvider } from "../components/ThemeContext";
import { ThemeToggle } from "../components/ThemeToggle";
import {
  GitHubLogoIcon,
  HomeIcon,
  ArrowLeftIcon,
  PersonIcon
} from "@radix-ui/react-icons";
import { SERVER_URL } from "../lib/config";

interface UserProfile {
  id?: string;
  username: string;
  avatar_url?: string;
  avatarUrl?: string;
  email?: string;
}

interface DashboardStats {
  totalSessions: number;
  activeSessions: number;
  totalCollaborators: number;
}

export default function DashboardPage() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("lmesh_auth_token");
      if (savedToken) {
        setAuthToken(savedToken);
      } else {
        setUserProfile({
          username: "octocat",
          avatar_url: "https://github.com/octocat.png"
        });
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (authToken) {
      fetch(`${SERVER_URL}/api/dashboard/stats`, {
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
          if (data.stats) {
            setStats(data.stats);
          }
        })
        .catch(() => {
          setUserProfile({
            username: "octocat",
            avatar_url: "https://github.com/octocat.png"
          });
        })
        .finally(() => setIsLoading(false));
    }
  }, [authToken]);



  const handleLogout = () => {
    localStorage.removeItem("lmesh_auth_token");
    setAuthToken(null);
    setUserProfile(null);
  };

  return (
    <ThemeProvider>
      <div className="w-full min-h-screen bg-(--background) text-(--foreground) bg-grid-pattern relative flex flex-col items-center justify-between selection:bg-(--selection-bg) selection:text-(--selection-fg) overflow-x-hidden transition-colors duration-200">
        
        {/* Top Glow Accent */}
        <div className="absolute top-[-10%] left-[50%] translate-x-[-50%] w-150 h-75 bg-(--glow-color) rounded-full blur-[120px] pointer-events-none" />

        {/* Header Navigation */}
        <header className="w-full max-w-5xl px-4 sm:px-8 h-16 flex items-center justify-between border-b border-(--border-subtle) z-10">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs text-(--text-muted) hover:text-(--foreground) transition-colors font-sans"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <span className="text-(--border-color)">|</span>
            <div className="flex items-center gap-2">
              <img src="/lmesh-logo.png" alt="LMESH Logo" className="w-5 h-5 object-contain" />
              <span className="font-mono text-sm tracking-widest uppercase font-semibold text-(--foreground)">lmesh</span>
              <span className="text-xs font-sans text-(--text-subtle) px-2 py-0.5 rounded bg-(--card-bg) border border-(--border-color)">
                Dashboard
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-4">
            {userProfile ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {userProfile.username ? (
                    <img
                      src={`https://github.com/${userProfile.username}.png`}
                      alt={userProfile.username}
                      className="w-6 h-6 rounded-full border border-(--border-color)"
                    />
                  ) : (
                    <PersonIcon className="w-4 h-4 text-(--foreground)" />
                  )}


                  <span className="text-xs font-semibold text-(--foreground)">@{userProfile.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs text-(--text-subtle) hover:text-(--foreground) transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs font-semibold text-(--btn-fg) bg-(--btn-bg) hover:opacity-90 px-3 py-1.5 rounded-lg transition-opacity flex items-center gap-1.5 shadow-xs font-sans"
              >
                <GitHubLogoIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
            <ThemeToggle />
          </nav>
        </header>

        {/* Dashboard Main Content */}
        <main className="w-full flex-1 flex flex-col items-center z-10 py-6">
          <HostDashboard userProfile={userProfile || undefined} authToken={authToken} stats={stats} isLoading={isLoading} />
        </main>




        {/* Minimal Dashboard Footer */}
        <footer className="w-full max-w-5xl px-4 sm:px-8 py-6 border-t border-(--border-subtle) flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-(--text-subtle) font-sans z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-mono text-[11px] uppercase tracking-wider">LMESH Console</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>© {new Date().getFullYear()} LMESH</span>
            <span>•</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-(--foreground) transition-colors"
            >
              GitHub
            </a>
            <span>•</span>
            <Link href="/" className="hover:text-(--foreground) transition-colors">
              Home
            </Link>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}
