import type { OutdoorChallenge } from '../shared/types.js';
import type { ProjectContextSummary } from './context.js';
import { validateChallenge } from './schema.js';

export interface HostedChallengeResult {
  challenge: OutdoorChallenge;
  source: 'backboard' | 'tinker' | 'fallback' | 'hosted-ai';
  model?: string;
  cached: boolean;
}

export async function isHostedBackendAvailable(
  baseUrl: string,
  timeoutMs: number = 2500
): Promise<{ available: boolean; provider?: string; model?: string }> {
  try {
    const cleanUrl = baseUrl.replace(/\/$/, '');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(`${cleanUrl}/health`, {
      signal: controller.signal
    });
    clearTimeout(timer);

    if (!res.ok) return { available: false };
    const data: any = await res.json();
    return {
      available: data?.status === 'ok',
      provider: data?.provider,
      model: data?.model
    };
  } catch {
    return { available: false };
  }
}

export async function fetchHostedChallenge(
  baseUrl: string,
  context: ProjectContextSummary,
  durationMinutes: number,
  timeoutMs: number = 6000
): Promise<HostedChallengeResult | null> {
  const cleanUrl = baseUrl.replace(/\/$/, '');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${cleanUrl}/api/challenge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-GitGrass-Client': 'cli'
      },
      body: JSON.stringify({
        repositoryName: context.repositoryName,
        projectDescription: context.projectDescription,
        category: context.category,
        durationMinutes,
        detectedKeywords: context.detectedKeywords
      }),
      signal: controller.signal
    });
    clearTimeout(timer);

    if (!response.ok) {
      return null;
    }

    const data: any = await response.json();
    if (!data.success || !data.challenge) {
      return null;
    }

    const validated = validateChallenge(data.challenge);
    return {
      challenge: validated,
      source: data.source || 'hosted-ai',
      model: data.model,
      cached: Boolean(data.cached)
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
