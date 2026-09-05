"use client";

import { useState } from "react";
import { 
  Cross2Icon, 
  LockClosedIcon, 
  LockOpen1Icon, 
  GearIcon, 
  DesktopIcon, 
  BellIcon, 
  CheckIcon
} from "@radix-ui/react-icons";

interface SessionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isHost: boolean;
  readOnly: boolean;
  onToggleReadOnly?: (value: boolean) => void;
  e2eEncrypted: boolean;
  onToggleE2E?: (value: boolean) => void;
  terminalTheme: string;
  onSelectTheme?: (theme: string) => void;
  fontSize: number;
  onChangeFontSize?: (size: number) => void;
  cursorStyle: "block" | "underline" | "bar";
  onChangeCursorStyle?: (style: "block" | "underline" | "bar") => void;
  soundEnabled: boolean;
  onToggleSound?: (enabled: boolean) => void;
}

export function SessionSettingsModal({
  isOpen,
  onClose,
  isHost,
  readOnly,
  onToggleReadOnly,
  e2eEncrypted,
  onToggleE2E,
  terminalTheme,
  onSelectTheme,
  fontSize,
  onChangeFontSize,
  cursorStyle,
  onChangeCursorStyle,
  soundEnabled,
  onToggleSound,
}: SessionSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"security" | "e2ee" | "appearance" | "notifications">("security");

  if (!isOpen) return null;

  const themes = [
    { id: "dark", label: "Dark Standard", bg: "#030303", fg: "#ededed" },
    { id: "dracula", label: "Dracula", bg: "#282a36", fg: "#f8f8f2" },
    { id: "matrix", label: "Matrix Hacker", bg: "#0d1117", fg: "#00ff66" },
    { id: "solarized", label: "Solarized Dark", bg: "#002b36", fg: "#839496" },
    { id: "cyberpunk", label: "Cyberpunk", bg: "#10002b", fg: "#ff007f" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 selection:bg-[var(--selection-bg)] selection:text-[var(--selection-fg)]">
      <div className="w-full max-w-xl bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[var(--foreground)] font-sans transition-all">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <GearIcon className="w-4 h-4 text-[var(--text-muted)]" />
            <h3 className="font-mono text-sm font-semibold tracking-wide uppercase">Session Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-hover)] transition-colors cursor-pointer"
          >
            <Cross2Icon className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Layout: Sidebar Navigation + Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Side Tabs */}
          <nav className="w-full md:w-48 bg-[var(--background)] border-b md:border-b-0 md:border-r border-[var(--border-subtle)] p-3 flex md:flex-col gap-1 shrink-0 font-mono text-xs">
            <button
              onClick={() => setActiveTab("security")}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === "security" 
                  ? "bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--foreground)] font-semibold" 
                  : "text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-hover)]"
              }`}
            >
              <LockClosedIcon className="w-3.5 h-3.5" />
              <span>Access & Security</span>
            </button>

            <button
              onClick={() => setActiveTab("e2ee")}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === "e2ee" 
                  ? "bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--foreground)] font-semibold" 
                  : "text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-hover)]"
              }`}
            >
              <LockClosedIcon className="w-3.5 h-3.5" />
              <span>Encryption (E2EE)</span>
            </button>

            <button
              onClick={() => setActiveTab("appearance")}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === "appearance" 
                  ? "bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--foreground)] font-semibold" 
                  : "text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-hover)]"
              }`}
            >
              <DesktopIcon className="w-3.5 h-3.5" />
              <span>Terminal Aesthetics</span>
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === "notifications" 
                  ? "bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--foreground)] font-semibold" 
                  : "text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-hover)]"
              }`}
            >
              <BellIcon className="w-3.5 h-3.5" />
              <span>Sound & Alerts</span>
            </button>
          </nav>

          {/* Main Tab Content */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {activeTab === "security" && (
              <div className="space-y-5">
                <div>
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--foreground)]">Access Control</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Manage typing permissions for joined collaborators.</p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between p-3.5 rounded-lg border border-[var(--border-color)] bg-[var(--background)]">
                    <div>
                      <span className="text-xs font-mono font-medium block">Read-Only Mode</span>
                      <span className="text-[11px] text-[var(--text-subtle)] block mt-0.5">
                        Prevent collaborators from requesting control
                      </span>
                    </div>
                    <button
                      onClick={() => onToggleReadOnly?.(!readOnly)}
                      disabled={!isHost}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer disabled:opacity-40 ${
                        readOnly ? "bg-emerald-500" : "bg-[var(--border-color)]"
                      }`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        readOnly ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>

                  <div className="p-3.5 rounded-lg border border-[var(--border-color)] bg-[var(--background)] space-y-2">
                    <span className="text-xs font-mono font-medium block">Host Permissions</span>
                    <p className="text-[11px] text-[var(--text-subtle)]">
                      {isHost 
                        ? "You are the host of this session. You can grant or revoke keyboard control anytime." 
                        : "You are connected as a guest collaborator."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "e2ee" && (
              <div className="space-y-5">
                <div>
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--foreground)]">End-to-End Encryption</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Client-side zero-knowledge terminal payload encryption.</p>
                </div>

                <div className="p-4 rounded-lg border border-[var(--border-color)] bg-[var(--background)] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LockClosedIcon className={`w-4 h-4 ${e2eEncrypted ? "text-emerald-400" : "text-[var(--text-subtle)]"}`} />
                      <span className="text-xs font-mono font-medium">AES-256-GCM E2EE</span>
                    </div>
                    <button
                      onClick={() => onToggleE2E?.(!e2eEncrypted)}
                      disabled={!isHost}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer disabled:opacity-40 ${
                        e2eEncrypted ? "bg-emerald-500" : "bg-[var(--border-color)]"
                      }`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        e2eEncrypted ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>
                  <p className="text-[11px] text-[var(--text-subtle)] leading-relaxed">
                    When E2EE is enabled, raw stdout and keystroke data are encrypted on your local machine using Web Crypto API before hitting the relay server.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-5">
                <div>
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--foreground)]">Terminal Theme & Font</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Customize xterm.js color palette and typography.</p>
                </div>

                {/* Theme Selector */}
                <div className="space-y-2">
                  <label className="text-[11px] font-mono text-[var(--text-subtle)] uppercase">Theme</label>
                  <div className="grid grid-cols-2 gap-2">
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => onSelectTheme?.(t.id)}
                        className={`p-2.5 rounded-md border text-left flex items-center justify-between font-mono text-xs transition-colors cursor-pointer ${
                          terminalTheme === t.id 
                            ? "border-emerald-500 bg-[var(--background)]" 
                            : "border-[var(--border-color)] hover:bg-[var(--card-hover)]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: t.bg }} />
                          <span>{t.label}</span>
                        </div>
                        {terminalTheme === t.id && <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div className="space-y-2">
                  <label className="text-[11px] font-mono text-[var(--text-subtle)] uppercase">Font Size ({fontSize}px)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={10}
                      max={20}
                      value={fontSize}
                      onChange={(e) => onChangeFontSize?.(Number(e.target.value))}
                      className="flex-1 accent-emerald-500 cursor-pointer"
                    />
                    <span className="font-mono text-xs w-8 text-center">{fontSize}px</span>
                  </div>
                </div>

                {/* Cursor Style */}
                <div className="space-y-2">
                  <label className="text-[11px] font-mono text-[var(--text-subtle)] uppercase">Cursor Shape</label>
                  <div className="flex gap-2">
                    {(["block", "underline", "bar"] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => onChangeCursorStyle?.(style)}
                        className={`flex-1 py-2 rounded-md border font-mono text-xs capitalize transition-colors cursor-pointer ${
                          cursorStyle === style 
                            ? "border-emerald-500 bg-[var(--background)] font-medium" 
                            : "border-[var(--border-color)] hover:bg-[var(--card-hover)] text-[var(--text-muted)]"
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-5">
                <div>
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--foreground)]">Audio & Notifications</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Configure terminal bell and control request alerts.</p>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-lg border border-[var(--border-color)] bg-[var(--background)]">
                  <div>
                    <span className="text-xs font-mono font-medium block">Terminal Bell Sound</span>
                    <span className="text-[11px] text-[var(--text-subtle)] block mt-0.5">
                      Play audible tone when shell outputs `\x07` BEL
                    </span>
                  </div>
                  <button
                    onClick={() => onToggleSound?.(!soundEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      soundEnabled ? "bg-emerald-500" : "bg-[var(--border-color)]"
                    }`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      soundEnabled ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[var(--border-subtle)] bg-[var(--background)] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[var(--btn-bg)] text-[var(--btn-fg)] hover:opacity-90 rounded-md font-mono text-xs font-semibold transition-opacity cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
