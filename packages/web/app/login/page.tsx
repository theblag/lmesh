"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeProvider } from "../components/ThemeContext";
import { ThemeToggle } from "../components/ThemeToggle";
import {
  GitHubLogoIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  UpdateIcon,
  PersonIcon,
  DesktopIcon
} from "@radix-ui/react-icons";
import { SERVER_URL } from "../lib/config";
import { ParticleNetworkCanvas } from "../components/ParticleNetworkCanvas";

interface UserProfile {
  id?: string;
  username: string;
  avatar_url?: string;
  email?: string;
}

export default function LoginPage() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [deviceCode, setDeviceCode] = useState("");
  const [deviceStatus, setDeviceStatus] = useState<{
    type: "loading" | "success" | "error";
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("lmesh_auth_token");
      if (savedToken) {
        setAuthToken(savedToken);
        fetch(`${SERVER_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${savedToken}`
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
            localStorage.removeItem("lmesh_auth_token");
            setAuthToken(null);
            setUserProfile(null);
          })
          .finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("lmesh_auth_token");
    setAuthToken(null);
    setUserProfile(null);
  };

  const handleDeviceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = deviceCode.trim().toUpperCase();
    if (!code) return;

    setDeviceStatus({ type: "loading", message: "Verifying device code with server..." });
    setIsSubmitting(true);

    try {
      const res = await fetch(`${SERVER_URL}/api/auth/device/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_code: code }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDeviceStatus({
          type: "error",
          message: data.error || "Unable to authorize device. This is on us - please try again in a few moments."
        });
        return;
      }

      setDeviceStatus({
        type: "success",
        message: "Device authorized! You can now return to your CLI session."
      });
    } catch (err: any) {
      // Network error when server is offline or connection refused
      setDeviceStatus({
        type: "error",
        message: "Unable to reach server. This is on us - please try again in a few moments."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemeProvider>
      {/* Full-Page Split Layout (No container card, spans full screen width & height) */}
      <div className="w-full min-h-screen bg-(--background) text-(--foreground) grid grid-cols-1 md:grid-cols-12 overflow-x-hidden font-sans selection:bg-(--selection-bg) selection:text-(--selection-fg) transition-colors duration-200">

        {/* LEFT COLUMN (Form Area - 7 cols on desktop) */}
        <div className="md:col-span-7 flex flex-col justify-between p-6 sm:p-10 md:p-14 z-10 min-h-screen bg-(--background)">

          {/* Header Row */}
          <header className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-1.5 text-xs text-(--text-muted) hover:text-(--foreground) transition-colors font-medium"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
              <span className="text-(--border-color)">|</span>
              <Link href="/" className="flex items-center">
                <img src="/lmesh-logo-favicon.png" alt="LMESH" className="h-8 sm:h-9 w-auto object-contain theme-logo" />
              </Link>
            </div>

            <ThemeToggle />
          </header>

          {/* Centered Sign-In Content (Matching Reference Image Layout) */}
          <main className="my-auto max-w-md w-full mx-auto space-y-8 py-8">

            {/* Top Brand Logo Icon Badge */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-(--card-bg) border border-(--border-color) flex items-center justify-center shadow-xs p-3">
                <img src="/lmesh-logo-favicon.png" alt="LMESH" className="w-full h-full object-contain theme-logo" />
              </div>

              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-(--foreground)">
                  Welcome back!
                </h1>
                <p className="text-xs sm:text-sm text-(--text-muted) leading-relaxed">
                  Authenticate your developer profile to host live sessions.
                </p>
              </div>
            </div>

            {userProfile ? (
              /* Authenticated User View */
              <div className="space-y-5 bg-(--card-bg) border border-(--border-color) rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {userProfile.avatar_url ? (
                      <img
                        src={userProfile.avatar_url}
                        alt={userProfile.username}
                        className="w-10 h-10 rounded-full border border-(--border-color)"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                        <PersonIcon className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-semibold text-(--foreground)">@{userProfile.username}</div>
                      <div className="text-xs text-(--text-subtle)">Authenticated Host Account</div>
                    </div>
                  </div>
                  <span className="text-[11px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                    <CheckCircledIcon className="w-3 h-3 text-emerald-400" />
                    Active
                  </span>
                </div>

                <p className="text-xs text-(--text-muted) leading-relaxed">
                  Your identity is authenticated. Manage active terminal sessions and spectating permissions from your dashboard.
                </p>

                <div className="flex gap-3 pt-1">
                  <Link
                    href="/dashboard"
                    className="flex-1 py-3 px-4 rounded-xl bg-(--btn-bg) text-(--btn-fg) font-semibold text-xs text-center transition-opacity hover:opacity-90 flex items-center justify-center gap-2 shadow-xs"
                  >
                    <span>Open Dashboard</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="py-3 px-4 rounded-xl border border-(--border-color) bg-(--background) hover:bg-(--card-hover) text-(--text-muted) hover:text-(--foreground) text-xs font-medium transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              /* Unauthenticated Form Options */
              <div className="space-y-6">

                {/* Sign in with GitHub primary button */}
                <a
                  href={`${SERVER_URL}/api/auth/github`}
                  className="w-full py-3.5 px-5 rounded-xl bg-(--btn-bg) text-(--btn-fg) hover:opacity-90 font-semibold text-sm flex items-center justify-center gap-3 transition-opacity cursor-pointer shadow-xs"
                >
                  <GitHubLogoIcon className="w-5 h-5" />
                  <span>Sign in with GitHub</span>
                </a>

                {/* Divider Line */}
                <div className="relative flex items-center justify-center">
                  <div className="w-full border-t border-(--border-color)" />
                  <span className="absolute bg-(--background) px-3 text-[11px] font-medium text-(--text-subtle) uppercase tracking-wider">
                    Or authorize CLI device
                  </span>
                </div>

                {/* CLI Device Code Form */}
                <form onSubmit={handleDeviceSubmit} className="space-y-3">
                  <label htmlFor="cli-code" className="block text-xs font-medium text-(--text-muted) flex items-center gap-1.5">
                    <DesktopIcon className="w-3.5 h-3.5 text-(--text-subtle)" />
                    <span>Enter CLI Device Code (from <code className="text-(--text-muted) font-mono">lmesh login</code>)</span>
                  </label>

                  <div className="flex gap-2">
                    <input
                      id="cli-code"
                      type="text"
                      placeholder="ABCD-1234"
                      value={deviceCode}
                      onChange={(e) => {
                        setDeviceCode(e.target.value.toUpperCase());
                        if (deviceStatus) setDeviceStatus(null);
                      }}
                      disabled={isSubmitting}
                      className="flex-1 bg-(--card-bg) border border-(--border-color) focus:border-(--foreground) rounded-xl px-4 py-3 text-xs text-(--foreground) placeholder:text-(--text-subtle) focus:outline-none transition-colors tracking-widest uppercase font-mono"
                    />
                    <button
                      type="submit"
                      disabled={!deviceCode.trim() || isSubmitting}
                      className="bg-(--btn-bg) text-(--btn-fg) hover:opacity-90 disabled:opacity-50 px-4 py-3 rounded-xl text-xs font-semibold transition-opacity cursor-pointer shrink-0 flex items-center gap-1.5"
                    >
                      {isSubmitting ? (
                        <>
                          <UpdateIcon className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <span>Authorize</span>
                      )}
                    </button>
                  </div>

                  {deviceStatus && (
                    <div
                      className={`text-xs font-medium flex items-start gap-1.5 pt-1.5 leading-relaxed ${deviceStatus.type === "success"
                          ? "text-emerald-400"
                          : deviceStatus.type === "loading"
                            ? "text-(--text-muted)"
                            : "text-rose-400"
                        }`}
                    >
                      {deviceStatus.type === "success" && (
                        <CheckCircledIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      {deviceStatus.type === "loading" && (
                        <UpdateIcon className="w-4 h-4 animate-spin text-(--text-muted) shrink-0 mt-0.5" />
                      )}
                      {deviceStatus.type === "error" && (
                        <CrossCircledIcon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <span>{deviceStatus.message}</span>
                    </div>
                  )}
                </form>

              </div>
            )}

          </main>

          {/* Footer Row */}
          <footer className="flex items-center justify-between text-xs text-(--text-subtle) pt-4 border-t border-(--border-subtle) w-full">
            <span>© {new Date().getFullYear()} LMESH</span>
            <div className="flex items-center gap-4">
              <Link href="/" className="hover:text-(--foreground) transition-colors">
                Home
              </Link>
              <span>•</span>
              <Link href="/docs" className="hover:text-(--foreground) transition-colors">
                Docs
              </Link>
              <span>•</span>
              <Link href="/dashboard" className="hover:text-(--foreground) transition-colors">
                Dashboard
              </Link>
            </div>
          </footer>

        </div>

        {/* RIGHT COLUMN (Visual Panel - 5 cols on desktop, spans full height) */}
        <div className="hidden md:flex md:col-span-5 relative bg-[#080a10] border-l border-(--border-color) flex-col items-center justify-center p-8 overflow-hidden min-h-screen text-white select-none">

          {/* Interactive Particle Network Canvas */}
          <ParticleNetworkCanvas />

          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-white/[0.04] rounded-full blur-[140px] pointer-events-none z-0" />

          {/* Center Impact Typography (Matching Reference Screenshot) */}
          <div className="z-10 text-center space-y-3 max-w-md mx-auto my-auto flex flex-col items-center justify-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-none text-white drop-shadow-xs font-sans">
              EXECUTION ENGINE
            </h2>
            <p className="text-xs sm:text-sm text-white/70 max-w-sm font-sans leading-relaxed tracking-normal">
              Stream terminal sessions securely over WebSockets with real-time audit logging
            </p>
          </div>

        </div>

      </div>
    </ThemeProvider>
  );
}
