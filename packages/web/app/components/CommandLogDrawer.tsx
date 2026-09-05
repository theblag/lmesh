"use client";

import { useState } from "react";
import { 
  Cross2Icon, 
  MagnifyingGlassIcon, 
  DownloadIcon, 
  PersonIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from "@radix-ui/react-icons";
import { cleanAnsi } from "../lib/ansi";

export interface LogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userRole: "host" | "collaborator";
  command: string;
  status: "executed" | "flagged" | "denied";
}

interface CommandLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: LogEntry[];
  onExportLogs?: (format: "json" | "csv") => void;
}

export function CommandLogDrawer({
  isOpen,
  onClose,
  logs,
  onExportLogs,
}: CommandLogDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [exportedFormat, setExportedFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredLogs = logs.filter(
    (log) =>
      log.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = (format: "json" | "csv") => {
    onExportLogs?.(format);
    setExportedFormat(format);

    try {
      let dataStr = "";
      let mimeType = "application/json";
      let fileExt = "json";

      if (format === "json") {
        dataStr = JSON.stringify(logs, null, 2);
      } else {
        mimeType = "text/csv";
        fileExt = "csv";
        const headers = ["id", "timestamp", "userName", "userRole", "command", "status"];
        const rows = logs.map((l) =>
          [l.id, l.timestamp, `"${l.userName}"`, l.userRole, `"${l.command.replace(/"/g, '""')}"`, l.status].join(",")
        );
        dataStr = [headers.join(","), ...rows].join("\n");
      }

      const blob = new Blob([dataStr], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lmesh-audit-log.${fileExt}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
    }

    setTimeout(() => setExportedFormat(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end">
      {/* Slide-over panel */}
      <div className="w-full max-w-md bg-[var(--card-bg)] border-l border-[var(--border-color)] h-full flex flex-col shadow-2xl text-[var(--foreground)] font-sans transition-all animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider">Command Audit Log</h3>
            <span className="text-[10px] font-mono text-[var(--text-subtle)] bg-[var(--background)] px-2 py-0.5 rounded border border-[var(--border-color)]">
              {logs.length} entries
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-hover)] transition-colors cursor-pointer"
          >
            <Cross2Icon className="w-4 h-4" />
          </button>
        </div>

        {/* Filter bar & Export Controls */}
        <div className="p-3 border-b border-[var(--border-subtle)] bg-[var(--background)] flex items-center gap-2">
          <div className="flex-1 relative flex items-center">
            <MagnifyingGlassIcon className="w-3.5 h-3.5 absolute left-3 text-[var(--text-subtle)] pointer-events-none" />
            <input
              type="text"
              placeholder="Filter commands or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-md pl-8 pr-3 py-1.5 font-mono text-xs text-[var(--foreground)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-[var(--foreground)] transition-colors"
            />
          </div>

          <button
            onClick={() => handleExport("json")}
            className="px-2.5 py-1.5 rounded border border-[var(--border-color)] bg-[var(--card-hover)] text-[var(--foreground)] hover:bg-[var(--card-bg)] transition-colors cursor-pointer text-xs font-mono flex items-center gap-1 shrink-0"
            title="Export Audit Log as JSON"
          >
            {exportedFormat === "json" ? (
              <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <DownloadIcon className="w-3.5 h-3.5" />
            )}
            <span className="text-[10px] font-semibold uppercase">JSON</span>
          </button>

          <button
            onClick={() => handleExport("csv")}
            className="px-2.5 py-1.5 rounded border border-(--border-color) bg-[var(--card-hover)] text-[var(--foreground)] hover:bg-[var(--card-bg)] transition-colors cursor-pointer text-xs font-mono flex items-center gap-1 shrink-0"
            title="Export Audit Log as CSV"
          >
            {exportedFormat === "csv" ? (
              <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <DownloadIcon className="w-3.5 h-3.5" />
            )}
            <span className="text-[10px] font-semibold uppercase">CSV</span>
          </button>
        </div>

        {/* Audit Log Timeline */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
              <p className="text-xs text-(--text-subtle)">No matching audit logs found.</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg bg-(--background) border border-(--border-color) space-y-2 hover:border-[var(--border-subtle)] transition-colors"
              >
                {/* Meta Header */}
                <div className="flex items-center justify-between text-[10px] text-[var(--text-subtle)]">
                  <div className="flex items-center gap-1.5">
                    <PersonIcon className="w-3 h-3 text-(--text-subtle)" />
                    <span className="font-semibold text-(--foreground)">{log.userName}</span>
                    <span className="px-1 py-0.2 rounded bg-(--card-hover) uppercase text-[9px]">
                      {log.userRole}
                    </span>
                  </div>
                  <span>{log.timestamp}</span>
                </div>

                {/* Command text */}
                <div className="bg-(--card-bg) border border-(--border-subtle) rounded p-2 text-xs font-mono overflow-x-auto text-emerald-400 select-all">
                  <code>{cleanAnsi(log.command)}</code>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[var(--text-subtle)]">Status</span>
                  {log.status === "executed" && (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckIcon className="w-3 h-3" /> Executed
                    </span>
                  )}
                  {log.status === "flagged" && (
                    <span className="text-amber-400 flex items-center gap-1">
                      <ExclamationTriangleIcon className="w-3 h-3" /> Flagged Destructive
                    </span>
                  )}
                  {log.status === "denied" && (
                    <span className="text-rose-400 flex items-center gap-1">
                      <Cross2Icon className="w-3 h-3" /> Denied
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--background)] text-center text-[10px] font-mono text-[var(--text-subtle)]">
          LMESH Realtime Session Audit Stream
        </div>

      </div>
    </div>
  );
}
