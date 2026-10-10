export class InMemoryRateLimiter {
  private requests = new Map<string, number[]>();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(clientId: string): { allowed: boolean; remaining: number; retryAfterSeconds?: number } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    const timestamps = this.requests.get(clientId) || [];
    const validTimestamps = timestamps.filter((t) => t > windowStart);

    if (validTimestamps.length >= this.maxRequests) {
      const oldestValid = validTimestamps[0];
      const retryAfterSeconds = Math.ceil((oldestValid + this.windowMs - now) / 1000);
      return { allowed: false, remaining: 0, retryAfterSeconds };
    }

    validTimestamps.push(now);
    this.requests.set(clientId, validTimestamps);

    // Periodic cleanup if map grows large
    if (this.requests.size > 5000) {
      for (const [key, ts] of this.requests.entries()) {
        const filtered = ts.filter((t) => t > windowStart);
        if (filtered.length === 0) {
          this.requests.delete(key);
        } else {
          this.requests.set(key, filtered);
        }
      }
    }

    return { allowed: true, remaining: this.maxRequests - validTimestamps.length };
  }

  reset(): void {
    this.requests.clear();
  }
}
