import express from 'express';
import type { Express, Request, Response } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createSessionRouter } from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getWebAssetsDir(): string {
  // Check development path or dist path
  const candidates = [
    path.resolve(__dirname, '../../web'),
    path.resolve(__dirname, '../web'),
    path.resolve(process.cwd(), 'web')
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return c;
    }
  }
  return path.resolve(process.cwd(), 'web');
}

export function createServerApp(repoRoot: string): Express {
  const app = express();

  // Security: limit body size to 50kb
  app.use(express.json({ limit: '50kb' }));
  app.use(express.urlencoded({ extended: true, limit: '50kb' }));

  // Prevent CORS issues across mobile devices on LAN
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  const webDir = getWebAssetsDir();
  app.use(express.static(webDir));

  // Mount API session router
  const sessionRouter = createSessionRouter(repoRoot);
  app.use('/api/session', sessionRouter);

  // Also support direct /session/:id endpoints for API
  // If request accepts text/html, serve index.html; otherwise route to API
  app.use('/session', (req: Request, res: Response, next) => {
    const accept = req.headers.accept || '';
    if (req.method === 'GET' && accept.includes('text/html')) {
      const indexPath = path.join(webDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
        return;
      }
    }
    sessionRouter(req, res, next);
  });

  // Direct root fallback to mobile app
  app.get('/', (_req: Request, res: Response): void => {
    const indexPath = path.join(webDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.send('<h1>git-grass</h1><p>Outdoor Break Gateway active.</p>');
    }
  });

  return app;
}
