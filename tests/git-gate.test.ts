import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { runGit } from '../src/git/executor.js';
import {
  installPreCommitHook,
  removePreCommitHook,
  isHookInstalled,
  getPreCommitHookPath
} from '../src/git/hooks.js';
import { getStagedTreeHash, verifyStagedIntegrity } from '../src/git/staged-state.js';
import { executeSessionCommit } from '../src/git/commit-flow.js';
import { getDefaultConfig } from '../src/shared/config.js';
import type { SessionData } from '../src/shared/types.js';

describe('git-grass Git integration & hook gate', () => {
  let tempRepo: string;

  beforeAll(async () => {
    tempRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'git-grass-gate-test-'));
    // Initialize temporary git repo
    await runGit(['init', '-b', 'main'], tempRepo);
    await runGit(['config', 'user.name', 'Gate Tester'], tempRepo);
    await runGit(['config', 'user.email', 'gate@tester.local'], tempRepo);

    // Initial commit
    fs.writeFileSync(path.join(tempRepo, 'init.txt'), 'Initial file');
    await runGit(['add', 'init.txt'], tempRepo);
    await runGit(['commit', '-m', 'chore: initial commit'], tempRepo);
  });

  afterAll(() => {
    fs.rmSync(tempRepo, { recursive: true, force: true });
  });

  it('safely installs hook and preserves existing custom pre-commit hooks', () => {
    const hookPath = getPreCommitHookPath(tempRepo);
    fs.mkdirSync(path.dirname(hookPath), { recursive: true });

    // Existing hook with custom script
    const existingScript = '#!/bin/sh\necho "Running existing linter..."\nexit 0\n';
    fs.writeFileSync(hookPath, existingScript);

    // Install git-grass hook
    const result = installPreCommitHook(tempRepo);
    expect(result.success).toBe(true);
    expect(isHookInstalled(tempRepo)).toBe(true);

    // Verify existing hook was preserved
    const contents = fs.readFileSync(hookPath, 'utf8');
    expect(contents).toContain('echo "Running existing linter..."');
    expect(contents).toContain('BEGIN GIT-GRASS HOOK');

    // Remove hook safely
    const removeResult = removePreCommitHook(tempRepo);
    expect(removeResult.success).toBe(true);
    expect(isHookInstalled(tempRepo)).toBe(false);

    // Existing script still preserved after uninstall
    const remainingContents = fs.readFileSync(hookPath, 'utf8');
    expect(remainingContents).toContain('echo "Running existing linter..."');
  });

  it('fingerprints staged changes and detects index modifications', async () => {
    fs.writeFileSync(path.join(tempRepo, 'feature.txt'), 'Hello outdoor world');
    await runGit(['add', 'feature.txt'], tempRepo);

    const hash1 = await getStagedTreeHash(tempRepo);
    expect(hash1).toBeDefined();
    expect(typeof hash1).toBe('string');

    // Integrity matches original staged state
    const matches1 = await verifyStagedIntegrity(tempRepo, hash1);
    expect(matches1).toBe(true);

    // Modifying staged content changes hash
    fs.writeFileSync(path.join(tempRepo, 'feature.txt'), 'Modified outdoor content');
    await runGit(['add', 'feature.txt'], tempRepo);

    const matches2 = await verifyStagedIntegrity(tempRepo, hash1);
    expect(matches2).toBe(false);
  });

  it('executes atomic session commit and prevents recursive hook loops', async () => {
    fs.writeFileSync(path.join(tempRepo, 'work.txt'), 'Ready to commit');
    await runGit(['add', 'work.txt'], tempRepo);
    const hash = await getStagedTreeHash(tempRepo);

    const config = getDefaultConfig();
    config.autoPush = false;

    const session: SessionData = {
      sessionId: 'test-session-commit',
      sessionToken: 'test-token-12345',
      repositoryRoot: tempRepo,
      repositoryName: 'test-repo',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      status: 'COMPLETED',
      requiredDurationMinutes: 10,
      breakStartedAt: new Date().toISOString(),
      breakCompletedAt: new Date().toISOString(),
      challenge: null,
      stagedTreeHash: hash,
      userReflection: 'Took a walk outside',
      commitMessage: 'feat: add work after break',
      commitResult: null,
      pushResult: null
    };

    const result = await executeSessionCommit(tempRepo, session, config, 'feat: verified outdoor commit');
    expect(result.commitSuccess).toBe(true);
    expect(result.commitHash).toBeDefined();

    // Verify git log has new commit
    const logRes = await runGit(['log', '-n', '1', '--oneline'], tempRepo);
    expect(logRes.stdout).toContain('feat: verified outdoor commit');
  });
});
