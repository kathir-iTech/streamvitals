// GBIF baseline: presence records near the session location.
// Browser talks directly to api.gbif.org (CORS-open, no key, no server proxy).
// This is NOT a water-quality assessment — it is context: what has been recorded
// near this spot. Absence of records is not absence of species.

export const GBIF_API = 'https://api.gbif.org/v1';
export const GBIF_DEFAULT_RADIUS_KM = 50;

export interface GbifTaxonQuery {
  indicatorId: string;
  label: string;
  scientificName: string;
}

// EPT orders = the tolerance-based community the factsheet measures for BMI-01.
// Aves = BIR-04. The three INV-11 binomials expand the factsheet's own
// abbreviated IAP examples ("A. donax", "T. fluminensis", "A. altissima",
// research/factsheet_text.txt:655-657). Bacillariophyta = DIA-10.
// FCL-06 has no taxon group — it is a laboratory indicator, stated as such in the UI.
export const GBIF_TAXA: GbifTaxonQuery[] = [
  { indicatorId: 'BMI-01', label: 'Mayflies (Ephemeroptera)', scientificName: 'Ephemeroptera' },
  { indicatorId: 'BMI-01', label: 'Stoneflies (Plecoptera)', scientificName: 'Plecoptera' },
  { indicatorId: 'BMI-01', label: 'Caddisflies (Trichoptera)', scientificName: 'Trichoptera' },
  { indicatorId: 'BIR-04', label: 'Birds (Aves)', scientificName: 'Aves' },
  { indicatorId: 'INV-11', label: 'Giant reed (Arundo donax)', scientificName: 'Arundo donax' },
  { indicatorId: 'INV-11', label: 'Wandering spiderwort (Tradescantia fluminensis)', scientificName: 'Tradescantia fluminensis' },
  { indicatorId: 'INV-11', label: 'Tree of heaven (Ailanthus altissima)', scientificName: 'Ailanthus altissima' },
  { indicatorId: 'DIA-10', label: 'Diatoms (Bacillariophyta)', scientificName: 'Bacillariophyta' },
];

export type GbifRowStatus = 'ok' | 'no_match' | 'error';

export interface GbifBaselineRow extends GbifTaxonQuery {
  usageKey?: number;
  count?: number;
  status: GbifRowStatus;
}

export interface GbifBaseline {
  engine: string;
  radiusKm: number;
  lat: number;
  lng: number;
  capturedAt: string;
  rows: GbifBaselineRow[];
  attribution: string;
}

interface FetcherResponse {
  ok: boolean;
  status?: number;
  json: () => Promise<unknown>;
}

type Fetcher = (url: string) => Promise<FetcherResponse>;

const defaultFetcher: Fetcher = (url) => fetch(url);

export async function fetchGbifBaseline(
  lat: number,
  lng: number,
  radiusKm: number = GBIF_DEFAULT_RADIUS_KM,
  fetcher: Fetcher = defaultFetcher,
): Promise<GbifBaseline> {
  const rows = await Promise.all(
    GBIF_TAXA.map(async (taxon): Promise<GbifBaselineRow> => {
      try {
        const matchUrl = `${GBIF_API}/species/match?name=${encodeURIComponent(taxon.scientificName)}`;
        const matchRes = await fetcher(matchUrl);
        if (!matchRes.ok) return { ...taxon, status: 'error' };
        const match = (await matchRes.json()) as { usageKey?: number; matchType?: string };
        if (!match.usageKey || match.matchType === 'NONE') return { ...taxon, status: 'no_match' };

        const occUrl = `${GBIF_API}/occurrence/search?taxonKey=${match.usageKey}&geo=${lat},${lng}&radius=${radiusKm * 1000}&limit=0`;
        const occRes = await fetcher(occUrl);
        if (!occRes.ok) return { ...taxon, usageKey: match.usageKey, status: 'error' };
        const occ = (await occRes.json()) as { count?: number };
        return {
          ...taxon,
          usageKey: match.usageKey,
          count: typeof occ.count === 'number' ? occ.count : 0,
          status: 'ok',
        };
      } catch {
        return { ...taxon, status: 'error' };
      }
    }),
  );

  return {
    engine: 'api.gbif.org/v1',
    radiusKm,
    lat,
    lng,
    capturedAt: new Date().toISOString(),
    rows,
    attribution:
      'GBIF.org occurrence records near the session location — presence data for context only, not a water-quality assessment. Absence of records is not absence of species.',
  };
}
