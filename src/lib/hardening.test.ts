import { describe, it, expect } from 'vitest';
import { encodeShare, decodeShare, SHARE_QR_MAX_CHARS } from './session-share';
import { buildSampleSession } from './sample-session';
import { assess } from './assessment/engine';

// Deterministic LCG so failures are reproducible (no Math.random in tests).
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

describe('adversarial share payloads (fuzz)', () => {
  it('60 seeded mutations of a valid payload never throw', async () => {
    const valid = await encodeShare(buildSampleSession('2026-01-01T00:00:00.000Z'));
    const rand = lcg(42);
    const junk = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_!@#$%^&*()[]{}<>?/|.,';
    for (let i = 0; i < 60; i++) {
      let mutated = valid;
      const mode = i % 3;
      if (mode === 0) {
        const pos = Math.floor(rand() * mutated.length);
        mutated = `${mutated.slice(0, pos)}${junk[Math.floor(rand() * junk.length)]}${mutated.slice(pos + 1)}`;
      } else if (mode === 1) {
        mutated = mutated.slice(0, Math.max(1, Math.floor(rand() * mutated.length)));
      } else {
        mutated += junk[Math.floor(rand() * junk.length)].repeat(1 + Math.floor(rand() * 5));
      }
      const out = await decodeShare(mutated);
      expect(out === null || typeof out === 'object').toBe(true);
    }
  });

  it('hostile inputs return null without throwing', async () => {
    const inputs = [
      '',
      '#',
      '!!!not-base64!!!',
      '%%%',
      'a'.repeat(1_000_000), // over the 20k cap → rejected before decode work
      '\u0000\u0001\u0002',
      '<script>alert(1)</script>',
      '{"v":1,"session":{"__proto__":{"polluted":true}}}',
      'eyJ2IjoxfQ', // base64url of '{"v":1}' — parses, fails validation
    ];
    for (const input of inputs) {
      expect(await decodeShare(input)).toBeNull();
    }
  });

  it('round-trips a hostile session: 50k note, CRLF, emoji, prototype-key state', async () => {
    const session = buildSampleSession('2026-02-02T00:00:00.000Z');
    session.indicators[0].notes = `[SYNTHETIC SAMPLE] ${'verbose note, with comma '.repeat(2000)}\r\n🐟 done`;
    const payload = await encodeShare(session);
    const back = await decodeShare(payload);
    expect(back).not.toBeNull();
    expect(back!.indicators[0].notes).toBe(session.indicators[0].notes);
    expect(back!.isSample).toBe(true);
    // The whole hostile session still fits the QR budget comfortably.
    expect(payload.length).toBeLessThan(SHARE_QR_MAX_CHARS);
  });
});

describe('assessment engine (fuzz)', () => {
  it('never throws and always yields a known band on junk inputs', () => {
    const junkIndicators = ['', 'NOPE-99', 'bmi-01', 'BMI-01 ', 'BMI-01\u0000', '__proto__', 'constructor', 'x'.repeat(500)];
    const junkStates = ['', 'unknown_state', '__proto__', 'constructor', 'toString', 'hasOwnProperty', 'x'.repeat(500), 'diverse_sensitive '];
    const known = new Set(['favorable', 'moderate', 'degraded', 'pending_lab', 'unassessable']);
    for (const ind of junkIndicators) {
      for (const state of junkStates) {
        const a = assess(ind, state);
        expect(known.has(a.band)).toBe(true);
        expect(a.band).toBe('unassessable'); // none of these pairs are exact valid inputs
      }
    }
  });

  it('prototype-key states never resolve to a real band', () => {
    expect(assess('BMI-01', '__proto__').band).toBe('unassessable');
    expect(assess('BIR-04', 'constructor').band).toBe('unassessable');
    expect(assess('__proto__', 'diverse_sensitive').band).toBe('unassessable');
  });
});
