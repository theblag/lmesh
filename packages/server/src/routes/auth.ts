import { Router } from "express";
import {
  generateToken,
  verifyToken,
  requestGitHubDeviceCode,
  pollGitHubDeviceToken,
  exchangeGitHubCode,
  fetchGitHubUserProfile,
} from "../auth.js";

const router = Router();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
const WEB_CLIENT_URL = process.env.WEB_CLIENT_URL || "http://localhost:3000";

/**
 * 1. Web OAuth: Redirect user to GitHub Login
 */
router.get("/github", (req, res) => {
  if (!GITHUB_CLIENT_ID) {
    return res.status(500).json({ error: "GITHUB_CLIENT_ID is not configured on server." });
  }
  const redirectUri = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=read:user%20user:email`;
  res.redirect(redirectUri);
});

/**
 * 2. Web OAuth: Callback endpoint handling GitHub redirect
 */
router.get("/github/callback", async (req, res) => {
  const code = req.query.code as string;
  if (!code) {
    return res.status(400).send("Missing OAuth authorization code.");
  }

  try {
    const accessToken = await exchangeGitHubCode(code);
    const userProfile = await fetchGitHubUserProfile(accessToken);
    const jwtToken = generateToken(userProfile);

    res.redirect(`${WEB_CLIENT_URL}?token=${encodeURIComponent(jwtToken)}`);
  } catch (err: any) {
     
    console.error("OAuth Callback Error:", err);
    res.status(500).send(`Authentication Failed: ${err.message}`);
  }
});

/**
 * 3. CLI Device Flow: Step 1 - Request Device Authorization Code
 */
router.post("/device/code", async (req, res) => {
  try {
    const deviceData = await requestGitHubDeviceCode();
    res.json(deviceData);
  } catch (err: any) {
    console.error("Device Code Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 4. CLI Device Flow: Step 2 - Poll for Device Approval Token
 */
router.post("/device/token", async (req, res) => {
  const { device_code } = req.body;
  if (!device_code) {
    return res.status(400).json({ error: "device_code is required" });
  }

  try {
    const pollResult = await pollGitHubDeviceToken(device_code);

    if (pollResult.error) {
      return res.json({ error: pollResult.error, error_description: pollResult.error_description });
    }

    if (pollResult.access_token) {
      const userProfile = await fetchGitHubUserProfile(pollResult.access_token);
      const token = generateToken(userProfile);
      return res.json({ token, user: userProfile });
    }

    res.json(pollResult);
  } catch (err: any) {
    console.error("Poll Device Token Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 5. Verify token and return user info
 */
router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.substring(7);
  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  res.json({ user });
});

export default router;
