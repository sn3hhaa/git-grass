#!/usr/bin/env node
import { Command } from 'commander';
import { handleInit } from './commands/init.js';
import { handleStatus } from './commands/status.js';
import { handleCheck } from './commands/check.js';
import { handleStart } from './commands/start.js';
import { handleVerify } from './commands/verify.js';
import { handleConfig } from './commands/config.js';
import { handleUninstall } from './commands/uninstall.js';

const program = new Command();

program
  .name('git-grass')
  .description("🌱 Your AI can write the code. It can't touch grass. Git-native outdoor-break enforcement.")
  .version('0.1.0');

program
  .command('init')
  .description('Initialize git-grass in the current Git repository and install the commit gate')
  .option('-i, --interval <minutes>', 'Break interval in minutes (default: 60, min: 10)')
  .option('-d, --duration <minutes>', 'Default break duration in minutes (default: 15, min: 10)')
  .option('--auto-push', 'Automatically push after a verified commit')
  .action(handleInit);

program
  .command('status')
  .description('Show break schedule, timer status, and active sessions')
  .action(handleStatus);

program
  .command('check')
  .description('Check break gate status (used by Git pre-commit hook)')
  .option('--wait', 'Wait for completion if break is required')
  .action(handleCheck);

program
  .command('start')
  .description('Start an outdoor break session and display the QR code')
  .option('-d, --duration <minutes>', 'Break duration in minutes (min: 10)')
  .option('-p, --port <port>', 'Server port (default: 4242)')
  .action(handleStart);

program
  .command('verify')
  .description('Verify active session duration and completion requirements')
  .action(handleVerify);

program
  .command('config [key] [value]')
  .description('Inspect or update configuration values')
  .action(handleConfig);

program
  .command('uninstall')
  .description('Safely remove git-grass hooks and repository configuration')
  .option('-y, --yes', 'Confirm uninstallation without prompt')
  .action(handleUninstall);

program.parse(process.argv);
