import { describe, it, expect } from 'vitest';
import { getFactsheetContent, getAllFactsheetContent, isOutOfScope } from './factsheet-content';

describe('factsheet-content', () => {
  it('returns factsheet content for a valid indicator ID', () => {
    const result = getFactsheetContent('BMI-01');
    expect(result).toBeTruthy();
    expect(result!.id).toBe('BMI-01');
    expect(result!.name).toBe('Benthic Macroinvertebrates');
    expect(result!.citizen_question).toBeTruthy();
    expect(result!.citizen_state_labels).toBeDefined();
  });

  it('returns null for an invalid indicator ID', () => {
    const result = getFactsheetContent('INVALID');
    expect(result).toBeNull();
  });

  it('returns all factsheet content for citizen-observable indicators', () => {
    const all = getAllFactsheetContent();
    expect(all.length).toBeGreaterThan(0);
    all.forEach((entry) => {
      expect(entry.citizen_question).toBeTruthy();
      expect(entry.source).toBeTruthy();
    });
  });

  it('marks lab-only indicators correctly', () => {
    const fcl = getFactsheetContent('FCL-06');
    expect(fcl).toBeTruthy();
    expect(fcl!.lab_only).toBe(true);

    const dia = getFactsheetContent('DIA-10');
    expect(dia).toBeTruthy();
    expect(dia!.lab_only).toBe(true);
  });

  it('isOutOfScope returns true for diagnostic questions', () => {
    expect(isOutOfScope('What tier is my stream?')).toBe(true);
    expect(isOutOfScope('Is my stream healthy?')).toBe(true);
    expect(isOutOfScope('What score does this get?')).toBe(true);
  });

  it('isOutOfScope returns false for observation questions', () => {
    expect(isOutOfScope('What macroinvertebrates do you see?')).toBe(false);
    expect(isOutOfScope('How many birds were observed?')).toBe(false);
  });
});
