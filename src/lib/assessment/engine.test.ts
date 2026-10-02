import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { assess, summarizeAssessments, bandRank, ENGINE_VERSION } from './engine';

describe('deterministic assessment engine', () => {
  it('maps every citizen state of BMI-01 to the tolerance rule bands', () => {
    expect(assess('BMI-01', 'diverse_sensitive').band).toBe('favorable');
    expect(assess('BMI-01', 'tolerant_only').band).toBe('degraded');
    expect(assess('BMI-01', 'absent_or_dead').band).toBe('degraded');
  });

  it('maps every citizen state of BIR-04 to the richness rule bands', () => {
    expect(assess('BIR-04', 'many_species').band).toBe('favorable');
    expect(assess('BIR-04', 'few_species').band).toBe('moderate');
    expect(assess('BIR-04', 'none_observed').band).toBe('degraded');
  });

  it('maps every citizen state of INV-11 to the extent rule bands', () => {
    expect(assess('INV-11', 'none_seen').band).toBe('favorable');
    expect(assess('INV-11', 'few_patches').band).toBe('moderate');
    expect(assess('INV-11', 'widespread').band).toBe('degraded');
  });

  it('keeps both lab indicators pending — it never grades what it did not measure', () => {
    expect(assess('FCL-06').band).toBe('pending_lab');
    expect(assess('FCL-06').confidence).toBe('awaiting-laboratory');
    expect(assess('DIA-10').band).toBe('pending_lab');
    expect(assess('DIA-10').method).toBe('lab-protocol');
  });

  it('is referentially transparent: identical input yields byte-identical output', () => {
    const a = JSON.stringify(assess('BMI-01', 'diverse_sensitive'));
    const b = JSON.stringify(assess('BMI-01', 'diverse_sensitive'));
    expect(a).toBe(b);
    const c = JSON.stringify(assess('FCL-06'));
    const d = JSON.stringify(assess('FCL-06'));
    expect(c).toBe(d);
  });

  it('refuses to guess: unknown state and unknown indicator are unassessable, not thrown', () => {
    expect(assess('BMI-01', 'looks_fine').band).toBe('unassessable');
    expect(assess('XXX-99', 'diverse_sensitive').band).toBe('unassessable');
    expect(assess('BMI-01').band).toBe('unassessable');
    expect(assess('BMI-01', '').band).toBe('unassessable');
  });

  it('orders bands monotonically along each indicator\u2019s own gradient', () => {
    const ranks = (pairs: [string, string][]) =>
      pairs.map(([id, state]) => bandRank(assess(id, state).band) as number);
    const bmi = ranks([['BMI-01', 'diverse_sensitive'], ['BMI-01', 'tolerant_only']]);
    expect(bmi[0]).toBeLessThan(bmi[1]);
    const bir = ranks([['BIR-04', 'many_species'], ['BIR-04', 'few_species'], ['BIR-04', 'none_observed']]);
    expect(bir[0]).toBeLessThan(bir[1]);
    expect(bir[1]).toBeLessThan(bir[2]);
    const inv = ranks([['INV-11', 'none_seen'], ['INV-11', 'few_patches'], ['INV-11', 'widespread']]);
    expect(inv[0]).toBeLessThan(inv[1]);
    expect(inv[1]).toBeLessThan(inv[2]);
  });

  it('attaches a full chain of evidence and honesty caveats to every real assessment', () => {
    for (const [id, state] of [
      ['BMI-01', 'diverse_sensitive'],
      ['BMI-01', 'tolerant_only'],
      ['BMI-01', 'absent_or_dead'],
      ['BIR-04', 'many_species'],
      ['BIR-04', 'few_species'],
      ['BIR-04', 'none_observed'],
      ['INV-11', 'none_seen'],
      ['INV-11', 'few_patches'],
      ['INV-11', 'widespread'],
    ] as const) {
      const a = assess(id, state);
      expect(a.chain.length).toBeGreaterThanOrEqual(3);
      expect(a.caveats.length).toBeGreaterThan(0);
      expect(a.engine).toBe(ENGINE_VERSION);
      expect(a.scoredBy).toContain('No AI');
    }
    for (const id of ['FCL-06', 'DIA-10']) {
      const a = assess(id);
      expect(a.chain.length).toBe(3);
      expect(a.caveats[0]).toContain('did not measure');
    }
  });

  it('labels citizen output as a proxy, never as a laboratory index', () => {
    const a = assess('BMI-01', 'diverse_sensitive');
    expect(a.method).toBe('citizen-state-proxy');
    expect(a.caveats.join(' ')).toContain('not a BMWP score');
  });

  it('summarizes a session without changing any per-indicator result', () => {
    const summary = summarizeAssessments([
      { indicatorId: 'BMI-01', state: 'diverse_sensitive' },
      { indicatorId: 'BIR-04', state: 'none_observed' },
      { indicatorId: 'INV-11' },
      { indicatorId: 'FCL-06' },
      { indicatorId: 'DIA-10' },
    ]);
    expect(summary.counts.favorable).toBe(1);
    expect(summary.counts.degraded).toBe(1);
    expect(summary.counts.pending_lab).toBe(2);
    expect(summary.unassessable).toBe(1);
    expect(summary.worstBand).toBe('degraded');
    expect(summary.perIndicator).toHaveLength(5);
    expect(summary.engine).toBe(ENGINE_VERSION);
  });

  it('contains no AI, no network, no clock — the source itself is the boundary', () => {
    const source = readFileSync(join(process.cwd(), 'src/lib/assessment/engine.ts'), 'utf8');
    expect(source).not.toMatch(/fetch\s*\(/);
    expect(source).not.toMatch(/XMLHttpRequest/);
    expect(source).not.toMatch(/from ['"].*(assistant|groq|openai)/i);
    expect(source).not.toMatch(/require\(/);
    expect(source).not.toMatch(/\bDate\b/);
    expect(source).not.toMatch(/\bMath\.random\b/);
  });

  it('every input and rule id that can fire is unique (auditability)', () => {
    const ids = new Set<string>();
    for (const [id, states] of [
      ['BMI-01', ['diverse_sensitive', 'tolerant_only', 'absent_or_dead']],
      ['BIR-04', ['many_species', 'few_species', 'none_observed']],
      ['INV-11', ['none_seen', 'few_patches', 'widespread']],
    ] as const) {
      for (const state of states) {
        const a = assess(id, state);
        for (const step of a.chain) {
          if (step.step === 'Sources') continue; // shared citation, not a rule
          expect(ids.has(step.ruleId)).toBe(false);
          ids.add(step.ruleId);
        }
      }
    }
    expect(ids.size).toBeGreaterThan(0);
  });
});
