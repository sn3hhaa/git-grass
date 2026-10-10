import { describe, it, expect } from 'vitest';
import {
  ConfigSchema,
  getDefaultConfig,
  isBreakDue,
  MIN_ALLOWED_BREAK_MINUTES,
  parseConfig
} from '../src/shared/config.js';

describe('git-grass configuration', () => {
  it('loads valid default configuration', () => {
    const config = getDefaultConfig();
    expect(config.breakIntervalMinutes).toBe(60);
    expect(config.defaultDurationMinutes).toBe(15);
    expect(config.minDurationMinutes).toBe(10);
    expect(config.allowedDurationsMinutes).toContain(10);
    expect(config.allowedDurationsMinutes).toContain(15);
  });

  it('enforces minimum 10-minute break duration', () => {
    expect(() => {
      parseConfig({
        defaultDurationMinutes: 5
      });
    }).toThrow(/10 minutes/i);

    expect(() => {
      parseConfig({
        allowedDurationsMinutes: [5, 10, 15]
      });
    }).toThrow(/10 minutes/i);
  });

  it('calculates elapsed time and break due state accurately', () => {
    const config = getDefaultConfig();
    config.breakIntervalMinutes = 60;

    // No break ever recorded -> due
    config.lastBreakCompletedAt = null;
    expect(isBreakDue(config).due).toBe(true);

    // Break recorded 30 minutes ago -> not due
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    config.lastBreakCompletedAt = thirtyMinsAgo;
    const check1 = isBreakDue(config);
    expect(check1.due).toBe(false);
    expect(check1.minutesElapsed).toBe(30);

    // Break recorded 65 minutes ago -> due
    const sixtyFiveMinsAgo = new Date(Date.now() - 65 * 60 * 1000).toISOString();
    config.lastBreakCompletedAt = sixtyFiveMinsAgo;
    const check2 = isBreakDue(config);
    expect(check2.due).toBe(true);
    expect(check2.minutesElapsed).toBe(65);
  });
});
