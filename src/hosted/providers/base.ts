import type { ChallengeRequest, HostedAIProvider } from '../types.js';

export function buildChallengePrompt(request: ChallengeRequest): string {
  return `
You are the AI challenge generator for git-grass, an open-source developer wellness tool.
Git-grass enforces a real-world, physical outdoor break tailored specifically to the repository the developer is currently building.

PROJECT CONTEXT:
- Repository Name: ${request.repositoryName}
- Project Description: ${request.projectDescription || 'Software engineering project'}
- Category: ${request.category}
- Duration: ${request.durationMinutes} minutes
- Detected Files & Tech Stack: ${request.detectedKeywords.join(', ') || 'general'}
${request.preferences?.mobilityPreference ? `- Mobility Preference: ${request.preferences.mobilityPreference}` : ''}
${request.preferences?.environmentPreference ? `- Environment Preference: ${request.preferences.environmentPreference}` : ''}

RULES FOR CHALLENGE:
1. Must be conducted OUTDOORS without phones, screens, laptops, or photography (NEVER use words like phone, screen, camera, photo, app, laptop, computer, monitor, device, code, coding, git, terminal).
2. Must explicitly connect the physical outdoor observation to the concepts of "${request.repositoryName}" (${request.projectDescription}) using real-world physical analogies (e.g., architecture, light, pathways, nature, sound, flow).
3. Must NOT require purchases, equipment, trespassing, or speaking to strangers.
4. Must be achievable in ${request.durationMinutes} minutes.
5. Return ONLY a valid JSON object matching this exact schema:
{
  "title": "Creative outdoor walk title inspired by ${request.repositoryName} (3-6 words)",
  "projectContext": "${request.repositoryName} — ${request.projectDescription.slice(0, 60)}",
  "durationMinutes": ${request.durationMinutes},
  "category": "${request.category}",
  "instructions": [
    "Step outside into the fresh air and walk at a relaxed pace.",
    "Specific physical observation step 2 connecting the outdoor environment to ${request.repositoryName}",
    "Specific physical observation step 3"
  ],
  "reflectionPrompt": "A thoughtful outdoor observation question connecting what you saw outside back to ${request.repositoryName}",
  "phoneFree": true,
  "safetyNotes": [
    "Stay on public pedestrian walkways.",
    "Remain aware of surroundings."
  ]
}
`.trim();
}

