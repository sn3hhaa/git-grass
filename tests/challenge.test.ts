import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OutdoorChallengeSchema, validateChallenge } from '../src/challenge/schema.js';
import { loadFallbackChallenges, getFallbackChallenge } from '../src/challenge/fallback.js';
import { extractProjectContext } from '../src/challenge/context.js';
import {
  generateOllamaChallenge,
  isModelAvailable,
  isOllamaAvailable
} from '../src/challenge/ollama.js';
import { createOutdoorChallenge } from '../src/challenge/generator.js';
import { getDefaultConfig } from '../src/shared/config.js';

describe('git-grass challenge schema & fallback engine', () => {
  it('validates a correct outdoor challenge structure', () => {
    const raw = {
      title: 'Forest Texture Walk',
      projectContext: 'graphics-engine',
      durationMinutes: 15,
      category: 'gamedev',
      instructions: [
        'Step outside for 15 minutes away from screens.',
        'Observe three natural organic surfaces.'
      ],
      reflectionPrompt: 'Which surface had the most complex roughness?',
      phoneFree: true,
      safetyNotes: ['Stay on public pathways.']
    };

    const validated = validateChallenge(raw);
    expect(validated.title).toBe('Forest Texture Walk');
    expect(validated.phoneFree).toBe(true);
    expect(validated.durationMinutes).toBe(15);
  });

  it('rejects invalid challenges that violate phone-free rule or duration constraint', () => {
    expect(() => {
      validateChallenge({
        title: 'Screen Test',
        projectContext: 'test',
        durationMinutes: 5, // under 10m
        category: 'general',
        instructions: ['Test code on laptop'],
        reflectionPrompt: 'Prompt',
        phoneFree: true
      });
    }).toThrow();

    expect(() => {
      validateChallenge({
        title: 'Phone Walk',
        projectContext: 'test',
        durationMinutes: 15,
        category: 'general',
        instructions: ['Walk with phone on'],
        reflectionPrompt: 'Prompt',
        phoneFree: false // must be true
      });
    }).toThrow();
  });

  it('loads fallback challenges and matches project categories', () => {
    const fallbacks = loadFallbackChallenges();
    expect(fallbacks.length).toBeGreaterThan(0);

    const context = {
      repositoryName: 'retro-game-2d',
      projectDescription: 'A 2D platformer built with canvas',
      category: 'gamedev' as const,
      detectedKeywords: ['game', 'canvas']
    };

    const challenge = getFallbackChallenge(context, 20);
    expect(challenge.durationMinutes).toBe(20);
    expect(challenge.category).toBe('gamedev');
    expect(challenge.phoneFree).toBe(true);
    expect(challenge.instructions.length).toBeGreaterThan(0);
  });
});

