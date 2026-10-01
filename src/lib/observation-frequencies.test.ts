import { describe, it, expect } from 'vitest';
import { computeObservationFrequencies } from './observation-frequencies';
import type { FieldSession } from './field-session';

function session(id: string, indicators: FieldSession['indicators']): FieldSession {
  return { sessionId: id, streamName: 'Test Stream', volunteer: 'Tester', date: '2026-10-01', indicators, startedAt: '2026-10-01T00:00:00Z' };
}

function record(indicatorId: string, indicatorName: string, type: 'citizen_observable' | 'lab_only', state?: string) {
  return { indicatorId, indicatorName, type, state, photos: [], notes: '', timestamp: '2026-10-01T00:00:00Z', status: 'complete' as const };
}

describe('computeObservationFrequencies', () => {
  it('returns empty array for no sessions', () => {
    expect(computeObservationFrequencies([])).toEqual([]);
  });

  it('counts states across sessions as frequencies', () => {
    const sessions = [
      session('s1', [record('BMI-01', 'Benthic Macroinvertebrates', 'citizen_observable', 'diverse_sensitive')]),
      session('s2', [
        record('BMI-01', 'Benthic Macroinvertebrates', 'citizen_observable', 'diverse_sensitive'),
        record('BMI-01', 'Benthic Macroinvertebrates', 'citizen_observable', 'tolerant_only'),
      ]),
    ];
    const result = computeObservationFrequencies(sessions);
    expect(result).toHaveLength(1);
    expect(result[0].indicatorId).toBe('BMI-01');
    expect(result[0].total).toBe(3);
    expect(result[0].states).toEqual([
      { state: 'diverse_sensitive', count: 2 },
      { state: 'tolerant_only', count: 1 },
    ]);
  });

  it('excludes lab-only records and records without a state', () => {
    const sessions = [
      session('s1', [
        record('FCL-06', 'Fecal Coliforms', 'lab_only'),
        record('BMI-01', 'Benthic Macroinvertebrates', 'citizen_observable'),
      ]),
    ];
    expect(computeObservationFrequencies(sessions)).toEqual([]);
  });

  it('orders indicators by id and states by count then name', () => {
    const sessions = [
      session('s1', [
        record('BIR-04', 'Birds', 'citizen_observable', 'many_species'),
        record('BMI-01', 'Benthic Macroinvertebrates', 'citizen_observable', 'tolerant_only'),
        record('BMI-01', 'Benthic Macroinvertebrates', 'citizen_observable', 'diverse_sensitive'),
        record('BMI-01', 'Benthic Macroinvertebrates', 'citizen_observable', 'tolerant_only'),
      ]),
    ];
    const result = computeObservationFrequencies(sessions);
    expect(result.map((r) => r.indicatorId)).toEqual(['BIR-04', 'BMI-01']);
    const bmi = result.find((r) => r.indicatorId === 'BMI-01')!;
    expect(bmi.states.map((s) => s.state)).toEqual(['tolerant_only', 'diverse_sensitive']);
  });

  it('treats the output as plain counts: totals equal the sum of state counts', () => {
    const sessions = [
      session('s1', [record('INV-11', 'Invasive Alien Plants', 'citizen_observable', 'few_patches')]),
      session('s2', [record('INV-11', 'Invasive Alien Plants', 'citizen_observable', 'few_patches')]),
      session('s3', [record('INV-11', 'Invasive Alien Plants', 'citizen_observable', 'none_seen')]),
    ];
    const result = computeObservationFrequencies(sessions);
    const summed = result[0].states.reduce((acc, s) => acc + s.count, 0);
    expect(result[0].total).toBe(summed);
    expect(result[0].total).toBe(3);
  });
});
