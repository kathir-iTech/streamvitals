import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    project: 'StreamVitals',
    hackathon: 'OneAquaHealth IEEE Global Hackathon 2026',
    tracks: ['Track 1 (Citizen Science UX)', 'Track 3 (AI-Supported Assessment)'],
    generatedAt: new Date().toISOString(),
    doi: '10.5281/zenodo.20345207',
    citation: 'Schmeller, D., et al. (2026). OneAquaHealth Key Indicators Factsheets Collection. Zenodo.',
    aiBoundary: 'AI may interpret input. AI may not adjudicate.',
    fhirDisclaimer: 'FHIR R4 export using OAH CI-build structures — draft implementation guide, not certified.',
  });
}
