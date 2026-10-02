import { describe, it, expect, vi } from 'vitest';
import { buildSampleSession, SAMPLE_SESSION_ID } from './sample-session';
import { assess } from './assessment/engine';

vi.mock('./field-session', () => ({
  createSession: vi.fn(),
}));

import { loadSampleSession, } from './sample-session';
import { createSession } from './field-session';

describe('buildSampleSession', () => {
  it('is fixed-ID, flagged, and unmistakably labeled synthetic', () => {
    const s = buildSampleSession('2026-06-01T08:00:00.000Z');
    expect(s.sessionId).toBe(SAMPLE_SESSION_ID);
    expect(s.isSample).toBe(true);
    expect(s.streamName).toContain('SAMPLE');
    expect(s.volunteer).toContain('synthetic');
    expect(s.indicators).toHaveLength(5);
    // Every non-empty note carries the synthetic marker.
    for (const ind of s.indicators) {
      if (ind.notes) expect(ind.notes).toContain('[SYNTHETIC SAMPLE]');
    }
  });

  it('uses only states the deterministic engine assesses (3 favorable, 2 pending lab)', () => {
    const s = buildSampleSession('2026-06-01T08:00:00.000Z');
    const bands = s.indicators.map((ind) => assess(ind.indicatorId, ind.state).band);
    expect(bands.filter((b) => b === 'favorable')).toHaveLength(3);
    expect(bands.filter((b) => b === 'pending_lab')).toHaveLength(2);
    expect(bands).not.toContain('unassessable');
  });

  it('captures no photos and no GPS (honest absences, labeled in the banner)', () => {
    const s = buildSampleSession();
    expect(s.location).toBeUndefined();
    for (const ind of s.indicators) expect(ind.photos).toHaveLength(0);
  });

  it('is deterministic for a fixed timestamp (repeat loads replace, never drift)', () => {
    const a = buildSampleSession('2026-06-01T08:00:00.000Z');
    const b = buildSampleSession('2026-06-01T08:00:00.000Z');
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});

describe('loadSampleSession', () => {
  it('surfaces storage failures instead of swallowing them', async () => {
    vi.mocked(createSession).mockResolvedValueOnce({ success: false, error: 'Quota exceeded' });
    await expect(loadSampleSession()).resolves.toEqual({ ok: false, error: 'Quota exceeded' });
    vi.mocked(createSession).mockResolvedValueOnce({ success: true });
    await expect(loadSampleSession()).resolves.toEqual({ ok: true });
  });
});
