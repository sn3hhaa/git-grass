import { z } from 'zod';
import { OutdoorChallengeSchema } from '../challenge/schema.js';
import type { OutdoorChallenge } from '../shared/types.js';

export const ChallengeRequestSchema = z.object({
  repositoryName: z.string().min(1).max(100),
  projectDescription: z.string().max(500).default(''),
  category: z.enum(['web', 'ml', 'systems', 'gamedev', 'audio', 'general']).default('general'),
  durationMinutes: z.number().int().min(10).max(120).default(15),
  detectedKeywords: z.array(z.string().max(50)).max(20).default([]),
  preferences: z
    .object({
      mobilityPreference: z.string().max(50).optional(),
      environmentPreference: z.string().max(50).optional()
    })
    .optional()
});

export type ChallengeRequest = z.infer<typeof ChallengeRequestSchema>;

export const ChallengeResponseSchema = z.object({
  success: z.boolean(),
  challenge: OutdoorChallengeSchema,
  source: z.enum(['backboard', 'tinker', 'fallback']),
  model: z.string().optional(),
  cached: z.boolean().default(false)
});

export type ChallengeResponse = z.infer<typeof ChallengeResponseSchema>;

export interface HostedAIProvider {
  name: 'backboard' | 'tinker' | 'fallback';
  generateChallenge(request: ChallengeRequest): Promise<OutdoorChallenge | null>;
}
