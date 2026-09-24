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
  LockClosedIcon,
  LockOpen1Icon
} from "@radix-ui/react-icons";

interface TerminalToolbarProps {
  hasControl?: boolean;
  privateMode?: boolean;
  safetyMode?: boolean; // legacy alias
  onTogglePrivateMode?: () => void;
  onToggleSafetyMode?: () => void; // legacy alias
  onClearTerminal?: () => void;
  onCopyBuffer?: () => void;
  onToggleFullscreen?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onSendKey?: (keySequence: string) => void;
}

export function TerminalToolbar({
  hasControl = false,
  privateMode,
  safetyMode = false,
  onTogglePrivateMode,
  onToggleSafetyMode,
  onClearTerminal,
  onCopyBuffer,
  onToggleFullscreen,
  onZoomIn,
  onZoomOut,
  onSendKey,
}: TerminalToolbarProps) {
  const isPrivate = privateMode !== undefined ? privateMode : safetyMode;
  const handleToggle = onTogglePrivateMode || onToggleSafetyMode;
  const [copied, setCopied] = useState(false);
  const [showQuickKeys, setShowQuickKeys] = useState(false);

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
    <div className="w-full bg-[#09090b]/80 backdrop-blur-md border-b border-white/8 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-sans select-none transition-colors duration-200">
      {/* Left side: Quick Key Shortcuts */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setShowQuickKeys(!showQuickKeys)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/4 hover:bg-white/8 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer shadow-xs"
          title="Toggle Quick Key Bar"
        >
          <KeyboardIcon className="w-3.5 h-3.5 text-white/60" />
          <span className="text-[11px] font-medium tracking-tight">Quick Keys</span>
        </button>

        {/* Private Mode Toggle Button */}
        <button
          onClick={handleToggle}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-sans transition-all cursor-pointer shadow-xs ${
            isPrivate
              ? "bg-purple-500/15 border-purple-500/40 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
              : "bg-white/4 hover:bg-white/8 border-white/10 text-white/70 hover:text-white"
          }`}
          title={
            isPrivate
              ? "Private Mode ON: Commands will be redacted in audit logs"
              : "Toggle Private Mode: Redact sensitive commands in audit logs"
          }
        >
          {isPrivate ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <LockClosedIcon className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[11px] font-semibold tracking-tight text-purple-300">Private ON</span>
            </>
          ) : (
            <>
              <LockOpen1Icon className="w-3.5 h-3.5 text-white/50" />
              <span className="text-[11px] font-medium tracking-tight">Private</span>
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
                className="px-2.5 py-1 rounded-md bg-black/40 hover:bg-white/8 border border-white/10 text-white/90 hover:text-white active:scale-95 transition-all disabled:opacity-25 disabled:pointer-events-none cursor-pointer text-xs font-mono font-medium shadow-xs"
              >
                <kbd className="font-mono text-[11px] tracking-tight">{key.label}</kbd>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right side: Terminal Action Utilities */}
      <div className="flex items-center gap-1">
        <button
          onClick={onZoomOut}
          className="p-1.5 rounded-md hover:bg-white/8 text-white/60 hover:text-white transition-colors cursor-pointer"
          title="Decrease Font Size"
        >
          <MinusIcon className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onZoomIn}
          className="p-1.5 rounded-md hover:bg-white/8 text-white/60 hover:text-white transition-colors cursor-pointer"
          title="Increase Font Size"
        >
          <PlusIcon className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onClearTerminal}
          className="p-1.5 rounded-md hover:bg-white/8 text-white/60 hover:text-white transition-colors cursor-pointer ml-1"
          title="Clear Terminal Display"
        >
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md hover:bg-white/8 text-white/60 hover:text-white transition-colors cursor-pointer"
          title="Copy Terminal Selection"
        >
          {copied ? <CheckIcon className="w-3.5 h-3.5 text-emerald-400" /> : <CopyIcon className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={onToggleFullscreen}
          className="p-1.5 rounded-md hover:bg-white/8 text-white/60 hover:text-white transition-colors cursor-pointer"
          title="Toggle Fullscreen View"
        >
          <DesktopIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
