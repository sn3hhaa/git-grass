import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy web assets to dist/web if web exists
const webSrc = path.join(projectRoot, 'web');
const webDest = path.join(projectRoot, 'dist', 'web');
copyDirSync(webSrc, webDest);

// Copy challenges assets to dist/challenges if challenges exists
const challengesSrc = path.join(projectRoot, 'challenges');
const challengesDest = path.join(projectRoot, 'dist', 'challenges');
copyDirSync(challengesSrc, challengesDest);

// Ensure LF line endings on CLI entry point for cross-platform npm bin execution
const cliEntry = path.join(projectRoot, 'dist', 'cli', 'index.js');
if (fs.existsSync(cliEntry)) {
  const content = fs.readFileSync(cliEntry, 'utf-8').replace(/\r\n/g, '\n');
  fs.writeFileSync(cliEntry, content, 'utf-8');
}

console.log('[build] Assets synchronized to dist/');
