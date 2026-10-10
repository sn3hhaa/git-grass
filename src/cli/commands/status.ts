import pc from 'picocolors';
import { findRepoRoot } from '../../git/repository.js';
import { loadConfig, loadSession } from '../../session/storage.js';
import { isBreakDue } from '../../shared/config.js';
import { isHookInstalled } from '../../git/hooks.js';

export async function handleStatus(): Promise<void> {
  const repoRoot = await findRepoRoot();
  if (!repoRoot) {
    console.error(pc.red('Error: Not inside a Git repository.'));
    process.exit(1);
  }

  const config = loadConfig(repoRoot);
  const session = loadSession(repoRoot);
  const hookActive = isHookInstalled(repoRoot);
  const { due, minutesElapsed } = isBreakDue(config);

  console.log(pc.green(pc.bold('\n🌱 git-grass status\n')));
  console.log(pc.cyan('Repository:           ') + repoRoot);
  console.log(pc.cyan('Pre-commit hook:      ') + (hookActive ? pc.green('Installed & Active') : pc.yellow('Not installed (run "git grass init")')));
  console.log(pc.cyan('Break interval:       ') + `${config.breakIntervalMinutes} minutes`);
  console.log(pc.cyan('Default break time:   ') + `${config.defaultDurationMinutes} minutes (min: 10m)`);

  if (config.lastBreakCompletedAt) {
    const lastDate = new Date(config.lastBreakCompletedAt);
    console.log(pc.cyan('Last break:           ') + `${lastDate.toLocaleString()} (${minutesElapsed}m ago)`);
  } else {
    console.log(pc.cyan('Last break:           ') + pc.dim('None recorded'));
  }

  const remaining = Math.max(0, config.breakIntervalMinutes - minutesElapsed);
  if (due) {
    console.log(pc.cyan('Break status:         ') + pc.red(pc.bold('BREAK DUE! Next commit will be gated.')));
  } else {
    console.log(pc.cyan('Break status:         ') + pc.green(`Active focus (${remaining} minutes until next break)`));
  }

  if (session) {
    console.log(pc.cyan('Active session:       ') + `${session.sessionId} [${session.status}]`);
    if (session.challenge) {
      console.log(pc.cyan('Current challenge:    ') + `"${session.challenge.title}"`);
    }
  } else {
    console.log(pc.cyan('Active session:       ') + pc.dim('None'));
  }

  console.log(pc.cyan('AI Provider:          ') + `${config.aiProvider} (${config.aiModel})`);
  console.log(pc.cyan('Auto push:            ') + (config.autoPush ? pc.green('Yes') : pc.dim('No')));
  console.log('');
}
