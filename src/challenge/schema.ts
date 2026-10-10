import { z } from 'zod';
import type { OutdoorChallenge } from '../shared/types.js';

export const OutdoorChallengeSchema = z.object({
  title: z.string().min(3),
  projectContext: z.string().min(3),
  durationMinutes: z.number().int().min(10),
  category: z.string().min(2),
  instructions: z.array(z.string().min(5)).min(1),
  reflectionPrompt: z.string().min(5),
  phoneFree: z.literal(true),
  safetyNotes: z.array(z.string()).default([
    'Remain aware of your surroundings at all times.',
    'Do not trespass on private property.',
    'Stay hydrated and observe local weather conditions.'
  ])
});

export function validateChallenge(data: unknown): OutdoorChallenge {
  const parsed = OutdoorChallengeSchema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    throw new Error(`Invalid outdoor challenge payload: ${issues}`);
  }
  return parsed.data;
}
