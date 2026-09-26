# BOLT PROMPT 3: API ROUTES & AI PROXY
Paste this third into Bolt AI.

## src/app/api/ai/assistant/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
async function getOfflineReply(): Promise<NextResponse> { return NextResponse.json({ offline: true, reply: 'Offline Mode: Displaying pre-cached OneAquaHealth factsheet guidance.' }); }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question } = body as { question: string };
    if (!question || typeof question !== 'string') return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return getOfflineReply();
    const SYSTEM_PROMPT = `You are the OneAquaHealth Field Reference Assistant. Answer user queries strictly using the provided factsheet context from the OneAquaHealth Key Indicators of Ecosystem and Biological Health Factsheets Collection (doi:10.5281/zenodo.20345207). Refuse species identification from photos, water safety guarantees, or unverified stream diagnostic scores. Keep responses concise, scientific, and educational.`;
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: question }], temperature: 0.3, max_tokens: 500 }),
    });
    if (!response.ok) return getOfflineReply();
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'No response generated.';
    return NextResponse.json({ offline: false, reply });
  } catch { return getOfflineReply(); }
}
```

## src/app/api/sensors/route.ts
```typescript
import { NextResponse } from 'next/server';
import { indicators } from '@/data/indicators';
export async function GET() {
  const sensorEndpoints = indicators.filter(ind => ind.is_lab_only === false).map(ind => ({ id: ind.id, name: ind.name, code: ind.code, category: ind.category, states: ind.states, citation: ind.citation }));
  return NextResponse.json({ endpoints: sensorEndpoints, protocol: 'OGC SensorThings API v1.1', watermlVersion: '2.0', updateIntervalSeconds: 30 });
}
```

## src/app/api/provenance/route.ts
```typescript
import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ project: 'StreamVitals', hackathon: 'OneAquaHealth IEEE Global Hackathon 2026', tracks: ['Track 1 (Citizen Science UX)', 'Track 3 (AI-Supported Assessment)'], generatedAt: new Date().toISOString(), doi: '10.5281/zenodo.20345207', citation: 'Schmeller, D., et al. (2026). OneAquaHealth Key Indicators Factsheets Collection. Zenodo.', aiBoundary: 'AI may interpret input. AI may not adjudicate.', fhirDisclaimer: 'FHIR R4 export using OAH CI-build structures — draft implementation guide, not certified.' });
}
```

## src/app/api/export/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server';
export async function POST(request: NextRequest) {
  const { format, data } = await request.json();
  const supportedFormats = ['csv', 'geojson', 'json'];
  if (!format || !supportedFormats.includes(format)) return NextResponse.json({ error: `Unsupported format. Supported: ${supportedFormats.join(', ')}` }, { status: 400 });
  if (format === 'json') return NextResponse.json(data);
  if (format === 'csv') {
    const headers = ['indicatorId', 'name', 'category', 'is_lab_only', 'selectedState', 'notes'];
    const rows = (data || []).map((d: any) => [d.indicatorId || '', d.name || '', d.category || '', d.is_lab_only ? 'true' : 'false', d.selectedState || '', (d.notes || '').replace(/,/g, ';')].join(','));
    return new NextResponse([headers.join(','), ...rows].join('\n'), { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="streamvitals-export.csv"' } });
  }
  return NextResponse.json({ message: `Export format ${format} ready` });
}
```

## src/app/api/analyze/route.ts (NO TIER RATINGS)
```typescript
import { NextRequest, NextResponse } from 'next/server';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { observations } = body;
    if (!observations || !Array.isArray(observations)) return NextResponse.json({ error: 'Observations array required' }, { status: 400 });
    return NextResponse.json({ observationCount: observations.length, validatedCount: observations.filter((o: any) => o.selectedState).length, dataStatus: observations.filter((o: any) => o.selectedState).length >= observations.length ? 'SUFFICIENT' : observations.filter((o: any) => o.selectedState).length >= Math.ceil(observations.length / 2) ? 'PARTIAL' : 'INSUFFICIENT', note: 'This is field data collection only. No diagnostic assessment or tier assignment.', timestamp: new Date().toISOString() });
  } catch { return NextResponse.json({ error: 'Analysis failed' }, { status: 500 }); }
}
```

CONSTRAINTS:
- NO tier ratings (T1/T2/T3) in any route
- NO diagnostic assessment text
- AI proxy must return offline mode when GROQ_API_KEY is missing
- AI proxy system prompt MUST refuse species identification, water safety guarantees, diagnostic scores
- All routes return proper HTTP status codes
