import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Server } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createServerApp } from '../src/server/app.js';
import { saveConfig, saveSession } from '../src/session/storage.js';
import { getDefaultConfig } from '../src/shared/config.js';
import type { SessionData } from '../src/shared/types.js';

describe('git-grass local server and API routes', () => {
  let tempDir: string;
  let server: Server;
  let port: number;
  let baseUrl: string;

  const validToken = 'abcdef1234567890abcdef1234567890abcdef1234567890';
  const sessionId = 'grass-test-1234';

  beforeAll(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'git-grass-srv-test-'));
    const config = getDefaultConfig();
    saveConfig(tempDir, config);

    const session: SessionData = {
      sessionId,
      sessionToken: validToken,
      repositoryRoot: tempDir,
      repositoryName: 'test-repo',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      status: 'CHALLENGE_READY',
      requiredDurationMinutes: 10,
      breakStartedAt: null,
      breakCompletedAt: null,
      challenge: {
        title: 'Tree Canopy Observation',
        projectContext: 'test-repo',
        durationMinutes: 10,
        category: 'general',
        instructions: ['Step outside and observe tree leaves'],
        reflectionPrompt: 'What was the color variation?',
        phoneFree: true,
        safetyNotes: ['Stay on sidewalks']
      },
      stagedTreeHash: null,
      userReflection: null,
      commitMessage: null,
      commitResult: null,
      pushResult: null
    };
    saveSession(tempDir, session);

    const app = createServerApp(tempDir);
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr: any = server.address();
        port = addr.port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('rejects unauthenticated requests without session token', async () => {
    const res = await fetch(`${baseUrl}/api/session/${sessionId}`);
    expect(res.status).toBe(401);
  });

  it('returns sanitized session data with valid token', async () => {
    const res = await fetch(`${baseUrl}/api/session/${sessionId}?token=${validToken}`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.session.sessionId).toBe(sessionId);
    expect(data.session.sessionToken).toBeUndefined(); // token must never be leaked
    expect(data.session.challenge.title).toBe('Tree Canopy Observation');
  });

  it('starts break and updates status to BREAK_IN_PROGRESS', async () => {
    const res = await fetch(`${baseUrl}/api/session/${sessionId}/start?token=${validToken}`, {
      method: 'POST'
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.session.status).toBe('BREAK_IN_PROGRESS');
    expect(data.session.breakStartedAt).toBeDefined();
  });

  it('rejects premature completion before required duration has elapsed', async () => {
    const res = await fetch(`${baseUrl}/api/session/${sessionId}/complete?token=${validToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reflection: 'I just stepped out for 5 seconds' })
    });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/duration requirement not yet satisfied/i);
  });
});
