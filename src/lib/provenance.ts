import fs from 'fs';
import path from 'path';

const indicators = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/indicators.json'), 'utf8'));

export function buildProvenanceManifest() {
  const manifest = {
    project: 'StreamVitals',
    hackathon: 'OneAquaHealth IEEE Global Hackathon 2026, Track 3 (AI-Supported Assessment)',
    generated_at: new Date().toISOString(),
    source_files: [
      {
        name: 'OneAquaHealth Key Indicators of Ecosystem and Biological Health - Factsheets Collection',
        source_url: 'https://zenodo.org/records/20345207',
        doi: '10.5281/zenodo.20345207',
        retrieved_at: new Date().toISOString(),
        sha256: '',
        document_version: 'v1',
        license: 'CC-BY 4.0',
        lead_author: 'Maria João Feio',
      },
      {
        name: 'OAH-FHIR Implementation Guide',
        source_url: 'https://build.fhir.org/ig/hl7-eu/oah/',
        status: 'draft/CI-build — not certified',
      },
      {
        name: 'OneAquaHealth Resilience Map',
        source_url: 'https://apps.oneaquahealth.eu/resmap/',
        status: 'client-side SPA — no public data API',
      },
    ],
    indicators_used: indicators.map((ind) => ({
      id: ind.id,
      name: ind.name,
      group: ind.group,
      citizen_observable: ind.citizen_observable,
      lab_only: ind.lab_only,
      source: ind.source,
      framework_basis: ind.framework_basis,
    })),
    cities_referenced: [
      { name: 'Coimbra', country: 'PT' },
      { name: 'Benevento', country: 'IT' },
      { name: 'Ghent', country: 'BE' },
      { name: 'Oslo', country: 'NO' },
      { name: 'Toulouse', country: 'FR' },
    ],
    fhir_disclaimer: 'FHIR R4 export using current OAH CI-build structures where applicable — draft implementation guide, not certified.',
    ai_boundary: 'AI may interpret input. AI may not adjudicate.',
  };
  return manifest;
}

export function getProvenanceManifest(): object {
  return buildProvenanceManifest();
}
