import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { indicatorId, question } = body;

    if (!indicatorId || !question) {
      return NextResponse.json({ error: 'Missing indicatorId or question' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        response: 'Assistant unavailable — no API key configured. Using offline factsheet reference.',
        source: 'offline' 
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
        model: 'llama-3.1-8b-instant',
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
    return NextResponse.json({ 
      response: `Assistant unavailable — network error: ${message}. Using offline factsheet reference.`,
      source: 'offline' 
    }, { status: 200 });
  }
}
