import { describe, it, expect } from 'vitest';
import { OutdoorChallengeSchema, validateChallenge } from '../src/challenge/schema.js';
import { loadFallbackChallenges, getFallbackChallenge } from '../src/challenge/fallback.js';
import { extractProjectContext } from '../src/challenge/context.js';

describe('git-grass challenge engine', () => {
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
