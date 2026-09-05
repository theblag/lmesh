/**
 * Utility to strip ANSI escape codes, terminal control sequences,
 * and prompt artifacts before persisting commands to Neon DB.
 */
export function cleanAnsi(str: string): string {
  if (!str) return "";
  return str
    // 1. Remove standard ANSI escape sequences (\x1b...)
    .replace(/\x1b\[[0-9;?]*[a-zA-Z]/g, "")
    .replace(/\x1b\][^\x07]*\x07/g, "")
    .replace(/\x1b[()][AB012]/g, "")
    .replace(/\x1b[=>]/g, "")
    // 2. Remove residual terminal control sequences (e.g. [?9001h, [2J, [4;1H, [K, ]0;...)
    .replace(/\[\?[0-9]+[hl]/g, "")
    .replace(/\[[0-9;]+[hHlLMK]/g, "")
    .replace(/\[[a-zA-Z]/g, "")
    .replace(/\]0;[^\r\n]*/g, "")
    // 3. Remove common shell header noise and prompts
    .replace(/Windows PowerShell\s*Copyright \(C\) Microsoft Corporation\. All rights reserved\./gi, "")
    .replace(/PS [A-Z]:\\[^>]*>/gi, "")
    // 4. Remove non-printable control characters
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "")
    .trim();
}
