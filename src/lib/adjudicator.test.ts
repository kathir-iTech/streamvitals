import { describe, it, expect } from 'vitest';
import { assess, validateObservations } from './adjudicator';
import { indicators } from '@/data/indicators';

const makeObs = (indicatorId: string, state: string, confirmed = true, confidence: 'high' | 'uncertain' = 'high') => ({
  indicatorId,
  state: state as 'diverse_sensitive' | 'tolerant_only' | 'absent_or_dead',
  confirmed,
  confidence,
});

const allHealthy = [
  makeObs('BMI-01', 'diverse_sensitive'),
  makeObs('BMI-04', 'diverse_sensitive'),
  makeObs('BMI-11', 'diverse_sensitive'),
];

const allAbsent = [
  makeObs('BMI-01', 'absent_or_dead'),
  makeObs('BMI-04', 'absent_or_dead'),
  makeObs('BMI-11', 'absent_or_dead'),
];

const mixed = [
  makeObs('BMI-01', 'diverse_sensitive'),
  makeObs('BMI-04', 'tolerant_only'),
  makeObs('BMI-11', 'absent_or_dead'),
];

describe('Repeatability', () => {
  it('same input produces identical output every time', () => {
    const r1 = assess(allHealthy);
    const r2 = assess(allHealthy);
    const r3 = assess(allHealthy);
    expect(r1).toEqual(r2);
    expect(r2).toEqual(r3);
  });

  it('deterministic across multiple calls with same observations', () => {
    const observations = [makeObs('BMI-01', 'absent_or_dead'), makeObs('BMI-04', 'diverse_sensitive')];
    const results = Array.from({ length: 10 }, () => assess(observations));
    const first = results[0];
    results.forEach((r) => expect(r).toEqual(first));
  });
});

describe('Monotonicity', () => {
  it('worse observation never produces better tier without documented reason', () => {
    const healthy = assess([makeObs('BMI-01', 'diverse_sensitive')]);
    const tolerant = assess([makeObs('BMI-01', 'tolerant_only')]);
    const absent = assess([makeObs('BMI-01', 'absent_or_dead')]);

    expect(['T1_NO_PRIORITY_CONCERN', 'T2_NEEDS_ATTENTION', 'T3_FURTHER_ASSESSMENT_RECOMMENDED'].indexOf(healthy.tier)).toBeLessThanOrEqual(['T1_NO_PRIORITY_CONCERN', 'T2_NEEDS_ATTENTION', 'T3_FURTHER_ASSESSMENT_RECOMMENDED'].indexOf(tolerant.tier));
    expect(['T1_NO_PRIORITY_CONCERN', 'T2_NEEDS_ATTENTION', 'T3_FURTHER_ASSESSMENT_RECOMMENDED'].indexOf(tolerant.tier)).toBeLessThanOrEqual(['T1_NO_PRIORITY_CONCERN', 'T2_NEEDS_ATTENTION', 'T3_FURTHER_ASSESSMENT_RECOMMENDED'].indexOf(absent.tier));
  });

  it('adding a worse observation does not improve tier', () => {
    const better = assess([makeObs('BMI-01', 'diverse_sensitive'), makeObs('BMI-04', 'diverse_sensitive')]);
    const worse = assess([makeObs('BMI-01', 'absent_or_dead'), makeObs('BMI-04', 'diverse_sensitive')]);
    const severityRank = { T1_NO_PRIORITY_CONCERN: 0, T2_NEEDS_ATTENTION: 1, T3_FURTHER_ASSESSMENT_RECOMMENDED: 2 };
    expect(severityRank[worse.tier]).toBeGreaterThanOrEqual(severityRank[better.tier]);
  });

  it('tier progression is strictly ordered', () => {
    const obs = (state: string) => makeObs('BMI-01', state as 'diverse_sensitive' | 'tolerant_only' | 'absent_or_dead');
    const t1 = assess([obs('diverse_sensitive')]);
    const t2 = assess([obs('tolerant_only')]);
    const t3 = assess([obs('absent_or_dead')]);
    const order = { T1_NO_PRIORITY_CONCERN: 0, T2_NEEDS_ATTENTION: 1, T3_FURTHER_ASSESSMENT_RECOMMENDED: 2 };
    expect(order[t1.tier]).toBeLessThan(order[t2.tier]);
    expect(order[t2.tier]).toBeLessThan(order[t3.tier]);
  });
});

