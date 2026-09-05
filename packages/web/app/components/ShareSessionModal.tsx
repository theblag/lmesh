"use client";

import { useState } from "react";
import { 
  Cross2Icon, 
  CopyIcon, 
  CheckIcon, 
  Share1Icon,
  SymbolIcon
} from "@radix-ui/react-icons";

interface ShareSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

export function ShareSessionModal({
  isOpen,
  onClose,
  sessionId,
}: ShareSessionModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);

  if (!isOpen) return null;

  const sessionUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/${sessionId}` 
    : `http://localhost:3000/${sessionId}`;
  
  const cliCommand = `lmesh join ${sessionId}`;

  const copyToClipboard = (text: string, type: "link" | "cli") => {
    navigator.clipboard.writeText(text);
    if (type === "link") {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCli(true);
      setTimeout(() => setCopiedCli(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 selection:bg-[var(--selection-bg)] selection:text-[var(--selection-fg)]">
      <div className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden p-6 space-y-6 text-[var(--foreground)] font-sans transition-all">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share1Icon className="w-4 h-4 text-emerald-400" />
            <h3 className="font-mono text-sm font-semibold tracking-wide uppercase">Share Live Session</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-hover)] transition-colors cursor-pointer"
          >
            <Cross2Icon className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          Invite collaborators to view or control your terminal session in real time.
        </p>

        {/* Copy Browser Link */}
        <div className="space-y-2">
          <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--text-subtle)]">
            Browser URL Link
          </label>
          <div className="flex items-center justify-between bg-[var(--background)] border border-[var(--border-color)] rounded-md px-3.5 py-2.5 font-mono text-xs">
            <span className="text-[var(--foreground)] truncate select-all">{sessionUrl}</span>
            <button
              onClick={() => copyToClipboard(sessionUrl, "link")}
              className="text-[var(--text-subtle)] hover:text-[var(--foreground)] transition-colors cursor-pointer shrink-0 ml-2"
              title="Copy URL"
            >
              {copiedLink ? <CheckIcon className="w-4 h-4 text-emerald-400" /> : <CopyIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Copy CLI Join Command */}
        <div className="space-y-2">
          <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--text-subtle)]">
            CLI Join Command
          </label>
          <div className="flex items-center justify-between bg-[var(--background)] border border-[var(--border-color)] rounded-md px-3.5 py-2.5 font-mono text-xs">
            <span className="text-emerald-400 font-medium truncate select-all">{cliCommand}</span>
            <button
              onClick={() => copyToClipboard(cliCommand, "cli")}
              className="text-[var(--text-subtle)] hover:text-[var(--foreground)] transition-colors cursor-pointer shrink-0 ml-2"
              title="Copy CLI Command"
            >
              {copiedCli ? <CheckIcon className="w-4 h-4 text-emerald-400" /> : <CopyIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Quick Session Badge Summary */}
        <div className="p-3 rounded-lg bg-[var(--background)] border border-[var(--border-subtle)] font-mono text-xs flex items-center justify-between">
          <span className="text-[var(--text-muted)] text-[11px]">Session Key</span>
          <span className="font-semibold text-emerald-400">{sessionId}</span>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="w-full bg-[var(--btn-bg)] text-[var(--btn-fg)] hover:opacity-90 py-2.5 rounded-md font-mono text-xs font-semibold transition-opacity cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
