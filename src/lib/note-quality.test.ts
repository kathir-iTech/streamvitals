import { describe, it, expect } from 'vitest';
import { checkNoteQuality } from './note-quality';

describe('note-quality', () => {
  it('passes neutral field notes', () => {
    expect(checkNoteQuality('BMI-01', 'diverse_sensitive', 'Test notes BMI-01').ok).toBe(true);
    expect(checkNoteQuality('BMI-01', 'diverse_sensitive', '').ok).toBe(true);
    expect(checkNoteQuality('BMI-01', '', 'saw some insects under stones').ok).toBe(true);
  });

  it('catches BMI-01 contradiction: sensitive selected but notes say dead/absent', () => {
    const r = checkNoteQuality('BMI-01', 'diverse_sensitive', 'only worms, everything else dead');
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.kind === 'contradiction')).toBe(true);
  });

  it('catches BMI-01 contradiction: absent selected but notes mention mayfly', () => {
    const r = checkNoteQuality('BMI-01', 'absent_or_dead', 'found several mayfly larvae under stones');
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.kind === 'contradiction')).toBe(true);
  });

  it('catches BIR-04 contradiction: many species but notes say no birds', () => {
    const r = checkNoteQuality('BIR-04', 'many_species', 'no birds seen, silent transect');
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.kind === 'contradiction')).toBe(true);
  });

  it('catches INV-11 contradiction: none seen but notes mention knotweed', () => {
    const r = checkNoteQuality('INV-11', 'none_seen', 'large knotweed patch choking bank');
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.kind === 'contradiction')).toBe(true);
  });

  it('catches unsupported assessment language even without state', () => {
    const r = checkNoteQuality('BMI-01', '', 'stream looks healthy, water is safe to drink');
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.kind === 'unsupported')).toBe(true);
  });

  it('catches tier/score language', () => {
    const r = checkNoteQuality('BIR-04', 'few_species', 'I give this tier 1, score is excellent');
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.kind === 'unsupported')).toBe(true);
  });
});
