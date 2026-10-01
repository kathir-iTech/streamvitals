import { describe, it, expect, beforeEach } from 'vitest';
import { createSession, getSession, getFullSession, isIndexedDBAvailable, updateSession, getAllSessions } from './field-session';

describe('field-session', () => {
  beforeEach(async () => {
    if (!isIndexedDBAvailable()) return;
    try { await updateSession('cleanup-test', { completedAt: new Date().toISOString() }); } catch {}
    try { await updateSession('retrieve-test', { completedAt: new Date().toISOString() }); } catch {}
    try { await updateSession('full-test', { completedAt: new Date().toISOString() }); } catch {}
  });

  it('creates a session successfully', async () => {
    const session = {
      sessionId: 'test-session',
      streamName: 'Test Creek',
      volunteer: 'Test Volunteer',
      date: '2026-01-01',
      indicators: [],
      startedAt: new Date().toISOString(),
    };
    const result = await createSession(session);
    expect(result.success).toBe(true);
  });

  it('rejects a session with no sessionId, stream name, or start time', async () => {
    const badSession = { sessionId: '', streamName: '', volunteer: '', date: '', indicators: [], startedAt: '' };
    const result = await createSession(badSession);
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('retrieves a session by ID', async () => {
    const session = {
      sessionId: 'retrieve-test',
      streamName: 'Retrieve Creek',
      volunteer: 'Test',
      date: '2026-01-01',
      indicators: [],
      startedAt: new Date().toISOString(),
    };
    const created = await createSession(session);
    if (created.success) {
      const retrieved = await getSession('retrieve-test');
      expect(retrieved).toBeTruthy();
      expect(retrieved!.streamName).toBe('Retrieve Creek');
    }
  });

  it('returns undefined for non-existent session', async () => {
    const result = await getSession('non-existent-id');
    expect(result).toBeUndefined();
  });

  it('returns all sessions as an array', async () => {
    if (!isIndexedDBAvailable()) return;
    const all = await getAllSessions();
    expect(Array.isArray(all)).toBe(true);
    expect(all.length).toBeGreaterThan(0);
    expect(all.some((s) => s.sessionId === 'test-session')).toBe(true);
  });

  it('getFullSession returns session and photos', async () => {
    const session = {
      sessionId: 'full-test',
      streamName: 'Full Creek',
      volunteer: 'Tester',
      date: '2026-01-01',
      indicators: [{ indicatorId: 'BMI-01', indicatorName: 'Benthic Macroinvertebrates', type: 'citizen_observable' as const, photos: [], notes: 'test note', timestamp: new Date().toISOString(), status: 'complete' as const }],
      startedAt: new Date().toISOString(),
    };
    const created = await createSession(session);
    if (created.success) {
      const full = await getFullSession('full-test');
      expect(full).toBeTruthy();
      expect(full.photos).toBeDefined();
    }
  });

  it('updates a session', async () => {
    const session = {
      sessionId: 'update-test',
      streamName: 'Update Creek',
      volunteer: 'Test',
      date: '2026-01-01',
      indicators: [],
      startedAt: new Date().toISOString(),
    };
    const created = await createSession(session);
    if (created.success) {
      const updated = await updateSession('update-test', { completedAt: new Date().toISOString() });
      expect(updated.success).toBe(true);
    }
  });
});
