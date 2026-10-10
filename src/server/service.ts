import type { Server } from 'node:http';
import pc from 'picocolors';
import qrcodeTerminal from 'qrcode-terminal';
import { createServerApp } from './app.js';
import { getLocalNetworkIp } from './network.js';
import type { SessionData } from '../shared/types.js';

export interface RunningServer {
  server: Server;
  port: number;
  ip: string;
  sessionUrl: string;
}

export function displayTerminalGate(sessionUrl: string, minDurationMinutes: number = 10): void {
  console.log(pc.green(pc.bold('\n🌱 git-grass\n')));
  console.log(pc.white('Your AI can write the code.'));
  console.log(pc.green(pc.bold("It can't touch grass.")));
  console.log('');
  console.log(pc.red(pc.bold('A break is required.')));
  console.log('');
  console.log(pc.cyan(`Minimum duration: `) + `${minDurationMinutes} minutes`);
  console.log(pc.dim('Your staged changes are preserved.'));
  console.log('');
  console.log(pc.white('Scan the QR code to receive'));
  console.log(pc.white('your outdoor challenge:\n'));

  // Render QR code to terminal
  try {
    qrcodeTerminal.generate(sessionUrl, { small: true });
  } catch {
    console.log(pc.yellow('  [Could not render ANSI QR Code in this terminal]'));
  }

  console.log('');
  console.log(pc.cyan('Or open in your browser / phone:'));
  console.log(pc.bold(pc.underline(pc.green(sessionUrl))));
  console.log('');
  console.log(pc.dim('Press Ctrl+C to close the session server when complete.\n'));
}

export async function startSessionServer(
  repoRoot: string,
  session: SessionData,
  preferredPort: number = 4242
): Promise<RunningServer> {
  const app = createServerApp(repoRoot);
  const ip = getLocalNetworkIp();

  return new Promise((resolve, reject) => {
    // Try preferred port, fallback to port 0 (dynamic available port) if busy
    const server = app.listen(preferredPort, '0.0.0.0', () => {
      const addr = server.address();
      const port = typeof addr === 'object' && addr ? addr.port : preferredPort;
      const sessionUrl = `http://${ip}:${port}/?session=${session.sessionId}&token=${session.sessionToken}`;
      resolve({ server, port, ip, sessionUrl });
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        // Fallback to random open port
        const fallbackServer = app.listen(0, '0.0.0.0', () => {
          const addr = fallbackServer.address();
          const port = typeof addr === 'object' && addr ? addr.port : 4243;
          const sessionUrl = `http://${ip}:${port}/?session=${session.sessionId}&token=${session.sessionToken}`;
          resolve({ server: fallbackServer, port, ip, sessionUrl });
        });
        fallbackServer.on('error', reject);
      } else {
        reject(err);
      }
    });
  });
}
