"use client";

import { useEffect, useState, useRef } from "react";

interface ScriptLine {
  type: "prompt-input" | "info" | "session-created" | "link" | "notification" | "gradient" | "output" | "main-head" | "text";
  prompt?: string;
  command?: string;
  text?: string;
  sessionId?: string;
  url?: string;
  delay?: number;
}

const ASCII_LOGO = [
  " ████                                   █████     ",
  "▒▒███                                  ▒▒███      ",
  " ▒███  █████████████    ██████   █████  ▒███████  ",
  " ▒███ ▒▒███▒▒███▒▒███  ███▒▒███ ███▒▒   ▒███▒▒███ ",
  " ▒███  ▒███ ▒███ ▒███ ▒███████ ▒▒█████  ▒███ ▒███ ",
  " ▒███  ▒███ ▒███ ▒███ ▒███▒▒▒   ▒▒▒▒███ ▒███ ▒███ ",
  " █████ █████▒███ █████▒▒██████  ██████  ████ █████",
  "▒▒▒▒▒ ▒▒▒▒▒ ▒▒▒ ▒▒▒▒▒  ▒▒▒▒▒▒  ▒▒▒▒▒▒  ▒▒▒▒ ▒▒▒▒▒ "
].join("\n");

const SIMULATION_SCRIPT: ScriptLine[] = [
  {
    type: "prompt-input",
    prompt: "aditya@mac ~/projects/lmesh $ ",
    command: "lmesh share",
    delay: 800,
  },
  {
    type: "main-head",
    text: ASCII_LOGO,
    delay: 500,
  },
  {
    type: "text",
    text: "v0.1.0 — Live Multi-user Execution Shell",
    delay: 500,
  },
  {
    type: "info",
    text: "Connecting to relay server...",
    delay: 500,
  },
  {
    type: "session-created",
    text: "Session created: ",
    sessionId: "x7k2m9p",
    delay: 400,
  },
  {
    type: "link",
    text: "Link: ",
    url: "https://lmesh.dev/x7k2m9p",
    delay: 500,
  },
  {
    type: "notification",
    text: "[lmesh] John joined as viewer",
    delay: 1200,
  },
  {
    type: "notification",
    text: "[lmesh] John requested control. Grant? (y/n): ",
    delay: 1000,
  },
  {
    type: "prompt-input",
    prompt: "aditya@mac ~/projects/lmesh $ ",
    command: "y",
    delay: 800,
  },
  {
    type: "gradient",
    text: "Control granted to John",
    delay: 600,
  },
  {
    type: "prompt-input",
    prompt: "john@mac ~/projects/lmesh $ ",
    command: "git log -n 1",
    delay: 1200,
  },
  {
    type: "output",
    text: "commit f3a7d9e1 (feat: terminal stream multiplexer)",
    delay: 400,
  },
  {
    type: "notification",
    text: "[lmesh] John left session",
    delay: 1500,
  },
];

