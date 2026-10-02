import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    project: 'StreamVitals',
    hackathon: 'OneAquaHealth IEEE Global Hackathon 2026',
    tracks: ['Track 3 (AI-Supported Assessment)'],
    generatedAt: new Date().toISOString(),
    doi: '10.5281/zenodo.20345207',
    citation: 'Schmeller, D., Calapez, A.R., Silva, J.P., Norte, A.C., Serra, S.R.Q., Dias, M., Silva, G.T., Bouchali, R., Loyau, A., Almeida, S.F.P., Schmitt, R., Chen, A., Ramos, J.A., Feio, M.J. (2026). OneAquaHealth Key Indicators Factsheets Collection. Zenodo. doi:10.5281/zenodo.20345207',
    aiBoundary: 'Assessment is deterministic (streamvitals-assessment/1.0.0). AI may interpret and explain; AI never scores.',
    assessmentEngine: 'streamvitals-assessment/1.0.0',
    externalData: 'GBIF.org API (api.gbif.org/v1) — occurrence counts near the session GPS location, fetched directly from the browser; context only, not an assessment.',
  });
}
