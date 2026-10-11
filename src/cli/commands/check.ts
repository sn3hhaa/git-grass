import pc from 'picocolors';
import { findRepoRoot } from '../../git/repository.js';
import { loadConfig, loadSession } from '../../session/storage.js';
import { isBreakDue } from '../../shared/config.js';
import { createSession } from '../../session/manager.js';
import { displayTerminalGate, startSessionServer } from '../../server/service.js';

export async function handleCheck(options: { wait?: boolean } = {}): Promise<void> {
  // 1. Bypass check
  if (process.env.GIT_GRASS_BYPASS_TOKEN) {
    process.exit(0);
  }

  const repoRoot = await findRepoRoot();
  if (!repoRoot) {
    // If not a git repo or cannot check, allow commit
    process.exit(0);
  }

  const config = loadConfig(repoRoot);
  const { due, minutesElapsed } = isBreakDue(config);

  if (!due) {
    // Commit is allowed
    process.exit(0);
  }

  // Break is due! Commit is blocked.
  let session = loadSession(repoRoot);
  if (!session || session.status === 'COMMITTED' || session.status === 'PUSHED' || session.repositoryName.toLowerCase() === 'desktop') {
    session = await createSession(repoRoot, config, config.defaultDurationMinutes);
  }

  const runningServer = await startSessionServer(repoRoot, session);
  await displayTerminalGate(runningServer.sessionUrl, session.requiredDurationMinutes, runningServer.webGatewayUrl);

  console.log(pc.yellow('Git commit paused. Workstation will resume after outdoor break check-in.\n'));

  // Polling loop to detect when phone completes the commit
  const checkInterval = setInterval(() => {
    const current = loadSession(repoRoot);
    if (current && (current.status === 'COMMITTED' || current.status === 'PUSHED')) {
      clearInterval(checkInterval);
      console.log(pc.green('\n✅ Outdoor break completed and verified! Git gate released.\n'));
      runningServer.server.close(() => {
        process.exit(0);
      });
    }
  }, 1500);

  // Handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    clearInterval(checkInterval);
    console.log(pc.yellow('\nBreak deferred. Staged changes preserved. Exiting commit gate.\n'));
    runningServer.server.close(() => {
      process.exit(1);
    });
  });
}