export function TerminalSimulation() {
  const [visibleLines, setVisibleLines] = useState<ScriptLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentTypedText, setCurrentTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef<boolean>(false);

  // Track if user has manually scrolled up away from the bottom
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    // 30px threshold from bottom
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 30;
    userScrolledUpRef.current = !isAtBottom;
  };

  // Auto-scroll to bottom whenever visible content or typed text updates (only if user hasn't scrolled up)
  useEffect(() => {
    if (containerRef.current && !userScrolledUpRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLines, currentTypedText]);

  useEffect(() => {
    let active = true;

    async function runScript() {
      if (!active) return;
      setVisibleLines([]);
      setCurrentLineIndex(0);
      setCurrentTypedText("");
      setIsTyping(false);
      userScrolledUpRef.current = false;

      for (let i = 0; i < SIMULATION_SCRIPT.length; i++) {
        if (!active) return;
        const line = SIMULATION_SCRIPT[i];
        setCurrentLineIndex(i);

        if (line.delay) {
          await new Promise((resolve) => setTimeout(resolve, line.delay));
        }

        if (line.type === "prompt-input" && line.command) {
          setIsTyping(true);
          for (let charIndex = 0; charIndex <= line.command.length; charIndex++) {
            if (!active) return;
            setCurrentTypedText(line.command.slice(0, charIndex));
            await new Promise((resolve) => setTimeout(resolve, 80 + Math.random() * 50));
          }
          setIsTyping(false);
          setVisibleLines((prev) => [...prev, line]);
          setCurrentTypedText("");
        } else {
          setVisibleLines((prev) => [...prev, line]);
        }
      }

      // Pause at end before restarting simulation
      await new Promise((resolve) => setTimeout(resolve, 5000));
      if (active) {
        runScript();
      }
    }

    runScript();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="w-full max-w-full bg-[#141414] border border-[#1e1e1e] rounded-xl overflow-hidden flex flex-col h-95 sm:h-110 shadow-none select-none">
      {/* macOS style top bar */}
      <div className="w-full bg-[#1a1a1a] px-4 py-3 flex items-center gap-1.5 border-b border-[#1e1e1e] shrink-0">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
      </div>

      {/* Terminal content container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 p-4 sm:p-6 font-mono text-[12px] sm:text-[13px] leading-relaxed overflow-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="space-y-1">
          {visibleLines.map((line, index) => {
            if (line.type === "prompt-input") {
              return (
                <div key={index} className="flex items-start flex-wrap">
                  <span className="text-[#555]">{line.prompt}</span>
                  <span className="text-[#f0f0f0]">{line.command}</span>
                </div>
              );
            } else if (line.type === "info") {
              return (
                <div key={index} className="text-[#38bdf8] whitespace-pre font-mono leading-tight overflow-x-auto">
                  {line.text}
                </div>
              );
            } else if (line.type === "session-created") {
              return (
                <div key={index}>
                  <span className="text-[#38bdf8]">{line.text}</span>
                  <span className="bg-linear-to-r from-[#a78bfa] to-[#38bdf8] bg-clip-text text-transparent font-medium">
                    {line.sessionId}
                  </span>
                </div>
              );
            } else if (line.type === "link") {
              return (
                <div key={index}>
                  <span className="text-[#38bdf8]">{line.text}</span>
                  <span className="text-[#38bdf8]">{line.url}</span>
                </div>
              );
            } else if (line.type === "notification") {
              return (
                <div key={index} className="text-[#4ade80]">
                  {line.text}
                </div>
              );
            } else if (line.type === "gradient") {
              return (
                <div key={index} className="bg-linear-to-r from-[#a78bfa] to-[#38bdf8] bg-clip-text text-transparent font-medium">
                  {line.text}
                </div>
              );
            } else if (line.type === "output") {
              return (
                <div key={index} className="text-[#555]">
                  {line.text}
                </div>
              );
            }
            else if (line.type === "main-head") {
              return (
                <div
                  key={index}
                  style={{ fontFamily: 'Consolas, "Courier New", monospace' }}
                  className="bg-linear-to-r from-[#a78bfa] to-[#38bdf8] bg-clip-text text-transparent whitespace-pre leading-none text-[11px] sm:text-[12.5px] font-bold my-2.5 overflow-x-auto"
                >
                  {line.text}
                </div>
              );
            }
            else if (line.type === "text") {
              return (
                <div key={index} className="text-white">
                  {line.text}
                </div>
              );
            }
            return null;
          })}

          {/* Current typing prompt */}
          {SIMULATION_SCRIPT[currentLineIndex]?.type === "prompt-input" && visibleLines.length <= currentLineIndex && (
            <div className="flex items-start flex-wrap">
              <span className="text-[#555]">
                {SIMULATION_SCRIPT[currentLineIndex]?.prompt}
              </span>
              <span className="text-[#f0f0f0]">
                {currentTypedText}
                <span className="inline-block w-1.5 h-3.5 bg-[#f0f0f0] ml-0.5 align-middle animate-cursor-blink" />
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


