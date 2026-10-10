import pc from 'picocolors';
import { findRepoRoot } from '../../git/repository.js';
import { loadSession } from '../../session/storage.js';
import { hasSatisfiedBreakDuration } from '../../session/validation.js';

export async function handleVerify(): Promise<void> {
  const repoRoot = await findRepoRoot();
  if (!repoRoot) {
    console.error(pc.red('Error: Not inside a Git repository.'));
    process.exit(1);
  }

  const session = loadSession(repoRoot);
  if (!session) {
    console.log(pc.yellow('No active session found in this repository.'));
    process.exit(0);
  }

  console.log(pc.green(pc.bold('\n🌱 git-grass Session Verification\n')));
  console.log(pc.cyan('Session ID:        ') + session.sessionId);
  console.log(pc.cyan('Status:            ') + session.status);
  console.log(pc.cyan('Required Duration: ') + `${session.requiredDurationMinutes} minutes`);

  if (!session.breakStartedAt) {
    console.log(pc.cyan('Timing Check:      ') + pc.yellow('Break has not yet been started on phone.'));
    process.exit(1);
  }

  const { satisfied, elapsedMinutes, requiredMinutes } = hasSatisfiedBreakDuration(session);

  console.log(pc.cyan('Elapsed Time:      ') + `${elapsedMinutes} of ${requiredMinutes} minutes`);
  if (satisfied) {
    console.log(pc.green(pc.bold('✓ Duration requirement satisfied.')));
  } else {
    console.log(pc.yellow(`⏳ Break still in progress (${requiredMinutes - elapsedMinutes} minutes remaining).`));
  }

  if (session.userReflection) {
    console.log(pc.cyan('Reflection:        ') + `"${session.userReflection}"`);
  }

  if (session.commitResult?.success) {
    console.log(pc.green(`✓ Commit released (Hash: ${session.commitResult.commitHash || 'ok'})`));
  }
  console.log('');
}
