# BOLT Prompt 3: API and AI

## AI Proxy Route
- `src/app/api/ai/assistant/route.ts`
- Proxies requests to Groq API (Llama 3.3 70B)
- Fallback: offline factsheet replies when no API key
- **Never** assigns tiers, scores, or severity levels
- **Never** identifies species beyond factsheet scope
- System prompt enforces OneAquaHealth protocol compliance

## Sensor API
- `src/app/api/sensors/route.ts`
- Returns sensor configurations for field collection

## Provenance API
- `src/app/api/provenance/route.ts`
- Logs data collection events for audit trail

## Export API
- `src/app/api/export/route.ts`
- Exports collected data as CSV/JSON

## AI Safety Rules
- Input validation on all endpoints
- Temperature: 0.3 (low, factual)
- Max tokens: 500
- System prompt includes explicit safety constraints
- Error handling returns offline fallback messages
