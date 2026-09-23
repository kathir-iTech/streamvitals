const fs = require('fs');
const path = require('path');
const indicators = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/indicators.json'), 'utf8'));

let _now = () => new Date().toISOString();
function setNow(fn) { _now = fn; }

const INDICATOR_MAP = new Map(indicators.map((ind) => [ind.id, ind]));

function assess(observations) {
  const drivers = [];
  const now = _now();
  let maxSeverity = 0;
  let tier = 'T1_NO_PRIORITY_CONCERN';

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

  let dataStatus;
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

function getRuleName(ind, state) {
  const labels = ind.citizen_state_labels || {};
  const label = labels[state] || state.replace(/_/g, ' ');
  const severity = ind.states[state]?.policy_severity ?? 0;
  const concernLabel = severity === 0 ? 'No Priority Concern' : severity === 2 ? 'Needs Attention' : 'Further Assessment Recommended';
  return `${ind.name}: ${label} → ${concernLabel}`;
}

function validateObservations(observations) {
  const errors = [];
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

module.exports = { assess, validateObservations, INDICATOR_MAP, setNow };
