import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { OutdoorChallenge } from '../shared/types.js';
import type { ProjectContextSummary } from './context.js';
import { validateChallenge } from './schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function loadFallbackChallenges(): OutdoorChallenge[] {
  // Search in both development and compiled dist locations
  const possiblePaths = [
    path.resolve(__dirname, '../../challenges/fallback-challenges.json'),
    path.resolve(__dirname, '../challenges/fallback-challenges.json'),
    path.resolve(process.cwd(), 'challenges/fallback-challenges.json')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
        if (Array.isArray(raw)) {
          return raw.map((item) => validateChallenge(item));
        }
      } catch {
        // continue
      }
    }
  }

  // Hardcoded emergency fallback challenge
  return [
    {
      title: 'Mindful Outdoor Perimeter Walk',
      projectContext: 'Development Focus Reset',
      durationMinutes: 15,
      category: 'general',
      instructions: [
        'Step outside your workspace into the fresh air.',
        'Walk in a continuous circle around your building, yard, or park.',
        'Observe three distinct natural objects: clouds, trees, or birds.',
        'Leave your phone locked in your pocket for the duration.'
      ],
      reflectionPrompt: 'What was the most refreshing observation you noticed while stepping away?',
      phoneFree: true,
      safetyNotes: [
        'Stay aware of surroundings.',
        'Stay on public sidewalks.',
        'Keep well hydrated.'
      ]
    }
  ];
}

export function getFallbackChallenge(
  context: ProjectContextSummary,
  durationMinutes: number
): OutdoorChallenge {
  const all = loadFallbackChallenges();

  // Try matching category
  const matchingCategory = all.filter((c) => c.category === context.category);
  const pool = matchingCategory.length > 0 ? matchingCategory : all;

  // Pick one randomly or deterministic based on repo name
  const index = Math.abs(
    context.repositoryName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % pool.length;

  const selected = { ...pool[index] };
  selected.durationMinutes = Math.max(10, durationMinutes);
  selected.projectContext = `${context.repositoryName} (${context.projectDescription.slice(0, 50)})`;

  return selected;
}
