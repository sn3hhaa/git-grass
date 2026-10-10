import type { Request, Response, NextFunction } from 'express';
import { loadSession } from '../session/storage.js';
import { validateSessionToken } from '../session/validation.js';

export interface AuthenticatedRequest extends Request {
  repoRoot: string;
  sessionData: any;
}

export function createAuthMiddleware(repoRoot: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const sessionId = req.params.id;
    if (!sessionId) {
      res.status(400).json({ error: 'Session ID parameter is required' });
      return;
    }

    const session = loadSession(repoRoot);
    if (!session || session.sessionId !== sessionId) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Extract token from Authorization header or query parameter
    const authHeader = req.headers.authorization;
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else if (typeof req.query.token === 'string') {
      token = req.query.token.trim();
    } else if (req.body && typeof req.body.token === 'string') {
      token = req.body.token.trim();
    }

    if (!token || !validateSessionToken(session, token)) {
      res.status(401).json({ error: 'Unauthorized: invalid or missing session token' });
      return;
    }

    (req as AuthenticatedRequest).repoRoot = repoRoot;
    (req as AuthenticatedRequest).sessionData = session;
    next();
  };
}
