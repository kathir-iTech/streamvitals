import { describe, it, expect, beforeEach } from 'vitest';
import { createSession, getSession, getFullSession, isIndexedDBAvailable, updateSession, getAllSessions, type FieldSession } from './field-session';

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

  it('round-trips optional location and GBIF baseline', async () => {
    const session: FieldSession = {
      sessionId: 'location-test',
      streamName: 'GPS Creek',
      volunteer: 'Test',
      date: '2026-01-01',
      indicators: [],
      startedAt: new Date().toISOString(),
      location: { lat: 40.4168, lng: -3.7038, accuracyM: 12.5, capturedAt: new Date().toISOString() },
    };
    const created = await createSession(session);
    expect(created.success).toBe(true);
    const retrieved = await getSession('location-test');
    expect(retrieved?.location?.lat).toBe(40.4168);
    expect(retrieved?.location?.accuracyM).toBe(12.5);

    const updated = await updateSession('location-test', {
      gbifBaseline: {
        engine: 'api.gbif.org/v1',
        radiusKm: 50,
        lat: 40.4168,
        lng: -3.7038,
        capturedAt: new Date().toISOString(),
        rows: [],
        attribution: 'GBIF.org occurrence records near the session location.',
      },
    });
    expect(updated.success).toBe(true);
    const after = await getSession('location-test');
    expect(after?.gbifBaseline?.engine).toBe('api.gbif.org/v1');
    expect(after?.location?.lng).toBe(-3.7038);
  });

  it('sessions without location stay valid (optional field)', async () => {
    const session: FieldSession = {
      sessionId: 'no-location-test',
      streamName: 'Plain Creek',
      volunteer: 'Test',
      date: '2026-01-01',
      indicators: [],
      startedAt: new Date().toISOString(),
    };
    const created = await createSession(session);
    expect(created.success).toBe(true);
    const retrieved = await getSession('no-location-test');
    expect(retrieved?.location).toBeUndefined();
    expect(retrieved?.gbifBaseline).toBeUndefined();
  });
});
