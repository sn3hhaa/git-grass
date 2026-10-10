import type { HostedAIProvider } from '../types.js';
import { BackboardProvider } from './backboard.js';
import { TinkerProvider } from './tinker.js';
import { HostedFallbackProvider } from './fallback.js';

export function getHostedProvider(): HostedAIProvider {
  const chosen = (process.env.AI_PROVIDER || 'backboard').toLowerCase().trim();

  if (chosen === 'tinker') {
    return new TinkerProvider();
  }

  if (chosen === 'fallback') {
    return new HostedFallbackProvider();
  }

  // Default is Backboard
  const backboard = new BackboardProvider();
  if (backboard.isConfigured()) {
    return backboard;
  }

  // Graceful fallback to bundled library if BACKBOARD_API_KEY is not yet populated
  return new HostedFallbackProvider();
}

