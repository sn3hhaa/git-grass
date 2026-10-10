import fs from 'node:fs';
import pc from 'picocolors';
import { findRepoRoot } from '../../git/repository.js';
import { removePreCommitHook } from '../../git/hooks.js';
import { getGitGrassDir } from '../../session/storage.js';

export interface UninstallOptions {
  yes?: boolean;
}

export async function handleUninstall(options: UninstallOptions = {}): Promise<void> {
  const repoRoot = await findRepoRoot();
  if (!repoRoot) {
    console.error(pc.red('Error: Not inside a Git repository.'));
    process.exit(1);
  }

  if (!options.yes) {
    console.log(pc.yellow('\n⚠️  You are about to uninstall git-grass from this repository.'));
    console.log(pc.dim('This will remove the pre-commit hook gate and delete the .git-grass directory.'));
    console.log(pc.dim('To proceed, re-run with: git grass uninstall --yes\n'));
    return;
  }

  // Remove hook
  const hookResult = removePreCommitHook(repoRoot);
  console.log(pc.cyan('Hook: ') + hookResult.message);

  // Remove .git-grass directory
  const grassDir = getGitGrassDir(repoRoot);
  if (fs.existsSync(grassDir)) {
    fs.rmSync(grassDir, { recursive: true, force: true });
    console.log(pc.cyan('Data: ') + 'Removed .git-grass directory.');
  }

  console.log(pc.green('\n✅ git-grass has been safely uninstalled from this repository.\n'));
}
