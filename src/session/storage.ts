import fs from 'node:fs';
import path from 'node:path';
import type { GitGrassConfig, SessionData } from '../shared/types.js';
import { getDefaultConfig, parseConfig } from '../shared/config.js';

export const GIT_GRASS_DIR_NAME = '.git-grass';
export const CONFIG_FILE_NAME = 'config.json';
export const SESSION_FILE_NAME = 'session.json';

export function getGitGrassDir(repoRoot: string): string {
  return path.join(repoRoot, GIT_GRASS_DIR_NAME);
}

export function getConfigPath(repoRoot: string): string {
  return path.join(getGitGrassDir(repoRoot), CONFIG_FILE_NAME);
}

export function getSessionPath(repoRoot: string): string {
  return path.join(getGitGrassDir(repoRoot), SESSION_FILE_NAME);
}

export function ensureGitGrassDir(repoRoot: string): string {
  const dir = getGitGrassDir(repoRoot);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Safely write data to a file atomically by writing to a temporary file then renaming.
 */
export function atomicWriteJson(filePath: string, data: unknown): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const tempPath = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`;
  const content = JSON.stringify(data, null, 2);
  fs.writeFileSync(tempPath, content, 'utf8');

  try {
    fs.renameSync(tempPath, filePath);
  } catch (error) {
    // On Windows, renameSync can fail if target exists in some file lock scenarios
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      fs.renameSync(tempPath, filePath);
    } catch {
      // Fallback: direct write
      fs.writeFileSync(filePath, content, 'utf8');
      if (fs.existsSync(tempPath)) {
        try { fs.unlinkSync(tempPath); } catch { /* ignore */ }
      }
    }
  }
}

export function loadConfig(repoRoot: string): GitGrassConfig {
  const configPath = getConfigPath(repoRoot);
  if (!fs.existsSync(configPath)) {
    return getDefaultConfig();
  }

  try {
    const raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return parseConfig(raw);
  } catch (error) {
    console.warn(`[git-grass] Warning: Could not parse config from ${configPath}, falling back to defaults.`, error);
    return getDefaultConfig();
  }
}

export function saveConfig(repoRoot: string, config: GitGrassConfig): void {
  const validated = parseConfig(config);
  const configPath = getConfigPath(repoRoot);
  atomicWriteJson(configPath, validated);
}

export function loadSession(repoRoot: string): SessionData | null {
  const sessionPath = getSessionPath(repoRoot);
  if (!fs.existsSync(sessionPath)) {
    return null;
  }

  try {
    const raw = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
    return raw as SessionData;
  } catch {
    return null;
  }
}

export function saveSession(repoRoot: string, session: SessionData): void {
  const sessionPath = getSessionPath(repoRoot);
  atomicWriteJson(sessionPath, session);
}

export function clearSession(repoRoot: string): void {
  const sessionPath = getSessionPath(repoRoot);
  if (fs.existsSync(sessionPath)) {
    try {
      fs.unlinkSync(sessionPath);
    } catch {
      // ignore
    }
  }
}
