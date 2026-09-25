import { indicators } from '@/data/indicators';

let _now = () => new Date().toISOString();
export function setNow(fn: () => string) { _now = fn; }

export type Tier = 'T1_NO_PRIORITY_CONCERN' | 'T2_NEEDS_ATTENTION' | 'T3_FURTHER_ASSESSMENT_RECOMMENDED';
export type DataStatus = 'SUFFICIENT' | 'PARTIAL' | 'INSUFFICIENT';

export interface ObservationField {
  indicatorId: string;
  state: string;
  confirmed: boolean;
  confidence: 'high' | 'uncertain';
}

export interface Driver {
  ruleId: string;
  ruleName: string;
  indicatorId: string;
  indicatorName: string;
  observationState: string;
  source: string;
  oneHealthMessage: string;
  severity: number;
}

export interface Verdict {
  tier: Tier;
  dataStatus: DataStatus;
  drivers: Driver[];
  evidenceCoverage: {
    assessed: number;
    notApplicable: number;
    requireProfessionalMeasurement: number;
  };
  timestamp: string;
}

const INDICATOR_MAP = new Map<string, typeof indicators[0]>(indicators.map((ind) => [ind.id, ind]));

export function assess(observations: ObservationField[]): Verdict {
  const drivers: Driver[] = [];
  const now = _now();

  let maxSeverity = 0;
  let tier: Tier = 'T1_NO_PRIORITY_CONCERN';

  const assessed = observations.filter((o) => o.confirmed).length;
  const notApplicable = observations.filter(
    (o) => !INDICATOR_MAP.get(o.indicatorId)?.citizen_observable && !o.confirmed
  ).length;
  const requireProfessional = observations.filter(
    (o) => INDICATOR_MAP.get(o.indicatorId)?.lab_only && !o.confirmed
  ).length;

  for (const obs of observations) {
    if (!obs.confirmed) continue;

    const ind = INDICATOR_MAP.get(obs.indicatorId);
    if (!ind) continue;

    const severity = ind.states[obs.state]?.policy_severity ?? 0;
    if (severity > maxSeverity) {
      maxSeverity = severity;
    }

    const ruleId = `RULE-${obs.indicatorId}-${obs.state}`;
    const ruleName = getRuleName(ind, obs.state);

    drivers.push({
      ruleId,
      ruleName,
      indicatorId: ind.id,
      indicatorName: ind.name,
      observationState: obs.state,
      source: ind.framework_basis.citation ?? ind.source ?? 'StreamVitals policy',
      oneHealthMessage: ind.one_health_message,
      severity,
    });
  }

  if (maxSeverity >= 3) {
    tier = 'T3_FURTHER_ASSESSMENT_RECOMMENDED';
  } else if (maxSeverity >= 2) {
    tier = 'T2_NEEDS_ATTENTION';
  } else {
    tier = 'T1_NO_PRIORITY_CONCERN';
  }

  let dataStatus: DataStatus;
  if (assessed >= observations.length) {
    dataStatus = 'SUFFICIENT';
  } else if (assessed >= Math.ceil(observations.length / 2)) {
    dataStatus = 'PARTIAL';
  } else {
    dataStatus = 'INSUFFICIENT';
  }

  return {
    tier,
    dataStatus,
    drivers,
    evidenceCoverage: {
      assessed,
      notApplicable,
      requireProfessionalMeasurement: requireProfessional,
    },
    timestamp: now,
  };
}

function getRuleName(ind: typeof indicators[0], state: string): string {
  const labels = ind.citizen_state_labels || {};
  const label = labels[state as keyof typeof labels] || state.replace(/_/g, ' ');
  const stateName = state.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const severity = ind.states[state]?.policy_severity ?? 0;
  const concernLabel = severity === 0 ? 'No Priority Concern' : severity === 2 ? 'Needs Attention' : 'Further Assessment Recommended';
  return `${ind.name}: ${label} → ${concernLabel}`;
}

export function validateObservations(observations: ObservationField[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  for (const obs of observations) {
    if (!INDICATOR_MAP.has(obs.indicatorId)) {
      errors.push(`Unknown indicator ID: ${obs.indicatorId}`);
    }
    const ind = INDICATOR_MAP.get(obs.indicatorId);
    if (ind && !Object.keys(ind.states).includes(obs.state)) {
      errors.push(`Invalid state "${obs.state}" for indicator ${obs.indicatorId}`);
    }
    if (!obs.confirmed) {
      errors.push(`Observation for ${obs.indicatorId} is not confirmed`);
    }
  }

  return { valid: errors.length === 0, errors };
}
