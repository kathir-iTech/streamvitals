import { z } from 'zod';
import { observationFieldSchema, observationValueSchema, stateSchema } from './schema';

const aiExtractionSchema = z.object({
  field: observationFieldSchema,
  value: observationValueSchema,
  evidenceSpan: z.string().min(1).max(500),
  confidence: z.enum(['high', 'medium', 'low']),
  needsClarification: z.boolean(),
  clarificationQuestion: z.string().optional(),
});

export type AIExtraction = z.infer<typeof aiExtractionSchema>;

const SYSTEM_PROMPT = `You are an Observation Quality Gate for StreamVitals, a tool for assessing urban stream health. Your ONLY job is to extract structured field observations from free-text citizen notes.

Rules:
1. Extract evidence spans (direct quotes) from the text that support each observation.
2. Map each extracted observation to the FIXED field vocabulary below. Never invent new fields.
3. NEVER output a tier, recommendation, diagnosis, or One Health text.
4. NEVER output any text outside the JSON structure.
5. If a claim is an interpretation (e.g. "I think there's sewage"), mark it as needsClarification: true with a clarification question.
6. If two mutually exclusive states are claimed for the same field (e.g. "crystal clear" + "very muddy"), mark needsClarification: true.

Field vocabulary:
- diatoms: "diverse_sensitive", "tolerant_only", "absent_or_dead"
- macroinvertebrates: "diverse_sensitive", "tolerant_only", "absent_or_dead"
- fish: "diverse_sensitive", "tolerant_only", "absent_or_dead"
- amphibians: "diverse_sensitive", "tolerant_only", "absent_or_dead"
- birds: "diverse_sensitive", "tolerant_only", "absent_or_dead"
- microbial_diversity: "diverse_sensitive", "tolerant_only", "absent_or_dead"
- fecal_coliforms: "diverse_sensitive", "tolerant_only", "absent_or_dead"
- pathogens: "diverse_sensitive", "tolerant_only", "absent_or_dead"
- antibiotic_resistance_genes: "diverse_sensitive", "tolerant_only", "absent_or_dead"
- diptera_adults: "diverse_sensitive", "tolerant_only", "absent_or_dead"
- invasive_plants: "diverse_sensitive", "tolerant_only", "absent_or_dead"

Confidence: high = directly observable in text, medium = inferred from context, low = uncertain.

Output ONLY valid JSON matching the schema above.`;

export async function extractObservations(
  freeText: string,
  apiKey: string
): Promise<{ extractions: AIExtraction[]; rejected: AIExtraction[] }> {
  // Model: llama-3.1-8b-instant on Groq (OpenAI-compatible).
  // Verify current recommended model name for Groq free tier before hardcoding.
  const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

  const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant', // UNVERIFIED — confirm current model name before submission
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: freeText },
      ],
      temperature: 0.1,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  // Parse and validate the JSON response
  const parsed = JSON.parse(content);
  const extractions: AIExtraction[] = [];
  const rejected: AIExtraction[] = [];

  const items = Array.isArray(parsed) ? parsed : [parsed];
  for (const item of items) {
    const result = aiExtractionSchema.safeParse(item);
    if (result.success) {
      extractions.push(result.data);
    } else {
      rejected.push(item);
    }
  }

  return { extractions, rejected };
}

export { aiExtractionSchema };
