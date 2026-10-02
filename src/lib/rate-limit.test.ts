import { describe, it, expect } from 'vitest';
import { createRateLimit } from './rate-limit';

describe('createRateLimit', () => {
  it('allows requests up to the limit', () => {
    const limit = createRateLimit(3, 60000, () => 1000);
    expect(limit('ip-1')).toBe(true);
    expect(limit('ip-1')).toBe(true);
    expect(limit('ip-1')).toBe(true);
  });

  it('blocks the request over the limit', () => {
    const limit = createRateLimit(3, 60000, () => 1000);
    limit('ip-1');
    limit('ip-1');
    limit('ip-1');
    expect(limit('ip-1')).toBe(false);
    expect(limit('ip-1')).toBe(false);
  });

  it('tracks keys independently', () => {
    const limit = createRateLimit(1, 60000, () => 1000);
    expect(limit('ip-1')).toBe(true);
    expect(limit('ip-1')).toBe(false);
    expect(limit('ip-2')).toBe(true);
  });

  it('slides the window: old entries expire and allow again', () => {
    let clock = 0;
    const limit = createRateLimit(2, 1000, () => clock);
    expect(limit('ip-1')).toBe(true);
    expect(limit('ip-1')).toBe(true);
    expect(limit('ip-1')).toBe(false);
    clock = 1500;
    expect(limit('ip-1')).toBe(true);
  });
});
