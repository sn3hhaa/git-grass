import pc from 'picocolors';
import { findRepoRoot } from '../../git/repository.js';
import { loadConfig, saveConfig } from '../../session/storage.js';

export async function handleConfig(key?: string, value?: string): Promise<void> {
  const repoRoot = await findRepoRoot();
  if (!repoRoot) {
    console.error(pc.red('Error: Not inside a Git repository.'));
    process.exit(1);
  }

  const config = loadConfig(repoRoot);

  if (!key) {
    // Print all configuration
    console.log(pc.green(pc.bold('\n🌱 git-grass configuration:\n')));
    console.log(JSON.stringify(config, null, 2));
    console.log('');
    return;
  }

  if (value === undefined) {
    // Get single key
    const val = (config as any)[key];
    if (val === undefined) {
      console.log(pc.yellow(`Key "${key}" is not set or does not exist.`));
    } else {
      console.log(typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val));
    }
    return;
  }

  // Setting a key
  switch (key) {
    case 'breakIntervalMinutes':
    case 'interval': {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 10) {
        console.error(pc.red('Error: Break interval must be an integer >= 10 minutes.'));
        process.exit(1);
      }
      config.breakIntervalMinutes = num;
      console.log(pc.green(`Updated breakIntervalMinutes to ${num}`));
      break;
    }
    case 'defaultDurationMinutes':
    case 'duration': {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 10) {
        console.error(pc.red('Error: Break duration must be an integer >= 10 minutes.'));
        process.exit(1);
      }
      config.defaultDurationMinutes = num;
      console.log(pc.green(`Updated defaultDurationMinutes to ${num}`));
      break;
    }
    case 'autoPush': {
      const bool = value.toLowerCase() === 'true' || value === '1';
      config.autoPush = bool;
      console.log(pc.green(`Updated autoPush to ${bool}`));
      break;
    }
    case 'aiProvider': {
      if (value !== 'ollama' && value !== 'fallback' && value !== 'auto') {
        console.error(pc.red('Error: aiProvider must be "ollama", "fallback", or "auto".'));
        process.exit(1);
      }
      config.aiProvider = value;
      console.log(pc.green(`Updated aiProvider to ${value}`));
      break;
    }
    case 'aiModel': {
      config.aiModel = value;
      console.log(pc.green(`Updated aiModel to ${value}`));
      break;
    }
    case 'ollamaHost': {
      config.ollamaHost = value;
      console.log(pc.green(`Updated ollamaHost to ${value}`));
      break;
    }
    case 'hostedBackendUrl':
    case 'backendUrl': {
      if (value === 'null' || value === 'none' || value === '') {
        config.hostedBackendUrl = null;
        console.log(pc.green('Cleared hostedBackendUrl.'));
      } else {
        config.hostedBackendUrl = value;
        console.log(pc.green(`Updated hostedBackendUrl to ${value}`));
      }
      break;
    }
    case 'resetLastBreak': {
      config.lastBreakCompletedAt = new Date().toISOString();
      console.log(pc.green(`Reset lastBreakCompletedAt to now.`));
      break;
    }
    default:
      console.error(pc.red(`Error: Unknown configuration key "${key}".`));
      process.exit(1);
  }

  saveConfig(repoRoot, config);
}