describe('git-grass local Ollama AI integration (Mocked)', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('sends correctly formatted request to local Ollama with target model gemma3:1b', async () => {
    let capturedUrl = '';
    let capturedBody: any = null;

    const mockResponsePayload = {
      title: 'Branch Geometry Walk',
      projectContext: 'sample-project',
      durationMinutes: 15,
      category: 'systems',
      instructions: [
        'Step outside for a 15-minute perimeter walk.',
        'Observe how tree branches split and distribute structural load.'
      ],
      reflectionPrompt: 'What branching pattern reminded you of graph data structures?',
      phoneFree: true,
      safetyNotes: ['Watch your footing on uneven surfaces.']
    };

    globalThis.fetch = vi.fn().mockImplementation(async (url: string, options: any) => {
      capturedUrl = url;
      capturedBody = JSON.parse(options.body);
      return {
        ok: true,
        json: async () => ({
          response: JSON.stringify(mockResponsePayload)
        })
      };
    });

    const context = {
      repositoryName: 'sample-project',
      projectDescription: 'Distributed systems library',
      category: 'systems' as const,
      detectedKeywords: ['distributed', 'systems']
    };

    const result = await generateOllamaChallenge(context, 15, {
      host: 'http://127.0.0.1:11434',
      model: 'gemma3:1b',
      timeoutMs: 3000
    });

    expect(capturedUrl).toBe('http://127.0.0.1:11434/api/generate');
    expect(capturedBody.model).toBe('gemma3:1b');
    expect(capturedBody.format).toBe('json');
    expect(capturedBody.stream).toBe(false);

    expect(result).not.toBeNull();
    expect(result?.title).toBe('Branch Geometry Walk');
    expect(result?.phoneFree).toBe(true);
    expect(result?.durationMinutes).toBe(15);
  });

  it('rejects invalid JSON response from model and returns null', async () => {
    globalThis.fetch = vi.fn().mockImplementation(async () => ({
      ok: true,
      json: async () => ({
        response: 'This is not JSON text at all, just plain words.'
      })
    }));

    const context = {
      repositoryName: 'bad-json-repo',
      projectDescription: 'testing',
      category: 'general' as const,
      detectedKeywords: []
    };

    const result = await generateOllamaChallenge(context, 10);
    expect(result).toBeNull();
  });

  it('rejects schema-violating output (e.g. phoneFree: false or sub-10m duration)', async () => {
    const invalidChallenge = {
      title: 'Quick indoor test',
      projectContext: 'invalid',
      durationMinutes: 5, // violates >= 10m rule
      category: 'general',
      instructions: ['Stay inside and stare at phone'],
      reflectionPrompt: 'Prompt',
      phoneFree: false // violates phone-free requirement
    };

    globalThis.fetch = vi.fn().mockImplementation(async () => ({
      ok: true,
      json: async () => ({
        response: JSON.stringify(invalidChallenge)
      })
    }));

    const context = {
      repositoryName: 'schema-violation',
      projectDescription: 'testing',
      category: 'general' as const,
      detectedKeywords: []
    };

    const result = await generateOllamaChallenge(context, 10);
    expect(result).toBeNull();
  });

  it('handles Ollama connection failure gracefully', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('ECONNREFUSED: Connection refused'));

    const isAvailable = await isOllamaAvailable('http://127.0.0.1:11434', 500);
    expect(isAvailable).toBe(false);

    const modelAvailable = await isModelAvailable('gemma3:1b', 'http://127.0.0.1:11434');
    expect(modelAvailable).toBe(false);
  });

  it('detects model presence accurately from Ollama tags response', async () => {
    globalThis.fetch = vi.fn().mockImplementation(async () => ({
      ok: true,
      json: async () => ({
        models: [
          { name: 'gemma3:1b', size: 1024000000 },
          { name: 'llama3:latest', size: 4000000000 }
        ]
      })
    }));

    const hasGemma = await isModelAvailable('gemma3:1b', 'http://127.0.0.1:11434');
    expect(hasGemma).toBe(true);

    const hasMissing = await isModelAvailable('mistral:7b', 'http://127.0.0.1:11434');
    expect(hasMissing).toBe(false);
  });

  it('gracefully falls back to curated challenge when Ollama times out or is missing', async () => {
    // Simulate Ollama completely offline
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Connection timed out'));

    const config = getDefaultConfig();
    config.aiProvider = 'auto';
    config.aiModel = 'gemma3:1b';

    const { challenge, source } = await createOutdoorChallenge(process.cwd(), config, 15);
    expect(source).toBe('fallback');
    expect(challenge).toBeDefined();
    expect(challenge.phoneFree).toBe(true);
    expect(challenge.durationMinutes).toBe(15);
    expect(challenge.instructions.length).toBeGreaterThan(0);
  });

  it('does not transmit repository source code or environment secrets in challenge prompts', async () => {
    let capturedPrompt = '';
    globalThis.fetch = vi.fn().mockImplementation(async (_url: string, options: any) => {
      const body = JSON.parse(options.body);
      capturedPrompt = body.prompt;
      return {
        ok: true,
        json: async () => ({
          response: JSON.stringify({
            title: 'Cloud Observation',
            projectContext: 'test',
            durationMinutes: 10,
            category: 'general',
            instructions: ['Walk outdoors'],
            reflectionPrompt: 'Prompt',
            phoneFree: true,
            safetyNotes: ['Safe']
          })
        })
      };
    });

    const context = {
      repositoryName: 'secret-auth-service',
      projectDescription: 'A secure JWT authentication microservice',
      category: 'systems' as const,
      detectedKeywords: ['jwt', 'auth']
    };

    await generateOllamaChallenge(context, 10);

    // Verify prompt contains bounded high-level summary only
    expect(capturedPrompt).toContain('secret-auth-service');
    expect(capturedPrompt).toContain('A secure JWT authentication microservice');
    // Prompt must NOT contain raw files, environment variables, or private keys
    expect(capturedPrompt).not.toContain('process.env');
    expect(capturedPrompt).not.toContain('PRIVATE_KEY');
    expect(capturedPrompt).not.toContain('Bearer');
  });
});

describe('git-grass local Ollama real inference (Opt-in live integration)', () => {
  const runLiveTest = process.env.TEST_REAL_OLLAMA === '1';

  it.skipIf(!runLiveTest)(
    'performs real local inference through local Ollama API if TEST_REAL_OLLAMA=1',
    async () => {
      const available = await isOllamaAvailable('http://127.0.0.1:11434', 2000);
      if (!available) {
        console.warn('Real Ollama integration test skipped: Ollama API not running at 127.0.0.1:11434');
        return;
      }

      const modelOk = await isModelAvailable('gemma3:1b', 'http://127.0.0.1:11434');
      if (!modelOk) {
        console.warn('Real Ollama integration test skipped: gemma3:1b model not installed');
        return;
      }

      const context = {
        repositoryName: 'live-test-repo',
        projectDescription: 'Git native health gating',
        category: 'general' as const,
        detectedKeywords: ['git', 'wellness']
      };

      const result = await generateOllamaChallenge(context, 10, {
        model: 'gemma3:1b',
        timeoutMs: 15000
      });

      expect(result).not.toBeNull();
      expect(result?.phoneFree).toBe(true);
      expect(result?.durationMinutes).toBe(10);
    }
  );
});
