import { getFallbackChallenge } from '../../challenge/fallback.js';
import type { OutdoorChallenge } from '../../shared/types.js';
import type { ChallengeRequest, HostedAIProvider } from '../types.js';

export class HostedFallbackProvider implements HostedAIProvider {
  readonly name = 'fallback' as const;

  async generateChallenge(request: ChallengeRequest): Promise<OutdoorChallenge | null> {
    const context = {
      repositoryName: request.repositoryName,
      projectDescription: request.projectDescription,
      category: request.category,
      detectedKeywords: request.detectedKeywords
    };

    return getFallbackChallenge(context, request.durationMinutes);
  }
}

