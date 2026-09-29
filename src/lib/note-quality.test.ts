import { describe, it, expect } from 'vitest';
import { checkNoteQuality } from './note-quality';

// Realistic volunteer notes. The first 6 must NOT flag (they are ordinary
// observations). The last 6 SHOULD flag (assessment wording or a contradiction
// with the selected state).
const MUST_NOT_FLAG: { indicatorId: string; state: string; notes: string }[] = [
  {
    indicatorId: 'BMI-01',
    state: 'diverse_sensitive',
    notes: 'Turned over three stones in the riffle. Caddisfly cases on two of them, one small mayfly nymph.',
  },
  {
    indicatorId: 'BMI-01',
    state: 'tolerant_only',
    notes: 'Mostly midges and a couple of leeches. Water was clear enough to see the bed. Cloudy, light rain earlier.',
  },
  {
    indicatorId: 'BIR-04',
    state: 'many_species',
    notes: '10 minute listen from the footbridge. Heard a kingfisher most of the time, plus two wagtails on the far bank.',
  },
  {
    indicatorId: 'BIR-04',
    state: 'few_species',
    notes: 'One grey wagtail feeding below the weir the whole ten minutes. Nothing else showed up.',
  },
  {
    indicatorId: 'INV-11',
    state: 'few_patches',
    notes: 'Two small patches of balsam on the left bank around the 30m mark, about a metre across each. Rest looked like native willow and grass.',
  },
  {
    indicatorId: 'INV-11',
    state: 'none_seen',
    notes: 'Walked 50m on each bank. Mostly nettles, willow and alder. Did not see knotweed or balsam anywhere.',
  },
];

const SHOULD_FLAG: { indicatorId: string; state: string; notes: string; expect: string }[] = [
  {
    indicatorId: 'BMI-01',
    state: 'diverse_sensitive',
    notes: 'Lots of mayflies, looks healthy to me.',
    expect: 'unsupported',
  },
  {
    indicatorId: 'BMI-01',
    state: 'absent_or_dead',
    notes: 'Found several mayfly and stonefly larvae under the stones.',
    expect: 'contradiction',
  },
  {
    indicatorId: 'BIR-04',
    state: 'many_species',
    notes: 'No birds at all this morning, the transect was completely silent.',
    expect: 'contradiction',
  },
  {
    indicatorId: 'INV-11',
    state: 'none_seen',
    notes: 'Large knotweed patch choking the right bank from the bridge to the weir.',
    expect: 'contradiction',
  },
  {
    indicatorId: 'BMI-01',
    state: 'tolerant_only',
    notes: 'I would rate this tier 1, the stream scores very well.',
    expect: 'unsupported',
  },
  {
    indicatorId: 'INV-11',
    state: 'few_patches',
    notes: 'The water is contaminated and this proves there is pollution upstream.',
    expect: 'unsupported',
  },
];

describe('note-quality', () => {
  it('passes neutral field notes', () => {
    expect(checkNoteQuality('BMI-01', 'diverse_sensitive', 'Test notes BMI-01').ok).toBe(true);
    expect(checkNoteQuality('BMI-01', 'diverse_sensitive', '').ok).toBe(true);
    expect(checkNoteQuality('BMI-01', '', 'saw some insects under stones').ok).toBe(true);
  });

  describe('realistic notes that must NOT flag (6)', () => {
    MUST_NOT_FLAG.forEach(({ indicatorId, state, notes }, i) => {
      it(`case ${i + 1}: ${indicatorId} / ${state} — ${notes.slice(0, 48)}…`, () => {
        const r = checkNoteQuality(indicatorId, state, notes);
        expect(r.ok, `expected no flag, got: ${JSON.stringify(r.issues)}`).toBe(true);
        expect(r.issues).toHaveLength(0);
      });
    });
  });

  describe('realistic notes that SHOULD flag (6)', () => {
    SHOULD_FLAG.forEach(({ indicatorId, state, notes, expect: kind }, i) => {
      it(`case ${i + 1}: ${indicatorId} / ${state} — ${notes.slice(0, 48)}…`, () => {
        const r = checkNoteQuality(indicatorId, state, notes);
        expect(r.ok).toBe(false);
        expect(r.issues.some((x) => x.kind === kind)).toBe(true);
      });
    });
  });

  it('flags contradiction even when the wording itself is neutral', () => {
    const r = checkNoteQuality('BIR-04', 'none_observed', 'A kingfisher perched on the rail for about a minute.');
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.kind === 'contradiction')).toBe(true);
  });

  it('does not flag lab-only indicator notes regardless of wording', () => {
    const r = checkNoteQuality('FCL-06', '', 'Collected 250 mL upstream of the footbridge at 08:15, labelled SMP-20260929-001.');
    expect(r.ok).toBe(true);
  });
});
