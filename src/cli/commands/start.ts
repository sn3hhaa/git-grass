import pc from 'picocolors';
import { findRepoRoot } from '../../git/repository.js';
import { loadConfig } from '../../session/storage.js';
import { createSession } from '../../session/manager.js';
import { displayTerminalGate, startSessionServer } from '../../server/service.js';

export interface StartOptions {
  duration?: string;
  port?: string;
}

export async function handleStart(options: StartOptions = {}): Promise<void> {
  const repoRoot = await findRepoRoot();
  if (!repoRoot) {
    console.error(pc.red('Error: Not inside a Git repository.'));
    process.exit(1);
  }

  const config = loadConfig(repoRoot);
  const duration = options.duration ? parseInt(options.duration, 10) : config.defaultDurationMinutes;
  const port = options.port ? parseInt(options.port, 10) : 4242;

  if (isNaN(duration) || duration < 10) {
    console.error(pc.red('Error: Duration must be an integer >= 10 minutes.'));
    process.exit(1);
  }

  console.log(pc.green('🌱 Generating outdoor challenge & starting break session...'));
  const session = await createSession(repoRoot, config, duration);

  const runningServer = await startSessionServer(repoRoot, session, port);
  displayTerminalGate(runningServer.sessionUrl, session.requiredDurationMinutes);

  // Keep process alive to serve the phone until user terminates or session completes
  process.on('SIGINT', () => {
    console.log(pc.yellow('\nStopping session server...'));
    runningServer.server.close(() => {
      process.exit(0);
    });
  });
}
