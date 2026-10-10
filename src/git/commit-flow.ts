import type { GitGrassConfig, SessionData } from '../shared/types.js';
import { runGit } from './executor.js';
import { hasStagedChanges, getUpstreamRemote } from './repository.js';
import { verifyStagedIntegrity } from './staged-state.js';
import { saveSession } from '../session/storage.js';

export interface CommitFlowResult {
  commitSuccess: boolean;
  commitHash?: string;
  commitError?: string;
  pushAttempted: boolean;
  pushSuccess?: boolean;
  pushError?: string;
}

export async function executeSessionCommit(
  repoRoot: string,
  session: SessionData,
  config: GitGrassConfig,
  commitMessage: string
): Promise<CommitFlowResult> {
  // 1. Check if there are staged changes
  const staged = await hasStagedChanges(repoRoot);
  if (!staged) {
    return {
      commitSuccess: false,
      commitError: 'No changes are currently staged in Git index to commit.',
      pushAttempted: false
    };
  }

  // 2. Staged changes integrity check
  const integrityOk = await verifyStagedIntegrity(repoRoot, session.stagedTreeHash);
  if (!integrityOk) {
    return {
      commitSuccess: false,
      commitError: 'Staged changes were modified after the break session was created. Commit aborted for safety.',
      pushAttempted: false
    };
  }

  // 3. Execute git commit safely with bypass token to prevent recursion
  const cleanMessage = commitMessage.trim() || '🌱 Commit verified via git-grass outdoor break';
  const bypassEnv = {
    GIT_GRASS_BYPASS_TOKEN: session.sessionToken
  };

  const commitRes = await runGit(['commit', '-m', cleanMessage], repoRoot, bypassEnv);
  if (commitRes.exitCode !== 0) {
    return {
      commitSuccess: false,
      commitError: commitRes.stderr || commitRes.stdout || 'Git commit exited with non-zero status.',
      pushAttempted: false
    };
  }

  // Retrieve new commit hash
  const hashRes = await runGit(['rev-parse', 'HEAD'], repoRoot);
  const commitHash = hashRes.exitCode === 0 ? hashRes.stdout.slice(0, 8) : undefined;

  session.status = 'COMMITTED';
  session.commitResult = {
    success: true,
    commitHash
  };

  const flowResult: CommitFlowResult = {
    commitSuccess: true,
    commitHash,
    pushAttempted: false
  };

  // 4. Handle optional push
  if (config.autoPush) {
    flowResult.pushAttempted = true;
    const upstream = await getUpstreamRemote(repoRoot);

    if (!upstream) {
      flowResult.pushSuccess = false;
      flowResult.pushError = 'No upstream or origin remote configured for current branch. Push skipped.';
      session.status = 'PUSH_FAILED';
      session.pushResult = {
        attempted: true,
        success: false,
        error: flowResult.pushError
      };
      saveSession(repoRoot, session);
      return flowResult;
    }

    const pushRes = await runGit(['push', upstream.remote, upstream.branch], repoRoot, bypassEnv);
    if (pushRes.exitCode === 0) {
      flowResult.pushSuccess = true;
      session.status = 'PUSHED';
      session.pushResult = {
        attempted: true,
        success: true,
        remote: upstream.remote,
        branch: upstream.branch
      };
    } else {
      flowResult.pushSuccess = false;
      flowResult.pushError = pushRes.stderr || pushRes.stdout || 'Git push exited with an error.';
      session.status = 'PUSH_FAILED';
      session.pushResult = {
        attempted: true,
        success: false,
        error: flowResult.pushError,
        remote: upstream.remote,
        branch: upstream.branch
      };
    }
  }

  saveSession(repoRoot, session);
  return flowResult;
}
