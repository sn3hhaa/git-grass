import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export interface GitExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Executes a Git command safely using execFile with an argument array.
 * No shell interpolation is used.
 */
export async function runGit(args: string[], cwd: string, env?: NodeJS.ProcessEnv): Promise<GitExecResult> {
  try {
    const { stdout, stderr } = await execFileAsync('git', args, {
      cwd,
      env: { ...process.env, ...env },
      windowsHide: true,
      maxBuffer: 10 * 1024 * 1024 // 10MB
    });
    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode: 0
    };
  } catch (error: any) {
    return {
      stdout: (error.stdout || '').trim(),
      stderr: (error.stderr || error.message || '').trim(),
      exitCode: typeof error.code === 'number' ? error.code : 1
    };
  }
}

/**
 * Executes a Git command synchronously or with interactive stream if needed.
 */
export function runGitSpawn(args: string[], cwd: string, env?: NodeJS.ProcessEnv): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';

    const child = spawn('git', args, {
      cwd,
      env: { ...process.env, ...env },
      windowsHide: true
    });

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('close', (code) => {
      resolve({
        exitCode: code ?? 0,
        stdout: stdout.trim(),
        stderr: stderr.trim()
      });
    });

    child.on('error', (err) => {
      resolve({
        exitCode: 1,
        stdout,
        stderr: err.message
      });
    });
  });
}
