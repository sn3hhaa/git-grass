import type { OutdoorChallenge } from '../shared/types.js';
import type { ProjectContextSummary } from './context.js';
import { validateChallenge } from './schema.js';

export interface OllamaOptions {
  host?: string;
  model?: string;
  timeoutMs?: number;
}

export async function isOllamaAvailable(host: string = 'http://127.0.0.1:11434', timeoutMs: number = 2000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(`${host}/api/tags`, {
      signal: controller.signal
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

export async function isModelAvailable(modelName: string, host: string = 'http://127.0.0.1:11434'): Promise<boolean> {
  try {
    const res = await fetch(`${host}/api/tags`);
    if (!res.ok) return false;
    const data: any = await res.json();
    if (!data.models || !Array.isArray(data.models)) return false;
    const target = modelName.toLowerCase();
    return data.models.some((m: any) => {
      const name = (m.name || '').toLowerCase();
      return (
        name === target ||
        name.startsWith(`${target}:`) ||
        target.startsWith(`${name}:`) ||
        name === `${target}:latest` ||
        name.replace(/:latest$/, '') === target.replace(/:latest$/, '')
      );
    });
  } catch {
    return false;
  }
}

export async function generateOllamaChallenge(
  context: ProjectContextSummary,
  durationMinutes: number,
  options: OllamaOptions = {}
): Promise<OutdoorChallenge | null> {
  const host = options.host || 'http://127.0.0.1:11434';
  const model = options.model || 'gemma3:1b';
  const timeoutMs = options.timeoutMs || 8000;

  const prompt = `
You are the AI challenge generator for git-grass, a developer tool that pauses git commits to enforce real-world outdoor walks.
Project context:
- Name: ${context.repositoryName}
- Description: ${context.projectDescription}
- Category: ${context.category}
- Duration: ${durationMinutes} minutes

Generate a safe, physical outdoor observation challenge tailored to this project's themes.
RULES:
1. Must be conducted OUTDOORS without phones, screens, or photography.
2. Must NOT include any software testing, shell commands, coding, or code review.
3. Must NOT require purchases, equipment, trespassing, or speaking to strangers.
4. Must be achievable in ${durationMinutes} minutes.
5. Return ONLY a valid JSON object matching this exact schema:
{
  "title": "Short poetic title (3-5 words)",
  "projectContext": "${context.repositoryName}",
  "durationMinutes": ${durationMinutes},
  "category": "${context.category}",
  "instructions": [
    "Step outside away from all monitors.",
    "Instruction step 2",
    "Instruction step 3"
  ],
  "reflectionPrompt": "Thoughtful question for the user to answer after returning from the walk",
  "phoneFree": true,
  "safetyNotes": [
    "Stay on public sidewalks.",
    "Remain aware of surroundings."
  ]
}
`.trim();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${host}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        format: 'json',
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 500
        }
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) return null;
    const body: any = await response.json();
    if (!body.response) return null;

    const parsedJson = JSON.parse(body.response);
    return validateChallenge(parsedJson);
  } catch {
    return null;
  }
}
