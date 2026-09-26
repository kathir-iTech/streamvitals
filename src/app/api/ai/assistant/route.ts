import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const OFFLINE_REPLIES: Record<string, string> = {
  'FCL-06': 'FCL-06 (Water Quality Parameters): Field data collection protocols for physicochemical parameters including temperature, pH, dissolved oxygen, conductivity, and turbidity. Use standardized probes at designated sampling points.',
  'DIA-10': 'DIA-10 (Diagnostic Indicators): Laboratory-only diagnostic protocols. Field data collection limited to observational parameters. No field diagnostic scoring permitted.',
};

function getOfflineReply(indicatorId: string, question: string): string {
  const cached = OFFLINE_REPLIES[indicatorId];
  if (cached) return cached;
  return `Offline reference for ${indicatorId}: Consult the OneAquaHealth Key Indicators factsheet (doi:10.5281/zenodo.20345207). Field collection limited to observational parameters.`;
}

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
    const { indicatorId, question } = body;

    if (!indicatorId || !question) {
      return NextResponse.json({ error: 'Missing indicatorId or question' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        response: getOfflineReply(indicatorId, question),
        source: 'offline',
      });
    }

    const systemPrompt = `You are the OneAquaHealth Field Companion AI assistant. Answer ONLY from the OneAquaHealth Key Indicators factsheets (doi:10.5281/zenodo.20345207).

Rules:
- Only answer using factsheet content about the requested indicator
- Never identify species beyond what's in the factsheet
- Never give opinions on water quality, health, or assessment
- Never assign tiers, scores, or severity levels
- If the question is outside the factsheet scope, respond: "I'm equipped to answer using the OneAquaHealth protocol and factsheet definitions I have. This question falls outside that scope — please consult the official monitoring guide."
- Use descriptive language only. Never use phrases like "this suggests sensitive habitat."`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Indicator: ${indicatorId}. Question: ${question}` },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || 'No response from assistant.';

    return NextResponse.json({ response: text, source: 'groq' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const indicatorId = body?.indicatorId || 'unknown';
    const question = body?.question || '';
    return NextResponse.json({
      response: getOfflineReply(indicatorId, question),
      source: 'offline',
    }, { status: 200 });
  }
}
