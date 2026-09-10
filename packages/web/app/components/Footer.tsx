`use client`;

import { useState, useEffect } from "react";
import Link from "next/link";
import { GitHubLogoIcon, ArrowRightIcon, CheckIcon } from "@radix-ui/react-icons";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("lmesh_auth_token");
      setIsLoggedIn(!!token);
    }
  }, []);

  const dashboardHref = isLoggedIn ? "/dashboard" : "/login";

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail("");
    }
  };

  return (
    <footer className="w-full border-t border-(--footer-border) bg-(--footer-bg) text-(--footer-fg) font-sans z-10 transition-colors duration-200">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 pt-12 pb-8 space-y-12">
        
        {/* Top 3 Navigation Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 border border-(--footer-border) divide-y md:divide-y-0 md:divide-x divide-(--footer-border) rounded-none overflow-hidden bg-(--footer-card-bg)">
          <Link
            href={dashboardHref}
            className="px-4 py-8 md:py-12 min-h-27.5 md:min-h-32.5 text-center hover:bg-(--footer-card-hover) transition-colors group flex items-center justify-center"
          >
            <span className="text-lg sm:text-xl md:text-2xl font-black uppercase tracking-tight text-(--footer-fg) group-hover:scale-105 transition-transform">
              DASHBOARD
            </span>
          </Link>

          <Link
            href="/docs"
            className="px-4 py-8 md:py-12 min-h-27.5 md:min-h-32.5 text-center hover:bg-(--footer-card-hover) transition-colors group flex items-center justify-center"
          >
            <span className="text-lg sm:text-xl md:text-2xl font-black uppercase tracking-tight text-(--footer-fg) group-hover:scale-105 transition-transform">
              DOCUMENTATION
            </span>
          </Link>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-8 md:py-12 min-h-27.5 md:min-h-[130px] text-center hover:bg-(--footer-card-hover) transition-colors group flex items-center justify-center"
          >
            <span className="text-lg sm:text-xl md:text-2xl font-black uppercase tracking-tight text-(--footer-fg) group-hover:scale-105 transition-transform">
              GITHUB REPO
            </span>
          </a>
        </div>

        {/* Main Section: Newsletter + Link Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pt-4">
          
          {/* Left: Newsletter / Updates Join */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight leading-none text-(--footer-fg)">
              JOIN THE LMESH MOVEMENT
            </h3>
            <p className="text-xs text-(--footer-text-muted) leading-relaxed max-w-sm">
              Subscribe for release updates, CLI security advisories, and terminal collaboration protocols.
            </p>

            <form onSubmit={handleSubscribe} className="pt-2 max-w-sm">
              <div className="relative flex items-center border-b-2 border-(--footer-fg) pb-1">
                <input
                  type="email"
                  placeholder="ENTER YOUR EMAIL..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-xs font-sans tracking-wider uppercase text-(--footer-fg) placeholder:text-(--footer-text-subtle) focus:outline-none pr-10"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-0 text-xs font-bold font-sans tracking-widest uppercase text-(--footer-fg) hover:opacity-75 transition-opacity cursor-pointer flex items-center gap-1"
                >
                  {subscribed ? (
                    <span className="text-emerald-500 font-semibold flex items-center gap-1">
                      OK <CheckIcon className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      OK <ArrowRightIcon className="w-4 h-4" />
                    </span>
                  )}
                </button>
              </div>
              <span className="text-[10px] font-sans text-(--footer-text-subtle) mt-2 block tracking-wider uppercase font-medium">
                No spam. Unsubscribe anytime.
              </span>
            </form>
          </div>

          {/* Right: Multi-column Links */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
            
            {/* Column 1 */}
            <div className="space-y-3">
              <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-(--footer-fg)">
                NAVIGATION
              </h4>
              <ul className="space-y-2 text-(--footer-text-muted)">
                <li>
                  <Link href="/" className="hover:text-(--footer-fg) transition-colors">Home</Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-(--footer-fg) transition-colors">Documentation</Link>
                </li>
                <li>
                  <Link href={dashboardHref} className="hover:text-(--footer-fg) transition-colors">User Dashboard</Link>
                </li>
                <li>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-(--footer-fg) transition-colors">CLI Package</a>
                </li>
                <li>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-(--footer-fg) transition-colors">WebSocket Gateway</a>
                </li>
              </ul>
            </div>

            {/* Column 2 */}
            <div className="space-y-3">
              <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-(--footer-fg)">
                RESOURCES
              </h4>
              <ul className="space-y-2 text-(--footer-text-muted)">
                <li>
                  <Link href="/docs" className="hover:text-(--footer-fg) transition-colors">Documentation</Link>
                </li>
                <li>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-(--footer-fg) transition-colors">API Architecture</a>
                </li>
                <li>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-(--footer-fg) transition-colors">OAuth Device Flow</a>
                </li>
                <li>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-(--footer-fg) transition-colors">Security Model</a>
                </li>
              </ul>
            </div>

            {/* Column 3 */}
            <div className="space-y-3">
              <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-(--footer-fg)">
                COMMUNITY
              </h4>
              <ul className="space-y-2 text-(--footer-text-muted)">
                <li>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-(--footer-fg) transition-colors flex items-center gap-1.5">
                    <GitHubLogoIcon className="w-3.5 h-3.5" />
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-(--footer-fg) transition-colors">Discussions</a>
                </li>
                <li>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-(--footer-fg) transition-colors">MIT License</a>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Giant Hero Typography: LMESH */}
        <div className="pt-8 border-t border-(--footer-border) flex flex-col items-center justify-center overflow-hidden">
          <h1 className="text-[18vw] sm:text-[16vw] md:text-[13vw] lg:text-[130px] xl:text-[160px] font-black uppercase tracking-tighter leading-none text-(--footer-fg) text-center select-none w-full scale-y-105 pointer-events-none">
            LMESH
          </h1>

          {/* Sub-footer copyright line */}
          <div className="w-full pt-4 border-t border-(--footer-border-subtle) flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-sans text-(--footer-text-muted)">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LMESH RELAY PROTOCOL || STABLE 1.1.5</span>
            </div>
            <span>© 2026 LMESH - ALL RIGHTS RESERVED</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
