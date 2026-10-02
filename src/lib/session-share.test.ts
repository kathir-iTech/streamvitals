import { describe, it, expect } from 'vitest';
import { encodeShare, decodeShare, buildShareUrl, SHARE_QR_MAX_CHARS } from './session-share';
import type { FieldSession } from './field-session';

function sampleSession(): FieldSession {
  const now = new Date().toISOString();
  return {
    sessionId: 'sess-share-1',
    streamName: 'Cedar Creek',
    volunteer: 'Jordan Reyes',
    date: '2026-10-02',
    startedAt: now,
    location: { lat: 40.4168, lng: -3.7038, accuracyM: 12, capturedAt: now },
    indicators: [
      { indicatorId: 'BMI-01', indicatorName: 'Benthic Macroinvertebrates', type: 'citizen_observable', state: 'diverse_sensitive', photos: ['photo-1'], notes: 'healthy stream', note_flag: 'assessment language', timestamp: now, status: 'complete' },
      { indicatorId: 'BIR-04', indicatorName: 'Birds', type: 'citizen_observable', state: 'many_species', photos: [], notes: '', timestamp: now, status: 'complete' },
      { indicatorId: 'INV-11', indicatorName: 'Invasive Alien Plants of the Riparian Corridor', type: 'citizen_observable', state: 'none_seen', photos: [], notes: '', timestamp: now, status: 'complete' },
      { indicatorId: 'FCL-06', indicatorName: 'Fecal Coliforms', type: 'lab_only', photos: [], notes: 'grab sample', sampleLabel: 'SMP-20261002-001', labProtocolGuidance: 'Water samples collected and analyzed using complementary methods.', timestamp: now, status: 'pending_lab_analysis' },
      { indicatorId: 'DIA-10', indicatorName: 'Diatoms and Diatom Teratology', type: 'lab_only', photos: [], notes: '', sampleLabel: 'SMP-20261002-002', labProtocolGuidance: 'Periphytic diatoms scraped from surface.', timestamp: now, status: 'pending_lab_analysis' },
    ],
    gbifBaseline: {
      engine: 'api.gbif.org/v1',
      radiusKm: 50,
      lat: 40.4168,
      lng: -3.7038,
      capturedAt: now,
      attribution: 'GBIF.org occurrence records near the session location — presence data for context only, not a water-quality assessment. Absence of records is not absence of species.',
      rows: [
        { indicatorId: 'BMI-01', label: 'Mayflies (Ephemeroptera)', scientificName: 'Ephemeroptera', status: 'ok', count: 42 },
        { indicatorId: 'BIR-04', label: 'Birds (Aves)', scientificName: 'Aves', status: 'ok', count: 1200 },
        { indicatorId: 'DIA-10', label: 'Diatoms (Bacillariophyta)', scientificName: 'Bacillariophyta', status: 'no_match' },
      ],
    },
  };
}

describe('session-share', () => {
  it('round-trips the session core fields exactly', () => {
    const original = sampleSession();
    const decoded = decodeShare(encodeShare(original));
    expect(decoded).toBeTruthy();
    expect(decoded!.sessionId).toBe(original.sessionId);
    expect(decoded!.streamName).toBe('Cedar Creek');
    expect(decoded!.volunteer).toBe('Jordan Reyes');
    expect(decoded!.date).toBe(original.date);
    expect(decoded!.startedAt).toBe(original.startedAt);
    expect(decoded!.indicators).toHaveLength(5);
    expect(decoded!.indicators[0].state).toBe('diverse_sensitive');
    expect(decoded!.indicators[0].notes).toBe('healthy stream');
    expect(decoded!.indicators[0].note_flag).toBe('assessment language');
    expect(decoded!.indicators[3].sampleLabel).toBe('SMP-20261002-001');
    expect(decoded!.indicators[3].status).toBe('pending_lab_analysis');
  });

  it('restores indicator names, types, and lab protocol guidance that the payload strips', () => {
    const original = sampleSession();
    const payload = encodeShare(original);
    expect(payload).not.toContain('Water samples collected');
    const decoded = decodeShare(payload)!;
    expect(decoded.indicators[0].indicatorName).toBe('Benthic Macroinvertebrates');
    expect(decoded.indicators[3].type).toBe('lab_only');
    expect(decoded.indicators[3].indicatorName).toBe('Fecal Coliforms');
    expect(decoded.indicators[3].labProtocolGuidance).toContain('CFU/100mL');
    expect(decoded.indicators[0].photos).toEqual([]);
  });

  it('round-trips location and GBIF baseline with labels and attribution restored', () => {
    const original = sampleSession();
    const decoded = decodeShare(encodeShare(original))!;
    expect(decoded.location?.lat).toBe(40.4168);
    expect(decoded.location?.accuracyM).toBe(12);
    expect(decoded.gbifBaseline?.engine).toBe('api.gbif.org/v1');
    expect(decoded.gbifBaseline?.radiusKm).toBe(50);
    expect(decoded.gbifBaseline?.attribution).toContain('not a water-quality assessment');
    expect(decoded.gbifBaseline?.rows).toHaveLength(3);
    expect(decoded.gbifBaseline?.rows[0].label).toBe('Mayflies (Ephemeroptera)');
    expect(decoded.gbifBaseline?.rows[0].count).toBe(42);
    expect(decoded.gbifBaseline?.rows[1].count).toBe(1200);
    expect(decoded.gbifBaseline?.rows[2].status).toBe('no_match');
  });

  it('rejects garbage, truncated, and wrong-version payloads', () => {
    expect(decodeShare('')).toBeNull();
    expect(decodeShare('#')).toBeNull();
    expect(decodeShare('%%%not-base64%%%')).toBeNull();
    expect(decodeShare('aGVsbG8gd29ybGQ')).toBeNull();
    const wrongVersion = Buffer.from(JSON.stringify({ v: 99, session: {}, indicators: [] })).toString('base64');
    expect(decodeShare(wrongVersion)).toBeNull();
    const missingFields = Buffer.from(JSON.stringify({ v: 1, session: { sessionId: 'x' }, indicators: [] })).toString('base64');
    expect(decodeShare(missingFields)).toBeNull();
  });

  it('refuses to encode a session without core identity fields', () => {
    const broken = { ...sampleSession(), sessionId: '' };
    expect(() => encodeShare(broken)).toThrow();
  });

  it('keeps a realistic session payload inside the QR budget', () => {
    const payload = encodeShare(sampleSession());
    expect(payload.length).toBeLessThan(SHARE_QR_MAX_CHARS);
    expect(payload).not.toMatch(/[+/=]/);
  });

  it('builds a /sync URL against the given origin', () => {
    expect(buildShareUrl('https://streamvitals.vercel.app', 'abc')).toBe('https://streamvitals.vercel.app/sync#abc');
    expect(buildShareUrl('http://localhost:3000/', 'abc')).toBe('http://localhost:3000/sync#abc');
  });
});
