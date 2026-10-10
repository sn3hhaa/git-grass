import type { GitGrassConfig, OutdoorChallenge } from '../shared/types.js';
import { extractProjectContext } from './context.js';
import { getFallbackChallenge } from './fallback.js';
import { generateOllamaChallenge, isModelAvailable, isOllamaAvailable } from './ollama.js';
import { fetchHostedChallenge } from './hosted-client.js';

export type ChallengeEngineSource = 'backboard' | 'hosted-ai' | 'tinker' | 'ollama' | 'fallback';

export async function createOutdoorChallenge(
  repoRoot: string,
  config: GitGrassConfig,
  durationMinutes: number
): Promise<{ challenge: OutdoorChallenge; source: ChallengeEngineSource; model?: string }> {
  const context = extractProjectContext(repoRoot);
  const duration = Math.max(10, durationMinutes);

  // 1. Check for Render-hosted AI Backend first (zero laptop dependencies, no models, no Docker)
  const backendUrl = process.env.GIT_GRASS_BACKEND_URL || config.hostedBackendUrl;
  if (backendUrl && backendUrl.trim().length > 0) {
    try {
      const hostedResult = await fetchHostedChallenge(backendUrl, context, duration);
      if (hostedResult && hostedResult.challenge) {
        return {
          challenge: hostedResult.challenge,
          source: (hostedResult.source as ChallengeEngineSource) || 'hosted-ai',
          model: hostedResult.model
        };
      }
    } catch {
      // Fall through cleanly
    }
  }

  // 2. Check for Local Ollama if configured
  if (config.aiProvider === 'ollama' || config.aiProvider === 'auto') {
    const available = await isOllamaAvailable(config.ollamaHost, 1500);
    if (available) {
      const modelOk = await isModelAvailable(config.aiModel, config.ollamaHost);
      if (modelOk) {
        try {
          const generated = await generateOllamaChallenge(context, duration, {
            host: config.ollamaHost,
            model: config.aiModel,
            timeoutMs: 6000
          });

          if (generated) {
            return { challenge: generated, source: 'ollama', model: config.aiModel };
          }
        } catch {
          // Fall through to fallback
        }
      }
    }
  }

  // 3. Graceful zero-dependency fallback to curated offline challenge library
  const fallback = getFallbackChallenge(context, duration);
  return { challenge: fallback, source: 'fallback' };
}
