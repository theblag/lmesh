"use client";

import { ExclamationTriangleIcon, CheckIcon, Cross2Icon, KeyboardIcon } from "@radix-ui/react-icons";

export interface PendingRequest {
  id: string;
  type: "control_request" | "destructive_command";
  clientName: string;
  command?: string;
  timestamp: string;
}

interface CommandApprovalModalProps {
  request: PendingRequest | null;
  onApprove: (requestId: string) => void;
  onDeny: (requestId: string) => void;
}

export function CommandApprovalModal({
  request,
  onApprove,
  onDeny,
}: CommandApprovalModalProps) {
  if (!request) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-[var(--card-bg)] border border-amber-500/40 rounded-xl p-5 shadow-2xl text-[var(--foreground)] font-sans animate-in slide-in-from-bottom-4 duration-200">
      
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
          {request.type === "control_request" ? (
            <KeyboardIcon className="w-5 h-5" />
          ) : (
            <ExclamationTriangleIcon className="w-5 h-5" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wide text-amber-400">
              {request.type === "control_request" ? "Control Request Pending" : "Destructive Command Alert"}
            </h4>
            <span className="text-[10px] font-mono text-[var(--text-subtle)]">{request.timestamp}</span>
          </div>

          <p className="text-xs text-[var(--foreground)] leading-relaxed">
            <span className="font-semibold text-emerald-400">{request.clientName}</span>{" "}
            {request.type === "control_request" 
              ? "requested keyboard control to type commands in your shared shell." 
              : "is attempting to execute a potentially destructive command on your machine:"}
          </p>

          {request.command && (
            <div className="p-2.5 rounded bg-[var(--background)] border border-[var(--border-color)] font-mono text-xs text-rose-400 font-semibold overflow-x-auto select-all">
              <code>{request.command}</code>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => onDeny(request.id)}
              className="flex-1 px-3 py-2 rounded-md border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Cross2Icon className="w-3.5 h-3.5" />
              Deny (n)
            </button>
            
            <button
              onClick={() => onApprove(request.id)}
              className="flex-1 px-3 py-2 rounded-md bg-emerald-500 hover:bg-emerald-600 text-black font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <CheckIcon className="w-3.5 h-3.5" />
              Approve (y)
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
