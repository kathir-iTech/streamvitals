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
  it('round-trips the session core fields exactly', async () => {
    const original = sampleSession();
    const decoded = await decodeShare(await encodeShare(original));
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

  it('restores indicator names, types, and lab protocol guidance that the payload strips', async () => {
    const original = sampleSession();
    const payload = await encodeShare(original);
    const decoded = (await decodeShare(payload))!;
    // Compressed transport: static text must come from local data, not the link.
    expect(decoded.indicators[0].indicatorName).toBe('Benthic Macroinvertebrates');
    expect(decoded.indicators[3].type).toBe('lab_only');
    expect(decoded.indicators[3].indicatorName).toBe('Fecal Coliforms');
    expect(decoded.indicators[3].labProtocolGuidance).toContain('CFU/100mL');
    expect(decoded.indicators[0].photos).toEqual([]);
  });

  it('round-trips location and GBIF baseline with labels and attribution restored', async () => {
    const original = sampleSession();
    const decoded = (await decodeShare(await encodeShare(original)))!;
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

  it('rejects garbage, truncated, and wrong-version payloads', async () => {
    expect(await decodeShare('')).toBeNull();
    expect(await decodeShare('#')).toBeNull();
    expect(await decodeShare('%%%not-base64%%%')).toBeNull();
    expect(await decodeShare('aGVsbG8gd29ybGQ')).toBeNull();
    const wrongVersion = Buffer.from(JSON.stringify({ v: 99, session: {}, indicators: [] })).toString('base64url');
    expect(await decodeShare(wrongVersion)).toBeNull();
    const missingFields = Buffer.from(JSON.stringify({ v: 1, session: { sessionId: 'x' }, indicators: [] })).toString('base64url');
    expect(await decodeShare(missingFields)).toBeNull();
  });

  it('still decodes legacy uncompressed links (plain base64url JSON)', async () => {
    const original = sampleSession();
    const legacyPayload = Buffer.from(
      JSON.stringify({
        v: 1,
        session: { sessionId: original.sessionId, streamName: original.streamName, volunteer: original.volunteer, date: original.date, startedAt: original.startedAt },
        indicators: original.indicators.map((ind) => ({ indicatorId: ind.indicatorId, state: ind.state, notes: ind.notes, status: ind.status, timestamp: ind.timestamp })),
      }),
    ).toString('base64url');
    const decoded = await decodeShare(legacyPayload);
    expect(decoded).toBeTruthy();
    expect(decoded!.streamName).toBe('Cedar Creek');
    expect(decoded!.indicators[0].state).toBe('diverse_sensitive');
  });

  it('refuses to encode a session without core identity fields', async () => {
    const broken = { ...sampleSession(), sessionId: '' };
    await expect(encodeShare(broken)).rejects.toThrow();
  });

  it('keeps a realistic session payload inside the QR budget', async () => {
    const payload = await encodeShare(sampleSession());
    expect(payload.length).toBeLessThan(SHARE_QR_MAX_CHARS);
    expect(payload).not.toMatch(/[+/=]/);
  });

  it('fits the owner Phase E session (5 detailed notes + GPS + 8 GBIF rows) inside the QR budget', async () => {
    const original = sampleSession();
    const big: FieldSession = {
      ...original,
      streamName: 'esi hospital , varadharajapuram , coimbatore',
      location: { lat: 11.008336097925875, lng: 77.02251897619858, accuracyM: 209, capturedAt: original.startedAt },
      indicators: original.indicators.map((ind, idx) => ({
        ...ind,
        notes:
          idx === 0
            ? 'Turned over 3 stones near the riffle upstream of the footbridge. Mostly aquatic worms and a few midge larvae; no mayfly or stonefly larvae spotted. Water slightly turbid. ~28C, partly cloudy, 10:40 AM.'
            : idx === 1
              ? 'Walked both banks for ~50m. Found a small isolated patch of Himalayan Balsam, roughly 2m x 2m, on the west bank near the bend. No Japanese Knotweed or Giant Hogweed elsewhere along the stretch.'
              : idx === 2
                ? '10-minute observation along the 100m stretch near the bank. Heard one grey wagtail call and spotted a kingfisher perched on a low branch across the stream. No dippers seen. Light breeze, overcast.'
                : idx === 3
                  ? 'Sample collected 10cm below surface, facing upstream, ~9:15 AM. Water clear, no visible debris. Container sealed immediately and placed in a cooler with ice for transport. Ambient temp ~24C.'
                  : 'Scraped periphyton from 5 submerged stones using a toothbrush into a distilled water vial, preserved with 70% ethanol. Stones moderately covered with light brown biofilm. Sample labeled and stored upright.',
      })),
      gbifBaseline: {
        ...original.gbifBaseline!,
        rows: [
          { indicatorId: 'BMI-01', label: 'Mayflies (Ephemeroptera)', scientificName: 'Ephemeroptera', status: 'ok', count: 1944519 },
          { indicatorId: 'BMI-01', label: 'Stoneflies (Plecoptera)', scientificName: 'Plecoptera', status: 'ok', count: 335265832 },
          { indicatorId: 'BMI-01', label: 'Caddisflies (Trichoptera)', scientificName: 'Trichoptera', status: 'ok', count: 3750601 },
          { indicatorId: 'BIR-04', label: 'Birds (Aves)', scientificName: 'Aves', status: 'ok', count: 2362070061 },
          { indicatorId: 'INV-11', label: 'Giant reed (Arundo donax)', scientificName: 'Arundo donax', status: 'ok', count: 92099 },
          { indicatorId: 'INV-11', label: 'Wandering spiderwort (Tradescantia fluminensis)', scientificName: 'Tradescantia fluminensis', status: 'ok', count: 33917 },
          { indicatorId: 'INV-11', label: 'Tree of heaven (Ailanthus altissima)', scientificName: 'Ailanthus altissima', status: 'ok', count: 228341 },
          { indicatorId: 'DIA-10', label: 'Diatoms (Bacillariophyta)', scientificName: 'Bacillariophyta', status: 'ok', count: 82733 },
        ],
      },
    };
    const payload = await encodeShare(big);
    expect(payload.length).toBeLessThan(SHARE_QR_MAX_CHARS);
    const decoded = (await decodeShare(payload))!;
    expect(decoded.indicators[0].notes).toContain('Turned over 3 stones');
    expect(decoded.gbifBaseline?.rows).toHaveLength(8);
    expect(decoded.location?.lat).toBeCloseTo(11.0083, 3);
  });

  it('builds a /sync URL against the given origin', () => {
    expect(buildShareUrl('https://streamvitals.vercel.app', 'abc')).toBe('https://streamvitals.vercel.app/sync#abc');
    expect(buildShareUrl('http://localhost:3000/', 'abc')).toBe('http://localhost:3000/sync#abc');
  });
});
