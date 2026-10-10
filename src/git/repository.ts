import path from 'node:path';
import fs from 'node:fs';
import { runGit } from './executor.js';

export async function isGitAvailable(): Promise<boolean> {
  const result = await runGit(['--version'], process.cwd());
  return result.exitCode === 0;
}

export async function findRepoRoot(startDir: string = process.cwd()): Promise<string | null> {
  const result = await runGit(['rev-parse', '--show-toplevel'], startDir);
  if (result.exitCode === 0 && result.stdout) {
    return path.resolve(result.stdout);
  }
  return null;
}

export function getRepositoryName(repoRoot: string): string {
  // Try package.json name first if available
  const pkgPath = path.join(repoRoot, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.name) return pkg.name;
    } catch {
      // ignore
    }
  }

  // Fallback to directory name
  return path.basename(repoRoot);
}

export async function hasStagedChanges(repoRoot: string): Promise<boolean> {
  const result = await runGit(['diff', '--cached', '--quiet'], repoRoot);
  // git diff --cached --quiet exits 1 if there are staged changes, 0 if clean
  return result.exitCode === 1;
}

export async function getCurrentBranch(repoRoot: string): Promise<string> {
  const result = await runGit(['rev-parse', '--abbrev-ref', 'HEAD'], repoRoot);
  if (result.exitCode === 0 && result.stdout) {
    return result.stdout;
  }
  return 'main';
}

export async function getUpstreamRemote(repoRoot: string): Promise<{ remote: string; branch: string } | null> {
  const branch = await getCurrentBranch(repoRoot);
  const remoteResult = await runGit(['config', `branch.${branch}.remote`], repoRoot);
  if (remoteResult.exitCode === 0 && remoteResult.stdout) {
    const mergeResult = await runGit(['config', `branch.${branch}.merge`], repoRoot);
    const mergeBranch = mergeResult.stdout.replace('refs/heads/', '') || branch;
    return {
      remote: remoteResult.stdout,
      branch: mergeBranch
    };
  }

  // Check if 'origin' remote exists as a fallback
  const remotesResult = await runGit(['remote'], repoRoot);
  if (remotesResult.exitCode === 0 && remotesResult.stdout.split('\n').includes('origin')) {
    return {
      remote: 'origin',
      branch
    };
  }

  return null;
}
