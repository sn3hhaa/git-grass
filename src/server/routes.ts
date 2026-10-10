import { Router } from 'express';
import type { Request, Response } from 'express';
import { loadConfig, loadSession, saveSession } from '../session/storage.js';
import {
  canTransition,
  hasSatisfiedBreakDuration,
  isSessionExpired,
  validateSessionToken
} from '../session/validation.js';
import { startSessionBreak, completeSessionBreak } from '../session/manager.js';
import { executeSessionCommit } from '../git/commit-flow.js';

export function createSessionRouter(repoRoot: string): Router {
  const router = Router();

  function sanitizeSession(session: any) {
    const { sessionToken, stagedTreeHash, ...safe } = session;
    return safe;
  }

  function extractToken(req: Request): string {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7).trim();
    }
    if (typeof req.query.token === 'string') {
      return req.query.token.trim();
    }
    if (req.body && typeof req.body.token === 'string') {
      return req.body.token.trim();
    }
    return '';
  }

  // GET /session/:id or GET /api/session/:id
  router.get('/:id', (req: Request, res: Response): void => {
    const session = loadSession(repoRoot);
    if (!session || session.sessionId !== req.params.id) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const token = extractToken(req);
    if (!validateSessionToken(session, token)) {
      res.status(401).json({ error: 'Unauthorized: valid token required' });
      return;
    }

    res.json({
      session: sanitizeSession(session),
      serverTime: new Date().toISOString()
    });
  });

  // GET /session/:id/status
  router.get('/:id/status', (req: Request, res: Response): void => {
    const session = loadSession(repoRoot);
    if (!session || session.sessionId !== req.params.id) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const token = extractToken(req);
    if (!validateSessionToken(session, token)) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const timing = hasSatisfiedBreakDuration(session);

    res.json({
      status: session.status,
      breakStartedAt: session.breakStartedAt,
      breakCompletedAt: session.breakCompletedAt,
      requiredDurationMinutes: session.requiredDurationMinutes,
      elapsedMinutes: timing.elapsedMinutes,
      satisfied: timing.satisfied,
      commitResult: session.commitResult,
      pushResult: session.pushResult,
      serverTime: new Date().toISOString()
    });
  });

  // POST /session/:id/start
  router.post('/:id/start', (req: Request, res: Response): void => {
    const token = extractToken(req);
    try {
      const session = startSessionBreak(repoRoot, req.params.id, token);
      res.json({
        success: true,
        session: sanitizeSession(session),
        message: 'Break successfully started. Lock your phone and step outside.'
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // POST /session/:id/complete
  router.post('/:id/complete', (req: Request, res: Response): void => {
    const token = extractToken(req);
    const { reflection, commitMessage } = req.body || {};

    if (!reflection || typeof reflection !== 'string' || reflection.trim().length < 2) {
      res.status(400).json({ error: 'Reflection response is required to complete the check-in.' });
      return;
    }

    try {
      const session = completeSessionBreak(
        repoRoot,
        req.params.id,
        token,
        reflection.trim(),
        typeof commitMessage === 'string' ? commitMessage : undefined
      );

      res.json({
        success: true,
        session: sanitizeSession(session),
        message: 'Outdoor break verified and completed.'
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // POST /session/:id/commit
  router.post('/:id/commit', async (req: Request, res: Response): Promise<void> => {
    const token = extractToken(req);
    const session = loadSession(repoRoot);

    if (!session || session.sessionId !== req.params.id) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    if (!validateSessionToken(session, token)) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (session.status !== 'COMPLETED' && session.status !== 'COMMITTING') {
      res.status(400).json({
        error: `Cannot commit in current state: ${session.status}. You must complete your outdoor break first.`
      });
      return;
    }

    const commitMessage = (req.body?.commitMessage || session.commitMessage || '').trim();
    if (!commitMessage) {
      res.status(400).json({ error: 'Commit message is required.' });
      return;
    }

    // Set transition to COMMITTING
    session.status = 'COMMITTING';
    session.commitMessage = commitMessage;
    saveSession(repoRoot, session);

    const config = loadConfig(repoRoot);
    const result = await executeSessionCommit(repoRoot, session, config, commitMessage);

    if (!result.commitSuccess) {
      res.status(500).json({
        error: result.commitError || 'Git commit failed.',
        commitSuccess: false
      });
      return;
    }

    res.json({
      success: true,
      commitSuccess: true,
      commitHash: result.commitHash,
      pushAttempted: result.pushAttempted,
      pushSuccess: result.pushSuccess,
      pushError: result.pushError,
      session: sanitizeSession(session)
    });
  });

  return router;
}
