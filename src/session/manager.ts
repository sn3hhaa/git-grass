import type { GitGrassConfig, SessionData, SessionState } from '../shared/types.js';
import { getRepositoryName } from '../git/repository.js';
import { getStagedTreeHash } from '../git/staged-state.js';
import { createOutdoorChallenge } from '../challenge/generator.js';
import {
  canTransition,
  generateSessionId,
  generateSessionToken,
  hasSatisfiedBreakDuration,
  isSessionExpired,
  validateSessionToken
} from './validation.js';
import { clearSession, loadConfig, loadSession, saveConfig, saveSession } from './storage.js';

export async function createSession(
  repoRoot: string,
  config: GitGrassConfig,
  durationMinutes?: number
): Promise<SessionData> {
  const chosenDuration = Math.max(10, durationMinutes || config.defaultDurationMinutes);
  const repoName = getRepositoryName(repoRoot);
  const stagedHash = await getStagedTreeHash(repoRoot);

  const { challenge } = await createOutdoorChallenge(repoRoot, config, chosenDuration);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hour session TTL

  const session: SessionData = {
    sessionId: generateSessionId(),
    sessionToken: generateSessionToken(),
    repositoryRoot: repoRoot,
    repositoryName: repoName,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: 'CHALLENGE_READY',
    requiredDurationMinutes: chosenDuration,
    breakStartedAt: null,
    breakCompletedAt: null,
    challenge,
    stagedTreeHash: stagedHash,
    userReflection: null,
    commitMessage: null,
    commitResult: null,
    pushResult: null
  };

  saveSession(repoRoot, session);
  return session;
}

export function startSessionBreak(repoRoot: string, sessionId: string, token: string): SessionData {
  const session = loadSession(repoRoot);
  if (!session || session.sessionId !== sessionId) {
    throw new Error('Session not found');
  }

  if (!validateSessionToken(session, token)) {
    throw new Error('Invalid session token');
  }

  if (isSessionExpired(session)) {
    throw new Error('Session has expired');
  }

  if (!canTransition(session.status, 'BREAK_IN_PROGRESS')) {
    throw new Error(`Cannot transition from ${session.status} to BREAK_IN_PROGRESS`);
  }

  session.status = 'BREAK_IN_PROGRESS';
  session.breakStartedAt = new Date().toISOString();
  saveSession(repoRoot, session);
  return session;
}

export function completeSessionBreak(
  repoRoot: string,
  sessionId: string,
  token: string,
  reflection: string,
  commitMessage?: string
): SessionData {
  const session = loadSession(repoRoot);
  if (!session || session.sessionId !== sessionId) {
    throw new Error('Session not found');
  }

  if (!validateSessionToken(session, token)) {
    throw new Error('Invalid session token');
  }

  if (isSessionExpired(session)) {
    throw new Error('Session has expired');
  }

  // Verify server elapsed time
  const { satisfied, elapsedMinutes, requiredMinutes } = hasSatisfiedBreakDuration(session);
  if (!satisfied) {
    throw new Error(
      `Break duration requirement not yet satisfied. Elapsed: ${elapsedMinutes}m, Required: ${requiredMinutes}m.`
    );
  }

  if (!canTransition(session.status, 'COMPLETED')) {
    throw new Error(`Cannot transition from ${session.status} to COMPLETED`);
  }

  session.status = 'COMPLETED';
  session.breakCompletedAt = new Date().toISOString();
  session.userReflection = reflection;
  if (commitMessage) {
    session.commitMessage = commitMessage.trim();
  }

  // Update repository's last break completed timestamp
  const config = loadConfig(repoRoot);
  config.lastBreakCompletedAt = session.breakCompletedAt;
  saveConfig(repoRoot, config);

  saveSession(repoRoot, session);
  return session;
}
