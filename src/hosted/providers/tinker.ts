import { validateChallenge } from '../../challenge/schema.js';
import type { OutdoorChallenge } from '../../shared/types.js';
import type { ChallengeRequest, HostedAIProvider } from '../types.js';
import { buildChallengePrompt } from './base.js';

export interface TinkerConfig {
  apiKey?: string;
  baseUrl?: string;
  modelName?: string;
  enabled?: boolean;
  timeoutMs?: number;
}

/**
 * TinkerProvider — Thinking Machines Tinker Open-Weight Sampling Integration.
 *
 * Implements OpenAI-compatible / Tinker sampling inference for open-weight models
 * (e.g. Qwen3 / Llama-3 LoRA adapters on Thinking Machines Tinker infrastructure)
 * with strict OutdoorChallengeSchema validation and credit-guard rail controls.
 */
export class TinkerProvider implements HostedAIProvider {
  readonly name = 'tinker' as const;
  private apiKey: string;
  private baseUrl: string;
  private modelName: string;
  private enabled: boolean;
  private timeoutMs: number;

  constructor(config: TinkerConfig = {}) {
    this.apiKey = config.apiKey ?? process.env.TINKER_API_KEY ?? '';
    this.baseUrl = (config.baseUrl || process.env.TINKER_BASE_URL || 'https://api.thinkingmachines.ai/v1').replace(/\/$/, '');
    this.modelName = config.modelName || process.env.TINKER_MODEL || 'Qwen/Qwen3-30B-A3B';
    this.enabled = config.enabled ?? (process.env.ENABLE_TINKER_PROVIDER !== 'false');
    this.timeoutMs = config.timeoutMs || 8000;
  }

  isConfigured(): boolean {
    return Boolean(this.enabled && this.apiKey && this.apiKey.trim().length > 0);
  }

  getModelInfo(): { provider: string; model: string } {
    return { provider: 'tinker', model: this.modelName };
  }

  async generateChallenge(request: ChallengeRequest): Promise<OutdoorChallenge | null> {
    if (!this.isConfigured()) {
      return null;
    }

    const prompt = buildChallengePrompt(request);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            {
              role: 'system',
              content: 'You generate valid JSON outdoor challenges tailored to the developer repository.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7
        }),
        signal: controller.signal
      });

      clearTimeout(timer);

      if (!response.ok) {
        return null;
      }

      const body: any = await response.json();
      const content = body?.choices?.[0]?.message?.content || body?.content;
      if (!content || typeof content !== 'string') {
        return null;
      }

      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
      const rawJson = jsonMatch[1] ? jsonMatch[1].trim() : content.trim();

      return validateChallenge(JSON.parse(rawJson));
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }
}
