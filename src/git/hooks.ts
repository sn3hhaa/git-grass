import fs from 'node:fs';
import path from 'node:path';

export const HOOK_MARKER_START = '# --- BEGIN GIT-GRASS HOOK ---';
export const HOOK_MARKER_END = '# --- END GIT-GRASS HOOK ---';

export const GIT_GRASS_HOOK_SCRIPT = `
${HOOK_MARKER_START}
# git-grass automated outdoor-break check
# Do not run if internal bypass token is present
if [ -n "$GIT_GRASS_BYPASS_TOKEN" ]; then
  exit 0
fi

if command -v git-grass >/dev/null 2>&1; then
  git-grass check
  GRASS_EXIT=$?
elif command -v npx >/dev/null 2>&1; then
  npx --no-install git-grass check
  GRASS_EXIT=$?
else
  # Fallback to local node invocation if git-grass binary is not in PATH
  GRASS_EXIT=0
fi

if [ "$GRASS_EXIT" -ne 0 ]; then
  echo ""
  echo "🌱 [git-grass] Commit paused. Step away from your workstation."
  echo "🌱 Run 'git grass start' or scan the QR code to take your break."
  echo ""
  exit 1
fi
${HOOK_MARKER_END}
`.trim();

export function getHooksDir(repoRoot: string): string {
  return path.join(repoRoot, '.git', 'hooks');
}

export function getPreCommitHookPath(repoRoot: string): string {
  return path.join(getHooksDir(repoRoot), 'pre-commit');
}

export function isHookInstalled(repoRoot: string): boolean {
  const hookPath = getPreCommitHookPath(repoRoot);
  if (!fs.existsSync(hookPath)) return false;
  const content = fs.readFileSync(hookPath, 'utf8');
  return content.includes(HOOK_MARKER_START) && content.includes(HOOK_MARKER_END);
}

export function installPreCommitHook(repoRoot: string): { success: boolean; message: string } {
  const hooksDir = getHooksDir(repoRoot);
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }

  const hookPath = getPreCommitHookPath(repoRoot);

  if (fs.existsSync(hookPath)) {
    const existingContent = fs.readFileSync(hookPath, 'utf8');
    if (existingContent.includes(HOOK_MARKER_START)) {
      return { success: true, message: 'git-grass hook is already installed in .git/hooks/pre-commit' };
    }

    // Preserve existing hook content and prepend git-grass hook block
    const updatedContent = `${GIT_GRASS_HOOK_SCRIPT}\n\n${existingContent}`;
    fs.writeFileSync(hookPath, updatedContent, { mode: 0o755 });
    return {
      success: true,
      message: 'Appended git-grass check to existing .git/hooks/pre-commit (existing hook preserved).'
    };
  }

  // Create new pre-commit hook file
  const newContent = `#!/bin/sh\n\n${GIT_GRASS_HOOK_SCRIPT}\n`;
  fs.writeFileSync(hookPath, newContent, { mode: 0o755 });
  return {
    success: true,
    message: 'Created new .git/hooks/pre-commit with git-grass hook.'
  };
}

export function removePreCommitHook(repoRoot: string): { success: boolean; message: string } {
  const hookPath = getPreCommitHookPath(repoRoot);
  if (!fs.existsSync(hookPath)) {
    return { success: true, message: 'No pre-commit hook found.' };
  }

  const content = fs.readFileSync(hookPath, 'utf8');
  if (!content.includes(HOOK_MARKER_START)) {
    return { success: true, message: 'git-grass hook was not present in .git/hooks/pre-commit.' };
  }

  // Strip git-grass block
  const startIndex = content.indexOf(HOOK_MARKER_START);
  const endIndex = content.indexOf(HOOK_MARKER_END) + HOOK_MARKER_END.length;

  const preserved = (
    content.slice(0, startIndex) + content.slice(endIndex)
  ).trim();

  // If file now only contains shebang or is empty, remove it
  if (!preserved || preserved === '#!/bin/sh' || preserved === '#!/usr/bin/env sh') {
    fs.unlinkSync(hookPath);
    return { success: true, message: 'Removed git-grass pre-commit hook file completely.' };
  }

  fs.writeFileSync(hookPath, `${preserved}\n`, { mode: 0o755 });
  return { success: true, message: 'Removed git-grass section from .git/hooks/pre-commit; preserved other hooks.' };
}
