import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function parseEnvFile(filePath: string): void {
  if (!fs.existsSync(filePath)) return;
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eqIdx = line.indexOf('=');
      if (eqIdx === -1) continue;
      const key = line.slice(0, eqIdx).trim();
      let val = line.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (key && process.env[key] === undefined && val.length > 0) {
        process.env[key] = val;
      }
    }
  } catch {
    // Ignore read errors
  }
}

export function loadDotEnv(): void {
  // 1. Check current working directory .env
  parseEnvFile(path.resolve(process.cwd(), '.env'));

  // 2. Check git-grass installation root .env (works even when CLI is run in another project!)
  try {
    const __filename = fileURLToPath(import.meta.url);
    const pkgRoot = path.resolve(path.dirname(__filename), '..', '..');
    parseEnvFile(path.join(pkgRoot, '.env'));
  } catch {
    // Ignore resolution errors
  }
}