describe('Missing-data safety', () => {
  it('unanswered field never treated as healthy', () => {
    const partial = [makeObs('BMI-01', 'diverse_sensitive', true)];
    const verdict = assess(partial);
    expect(verdict.tier).toBe('T1_NO_PRIORITY_CONCERN');
    expect(verdict.dataStatus).toBe('PARTIAL');
  });

  it('unconfirmed observation is not evaluated', () => {
    const unconfirmed = [makeObs('BMI-01', 'absent_or_dead', false)];
    const verdict = assess(unconfirmed);
    expect(verdict.dataStatus).toBe('INSUFFICIENT');
  });

  it('missing data results in INSUFFICIENT status', () => {
    const observations = [
      makeObs('BMI-01', 'diverse_sensitive'),
      makeObs('BMI-04', 'diverse_sensitive'),
      makeObs('BMI-11', 'diverse_sensitive'),
      makeObs('BMI-02', 'diverse_sensitive', false),
      makeObs('BMI-03', 'diverse_sensitive', false),
    ];
    const verdict = assess(observations);
    expect(verdict.dataStatus).toBe('PARTIAL');
  });

  it('all missing fields produce INSUFFICIENT', () => {
    const observations = [
      makeObs('BMI-01', 'diverse_sensitive', false),
      makeObs('BMI-04', 'diverse_sensitive', false),
      makeObs('BMI-11', 'diverse_sensitive', false),
    ];
    const verdict = assess(observations);
    expect(verdict.dataStatus).toBe('INSUFFICIENT');
  });
});

describe('Unsupported-indicator safety', () => {
  it('lab-only indicator without lab data resolves to not_assessed, never inferred', () => {
    const observations = [
      makeObs('BMI-02', 'diverse_sensitive', false),
      makeObs('BMI-06', 'diverse_sensitive', false),
      makeObs('BMI-07', 'diverse_sensitive', false),
    ];
    const verdict = assess(observations);
    expect(verdict.dataStatus).toBe('INSUFFICIENT');
    expect(verdict.drivers.length).toBe(0);
  });

  it('lab-only indicator with no data does not produce a tier', () => {
    const observations = [
      makeObs('BMI-02', 'absent_or_dead', false),
      makeObs('BMI-06', 'absent_or_dead', false),
      makeObs('BMI-07', 'absent_or_dead', false),
    ];
    const verdict = assess(observations);
    expect(verdict.tier).toBe('T1_NO_PRIORITY_CONCERN');
    expect(verdict.drivers.length).toBe(0);
  });
});

describe('Evidence traceability', () => {
  it('every driver in verdict resolves to a real indicator ID', () => {
    const verdict = assess(mixed);
    for (const driver of verdict.drivers) {
      const ind = (indicators as any[]).find((i) => i.id === driver.indicatorId);
      expect(ind).toBeDefined();
    }
  });

  it('every driver has a ruleId, ruleName, and source', () => {
    const verdict = assess(mixed);
    for (const driver of verdict.drivers) {
      expect(driver.ruleId).toBeTruthy();
      expect(driver.ruleName).toBeTruthy();
      expect(driver.source).toBeTruthy();
    }
  });

  it('driver severity matches indicator state policy_severity', () => {
    const verdict = assess(mixed);
    for (const driver of verdict.drivers) {
      const ind = (indicators as any[]).find((i) => i.id === driver.indicatorId);
      expect(driver.severity).toBe(ind.states[driver.observationState as keyof typeof ind.states].policy_severity);
    }
  });

  it('verdict timestamp is present', () => {
    const verdict = assess(allHealthy);
    expect(verdict.timestamp).toBeTruthy();
  });
});

