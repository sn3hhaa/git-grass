import express from 'express';
import type { Express, Request, Response } from 'express';
import { ChallengeRequestSchema, type ChallengeResponse } from './types.js';
import { ChallengeCache } from './cache.js';
import { InMemoryRateLimiter } from './rate-limiter.js';
import { getHostedProvider } from './providers/factory.js';
import { HostedFallbackProvider } from './providers/fallback.js';
import { BackboardProvider } from './providers/backboard.js';

export interface HostedServerOptions {
  cacheTtlMs?: number;
  rateLimitMax?: number;
  rateLimitWindowMs?: number;
}

export function createHostedServerApp(options: HostedServerOptions = {}): Express {
  const app = express();

  const cache = new ChallengeCache(options.cacheTtlMs);
  const rateLimiter = new InMemoryRateLimiter(options.rateLimitMax ?? 15, options.rateLimitWindowMs ?? 60 * 1000);
  const fallbackProvider = new HostedFallbackProvider();

  // Security: limit body size to 25kb
  app.use(express.json({ limit: '25kb' }));

  // CORS headers
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-GitGrass-Client');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // Health-check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    const provider = getHostedProvider();
    const isBackboard = provider instanceof BackboardProvider;

    res.json({
      status: 'ok',
      service: 'git-grass-hosted-ai',
      provider: provider.name,
      model: isBackboard ? (provider as BackboardProvider).getModelInfo().model : 'fallback',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // Challenge-generation endpoint
  app.post('/api/challenge', async (req: Request, res: Response): Promise<void> => {
    // 1. Rate limiting
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'anonymous';
    const rateCheck = rateLimiter.isAllowed(clientIp);

    if (!rateCheck.allowed) {
      res.status(429).json({
        error: 'Too many requests. Please wait before requesting another challenge.',
        retryAfterSeconds: rateCheck.retryAfterSeconds
      });
      return;
    }

    // 2. Validate request body
    const parseResult = ChallengeRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      const issues = parseResult.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
      res.status(400).json({ error: `Invalid request payload: ${issues}` });
      return;
    }

    const challengeReq = parseResult.data;

    // 3. Cache lookup (credit-saving safeguard)
    const cachedChallenge = cache.get(challengeReq);
    if (cachedChallenge) {
      const response: ChallengeResponse = {
        success: true,
        challenge: cachedChallenge,
        source: 'backboard',
        model: process.env.BACKBOARD_MODEL || 'gemini-2.0-flash',
        cached: true
      };
      res.json(response);
      return;
    }

    // 4. Invoke provider
    const provider = getHostedProvider();
    let challenge = null;

    try {
      challenge = await provider.generateChallenge(challengeReq);
    } catch {
      // Gracefully catch any unhandled provider exceptions without leaking errors
      challenge = null;
    }

    // 5. If provider failed or unconfigured, fall back to bundled challenge
    if (challenge) {
      cache.set(challengeReq, challenge);
      const isBackboard = provider instanceof BackboardProvider;
      const response: ChallengeResponse = {
        success: true,
        challenge,
        source: provider.name,
        model: isBackboard ? (provider as BackboardProvider).getModelInfo().model : undefined,
        cached: false
      };
      res.json(response);
      return;
    }

    // Fallback response
    const fallbackChallenge = await fallbackProvider.generateChallenge(challengeReq);
    if (!fallbackChallenge) {
      res.status(500).json({ error: 'Failed to generate challenge' });
      return;
    }

    res.json({
      success: true,
      challenge: fallbackChallenge,
      source: 'fallback',
      cached: false
    });
  });

  return app;
}
