import { NextRequest, NextResponse } from 'next/server';
import { getOfflineAssistantResponse, OUT_OF_SCOPE_RESPONSE } from '@/lib/factsheet-content';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
// llama-3.3-70b-versatile was shut down 2026-08-16 (404 model_not_found);
// openai/gpt-oss-120b is Groq's documented replacement for it.
const GROQ_MODEL = 'openai/gpt-oss-120b';

// Server-side diagnostics. Every Groq failure is answered with HTTP 200 +
// an offline fallback by design, so without these logs the Network tab can
// never tell "no key" from "bad key" from "rate limited". Never log the key
// value itself — presence and length only.
function diag(event: string, detail: Record<string, unknown>) {
  console.log(`[assistant] ${event} ${JSON.stringify(detail)}`);
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
      diag('offline-no-key', { hasKey: false, keyLength: 0, indicatorId });
      return NextResponse.json({
        response: getOfflineAssistantResponse(indicatorId, question),
        source: 'offline',
      });
    }

    diag('groq-request', {
      hasKey: true,
      keyLength: apiKey.length,
      indicatorId,
      question: String(question).slice(0, 200),
    });

    const systemPrompt = `You are the OneAquaHealth Field Companion AI assistant. Answer ONLY from the OneAquaHealth Key Indicators factsheets (doi:10.5281/zenodo.20345207).

Rules:
- Only answer using factsheet content about the requested indicator
- Never identify species beyond what's in the factsheet
- Never give opinions on water quality, health, or assessment
- Never assign tiers, scores, or severity levels
- If the question is outside the factsheet scope, respond: "${OUT_OF_SCOPE_RESPONSE}"
- Use descriptive language only. Never use phrases like "this suggests sensitive habitat."`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Indicator: ${indicatorId}. Question: ${question}` },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      diag('groq-http-error', {
        status: response.status,
        statusText: response.statusText,
        body: errBody.slice(0, 500),
      });
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || 'No response from assistant.';
    diag('groq-success', { model: GROQ_MODEL, replyChars: text.length, indicatorId });

    return NextResponse.json({ response: text, source: 'groq' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const indicatorId = body?.indicatorId || 'unknown';
    const question = body?.question || '';
    diag('fallback-after-error', {
      error: message,
      indicatorId,
      question: String(question).slice(0, 200),
    });
    return NextResponse.json({
      response: getOfflineAssistantResponse(indicatorId, question),
      source: 'offline',
    }, { status: 200 });
  }
}
