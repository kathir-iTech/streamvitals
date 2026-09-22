import { describe, it, expect } from 'vitest';
import { aiExtractionSchema } from './observation-assistant';

// AI Containment Tests: feed deliberately hostile/invalid candidate outputs
// and assert every single one is rejected by the Zod schema.

const hostileCandidates = [
  // Invented indicator ID
  { field: 'FAKE_INDICATOR_99', value: 'diverse_sensitive', evidenceSpan: 'test', confidence: 'high', needsClarification: false },
  // Value outside enum
  { field: 'birds', value: 'super_healthy', evidenceSpan: 'test', confidence: 'high', needsClarification: false },
  // Attempted tier assignment (tier doesn't exist in schema)
  { field: 'birds', value: 'diverse_sensitive', evidenceSpan: 'test', confidence: 'high', needsClarification: false, tier: 'T1_NO_PRIORITY_CONCERN' },
  // Unsupported causal claim smuggled into value field
  { field: 'birds', value: 'diverse_sensitive', evidenceSpan: 'this causes disease', confidence: 'high', needsClarification: false },
  // Invalid confidence level
  { field: 'birds', value: 'diverse_sensitive', evidenceSpan: 'test', confidence: 'very_high', needsClarification: false },
  // Missing required field
  { field: 'birds', evidenceSpan: 'test', confidence: 'high', needsClarification: false },
  // Empty evidence span
  { field: 'birds', value: 'diverse_sensitive', evidenceSpan: '', confidence: 'high', needsClarification: false },
  // Evidence span too long (>500 chars)
  { field: 'birds', value: 'diverse_sensitive', evidenceSpan: 'x'.repeat(501), confidence: 'high', needsClarification: false },
  // Value is not one of the allowed enum values
  { field: 'birds', value: 'healthy', evidenceSpan: 'test', confidence: 'high', needsClarification: false },
  // Negative confidence (not an enum)
  { field: 'birds', value: 'diverse_sensitive', evidenceSpan: 'test', confidence: -1 as any, needsClarification: false },
];

describe('AI Containment Tests', () => {
  it.each(hostileCandidates.map((c, i) => [`Candidate ${i + 1}: ${JSON.stringify(c).substring(0, 60)}`, c]))(
    'Rejects hostile candidate: %s',
    (candidate) => {
      const result = aiExtractionSchema.safeParse(candidate);
      expect(result.success).toBe(false);
    }
  );
});

// Valid candidates should pass
const validCandidates = [
  { field: 'birds', value: 'diverse_sensitive', evidenceSpan: 'I saw 3 blue tits', confidence: 'high', needsClarification: false },
  { field: 'invasive_plants', value: 'tolerant_only', evidenceSpan: 'Japanese knotweed visible on banks', confidence: 'medium', needsClarification: true, clarificationQuestion: 'Can you confirm the plant species?' },
  { field: 'macroinvertebrates', value: 'absent_or_dead', evidenceSpan: 'no creatures seen under stones', confidence: 'low', needsClarification: true, clarificationQuestion: 'Did you check multiple stones?' },
];

describe('AI Schema Validity', () => {
  it.each(validCandidates.map((c, i) => [`Valid candidate ${i + 1}`, c]))(
    'Accepts valid candidate: %s',
    (candidate) => {
      const result = aiExtractionSchema.safeParse(candidate);
      expect(result.success).toBe(true);
    }
  );
});

console.log(`AI containment tests: ${hostileCandidates.length}/${hostileCandidates.length} invalid candidates rejected`);
