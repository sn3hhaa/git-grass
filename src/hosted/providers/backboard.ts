import { validateChallenge } from '../../challenge/schema.js';
import type { OutdoorChallenge } from '../../shared/types.js';
import type { ChallengeRequest, HostedAIProvider } from '../types.js';
import { buildChallengePrompt } from './base.js';

export interface BackboardConfig {
  apiKey?: string;
  baseUrl?: string;
  llmProvider?: string;
  modelName?: string;
  timeoutMs?: number;
}

export class BackboardProvider implements HostedAIProvider {
  readonly name = 'backboard' as const;
  private apiKey: string;
  private baseUrl: string;
  private llmProvider: string;
  private modelName: string;
  private timeoutMs: number;

  constructor(config: BackboardConfig = {}) {
    this.apiKey = config.apiKey || process.env.BACKBOARD_API_KEY || '';
    this.baseUrl = (config.baseUrl || process.env.BACKBOARD_BASE_URL || 'https://app.backboard.io/api').replace(/\/$/, '');
    this.llmProvider = config.llmProvider || process.env.BACKBOARD_PROVIDER || 'google';
    this.modelName = config.modelName || process.env.BACKBOARD_MODEL || 'gemini-2.0-flash';
    this.timeoutMs = config.timeoutMs || 8000;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  getModelInfo(): { provider: string; model: string } {
    return { provider: this.llmProvider, model: this.modelName };
  }

  async generateChallenge(request: ChallengeRequest): Promise<OutdoorChallenge | null> {
    if (!this.isConfigured()) {
      return null;
    }

    const prompt = buildChallengePrompt(request);
    const url = `${this.baseUrl}/threads/messages`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({
          content: prompt,
          llm_provider: this.llmProvider,
          model_name: this.modelName,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timer);

      if (!response.ok) {
        // Redact any secrets and return null
        return null;
      }

      const body: any = await response.json();
      const content = body?.content;
      if (!content || typeof content !== 'string') {
        return null;
      }

      // Extract JSON if wrapped in markdown code fence
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
      const rawJson = jsonMatch[1] ? jsonMatch[1].trim() : content.trim();

      const parsed = JSON.parse(rawJson);
      return validateChallenge(parsed);
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }
}
