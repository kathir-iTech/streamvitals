export interface IndicatorState {
  policy_severity: number;
  sensor_thresholds?: Record<string, number>;
}

export interface FrameworkBasis {
  document: string;
  citation: string | null;
}

export interface Coding {
  system: string | null;
  code: string | null;
}

export interface OgcSensorThingsModel {
  datastreamName?: string;
  observationType?: string;
  phenomenon?: string;
  unitOfMeasurement?: { name: string; definition: string; symbol: string };
}

export interface SensorGeospatial {
  supports_huc?: boolean;
  watershed_mapping?: boolean;
  leaflet_integration?: boolean;
}

export interface Indicator {
  id: string;
  group: string;
  name: string;
  citizen_observable: boolean;
  citizen_question: string;
  visual_anchor_guide: string;
  plain_term: string;
  citizen_state_labels?: Record<string, string>;
  states: Record<string, IndicatorState>;
  framework_basis: FrameworkBasis;
  triage_mapping: { type: string; note: string };
  one_health_message: string;
  lab_only: boolean;
  coding: Coding;
  source: string;
  sensor_parameters?: string[];
  ogc_sensorthings_model?: OgcSensorThingsModel;
  waterml_concept?: string;
  epa_storet_parameter?: string;
  sensor_health_indicator?: boolean;
  real_time_monitoring?: boolean;
  wqp_data_category?: string;
  huc_relevance?: number[];
  geospatial?: SensorGeospatial;
}

import indicatorsData from '@/data/indicators.json';

export const indicators: Indicator[] = indicatorsData as unknown as Indicator[];