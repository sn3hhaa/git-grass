import { describe, it, expect } from 'vitest';
import {
  canTransition,
  generateSessionId,
  generateSessionToken,
  hasSatisfiedBreakDuration,
  isSessionExpired,
  validateSessionToken
} from '../src/session/validation.js';
import type { SessionData } from '../src/shared/types.js';

describe('git-grass session validation and state machine', () => {
  it('generates unique IDs and tokens', () => {
    const id1 = generateSessionId();
    const id2 = generateSessionId();
    expect(id1).toMatch(/^grass-\d{8}-[a-f0-9]{8}$/);
    expect(id1).not.toBe(id2);

    const token = generateSessionToken();
    expect(token.length).toBe(48); // 24 bytes hex
  });

  it('validates state transitions accurately', () => {
    expect(canTransition('IDLE', 'SESSION_CREATED')).toBe(true);
    expect(canTransition('CHALLENGE_READY', 'BREAK_IN_PROGRESS')).toBe(true);
    expect(canTransition('BREAK_IN_PROGRESS', 'COMPLETED')).toBe(true);
    expect(canTransition('COMPLETED', 'COMMITTING')).toBe(true);
    expect(canTransition('COMMITTING', 'COMMITTED')).toBe(true);

    // Invalid transitions
    expect(canTransition('IDLE', 'COMMITTED')).toBe(false);
    expect(canTransition('BREAK_IN_PROGRESS', 'COMMITTED')).toBe(false);
    expect(canTransition('CHALLENGE_READY', 'COMPLETED')).toBe(false);
  });

  it('validates cryptographic token matching', () => {
    const dummySession = {
      sessionToken: 'abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234'
    } as SessionData;

    expect(validateSessionToken(dummySession, 'abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234')).toBe(true);
    expect(validateSessionToken(dummySession, 'wrongtoken')).toBe(false);
    expect(validateSessionToken(dummySession, '')).toBe(false);
  });

  it('prevents completion prior to server elapsed duration', () => {
    const now = new Date();
    const session = {
      requiredDurationMinutes: 15,
      breakStartedAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString() // 5m ago
    } as SessionData;

    const check = hasSatisfiedBreakDuration(session, now);
    expect(check.satisfied).toBe(false);
    expect(check.elapsedMinutes).toBe(5);

    // After 16 minutes
    const futureSession = {
      requiredDurationMinutes: 15,
      breakStartedAt: new Date(now.getTime() - 16 * 60 * 1000).toISOString()
    } as SessionData;

    const checkFuture = hasSatisfiedBreakDuration(futureSession, now);
    expect(checkFuture.satisfied).toBe(true);
    expect(checkFuture.elapsedMinutes).toBe(16);
  });
});
