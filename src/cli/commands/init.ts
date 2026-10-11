import path from 'node:path';
import pc from 'picocolors';
import { findRepoRoot, isGitAvailable } from '../../git/repository.js';
import { ensureGitGrassDir, loadConfig, saveConfig } from '../../session/storage.js';
import { installPreCommitHook } from '../../git/hooks.js';

export interface InitOptions {
  interval?: string;
  duration?: string;
  autoPush?: boolean;
}

export async function handleInit(options: InitOptions = {}): Promise<void> {
  console.log(pc.green(pc.bold('\n🌱 git-grass initialization\n')));

  const gitOk = await isGitAvailable();
  if (!gitOk) {
    console.error(pc.red('Error: Git is not installed or not accessible in your PATH.'));
    process.exit(1);
  }

  const repoRoot = await findRepoRoot();
  if (!repoRoot) {
    console.error(pc.red('Error: Current directory is not inside a Git repository.'));
    console.error(pc.yellow('Please navigate to a Git repository and run "git grass init" again.'));
    process.exit(1);
  }

  ensureGitGrassDir(repoRoot);
  const config = loadConfig(repoRoot);

  if (options.interval) {
    const val = parseInt(options.interval, 10);
    if (!isNaN(val) && val >= 10) {
      config.breakIntervalMinutes = val;
    } else {
      console.warn(pc.yellow('Warning: Provided interval was invalid or < 10 mins. Using default.'));
    }
  }

  if (options.duration) {
    const val = parseInt(options.duration, 10);
    if (!isNaN(val) && val >= 10) {
      config.defaultDurationMinutes = val;
    } else {
      console.warn(pc.yellow('Warning: Provided duration was invalid or < 10 mins. Using default.'));
    }
  }

  if (typeof options.autoPush === 'boolean') {
    config.autoPush = options.autoPush;
  }

  saveConfig(repoRoot, config);

  const hookResult = installPreCommitHook(repoRoot);
  const displayRepo =
    path.basename(repoRoot).toLowerCase() === 'desktop' ? process.cwd() : repoRoot;

  console.log(pc.cyan(`Repository: `) + displayRepo);
  console.log(pc.cyan(`Break duration: `) + 'Selected by user on mobile Break Gateway');
  console.log(pc.cyan(`Hook status: `) + hookResult.message);

  console.log(pc.green('\n✅ git-grass is active!'));
  console.log(pc.dim('----------------------------------------------------'));
  console.log(pc.dim('Commands:'));
  console.log(pc.dim('  git grass status    - Check timer, break state, and active sessions'));
  console.log(pc.dim('  git grass start     - Manually start an outdoor challenge session'));
  console.log(pc.dim('  git grass config    - View or update settings'));
  console.log(pc.dim('  git grass uninstall - Safely remove hooks and git-grass integration'));
  console.log(pc.dim('----------------------------------------------------\n'));
}
