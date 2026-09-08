/**
 * Dynamic configuration for LMESH Web
 * Defaults to localhost:3001 for local development.
 * In production, reads NEXT_PUBLIC_SERVER_URL and NEXT_PUBLIC_WS_URL.
 */

export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";

/**
 * Returns the WebSocket endpoint for the relay server.
 * Automatically transforms http/https server URLs to ws/wss if NEXT_PUBLIC_WS_URL is not explicitly set.
 */
export function getWsUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }

  if (process.env.NEXT_PUBLIC_SERVER_URL) {
    const url = process.env.NEXT_PUBLIC_SERVER_URL;
    if (url.startsWith("https://")) {
      return url.replace(/^https:\/\//, "wss://");
    }
    if (url.startsWith("http://")) {
      return url.replace(/^http:\/\//, "ws://");
    }
  }

  return "ws://localhost:3001";
}