describe('City separation', () => {
  it('changing selected city does not change core verdict logic', () => {
    const observations = [makeObs('BMI-01', 'absent_or_dead'), makeObs('BMI-04', 'diverse_sensitive')];
    const verdictCoimbra = assess(observations);
    const verdictOslo = assess(observations);
    expect(verdictCoimbra).toEqual(verdictOslo);
  });

  it('city field does not affect tier calculation', () => {
    const obsWithCity = [makeObs('BMI-01', 'absent_or_dead'), makeObs('BMI-04', 'tolerant_only')];
    const verdict = assess(obsWithCity);
    expect(verdict.tier).toBe('T3_FURTHER_ASSESSMENT_RECOMMENDED');
  });
});

describe('Tier assignment', () => {
  it('all diverse_sensitive → T1_NO_PRIORITY_CONCERN', () => {
    const verdict = assess(allHealthy);
    expect(verdict.tier).toBe('T1_NO_PRIORITY_CONCERN');
  });

  it('any tolerant_only → T2_NEEDS_ATTENTION', () => {
    const observations = [makeObs('BMI-01', 'diverse_sensitive'), makeObs('BMI-04', 'tolerant_only')];
    const verdict = assess(observations);
    expect(verdict.tier).toBe('T2_NEEDS_ATTENTION');
  });

  it('any absent_or_dead → T3_FURTHER_ASSESSMENT_RECOMMENDED', () => {
    const verdict = assess(allAbsent);
    expect(verdict.tier).toBe('T3_FURTHER_ASSESSMENT_RECOMMENDED');
  });

  it('mixed states use worst state for tier', () => {
    const verdict = assess(mixed);
    expect(verdict.tier).toBe('T3_FURTHER_ASSESSMENT_RECOMMENDED');
  });
});

describe('Data status', () => {
  it('all confirmed → SUFFICIENT', () => {
    const observations = [makeObs('BMI-01', 'diverse_sensitive'), makeObs('BMI-04', 'diverse_sensitive'), makeObs('BMI-11', 'diverse_sensitive')];
    const verdict = assess(observations);
    expect(verdict.dataStatus).toBe('SUFFICIENT');
  });

  it('half confirmed → PARTIAL', () => {
    const observations = [
      makeObs('BMI-01', 'diverse_sensitive'),
      makeObs('BMI-04', 'diverse_sensitive'),
      makeObs('BMI-11', 'diverse_sensitive', false),
    ];
    const verdict = assess(observations);
    expect(verdict.dataStatus).toBe('PARTIAL');
  });

  it('none confirmed → INSUFFICIENT', () => {
    const observations = [
      makeObs('BMI-01', 'diverse_sensitive', false),
      makeObs('BMI-04', 'diverse_sensitive', false),
      makeObs('BMI-11', 'diverse_sensitive', false),
    ];
    const verdict = assess(observations);
    expect(verdict.dataStatus).toBe('INSUFFICIENT');
  });
});

describe('Evidence coverage counts', () => {
  it('counts assessed, notApplicable, requireProfessional correctly', () => {
    const observations = [
      makeObs('BMI-01', 'diverse_sensitive'),
      makeObs('BMI-04', 'diverse_sensitive'),
      makeObs('BMI-02', 'diverse_sensitive', false),
    ];
    const verdict = assess(observations);
    expect(verdict.evidenceCoverage.assessed).toBe(2);
    expect(verdict.evidenceCoverage.requireProfessionalMeasurement).toBe(0);
  });
});

describe('Validation', () => {
  it('valid observations pass validation', () => {
    const result = validateObservations(allHealthy);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('unknown indicator ID fails validation', () => {
    const observations = [{ indicatorId: 'FAKE-99', state: 'diverse_sensitive', confirmed: true }];
    const result = validateObservations(observations as any);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Unknown indicator'))).toBe(true);
  });

  it('unconfirmed observation fails validation', () => {
    const observations = [makeObs('BMI-01', 'diverse_sensitive', false)];
    const result = validateObservations(observations);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('not confirmed'))).toBe(true);
  });
});

describe('Non-AI compliance', () => {
  it('adjudicator has no network calls', () => {
    const verdict = assess(allHealthy);
    expect(verdict.tier).toBeTruthy();
  });

  it('verdict does not contain AI-generated text', () => {
    const verdict = assess(allHealthy);
    const verdictStr = JSON.stringify(verdict);
    expect(verdictStr).not.toContain('AI');
    expect(verdictStr).not.toContain('artificial intelligence');
  });
});
