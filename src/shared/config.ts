import { z } from 'zod';
import type { GitGrassConfig } from './types.js';

export const MIN_ALLOWED_BREAK_MINUTES = 10;
export const DEFAULT_BREAK_INTERVAL_MINUTES = 60;
export const DEFAULT_DURATION_MINUTES = 15;
export const DEFAULT_ALLOWED_DURATIONS = [10, 15, 20, 30];

export const PreferencesSchema = z.object({
  mobilityPreference: z
    .enum(['walking', 'sitting', 'stretching', 'wheelchair-accessible', 'any'])
    .default('any'),
  environmentPreference: z
    .enum(['park', 'urban', 'yard', 'balcony', 'any'])
    .default('any')
});

export const ConfigSchema = z.object({
  version: z.number().int().default(1),
  breakIntervalMinutes: z
    .number()
    .int()
    .min(10, 'Break interval cannot be less than 10 minutes')
    .default(DEFAULT_BREAK_INTERVAL_MINUTES),
  defaultDurationMinutes: z
    .number()
    .int()
    .min(MIN_ALLOWED_BREAK_MINUTES, 'Default duration cannot be less than 10 minutes')
    .default(DEFAULT_DURATION_MINUTES),
  allowedDurationsMinutes: z
    .array(z.number().int().min(MIN_ALLOWED_BREAK_MINUTES))
    .min(1)
    .default(DEFAULT_ALLOWED_DURATIONS)
    .refine(
      (durations) => durations.every((d) => d >= MIN_ALLOWED_BREAK_MINUTES),
      {
        message: `All break durations must be at least ${MIN_ALLOWED_BREAK_MINUTES} minutes`
      }
    ),
  minDurationMinutes: z
    .literal(MIN_ALLOWED_BREAK_MINUTES)
    .default(MIN_ALLOWED_BREAK_MINUTES),
  aiProvider: z.enum(['ollama', 'fallback', 'auto']).default('auto'),
  aiModel: z.string().default('gemma:2b'),
  ollamaHost: z.string().default('http://127.0.0.1:11434'),
  autoPush: z.boolean().default(false),
  preferences: PreferencesSchema.default({}),
  lastBreakCompletedAt: z.string().datetime().nullable().default(null)
});

export function getDefaultConfig(): GitGrassConfig {
  return ConfigSchema.parse({});
}

export function parseConfig(raw: unknown): GitGrassConfig {
  const parsed = ConfigSchema.safeParse(raw);
  if (!parsed.success) {
    const errorMessages = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    throw new Error(`Invalid git-grass configuration: ${errorMessages}`);
  }
  return parsed.data;
}

export function isBreakDue(config: GitGrassConfig, now: Date = new Date()): { due: boolean; minutesElapsed: number } {
  if (!config.lastBreakCompletedAt) {
    // If no break was ever recorded, check if interval has elapsed since repo creation or treat as due
    return { due: true, minutesElapsed: Infinity };
  }

  const lastTime = new Date(config.lastBreakCompletedAt).getTime();
  const diffMs = now.getTime() - lastTime;
  const minutesElapsed = Math.floor(diffMs / (1000 * 60));

  return {
    due: minutesElapsed >= config.breakIntervalMinutes,
    minutesElapsed: Math.max(0, minutesElapsed)
  };
}
