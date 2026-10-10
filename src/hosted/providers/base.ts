import type { ChallengeRequest, HostedAIProvider } from '../types.js';

export function buildChallengePrompt(request: ChallengeRequest): string {
  return `
You are the AI challenge generator for git-grass, an open-source developer wellness tool.
Git-grass enforces a real-world, physical outdoor break during software development.

PROJECT CONTEXT:
- Repository Name: ${request.repositoryName}
- Project Description: ${request.projectDescription || 'Software engineering project'}
- Category: ${request.category}
- Duration: ${request.durationMinutes} minutes
- Detected Keywords: ${request.detectedKeywords.join(', ') || 'general'}
${request.preferences?.mobilityPreference ? `- Mobility Preference: ${request.preferences.mobilityPreference}` : ''}
${request.preferences?.environmentPreference ? `- Environment Preference: ${request.preferences.environmentPreference}` : ''}

RULES FOR CHALLENGE:
1. Must be conducted OUTDOORS without phones, screens, laptops, or photography.
2. Must NOT include any coding, software testing, shell commands, or screen work.
3. Must NOT require purchases, equipment, trespassing, or speaking to strangers.
4. Must be achievable in ${request.durationMinutes} minutes.
5. Return ONLY a valid JSON object matching this exact schema:
{
  "title": "Short poetic title (3-5 words)",
  "projectContext": "${request.repositoryName}",
  "durationMinutes": ${request.durationMinutes},
  "category": "${request.category}",
  "instructions": [
    "Step outside away from all monitors and devices.",
    "Specific observational instruction step 2 tailored to ${request.category}",
    "Specific observational instruction step 3"
  ],
  "reflectionPrompt": "Thoughtful question to reflect upon outdoors and write down after returning",
  "phoneFree": true,
  "safetyNotes": [
    "Stay on public pedestrian walkways.",
    "Remain aware of surroundings."
  ]
}
`.trim();
}
