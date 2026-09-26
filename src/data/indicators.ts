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
  protocol_question: string;
  visual_anchor_guide: string;
  states: IndicatorState[];
  lab_guidance?: string;
  citation: string;
}

export const indicators: Indicator[] = indicatorsData as unknown as Indicator[];
