import pc from 'picocolors';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { findRepoRoot, isGitAvailable } from '../../git/repository.js';
import { loadConfig } from '../../session/storage.js';
import { isModelAvailable, isOllamaAvailable, generateOllamaChallenge } from '../../challenge/ollama.js';
import { loadFallbackChallenges } from '../../challenge/fallback.js';
import { isHostedBackendAvailable, fetchHostedChallenge } from '../../challenge/hosted-client.js';

const execFileAsync = promisify(execFile);

export async function handleDoctor(): Promise<void> {
  console.log(pc.green(pc.bold('\n🌱 git-grass Diagnostic Doctor\n')));

  let overallIssues = 0;
  let aiReady = false;
  let activeAiEngine: string | null = null;

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

  // 4. Hosted AI Backend (Render + Backboard)
  console.log('\n--- Hosted AI Backend (Render + Backboard) ---');
  const hostedUrl = process.env.GIT_GRASS_BACKEND_URL || config?.hostedBackendUrl;

  if (hostedUrl) {
    console.log(pc.cyan('  Backend URL:         ') + hostedUrl);
    process.stdout.write(pc.cyan('  Testing Backend:     ') + 'Connecting to hosted API... ');
    const check = await isHostedBackendAvailable(hostedUrl, 4000);

    if (check.available) {
      console.log(pc.green(`✓ Connected! Provider: ${check.provider || 'backboard'} (${check.model || 'default'})`));
      aiReady = true;
      activeAiEngine = `Hosted AI (${check.provider || 'backboard'})`;

      // Live inference test on hosted backend
      process.stdout.write(pc.cyan('  Testing Inference:   ') + 'Requesting sample challenge... ');
      const testContext = {
        repositoryName: 'diagnostic-test',
        projectDescription: 'git-grass developer health tool',
        category: 'general' as const,
        detectedKeywords: ['health', 'git']
      };

      const startMs = Date.now();
      const testRes = await fetchHostedChallenge(hostedUrl, testContext, 10, 8000);
      const elapsedMs = Date.now() - startMs;

      if (testRes?.challenge) {
        console.log(pc.green(`✓ Succeeded in ${elapsedMs}ms (${testRes.cached ? 'cached' : 'live'})`));
        console.log(pc.dim(`  Sample Challenge: "${testRes.challenge.title}"`));
      } else {
        console.log(pc.yellow('! Response received but generation fell back to bundled challenge'));
      }
    } else {
      if (check.isColdStart) {
        console.log(pc.yellow(`! Timed out connecting to ${hostedUrl}`));
        console.log(pc.dim('    Note: Render Free web services spin down after 15 min of inactivity and take ~50s to wake up.'));
        console.log(pc.dim('    The service may be waking up. Re-run "git grass doctor" in 30-60 seconds.'));
      } else {
        console.log(pc.yellow(`! Unreachable at ${hostedUrl} (${check.statusMessage || 'check deployment or network'})`));
      }
    }
  } else {
    console.log(pc.dim('  Backend URL:         Not configured (optional, enables cloud inference with ₹0 laptop setup)'));
  }

  // 5. Local AI Engine (Ollama - optional local alternative)
  console.log('\n--- Local AI Engine (Ollama - Optional Alternative) ---');
  const configuredModel = config ? config.aiModel : 'gemma3:1b';
  const configuredHost = config ? config.ollamaHost : 'http://127.0.0.1:11434';

  const ollamaApiOk = await isOllamaAvailable(configuredHost, 1500);
  if (ollamaApiOk) {
    console.log(pc.green('✓ Ollama Local API:    ') + `Connected at ${configuredHost}`);
    const modelFound = await isModelAvailable(configuredModel, configuredHost);
    if (modelFound) {
      console.log(pc.green('✓ Model Availability:  ') + `Model "${configuredModel}" is installed in local Ollama`);
      if (!aiReady) {
        aiReady = true;
        activeAiEngine = `Local Ollama (${configuredModel})`;
      }
    } else {
      console.log(pc.yellow('! Model Availability:  ') + `Model "${configuredModel}" not found in local Ollama`);
    }
  } else {
    console.log(pc.dim('  Ollama Local API:    Offline (not required when using hosted backend or fallbacks)'));
  }

  // 6. Fallback challenge dataset check
  console.log('\n--- Curated Fallback Challenge Engine ---');
  const fallbacks = loadFallbackChallenges();
  if (fallbacks.length > 0) {
    console.log(pc.green('✓ Fallback Dataset:    ') + `${fallbacks.length} curated domain challenges ready offline`);
  } else {
    console.log(pc.red('✗ Fallback Dataset:    ') + 'No fallback challenges loaded');
    overallIssues++;
  }

  // 7. Summary & Actionable instructions
  console.log('\n--- Overall Diagnostic Status ---');
  if (aiReady) {
    console.log(pc.green(pc.bold(`Status: READY (${activeAiEngine})`)));
    console.log(pc.green('AI challenge generation is fully operational.\n'));
  } else if (overallIssues === 0) {
    console.log(pc.yellow(pc.bold('Status: CODE READY, SETUP REQUIRED')));
    console.log(pc.dim('The git-grass application code is fully operational and will use curated domain fallbacks.'));
    console.log(pc.dim('To enable hosted AI with zero local installations (₹0 spending):'));
    console.log(pc.cyan('  1. Deploy the Render service using the included render.yaml blueprint.'));
    console.log(pc.cyan('  2. Set your Backboard API key in Render environment: BACKBOARD_API_KEY=<key>'));
    console.log(pc.cyan('  3. Configure your CLI to point to your Render service:'));
    console.log(pc.white('     git grass config hostedBackendUrl https://your-service.onrender.com'));
    console.log(pc.dim('Or set environment variable: GIT_GRASS_BACKEND_URL=https://your-service.onrender.com\n'));
  } else {
    console.log(pc.red(pc.bold('Status: BROKEN')));
    console.log(pc.red('One or more essential dependencies (Node >= 18, Git, or fallback dataset) are missing.\n'));
  }
}
