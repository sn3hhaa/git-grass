import type { OutdoorChallenge } from '../shared/types.js';
import type { ChallengeRequest } from './types.js';

interface CacheEntry {
  challenge: OutdoorChallenge;
  expiresAt: number;
}

export class ChallengeCache {
  private entries = new Map<string, CacheEntry>();
  private defaultTtlMs: number;

  constructor(defaultTtlMs: number = 60 * 60 * 1000) { // 1 hour TTL
    this.defaultTtlMs = defaultTtlMs;
  }

  private makeKey(req: ChallengeRequest): string {
    const normRepo = req.repositoryName.trim().toLowerCase();
    const normCategory = req.category.trim().toLowerCase();
    const duration = req.durationMinutes;
    return `${normRepo}:${normCategory}:${duration}`;
  }

  get(req: ChallengeRequest): OutdoorChallenge | null {
    const key = this.makeKey(req);
    const entry = this.entries.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.entries.delete(key);
      return null;
    }

    return entry.challenge;
  }

  set(req: ChallengeRequest, challenge: OutdoorChallenge, ttlMs?: number): void {
    const key = this.makeKey(req);
    const expiresAt = Date.now() + (ttlMs ?? this.defaultTtlMs);

    // Keep cache bounded to 1,000 entries max to prevent memory leakage on free tier
    if (this.entries.size > 1000) {
      const oldestKey = this.entries.keys().next().value;
      if (oldestKey) this.entries.delete(oldestKey);
    }

    this.entries.set(key, { challenge, expiresAt });
  }

  clear(): void {
    this.entries.clear();
  }

  size(): number {
    return this.entries.size;
  }
}
