// RFC 4180 cell: quote when the value contains commas, quotes, or newlines so
// note text travels VERBATIM (the old comma-to-semicolon swap altered it).
// Formula-leading characters are preserved as-is on purpose: exports are the
// citizen's own field records, and mangling them would break the verbatim
// guarantee the smoke test enforces.
export function csvCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}
