import type { OutdoorChallenge } from '../../shared/types.js';
import type { ChallengeRequest, HostedAIProvider } from '../types.js';

export interface TinkerConfig {
  apiKey?: string;
  enabled?: boolean;
}

/**
 * TinkerProvider — Thinking Machines Tinker Integration.
 *
 * Evaluation Finding:
 * Thinking Machines Tinker is an experimental distributed model-training and
 * LoRA fine-tuning infrastructure API with low-level token sampling clients (SamplingClient),
 * rather than a turnkey chat-completion REST endpoint. Dedicated remote GPU allocations
 * on Tinker would risk unpredictable credit consumption.
 *
 * In accordance with the ₹0 additional-cost mandate, Tinker is disabled by default
 * and designated as an inactive/optional research provider to protect user credits.
 */
export class TinkerProvider implements HostedAIProvider {
  readonly name = 'tinker' as const;
  private apiKey: string;
  private enabled: boolean;

  constructor(config: TinkerConfig = {}) {
    this.apiKey = config.apiKey || process.env.TINKER_API_KEY || '';
    this.enabled = config.enabled ?? (process.env.ENABLE_TINKER_PROVIDER === 'true');
  }

  isConfigured(): boolean {
    return Boolean(this.enabled && this.apiKey && this.apiKey.trim().length > 0);
  }

  async generateChallenge(_request: ChallengeRequest): Promise<OutdoorChallenge | null> {
    if (!this.isConfigured()) {
      // Disabled by default to protect developer credits
      return null;
    }

    // If future turnkey REST text generation is enabled on Tinker, implementation connects here.
    return null;
  }
}

