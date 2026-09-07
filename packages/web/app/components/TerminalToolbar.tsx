"use client";

import { useState } from "react";
import { 
  KeyboardIcon, 
  TrashIcon, 
  CopyIcon, 
  CheckIcon, 
  DesktopIcon,
  PlusIcon,
  MinusIcon,
  SymbolIcon,
  LockClosedIcon,
  LockOpen1Icon
} from "@radix-ui/react-icons";

interface TerminalToolbarProps {
  hasControl: boolean;
  isReadOnly: boolean;
  safetyMode?: boolean;
  onToggleSafetyMode?: () => void;
  onRequestControl?: () => void;
  onReleaseControl?: () => void;
  onClearTerminal?: () => void;
  onCopyBuffer?: () => void;
  onToggleFullscreen?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onSendKey?: (keySequence: string) => void;
}

export function TerminalToolbar({
  hasControl,
  isReadOnly,
  safetyMode = false,
  onToggleSafetyMode,
  onRequestControl,
  onReleaseControl,
  onClearTerminal,
  onCopyBuffer,
  onToggleFullscreen,
  onZoomIn,
  onZoomOut,
  onSendKey,
}: TerminalToolbarProps) {
  const [copied, setCopied] = useState(false);
  const [showQuickKeys, setShowQuickKeys] = useState(true);

  const handleCopy = () => {
    if (onCopyBuffer) {
      onCopyBuffer();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const quickKeys = [
    { label: "Ctrl+C", code: "\x03", title: "Interrupt process (SIGINT)" },
    { label: "Ctrl+Z", code: "\x1a", title: "Suspend process (SIGTSTP)" },
    { label: "Tab", code: "\t", title: "Autocomplete" },
    { label: "Esc", code: "\x1b", title: "Escape" },
    { label: "▲", code: "\x1b[A", title: "Up Arrow (History)" },
    { label: "▼", code: "\x1b[B", title: "Down Arrow" },
  ];

  return (
    <div className="w-full bg-[#09090b]/80 backdrop-blur-md border-b border-white/[0.08] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-sans select-none transition-colors duration-200">
      {/* Left side: Quick Key Shortcuts */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setShowQuickKeys(!showQuickKeys)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer shadow-xs"
          title="Toggle Quick Key Bar"
        >
          <KeyboardIcon className="w-3.5 h-3.5 text-white/60" />
          <span className="text-[11px] font-medium tracking-tight">Quick Keys</span>
        </button>

        {/* Safety Mode Toggle Button */}
        <button
          onClick={onToggleSafetyMode}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-sans transition-all cursor-pointer shadow-xs ${
            safetyMode
              ? "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
              : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white/70 hover:text-white"
          }`}
          title={
            safetyMode
              ? "Safety Mode ON: Commands will be redacted in audit logs"
              : "Toggle Safety Mode: Redact sensitive commands in audit logs"
          }
        >
          {safetyMode ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <LockClosedIcon className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-semibold tracking-tight text-amber-300">Safety ON</span>
            </>
          ) : (
            <>
              <LockOpen1Icon className="w-3.5 h-3.5 text-white/50" />
              <span className="text-[11px] font-medium tracking-tight">Safety</span>
            </>
          )}
        </button>

        {showQuickKeys && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {quickKeys.map((key) => (
              <button
                key={key.label}
                onClick={() => onSendKey?.(key.code)}
                disabled={!hasControl}
                title={key.title}
                className="px-2.5 py-1 rounded-md bg-black/40 hover:bg-white/[0.08] border border-white/10 text-white/90 hover:text-white active:scale-95 transition-all disabled:opacity-25 disabled:pointer-events-none cursor-pointer text-xs font-mono font-medium shadow-xs"
              >
                <kbd className="font-mono text-[11px] tracking-tight">{key.label}</kbd>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right side: Terminal Action Utilities & Control State */}
      <div className="flex items-center gap-3">
        {/* Terminal Utilities */}
        <div className="flex items-center gap-1 border-r border-white/10 pr-3">
          <button
            onClick={onZoomOut}
            className="p-1.5 rounded-md hover:bg-white/[0.08] text-white/60 hover:text-white transition-colors cursor-pointer"
            title="Decrease Font Size"
          >
            <MinusIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onZoomIn}
            className="p-1.5 rounded-md hover:bg-white/[0.08] text-white/60 hover:text-white transition-colors cursor-pointer"
            title="Increase Font Size"
          >
            <PlusIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClearTerminal}
            className="p-1.5 rounded-md hover:bg-white/[0.08] text-white/60 hover:text-white transition-colors cursor-pointer ml-1"
            title="Clear Terminal Display"
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-white/[0.08] text-white/60 hover:text-white transition-colors cursor-pointer"
            title="Copy Terminal Selection"
          >
            {copied ? <CheckIcon className="w-3.5 h-3.5 text-emerald-400" /> : <CopyIcon className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onToggleFullscreen}
            className="p-1.5 rounded-md hover:bg-white/[0.08] text-white/60 hover:text-white transition-colors cursor-pointer"
            title="Toggle Fullscreen View"
          >
            <DesktopIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Control Button Action */}
        <div>
          {hasControl ? (
            <button
              onClick={onReleaseControl}
              className="px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-sans font-medium tracking-tight flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <SymbolIcon className="w-3.5 h-3.5 animate-spin text-amber-400" />
              Release Control
            </button>
          ) : isReadOnly ? (
            <span className="px-3 py-1 rounded-md bg-white/[0.04] border border-white/10 text-white/50 text-xs font-sans font-medium tracking-tight">
              Read-Only
            </span>
          ) : (
            <button
              onClick={onRequestControl}
              className="px-3.5 py-1.5 rounded-md bg-white text-black hover:bg-white/90 text-xs font-sans font-semibold tracking-tight flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow"
            >
              <KeyboardIcon className="w-3.5 h-3.5" />
              Request Control
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
