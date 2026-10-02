import { describe, it, expect } from 'vitest';
import { csvCell } from './export-format';

describe('csvCell (RFC 4180)', () => {
  it('leaves plain values untouched', () => {
    expect(csvCell('healthy riparian zone')).toBe('healthy riparian zone');
    expect(csvCell('')).toBe('');
    expect(csvCell('BMI-01')).toBe('BMI-01');
  });

  it('quotes values containing commas, quotes, and newlines', () => {
    expect(csvCell('note, with comma')).toBe('"note, with comma"');
    expect(csvCell('line1\nline2')).toBe('"line1\nline2"');
    expect(csvCell('Windows\r\nbreak')).toBe('"Windows\r\nbreak"');
    expect(csvCell('she said "hi"')).toBe('"she said ""hi"""');
    expect(csvCell('mixed, with "quotes"\nand newline')).toBe('"mixed, with ""quotes""\nand newline"');
  });

  it('preserves formula-leading text verbatim (own data, integrity first)', () => {
    expect(csvCell('=SUM(A1)')).toBe('=SUM(A1)');
    expect(csvCell('-12')).toBe('-12');
  });

  it('preserves unicode, emoji, and tabs', () => {
    expect(csvCell('émoji 🐟')).toBe('émoji 🐟');
    expect(csvCell('tab\there')).toBe('tab\there'); // tab is legal unquoted in a cell
  });

  it('round-trips the note that earlier exports mangled', () => {
    const bmiNotes = 'Poor riparian zone, litter observed, bank unstable';
    const cell = csvCell(bmiNotes);
    expect(cell).toBe('"Poor riparian zone, litter observed, bank unstable"');
    // Unquoting returns the exact original.
    expect(cell.slice(1, -1).replace(/""/g, '"')).toBe(bmiNotes);
  });
});
