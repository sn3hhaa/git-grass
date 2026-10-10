import pc from 'picocolors';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { findRepoRoot, isGitAvailable } from '../../git/repository.js';
import { loadConfig } from '../../session/storage.js';
import { isModelAvailable, isOllamaAvailable, generateOllamaChallenge } from '../../challenge/ollama.js';
import { loadFallbackChallenges } from '../../challenge/fallback.js';
import { extractProjectContext } from '../../challenge/context.js';

const execFileAsync = promisify(execFile);

export async function handleDoctor(): Promise<void> {
  console.log(pc.green(pc.bold('\n🌱 git-grass Diagnostic Doctor\n')));

  let overallIssues = 0;
  let aiReady = false;

  // 1. Node.js check
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.replace(/^v/, '').split('.')[0], 10);
  if (majorVersion >= 18) {
    console.log(pc.green('✓ Node.js:             ') + `${nodeVersion} (compatible >= 18.0.0)`);
  } else {
    console.log(pc.red('✗ Node.js:             ') + `${nodeVersion} (requires >= 18.0.0)`);
    overallIssues++;
  }

  // 2. Git check
  const gitOk = await isGitAvailable();
  if (gitOk) {
    try {
      const { stdout } = await execFileAsync('git', ['--version']);
      console.log(pc.green('✓ Git:                 ') + stdout.trim());
    } catch {
      console.log(pc.green('✓ Git:                 ') + 'Available');
    }
  } else {
    console.log(pc.red('✗ Git:                 ') + 'Not found in PATH');
    overallIssues++;
  }

  // 3. Repository check
  const repoRoot = await findRepoRoot();
  let config = null;
  if (repoRoot) {
    config = loadConfig(repoRoot);
    console.log(pc.green('✓ Repository:          ') + repoRoot);
    console.log(pc.cyan('  Configured Interval: ') + `${config.breakIntervalMinutes} min (default duration: ${config.defaultDurationMinutes} min)`);
    console.log(pc.cyan('  Auto Push:           ') + (config.autoPush ? 'Enabled' : 'Disabled'));
  } else {
    console.log(pc.yellow('! Repository:          ') + 'Current directory is not inside a Git repository (run "git grass init" in a Git repo)');
  }

  const configuredModel = config ? config.aiModel : 'gemma3:1b';
  const configuredHost = config ? config.ollamaHost : 'http://127.0.0.1:11434';

  console.log('\n--- Local AI & Inference Engine ---');

  // 4. Ollama CLI check
  let ollamaCliFound = false;
  try {
    const isWindows = process.platform === 'win32';
    const checkCmd = isWindows ? 'where.exe' : 'which';
    await execFileAsync(checkCmd, ['ollama']);
    ollamaCliFound = true;
    console.log(pc.green('✓ Ollama CLI:          ') + 'Installed on system');
  } catch {
    console.log(pc.yellow('! Ollama CLI:          ') + 'Not found in system PATH');
  }

  // 5. Local Ollama HTTP API connectivity check
  const ollamaApiOk = await isOllamaAvailable(configuredHost, 1500);
  if (ollamaApiOk) {
    console.log(pc.green('✓ Ollama Local API:    ') + `Connected at ${configuredHost}`);
  } else {
    console.log(pc.yellow('! Ollama Local API:    ') + `Unreachable at ${configuredHost}`);
  }

  // 6. Configured model availability
  console.log(pc.cyan('  Target AI Model:     ') + configuredModel);

  let modelFound = false;
  if (ollamaApiOk) {
    modelFound = await isModelAvailable(configuredModel, configuredHost);
    if (modelFound) {
      console.log(pc.green('✓ Model Availability:  ') + `Model "${configuredModel}" is installed in local Ollama`);
    } else {
      console.log(pc.yellow('! Model Availability:  ') + `Model "${configuredModel}" not found in local Ollama`);
    }
  } else {
    console.log(pc.dim('  Model Availability:  (Ollama API offline, skipping model lookup)'));
  }

  // 7. Live inference test
  if (ollamaApiOk && modelFound) {
    process.stdout.write(pc.cyan('  Testing Inference:   ') + 'Running test generation against local Gemma... ');
    const testContext = {
      repositoryName: 'diagnostic-test',
      projectDescription: 'git-grass developer health tool',
      category: 'general' as const,
      detectedKeywords: ['health', 'git']
    };

    const startTime = Date.now();
    try {
      const result = await generateOllamaChallenge(testContext, 10, {
        host: configuredHost,
        model: configuredModel,
        timeoutMs: 8000
      });

      const elapsed = Date.now() - startTime;
      if (result && result.title) {
        console.log(pc.green(`✓ Succeeded in ${elapsed}ms`));
        console.log(pc.dim(`  Sample challenge: "${result.title}"`));
        aiReady = true;
      } else {
        console.log(pc.yellow(`! Model responded but validation failed`));
      }
    } catch (err: any) {
      console.log(pc.red(`✗ Inference failed: ${err.message}`));
    }
  }

  // 8. Fallback challenge dataset check
  const fallbacks = loadFallbackChallenges();
  if (fallbacks.length > 0) {
    console.log(pc.green('✓ Fallback Dataset:    ') + `${fallbacks.length} curated domain challenges ready offline`);
  } else {
    console.log(pc.red('✗ Fallback Dataset:    ') + 'No fallback challenges loaded');
    overallIssues++;
  }

  // Summary & Actionable instructions
  console.log('\n--- Overall Status ---');
  if (aiReady) {
    console.log(pc.green(pc.bold('Status: READY')));
    console.log(pc.green('Full local AI inference with Gemma is operational on this machine.\n'));
  } else if (overallIssues === 0) {
    console.log(pc.yellow(pc.bold('Status: CODE READY, SETUP REQUIRED')));
    console.log(pc.dim('The git-grass application code is fully operational and will use curated domain fallbacks.'));
    console.log(pc.dim('To enable local Gemma AI generation:'));
    console.log(pc.cyan('  1. Download and install Ollama from: https://ollama.com/download'));
    console.log(pc.cyan(`  2. Pull the lightweight Gemma model (~1.0 GB download):`));
    console.log(pc.white(`     ollama pull ${configuredModel}`));
    console.log(pc.cyan('  3. Start Ollama:'));
    console.log(pc.white('     ollama serve'));
    console.log(pc.dim('git-grass will automatically detect the local endpoint when available.\n'));
  } else {
    console.log(pc.red(pc.bold('Status: BROKEN')));
    console.log(pc.red('One or more essential dependencies (Node >= 18, Git, or fallback dataset) are missing.\n'));
  }
}

