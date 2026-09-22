import { z } from 'zod';

export const stateSchema = z.enum(['diverse_sensitive', 'tolerant_only', 'absent_or_dead']);

export const indicatorSchema = z.object({
  id: z.string(),
  group: z.string(),
  name: z.string(),
  citizen_observable: z.boolean(),
  citizen_question: z.string(),
  visual_anchor_guide: z.string(),
  plain_term: z.string(),
  states: z.object({
    diverse_sensitive: z.object({ policy_severity: z.number() }),
    tolerant_only: z.object({ policy_severity: z.number() }),
    absent_or_dead: z.object({ policy_severity: z.number() }),
  }),
  framework_basis: z.object({
    document: z.string(),
    citation: z.string().nullable(),
  }),
  triage_mapping: z.object({
    type: z.string(),
    note: z.string(),
  }),
  one_health_message: z.string(),
  lab_only: z.boolean(),
  coding: z.object({ system: z.string().nullable(), code: z.string().nullable() }),
  source: z.string().nullable(),
});

export type Indicator = z.infer<typeof indicatorSchema>;

export const observationFieldSchema = z.enum([
  'diatoms',
  'macroinvertebrates',
  'fish',
  'amphibians',
  'birds',
  'microbial_diversity',
  'fecal_coliforms',
  'pathogens',
  'antibiotic_resistance_genes',
  'diptera_adults',
  'invasive_plants',
]);

export const observationValueSchema = stateSchema;

export const aiExtractionSchema = z.object({
  field: observationFieldSchema,
  value: observationValueSchema,
  evidenceSpan: z.string(),
  confidence: z.enum(['high', 'medium', 'low']),
  needsClarification: z.boolean(),
  clarificationQuestion: z.string().optional(),
});

export type AIExtraction = z.infer<typeof aiExtractionSchema>;
