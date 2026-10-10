import { runGit } from './executor.js';

/**
 * Computes a deterministic SHA tree fingerprint of the currently staged changes
 * using `git write-tree`.
 */
export async function getStagedTreeHash(repoRoot: string): Promise<string | null> {
  const result = await runGit(['write-tree'], repoRoot);
  if (result.exitCode === 0 && result.stdout) {
    return result.stdout.trim();
  }
  return null;
}

/**
 * Validates whether the staged changes match the recorded fingerprint.
 */
export async function verifyStagedIntegrity(repoRoot: string, expectedHash: string | null): Promise<boolean> {
  if (!expectedHash) {
    return true; // No hash recorded
  }
  const currentHash = await getStagedTreeHash(repoRoot);
  return currentHash === expectedHash;
}
