import pc from 'picocolors';
import { findRepoRoot } from '../../git/repository.js';
import { loadConfig } from '../../session/storage.js';
import { getDefaultConfig } from '../../shared/config.js';
import { createOutdoorChallenge } from '../../challenge/generator.js';

export interface ChallengeOptions {
  test?: boolean;
  duration?: string;
}

export async function handleChallenge(options: ChallengeOptions = {}): Promise<void> {
  const repoRoot = (await findRepoRoot()) || process.cwd();
  const config = (await findRepoRoot()) ? loadConfig(repoRoot) : getDefaultConfig();

  const duration = options.duration ? parseInt(options.duration, 10) : config.defaultDurationMinutes;
  const safeDuration = isNaN(duration) || duration < 10 ? 15 : duration;

  console.log(pc.green(pc.bold('\n🌱 git-grass Challenge Preview\n')));
  console.log(pc.dim(`Generating outdoor challenge for duration: ${safeDuration} minutes...`));

  const { challenge, source } = await createOutdoorChallenge(repoRoot, config, safeDuration);

  console.log(pc.cyan('Engine Source:     ') + (source === 'ollama' ? pc.green('Local Ollama AI (Gemma)') : pc.yellow('Curated Offline Fallback')));
  console.log(pc.cyan('Category:          ') + challenge.category.toUpperCase());
  console.log(pc.cyan('Duration:          ') + `${challenge.durationMinutes} minutes (Phone-free)`);
  console.log(pc.cyan('Project Context:   ') + challenge.projectContext);
  console.log(pc.green(pc.bold(`\nTitle: ${challenge.title}\n`)));

  console.log(pc.white(pc.bold('Instructions:')));
  challenge.instructions.forEach((step, idx) => {
    console.log(`  ${idx + 1}. ${step}`);
  });

  console.log(pc.white(pc.bold('\nReflection Prompt:')));
  console.log(pc.dim(`  "${challenge.reflectionPrompt}"`));

  console.log(pc.white(pc.bold('\nSafety Notes:')));
  challenge.safetyNotes.forEach((note) => {
    console.log(pc.yellow(`  • ${note}`));
  });

  console.log(pc.green('\n✓ Challenge payload conforms to OutdoorChallengeSchema.\n'));
}

