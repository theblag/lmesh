import fs from "fs";
import path from "path";
import os from "os";
export interface UserConfig {
  token: string;
  user: {
    id: string;
    username: string;
    name: string | null;
    avatarUrl: string;
  };
}

function getConfigDirectory(): string {
  return path.join(os.homedir(), ".lmesh");
}
function getConfigFilePath(): string {
  return path.join(getConfigDirectory(), "auth.json");
}
/**
 * Read stored authentication configuration
 */
export function readConfig(): UserConfig | null {
  try {
    const filePath = getConfigFilePath();
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content) as UserConfig;
  } catch (err) {
    return null;
  }
}

/**
 * Save authentication token and user info to ~/.lmesh/auth.json
 */
export function writeConfig(token: string, user: UserConfig["user"]) {
  const dir = getConfigDirectory();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filePath = getConfigFilePath();
  const data: UserConfig = { token, user };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}
/**
 * Remove stored credentials
 */
export function clearConfig() {
  try {
    const filePath = getConfigFilePath();
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    // Ignore error if file doesn't exist
  }
}
