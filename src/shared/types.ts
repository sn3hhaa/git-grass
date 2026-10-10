/**
 * Core type definitions for git-grass
 */

export type SessionState =
  | 'IDLE'
  | 'BREAK_REQUIRED'
  | 'SESSION_CREATED'
  | 'CHALLENGE_READY'
  | 'BREAK_IN_PROGRESS'
  | 'AWAITING_COMPLETION'
  | 'COMPLETED'
  | 'COMMITTING'
  | 'COMMITTED'
  | 'PUSHED'
  | 'PUSH_FAILED';

export interface ChallengePreferences {
  mobilityPreference?: 'walking' | 'sitting' | 'stretching' | 'wheelchair-accessible' | 'any';
  environmentPreference?: 'park' | 'urban' | 'yard' | 'balcony' | 'any';
}

export interface GitGrassConfig {
  version: number;
  breakIntervalMinutes: number;
  defaultDurationMinutes: number;
  allowedDurationsMinutes: number[];
  minDurationMinutes: number;
  aiProvider: 'ollama' | 'fallback' | 'auto';
  aiModel: string;
  ollamaHost: string;
  autoPush: boolean;
  preferences: ChallengePreferences;
  lastBreakCompletedAt: string | null;
}

export interface OutdoorChallenge {
  title: string;
  projectContext: string;
  durationMinutes: number;
  category: string;
  instructions: string[];
  reflectionPrompt: string;
  phoneFree: true;
  safetyNotes: string[];
}

export interface SessionData {
  sessionId: string;
  sessionToken: string;
  repositoryRoot: string;
  repositoryName: string;
  createdAt: string;
  expiresAt: string;
  status: SessionState;
  requiredDurationMinutes: number;
  breakStartedAt: string | null;
  breakCompletedAt: string | null;
  challenge: OutdoorChallenge | null;
  stagedTreeHash: string | null;
  userReflection: string | null;
  commitMessage: string | null;
  commitResult: {
    success: boolean;
    commitHash?: string;
    error?: string;
  } | null;
  pushResult: {
    attempted: boolean;
    success?: boolean;
    remote?: string;
    branch?: string;
    error?: string;
  } | null;
}

export interface GitStatusCheckResult {
  isGitRepo: boolean;
  repoRoot: string | null;
  breakDue: boolean;
  minutesSinceLastBreak: number;
  breakIntervalMinutes: number;
  activeSession: SessionData | null;
  hasStagedChanges: boolean;
}
