import { describe, it, expect } from 'vitest';
import { fetchGbifBaseline, GBIF_TAXA, GBIF_API } from './gbif';

type Fetcher = (url: string) => Promise<{ ok: boolean; json: () => Promise<unknown> }>;

function recorder(behaviour?: (url: string) => 'ok' | 'none' | 'throw'): {
  fetcher: Fetcher;
  urls: string[];
} {
  const urls: string[] = [];
  const fetcher: Fetcher = async (url) => {
    urls.push(url);
    const mode = behaviour ? behaviour(url) : 'ok';
    if (mode === 'throw') throw new Error('network down');
    if (url.includes('/species/match')) {
      if (mode === 'none') return { ok: true, json: async () => ({ matchType: 'NONE' }) };
      return { ok: true, json: async () => ({ usageKey: 5716472, matchType: 'EXACT', confidence: 100 }) };
    }
    return { ok: true, json: async () => ({ count: 42, limit: 0 }) };
  };
  return { fetcher, urls };
}

describe('fetchGbifBaseline', () => {
  it('queries species/match then occurrence/search with geo, radius, and limit=0', async () => {
    const { fetcher, urls } = recorder();
    await fetchGbifBaseline(40.4168, -3.7038, 50, fetcher);

    const matchUrls = urls.filter((u) => u.includes('/species/match'));
    const occUrls = urls.filter((u) => u.includes('/occurrence/search'));
    expect(matchUrls).toHaveLength(GBIF_TAXA.length);
    expect(occUrls).toHaveLength(GBIF_TAXA.length);
    expect(matchUrls[0]).toBe(`${GBIF_API}/species/match?name=Ephemeroptera`);
    expect(matchUrls[4]).toContain('Arundo%20donax');
    for (const u of occUrls) {
      expect(u).toContain('taxonKey=5716472');
      expect(u).toContain('geo=40.4168,-3.7038');
      expect(u).toContain('radius=50000');
      expect(u).toContain('limit=0');
    }
  });

  it('returns one ok row per configured taxon with counts', async () => {
    const { fetcher } = recorder();
    const baseline = await fetchGbifBaseline(40.4168, -3.7038, 50, fetcher);
    expect(baseline.rows).toHaveLength(GBIF_TAXA.length);
    for (const row of baseline.rows) {
      expect(row.status).toBe('ok');
      expect(row.count).toBe(42);
      expect(row.usageKey).toBe(5716472);
    }
  });

  it('carries honest metadata: engine, radius, coordinates, attribution', async () => {
    const { fetcher } = recorder();
    const baseline = await fetchGbifBaseline(40.4168, -3.7038, 50, fetcher);
    expect(baseline.engine).toBe('api.gbif.org/v1');
    expect(baseline.radiusKm).toBe(50);
    expect(baseline.lat).toBe(40.4168);
    expect(baseline.lng).toBe(-3.7038);
    expect(Number.isNaN(Date.parse(baseline.capturedAt))).toBe(false);
    expect(baseline.attribution).toContain('GBIF.org');
    expect(baseline.attribution).toContain('not a water-quality assessment');
    expect(baseline.attribution).toContain('Absence of records is not absence of species');
  });

  it('marks unmatched taxa as no_match without an occurrence query', async () => {
    const { fetcher, urls } = recorder((url) => (url.includes('name=Plecoptera') ? 'none' : 'ok'));
    const baseline = await fetchGbifBaseline(40.4168, -3.7038, 50, fetcher);
    const stonefly = baseline.rows.find((r) => r.scientificName === 'Plecoptera');
    expect(stonefly?.status).toBe('no_match');
    expect(stonefly?.count).toBeUndefined();
    expect(urls.filter((u) => u.includes('/occurrence/search'))).toHaveLength(GBIF_TAXA.length - 1);
  });

  it('turns a rejected request into an error row instead of failing the baseline', async () => {
    const { fetcher } = recorder((url) => (url.includes('Ephemeroptera') ? 'throw' : 'ok'));
    const baseline = await fetchGbifBaseline(40.4168, -3.7038, 50, fetcher);
    expect(baseline.rows.find((r) => r.scientificName === 'Ephemeroptera')?.status).toBe('error');
    expect(baseline.rows.filter((r) => r.status === 'ok')).toHaveLength(GBIF_TAXA.length - 1);
  });

  it('honours a custom radius in metres', async () => {
    const { fetcher, urls } = recorder();
    await fetchGbifBaseline(1, 2, 25, fetcher);
    const occUrls = urls.filter((u) => u.includes('/occurrence/search'));
    for (const u of occUrls) expect(u).toContain('radius=25000');
  });
});
