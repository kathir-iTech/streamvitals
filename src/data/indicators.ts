import indicatorsData from './indicators.json';

export interface IndicatorState {
  id: string;
  label: string;
}

export interface Indicator {
  id: string;
  name: string;
  code: string;
  category: string;
  is_lab_only: boolean;
  lab_only: boolean;
  citizen_observable: boolean;
  protocol_question: string;
  citizen_question: string;
  visual_anchor_guide: string;
  states: IndicatorState[];
  citizen_state_labels: Record<string, string>;
  source: string;
  lab_guidance?: string;
  citation: string;
}

export const indicators: Indicator[] = indicatorsData as unknown as Indicator[];
