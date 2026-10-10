import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import type { Server } from 'node:http';
import { createHostedServerApp } from '../src/hosted/server.js';
import { BackboardProvider } from '../src/hosted/providers/backboard.js';
import { TinkerProvider } from '../src/hosted/providers/tinker.js';
import { ChallengeCache } from '../src/hosted/cache.js';
import { InMemoryRateLimiter } from '../src/hosted/rate-limiter.js';
import { isHostedBackendAvailable, fetchHostedChallenge } from '../src/challenge/hosted-client.js';
import { createOutdoorChallenge } from '../src/challenge/generator.js';
import { getDefaultConfig } from '../src/shared/config.js';
import type { ChallengeRequest } from '../src/hosted/types.js';

describe('git-grass hosted AI backend & providers', () => {
  let server: Server;
  let port: number;
  let baseUrl: string;

  beforeAll(async () => {
    const app = createHostedServerApp({
      cacheTtlMs: 60 * 1000,
      rateLimitMax: 100,
      rateLimitWindowMs: 10 * 1000
    });

    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr: any = server.address();
        port = addr.port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  describe('Health check endpoint', () => {
    it('GET /health returns 200 with service information and provider metadata', async () => {
      const res = await fetch(`${baseUrl}/health`);
      expect(res.status).toBe(200);
      const data: any = await res.json();
      expect(data.status).toBe('ok');
      expect(data.service).toBe('git-grass-hosted-ai');
      expect(typeof data.provider).toBe('string');
      expect(typeof data.uptime).toBe('number');
      expect(typeof data.timestamp).toBe('string');
    });
  });

  describe('Challenge generation API & validation', () => {
    const validPayload: ChallengeRequest = {
      repositoryName: 'test-backend',
      projectDescription: 'Distributed backend service',
      category: 'systems',
      durationMinutes: 15,
      detectedKeywords: ['node', 'redis', 'cluster']
    };

    it('rejects invalid request payloads with 400 and validation error message', async () => {
      // Missing repositoryName
      const invalidRes1 = await fetch(`${baseUrl}/api/challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationMinutes: 15, category: 'systems' })
      });
      expect(invalidRes1.status).toBe(400);
      const data1: any = await invalidRes1.json();
      expect(data1.error).toContain('repositoryName');

      // Duration under 10 minutes (minimum requirement)
      const invalidRes2 = await fetch(`${baseUrl}/api/challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validPayload, durationMinutes: 5 })
      });
      expect(invalidRes2.status).toBe(400);
      const data2: any = await invalidRes2.json();
      expect(data2.error).toContain('durationMinutes');

      // Invalid category
      const invalidRes3 = await fetch(`${baseUrl}/api/challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validPayload, category: 'non-existent-category' })
      });
      expect(invalidRes3.status).toBe(400);
    });

    it('generates a valid outdoor challenge structure adhering to schema', async () => {
      const res = await fetch(`${baseUrl}/api/challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload)
      });
      expect(res.status).toBe(200);
      const data: any = await res.json();
      expect(data.success).toBe(true);
      expect(data.challenge).toBeDefined();
      expect(data.challenge.phoneFree).toBe(true);
      expect(data.challenge.durationMinutes).toBe(15);
      expect(Array.isArray(data.challenge.instructions)).toBe(true);
      expect(data.challenge.instructions.length).toBeGreaterThanOrEqual(2);
      expect(typeof data.challenge.reflectionPrompt).toBe('string');
    });

    it('uses in-memory cache to prevent duplicate inference and protect credits', async () => {
      // First request (could be cached from previous test or newly cached)
      const res1 = await fetch(`${baseUrl}/api/challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload)
      });
      const data1: any = await res1.json();
      expect(res1.status).toBe(200);

      // Second identical request must return cached: true
      const res2 = await fetch(`${baseUrl}/api/challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload)
      });
      const data2: any = await res2.json();
      expect(res2.status).toBe(200);
      expect(data2.cached).toBe(true);
      expect(data2.challenge.title).toBe(data1.challenge.title);
    });

    it('enforces rate limiting when request limit is exceeded', async () => {
      const rateApp = createHostedServerApp({
        cacheTtlMs: 1000,
        rateLimitMax: 2,
        rateLimitWindowMs: 5000
      });
      const srv: Server = await new Promise((resolve) => {
        const s: Server = rateApp.listen(0, '127.0.0.1', () => resolve(s));
      });
      const testPort = (srv.address() as any).port;

      try {
        const u = `http://127.0.0.1:${testPort}/api/challenge`;
        await fetch(u, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validPayload)
        });
        await fetch(u, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validPayload)
        });
        const res = await fetch(u, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validPayload)
        });
        expect(res.status).toBe(429);
        const data: any = await res.json();
        expect(data.error).toContain('Too many requests');
        expect(data.retryAfterSeconds).toBeGreaterThan(0);
      } finally {
        await new Promise<void>((resolve) => srv.close(() => resolve()));
      }
    });
  });

  describe('Cache & Rate Limiter unit tests', () => {
    it('ChallengeCache accurately indexes and evicts on TTL', () => {
      const cache = new ChallengeCache(50); // 50ms TTL
      const req: ChallengeRequest = {
        repositoryName: 'lru-repo',
        projectDescription: 'testing',
        category: 'frontend',
        durationMinutes: 10
      };

      const dummyChallenge = {
        title: 'Cache Walk',
        projectContext: 'frontend',
        durationMinutes: 10,
        category: 'frontend' as const,
        instructions: ['Step outside', 'Breathe fresh air'],
        reflectionPrompt: 'Notice colors',
        phoneFree: true,
        safetyNotes: ['Watch traffic']
      };

      cache.set(req, dummyChallenge);
      expect(cache.get(req)?.title).toBe('Cache Walk');

      // Different request should be a miss
      expect(cache.get({ ...req, durationMinutes: 20 })).toBeNull();
    });

    it('InMemoryRateLimiter tracks sliding window correctly', () => {
      const limiter = new InMemoryRateLimiter(2, 1000); // 2 requests per second
      expect(limiter.isAllowed('1.2.3.4').allowed).toBe(true);
      expect(limiter.isAllowed('1.2.3.4').allowed).toBe(true);
      const blocked = limiter.isAllowed('1.2.3.4');
      expect(blocked.allowed).toBe(false);
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0);

      // Separate IP should be allowed
      expect(limiter.isAllowed('5.6.7.8').allowed).toBe(true);
    });
  });

  describe('BackboardProvider client unit tests', () => {
    const dummyReq: ChallengeRequest = {
      repositoryName: 'auth-service',
      projectDescription: 'OAuth2 authentication server',
      category: 'security',
      durationMinutes: 12,
      detectedKeywords: ['oauth', 'jwt']
    };

    it('returns null if apiKey is not configured', async () => {
      const provider = new BackboardProvider({ apiKey: '' });
      expect(provider.isConfigured()).toBe(false);
      const res = await provider.generateChallenge(dummyReq);
      expect(res).toBeNull();
    });

    it('successfully parses valid JSON response from Backboard API', async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          content: JSON.stringify({
            title: 'Security Boundary Stroll',
            projectContext: 'auth-service',
            durationMinutes: 12,
            category: 'security',
            instructions: [
              'Walk outside to the perimeter of your current building or garden.',
              'Observe physical access boundaries (fences, doors, paths).'
            ],
            reflectionPrompt: 'How do physical perimeters compare to token expiry boundaries?',
            phoneFree: true,
            safetyNotes: ['Do not enter restricted or private property.']
          })
        })
      }) as any;

      try {
        const provider = new BackboardProvider({
          apiKey: 'test-secret-key-12345',
          baseUrl: 'https://app.backboard.io/api'
        });
        expect(provider.isConfigured()).toBe(true);
        const challenge = await provider.generateChallenge(dummyReq);
        expect(challenge).not.toBeNull();
        expect(challenge?.title).toBe('Security Boundary Stroll');
        expect(challenge?.phoneFree).toBe(true);
        expect(challenge?.durationMinutes).toBe(12);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('successfully extracts JSON wrapped in markdown codeblocks from Backboard API', async () => {
      const originalFetch = globalThis.fetch;
      const markdownWrapped = `Here is your outdoor challenge:
\`\`\`json
{
  "title": "Markdown Fence Walk",
  "projectContext": "auth-service",
  "durationMinutes": 12,
  "category": "security",
  "instructions": [
    "Step outside away from screens for 12 minutes.",
    "Look up at open sky and relax your optical focus."
  ],
  "reflectionPrompt": "What cleared in your thoughts during the walk?",
  "phoneFree": true,
  "safetyNotes": ["Stay on sidewalks."]
}
\`\`\``;

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ content: markdownWrapped })
      }) as any;

      try {
        const provider = new BackboardProvider({ apiKey: 'test-secret-key' });
        const challenge = await provider.generateChallenge(dummyReq);
        expect(challenge).not.toBeNull();
        expect(challenge?.title).toBe('Markdown Fence Walk');
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('gracefully handles 401 Unauthorized from Backboard without leaking API key', async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ detail: 'Invalid API Key' })
      }) as any;

      try {
        const secretKey = 'super-secret-backboard-key-999';
        const provider = new BackboardProvider({ apiKey: secretKey });
        const challenge = await provider.generateChallenge(dummyReq);
        expect(challenge).toBeNull(); // Graceful degradation to null
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('gracefully handles 429 / Quota Exceeded and timeouts', async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => ({ error: 'Credit quota exceeded' })
      }) as any;

      try {
        const provider = new BackboardProvider({ apiKey: 'test-key' });
        const challenge = await provider.generateChallenge(dummyReq);
        expect(challenge).toBeNull();
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('gracefully handles malformed JSON response', async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ content: 'Not a JSON document at all' })
      }) as any;

      try {
        const provider = new BackboardProvider({ apiKey: 'test-key' });
        const challenge = await provider.generateChallenge(dummyReq);
        expect(challenge).toBeNull();
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });

  describe('TinkerProvider credit protection test', () => {
    it('is disabled by default to protect developer credits and returns null', async () => {
      const provider = new TinkerProvider({ apiKey: 'tinker-key-123', enabled: false });
      expect(provider.isConfigured()).toBe(false);
      const result = await provider.generateChallenge({
        repositoryName: 'ai-project',
        projectDescription: 'test',
        category: 'ai',
        durationMinutes: 10
      });
      expect(result).toBeNull();
    });
  });

  describe('HostedChallengeClient & Generator integration', () => {
    it('isHostedBackendAvailable detects online backend', async () => {
      const status = await isHostedBackendAvailable(baseUrl);
      expect(status.available).toBe(true);
      expect(status.provider).toBeDefined();
    });

    it('isHostedBackendAvailable safely returns false for unreachable backend', async () => {
      const status = await isHostedBackendAvailable('http://127.0.0.1:59999'); // closed port
      expect(status.available).toBe(false);
    });

    it('fetchHostedChallenge retrieves challenge from active server', async () => {
      const result = await fetchHostedChallenge(baseUrl, {
        repositoryName: 'cli-test-repo',
        projectDescription: 'Command line tool',
        category: 'general',
        detectedKeywords: ['terminal']
      }, 10);

      expect(result).not.toBeNull();
      expect(result?.challenge.durationMinutes).toBe(10);
      expect(result?.challenge.phoneFree).toBe(true);
    });

    it('createOutdoorChallenge falls back to bundled library if hosted backend is down', async () => {
      const config = {
        ...getDefaultConfig(),
        hostedBackendUrl: 'http://127.0.0.1:59999' // unreachable
      };

      const result = await createOutdoorChallenge(
        process.cwd(),
        config,
        10
      );

      expect(result).toBeDefined();
      expect(result.challenge).toBeDefined();
      expect(result.challenge.title).toBeDefined();
      expect(result.challenge.phoneFree).toBe(true);
      expect(result.challenge.durationMinutes).toBe(10);
      expect(result.source).toBe('fallback');
    });
  });
});
