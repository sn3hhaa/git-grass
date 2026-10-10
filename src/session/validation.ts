import crypto from 'node:crypto';
import type { SessionData, SessionState } from '../shared/types.js';

export function generateSessionToken(): string {
  return crypto.randomBytes(24).toString('hex');
}

export function generateSessionId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomBytes(4).toString('hex');
  return `grass-${dateStr}-${rand}`;
}

const ALLOWED_TRANSITIONS: Record<SessionState, SessionState[]> = {
  IDLE: ['BREAK_REQUIRED', 'SESSION_CREATED'],
  BREAK_REQUIRED: ['SESSION_CREATED'],
  SESSION_CREATED: ['CHALLENGE_READY'],
  CHALLENGE_READY: ['BREAK_IN_PROGRESS'],
  BREAK_IN_PROGRESS: ['AWAITING_COMPLETION', 'COMPLETED'],
  AWAITING_COMPLETION: ['COMPLETED'],
  COMPLETED: ['COMMITTING'],
  COMMITTING: ['COMMITTED', 'COMPLETED'], // allow retry if commit failed safely
  COMMITTED: ['PUSHED', 'PUSH_FAILED', 'IDLE'],
  PUSHED: ['IDLE'],
  PUSH_FAILED: ['IDLE']
};

export function canTransition(current: SessionState, next: SessionState): boolean {
  if (current === next) return true;
  const allowed = ALLOWED_TRANSITIONS[current];
  return allowed ? allowed.includes(next) : false;
}

export function validateSessionToken(session: SessionData, token: string): boolean {
  if (!token || !session.sessionToken) return false;
  // Use constant time comparison
  try {
    const a = Buffer.from(token);
    const b = Buffer.from(session.sessionToken);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function isSessionExpired(session: SessionData, now: Date = new Date()): boolean {
  const expiresAt = new Date(session.expiresAt).getTime();
  return now.getTime() > expiresAt;
}

/**
 * Validates whether the required break duration has been physically satisfied on the server.
 * Phone timestamps are untrusted; only server's breakStartedAt is authoritative.
 */
export function hasSatisfiedBreakDuration(session: SessionData, now: Date = new Date()): { satisfied: boolean; elapsedMinutes: number; requiredMinutes: number } {
  if (!session.breakStartedAt) {
    return { satisfied: false, elapsedMinutes: 0, requiredMinutes: session.requiredDurationMinutes };
  }

  const startTime = new Date(session.breakStartedAt).getTime();
  const elapsedMs = now.getTime() - startTime;
  const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));

  return {
    satisfied: elapsedMinutes >= session.requiredDurationMinutes,
    elapsedMinutes: Math.max(0, elapsedMinutes),
    requiredMinutes: session.requiredDurationMinutes
  };
}
