import open from "open";
import { readConfig, writeConfig, clearConfig } from "./config.js";
const SERVER_URL = process.env.LMESH_SERVER_URL || "http://localhost:3001";
/**
 * Perform GitHub Device Flow Login for CLI
 */
export async function loginCommand() {
  const existing = readConfig();
  if (existing) {
    console.log(`Already logged in as @${existing.user.username}`);
    console.log("Run 'lmesh logout' if you wish to switch accounts.\n");
    return;
  }
  console.log("Initiating GitHub Device Authorization...\n");
  try {
    const codeRes = await fetch(`${SERVER_URL}/api/auth/device/code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!codeRes.ok) {
      const errText = await codeRes.text();
      throw new Error(`Server returned error: ${errText}`);
    }
    const deviceData = await codeRes.json();
    const { device_code, user_code, verification_uri, expires_in, interval = 5 } = deviceData;
    if (!user_code || !verification_uri) {
      throw new Error("Invalid response from authorization server.");
    }
    console.log(`First copy your one-time code: \x1b[1m\x1b[36m${user_code}\x1b[0m`);
    console.log(`Press Enter or open: \x1b[34m${verification_uri}\x1b[0m`);
    try {
      await open(verification_uri);
    } catch (err) {
      // Ignore if browser fails to open automatically
    }
    console.log("Waiting for GitHub authorization...");
    const pollIntervalMs = (interval || 5) * 1000;
    const startTime = Date.now();
    const maxTimeMs = (expires_in || 900) * 1000;
    while (Date.now() - startTime < maxTimeMs) {
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
      const pollRes = await fetch(`${SERVER_URL}/api/auth/device/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_code }),
      });
      if (!pollRes.ok) {
        continue;
      }
      const pollData = await pollRes.json();
      if (pollData.token && pollData.user) {
        writeConfig(pollData.token, pollData.user);
        console.log(`\n\x1b[32mSuccessfully authenticated as @${pollData.user.username}!\x1b[0m`);
        console.log("Your authentication token is securely saved in ~/.lmesh/auth.json\n");
        return;
      }
      if (pollData.error) {
        if (pollData.error === "authorization_pending") {
          process.stdout.write(".");
          continue;
        } else if (pollData.error === "slow_down") {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          continue;
        } else if (pollData.error === "expired_token") {
          console.log("\n\x1b[31mAuthorization code expired. Please run 'lmesh login' again.\x1b[0m");
          return;
        } else if (pollData.error === "access_denied") {
          console.log("\n\x1b[31mAuthorization request was cancelled.\x1b[0m");
          return;
        }
      }
    }
    console.log("\n\x1b[31mAuthorization timed out. Please try again.\x1b[0m");
  } catch (err: any) {
    console.error(`\x1b[31mAuthentication Error: ${err.message}\x1b[0m`);
  }
}
/**
 * Logout and remove local credentials
 */
export function logoutCommand() {
  const existing = readConfig();
  if (!existing) {
    console.log("You are not currently logged in.");
    return;
  }
  clearConfig();
  console.log(`Logged out from @${existing.user.username}.`);
}
/**
 * Display logged-in status
 */
export function whoamiCommand() {
  const config = readConfig();
  if (!config) {
    console.log("Not logged in. Run 'lmesh login' to authenticate with GitHub.");
    return;
  }
  console.log(`Logged in as: \x1b[36m@${config.user.username}\x1b[0m (${config.user.name})`);
}