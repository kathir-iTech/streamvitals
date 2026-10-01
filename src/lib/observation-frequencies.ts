import type { FieldSession } from './field-session';

export interface StateFrequency {
  state: string;
  count: number;
}

export interface IndicatorFrequency {
  indicatorId: string;
  indicatorName: string;
  total: number;
  states: StateFrequency[];
}

// Counts of what saved sessions actually recorded. These are frequencies of
// observations — never a prediction, score, trend, or assessment of stream
// condition. Lab-only records (no observation state) are excluded.
export function computeObservationFrequencies(sessions: FieldSession[]): IndicatorFrequency[] {
  const byIndicator = new Map<string, { name: string; counts: Map<string, number> }>();

  for (const session of sessions) {
    for (const record of session.indicators || []) {
      if (record.type !== 'citizen_observable') continue;
      if (!record.state) continue;
      const entry = byIndicator.get(record.indicatorId) || { name: record.indicatorName, counts: new Map<string, number>() };
      entry.counts.set(record.state, (entry.counts.get(record.state) || 0) + 1);
      byIndicator.set(record.indicatorId, entry);
    }
  }

  const result: IndicatorFrequency[] = [];
  for (const [indicatorId, { name, counts }] of byIndicator) {
    const states: StateFrequency[] = Array.from(counts.entries()).map(([state, count]) => ({ state, count }));
    states.sort((a, b) => b.count - a.count || a.state.localeCompare(b.state));
    result.push({
      indicatorId,
      indicatorName: name,
      total: states.reduce((sum, s) => sum + s.count, 0),
      states,
    });
  }
  result.sort((a, b) => a.indicatorId.localeCompare(b.indicatorId));
  return result;
}
