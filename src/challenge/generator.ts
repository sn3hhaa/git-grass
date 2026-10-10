import type { GitGrassConfig, OutdoorChallenge } from '../shared/types.js';
import { extractProjectContext } from './context.js';
import { getFallbackChallenge } from './fallback.js';
import { generateOllamaChallenge, isModelAvailable, isOllamaAvailable } from './ollama.js';

export async function createOutdoorChallenge(
  repoRoot: string,
  config: GitGrassConfig,
  durationMinutes: number
): Promise<{ challenge: OutdoorChallenge; source: 'ollama' | 'fallback' }> {
  const context = extractProjectContext(repoRoot);
  const duration = Math.max(10, durationMinutes);

  // If configured to use Ollama or auto
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
            return { challenge: generated, source: 'ollama' };
          }
        } catch {
          // Fall through to fallback
        }
      }
    }
  }

  // Graceful fallback to bundled challenge library
  const fallback = getFallbackChallenge(context, duration);
  return { challenge: fallback, source: 'fallback' };
}
