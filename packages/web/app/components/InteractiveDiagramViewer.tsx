"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ZoomInIcon,
  ZoomOutIcon,
  ResetIcon,
  EnterFullScreenIcon,
  ExitFullScreenIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";

export default function InteractiveDiagramViewer() {
  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync zoom percentage sent from the iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === "lmesh-diagram-zoom") {
        setZoomPercent(e.data.zoom);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const sendAction = (action: "zoomIn" | "zoomOut" | "reset") => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ action }, "*");
    }
  };

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = "/lmesh_architecture.html";
    }
  };

  // Fullscreen support
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`rounded-xl border border-[#232630] bg-[#0c0d12] overflow-hidden text-[#ededed] flex flex-col transition-all duration-200 select-none shadow-2xl ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-none h-screen w-screen" : "w-full"
      }`}
    >
      {/* Top Header & Controls */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#1f212a] px-3.5 py-2.5 bg-[#13151c] text-xs font-mono select-none gap-2">
        {/* Title and metadata */}
        <div className="flex items-center gap-2">
          <span className="text-[#d1d5db] font-medium text-xs">LMESH Data Flow Architecture</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded border border-[#262a38] bg-[#0c0d12] text-[#60a5fa] font-mono">
            interactive vector
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center rounded-lg border border-[#232630] bg-[#0c0d12] p-0.5">
            <button
              onClick={() => sendAction("zoomOut")}
              className="p-1.5 rounded text-[#8e93a0] hover:text-white hover:bg-[#1f2330] transition-colors"
              title="Zoom out"
              aria-label="Zoom out"
            >
              <ZoomOutIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => sendAction("reset")}
              className="px-2 py-1 text-[11px] font-mono text-[#8e93a0] hover:text-white hover:bg-[#1f2330] rounded transition-colors min-w-[50px] text-center"
              title="Reset zoom to 100%"
            >
              {zoomPercent}%
            </button>
            <button
              onClick={() => sendAction("zoomIn")}
              className="p-1.5 rounded text-[#8e93a0] hover:text-white hover:bg-[#1f2330] transition-colors"
              title="Zoom in"
              aria-label="Zoom in"
            >
              <ZoomInIcon className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-3.5 bg-[#232630] mx-0.5" />
            <button
              onClick={() => sendAction("reset")}
              className="p-1.5 rounded text-[#8e93a0] hover:text-white hover:bg-[#1f2330] transition-colors"
              title="Reset viewport"
              aria-label="Reset viewport"
            >
              <ResetIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reload button */}
          <button
            onClick={handleReload}
            className="p-1.5 rounded-lg border border-[#232630] bg-[#0c0d12] text-[#8e93a0] hover:text-white hover:bg-[#1f2330] transition-colors"
            title="Reload diagram"
            aria-label="Reload diagram"
          >
            <ReloadIcon className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg border border-[#232630] bg-[#0c0d12] text-[#8e93a0] hover:text-white hover:bg-[#1f2330] transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <ExitFullScreenIcon className="w-3.5 h-3.5" />
            ) : (
              <EnterFullScreenIcon className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Frame Viewport Container */}
      <div
        className="relative w-full bg-[#0c0d12]"
        style={{
          height: isFullscreen ? "calc(100vh - 52px)" : "660px",
          minHeight: isFullscreen ? "calc(100vh - 52px)" : "660px",
        }}
      >
        <iframe
          ref={iframeRef}
          src="/lmesh_architecture.html"
          title="LMESH System Architecture Interactive Vector Diagram"
          className="w-full h-full border-none block"
          style={{
            background: "#0c0d12",
          }}
        />
      </div>
    </div>
  );
}
