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
  citizen_state_labels: z.object({
    diverse_sensitive: z.string(),
    tolerant_only: z.string(),
    absent_or_dead: z.string(),
  }).optional(),
  states: z.object({
    diverse_sensitive: z.object({ policy_severity: z.number(), sensor_thresholds: z.record(z.string(), z.number()).optional() }),
    tolerant_only: z.object({ policy_severity: z.number(), sensor_thresholds: z.record(z.string(), z.number()).optional() }),
    absent_or_dead: z.object({ policy_severity: z.number(), sensor_thresholds: z.record(z.string(), z.number()).optional() }),
  }),
  framework_basis: z.object({ document: z.string(), citation: z.string().nullable() }),
  triage_mapping: z.object({ type: z.string(), note: z.string() }),
  one_health_message: z.string(),
  lab_only: z.boolean(),
  coding: z.object({ system: z.string().nullable(), code: z.string().nullable() }),
  source: z.string().nullable(),
  sensor_parameters: z.array(z.string()).optional(),
  ogc_sensorthings_model: z.object({
    datastreamName: z.string().optional(),
    observationType: z.string().optional(),
    phenomenon: z.string().optional(),
    unitOfMeasurement: z.object({ name: z.string(), definition: z.string(), symbol: z.string() }).optional(),
  }).optional(),
  waterml_concept: z.string().optional(),
  epa_storet_parameter: z.string().optional(),
  sensor_health_indicator: z.boolean().optional(),
  real_time_monitoring: z.boolean().optional(),
  wqp_data_category: z.string().optional(),
  huc_relevance: z.array(z.number()).optional(),
  geospatial: z.object({ supports_huc: z.boolean().optional(), watershed_mapping: z.boolean().optional(), leaflet_integration: z.boolean().optional() }).optional(),
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
