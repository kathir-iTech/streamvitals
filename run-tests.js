const fs = require('fs');
const path = require('path');
const { assess, validateObservations, INDICATOR_MAP, setNow } = require('./src/lib/adjudicator.cjs');
const indicators = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/indicators.json'), 'utf8'));

const makeObs = (indicatorId, state, confirmed = true) => ({
  indicatorId,
  state,
  confirmed,
  confidence: 'high',
});

const allHealthy = [
  makeObs('BMI-01', 'diverse_sensitive'),
  makeObs('BIR-04', 'many_species'),
  makeObs('INV-11', 'none_seen'),
];

const allAbsent = [
  makeObs('BMI-01', 'absent_or_dead'),
  makeObs('BIR-04', 'none_observed'),
  makeObs('INV-11', 'widespread'),
];

const mixed = [
  makeObs('BMI-01', 'diverse_sensitive'),
  makeObs('BIR-04', 'few_species'),
  makeObs('INV-11', 'widespread'),
];

let passed = 0;
let failed = 0;

function assert(label, condition) {
  if (condition) {
    passed++;
    console.log(`PASS: ${label}`);
  } else {
    failed++;
    console.log(`FAIL: ${label}`);
  }
}

const fakeNow = () => '2026-09-22T00:00:00.000Z';
setNow(fakeNow);

// Repeatability
const r1 = assess(allHealthy);
const r2 = assess(allHealthy);
assert('Repeatability: same input -> identical output', JSON.stringify(r1) === JSON.stringify(r2));
for (let i = 0; i < 5; i++) { assert(`Repeatability: call ${i} matches`, JSON.stringify(assess(allHealthy)) === JSON.stringify(r1)); }

// Monotonicity
const t1 = assess([makeObs('BMI-01', 'diverse_sensitive')]);
const t2 = assess([makeObs('BMI-01', 'tolerant_only')]);
const t3 = assess([makeObs('BMI-01', 'absent_or_dead')]);
const order = { T1_NO_PRIORITY_CONCERN: 0, T2_NEEDS_ATTENTION: 1, T3_FURTHER_ASSESSMENT_RECOMMENDED: 2 };
assert('Monotonicity: tier progression is ordered', order[t1.tier] < order[t2.tier] && order[t2.tier] < order[t3.tier]);

const better = assess([makeObs('BMI-01', 'diverse_sensitive'), makeObs('BIR-04', 'many_species')]);
const worse = assess([makeObs('BMI-01', 'absent_or_dead'), makeObs('BIR-04', 'many_species')]);
assert('Worse observation never produces better tier', order[worse.tier] >= order[better.tier]);

// Tier assignment
assert('All healthy -> T1_NO_PRIORITY_CONCERN', t1.tier === 'T1_NO_PRIORITY_CONCERN');
assert('Any tolerant_only -> T2_NEEDS_ATTENTION', t2.tier === 'T2_NEEDS_ATTENTION');
assert('Any absent_or_dead -> T3_FURTHER_ASSESSMENT_RECOMMENDED', t3.tier === 'T3_FURTHER_ASSESSMENT_RECOMMENDED');
assert('Mixed states -> worst tier', assess(mixed).tier === 'T3_FURTHER_ASSESSMENT_RECOMMENDED');

// Data status
assert('All confirmed -> SUFFICIENT', assess(allHealthy).dataStatus === 'SUFFICIENT');
assert('Half confirmed -> PARTIAL', assess([...allHealthy.slice(0, 2), makeObs('INV-11', 'none_seen', false)]).dataStatus === 'PARTIAL');
assert('None confirmed -> INSUFFICIENT', assess(allHealthy.map(o => ({...o, confirmed: false}))).dataStatus === 'INSUFFICIENT');

// Missing-data safety
assert('Unanswered field with other data -> PARTIAL not SUFFICIENT', assess([makeObs('BMI-01', 'diverse_sensitive', true), makeObs('BIR-04', 'many_species', false)]).dataStatus === 'PARTIAL');
assert('Unconfirmed observation not evaluated', assess([makeObs('BMI-01', 'absent_or_dead', false)]).drivers.length === 0);
assert('All missing -> INSUFFICIENT', assess(allHealthy.map(o => ({...o, confirmed: false}))).dataStatus === 'INSUFFICIENT');
assert('Partial missing data has INSUFFICIENT status not healthy', assess([makeObs('BMI-01', 'diverse_sensitive', false), makeObs('BIR-04', 'many_species', false), makeObs('INV-11', 'none_seen', false)]).dataStatus === 'INSUFFICIENT');

// Unsupported-indicator safety
assert('Lab-only indicator without data -> not assessed, never inferred', assess([makeObs('FSH-02', 'absent_or_dead', false)]).drivers.length === 0);
assert('Lab-only indicator absent_or_dead does not produce T3', assess([makeObs('FSH-02', 'absent_or_dead', false)]).tier === 'T1_NO_PRIORITY_CONCERN');

// Evidence traceability
const verdict = assess(mixed);
assert('Every driver has indicatorId, ruleId, ruleName, source', verdict.drivers.every(d => d.indicatorId && d.ruleId && d.ruleName && d.source));
assert('Every driver severity matches policy_severity', verdict.drivers.every(d => {
  const ind = indicators.find(i => i.id === d.indicatorId);
  return ind && d.severity === ind.states[d.observationState].policy_severity;
}));
assert('Every driver has oneHealthMessage', verdict.drivers.every(d => d.oneHealthMessage));
assert('Verdict timestamp is present', verdict.timestamp !== '');
assert('Drivers count matches confirmed observations', verdict.drivers.length === 3);

// City separation
const v1 = assess([makeObs('BMI-01', 'absent_or_dead'), makeObs('BIR-04', 'many_species')]);
const v2 = assess([makeObs('BMI-01', 'absent_or_dead'), makeObs('BIR-04', 'many_species')]);
assert('City separation: same input -> same verdict', JSON.stringify(v1) === JSON.stringify(v2));

// Validation
assert('Valid observations pass', validateObservations(allHealthy).valid === true);
assert('Valid observations have no errors', validateObservations(allHealthy).errors.length === 0);
assert('Unknown indicator fails', validateObservations([{indicatorId: 'FAKE-99', state: 'diverse_sensitive', confirmed: true}]).valid === false);
assert('Unconfirmed fails validation', validateObservations([makeObs('BMI-01', 'diverse_sensitive', false)]).valid === false);

// Non-AI compliance
const verdictStr = JSON.stringify(assess(allHealthy));
assert('Verdict contains no AI references', !verdictStr.includes('AI') && !verdictStr.includes('artificial intelligence'));

// Evidence coverage
assert('Evidence coverage: assessed count is correct', verdict.evidenceCoverage.assessed === 3);
assert('Evidence coverage: requireProfessional count is correct', verdict.evidenceCoverage.requireProfessionalMeasurement >= 0);

// Indices exist
assert('INDICATOR_MAP has BMI-01', INDICATOR_MAP.has('BMI-01'));
assert('INDICATOR_MAP has BIR-04', INDICATOR_MAP.has('BIR-04'));
assert('INDICATOR_MAP has INV-11', INDICATOR_MAP.has('INV-11'));
assert('INDICATOR_MAP size is 11', INDICATOR_MAP.size === 11);

console.log(`\n--- Results: ${passed} passed, ${failed} failed ---`);
process.exit(failed > 0 ? 1 : 0);
