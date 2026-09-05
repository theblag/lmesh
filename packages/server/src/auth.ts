import jwt from "jsonwebtoken";
import { upsertUser } from "./db/index.js";

const JWT_SECRET = process.env.JWT_SECRET || "lmesh-super-secret-jwt-key-2026";
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";

export interface UserProfile {
  id: string;
  githubId: number;
  username: string;
  name: string | null;
  avatarUrl: string;
  email: string | null;
}

export interface JWTPayload extends UserProfile {
  iat?: number;
  exp?: number;
}

//Generate a signed JWT token for a user profile
export function generateToken(user: UserProfile): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "30d" });
}

// Verify and decode a JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (err) {
    return null;
  }
}

/**
 * Request a GitHub Device Authorization Code for CLI Flow
 */
export async function requestGitHubDeviceCode() {
  if (!GITHUB_CLIENT_ID) {
    throw new Error("GITHUB_CLIENT_ID is not configured in server environment.");
  }
  const response = await fetch("https://github.com/login/device/code", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      scope: "read:user user:email",
    }),
  });
  if (!response.ok) {
    const errBody = await response.text();
    console.error("GitHub Device Code Error:", errBody);
    throw new Error(`Failed to request GitHub device code: ${response.statusText} - ${errBody}`);
  }
  return response.json();
}

/**
 * Poll GitHub for Device OAuth Token approval status
 */
export async function pollGitHubDeviceToken(deviceCode: string) {
  if (!GITHUB_CLIENT_ID) {
    throw new Error("GITHUB_CLIENT_ID is not configured in server environment.");
  }
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      device_code: deviceCode,
      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to poll GitHub device token: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Exchange GitHub Web OAuth authorization code for an access token
 */
export async function exchangeGitHubCode(code: string): Promise<string> {
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    throw new Error("GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET is missing.");
  }
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
    }),
  });
  const data = await response.json();
  if (data.error) {
    throw new Error(`GitHub OAuth Error: ${data.error_description || data.error}`);
  }
  return data.access_token;
}

/**
 * Fetch authenticated GitHub User Profile and persist to Neon DB
 */
export async function fetchGitHubUserProfile(accessToken: string): Promise<UserProfile> {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "LMESH-Server",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch GitHub profile: ${response.statusText}`);
  }
  const data = await response.json();

  const userProfile: UserProfile = {
    id: String(data.id),
    githubId: data.id,
    username: data.login,
    name: data.name || data.login,
    avatarUrl: data.avatar_url,
    email: data.email || null,
  };

  // Automatically upsert (save/update) user profile in Neon DB
  const dbUser = await upsertUser(userProfile);
  if (dbUser && dbUser.id) {
    userProfile.id = dbUser.id; // Assign Neon DB UUID
  }

  return userProfile;
}