import { indicators } from '@/data/indicators';

export interface FactsheetEntry {
  id: string;
  name: string;
  citizen_question: string;
  visual_anchor_guide: string;
  citizen_state_labels: Record<string, string>;
  source: string;
  lab_only: boolean;
}

export function getFactsheetContent(indicatorId: string): FactsheetEntry | null {
  const ind = indicators.find((i) => i.id === indicatorId);
  if (!ind) return null;
  return {
    id: ind.id,
    name: ind.name,
    citizen_question: ind.citizen_question,
    visual_anchor_guide: ind.visual_anchor_guide,
    citizen_state_labels: ind.citizen_state_labels || {},
    source: ind.source,
    lab_only: ind.lab_only || false,
  };
}

export function getAllFactsheetContent(): FactsheetEntry[] {
  return indicators
    .filter((i) => i.citizen_observable || i.lab_only)
    .map((ind) => ({
      id: ind.id,
      name: ind.name,
      citizen_question: ind.citizen_question,
      visual_anchor_guide: ind.visual_anchor_guide,
      citizen_state_labels: ind.citizen_state_labels || {},
      source: ind.source,
      lab_only: ind.lab_only || false,
    }));
}

export function getOfflineAssistantResponse(indicatorId: string, question: string): string {
  const content = getFactsheetContent(indicatorId);
  if (!content) return `Indicator ${indicatorId} not found in factsheet content.`;

  if (content.lab_only) {
    return `Based on the OneAquaHealth factsheet (${content.source}):\n\n**${content.name}** — This indicator requires laboratory analysis. You cannot determine the result in the field.\n\n**Protocol Question:** ${content.citizen_question}\n\n**Visual Anchor:** ${content.visual_anchor_guide}\n\nCollect your sample according to the protocol and send it to the laboratory for analysis.`;
  }

  const stateLabels = Object.entries(content.citizen_state_labels).map(([key, label]) => `- ${label}`).join('\n');
  return `Based on the OneAquaHealth factsheet (${content.source}):\n\n**${content.name}**\n\n**Protocol Question:** ${content.citizen_question}\n\n**Visual Anchor:** ${content.visual_anchor_guide}\n\n**State definitions:**\n${stateLabels}\n\nThis indicator is citizen-observable. Record your observation and continue to the next indicator.`;
}

export function isOutOfScope(question: string): boolean {
  const lower = question.toLowerCase();
  const outOfScopeTerms = [
    'is my stream healthy', 'what tier', 'what score', 'how bad is',
    'what result', 'is it contaminated', 'should i drink', 'is it safe',
    'assessment tier', 'what category', 'how polluted', 'what level of concern',
    'triage', 'severity', 'policy', 'adjudicate', 'evaluate', 'verdict',
  ];
  return outOfScopeTerms.some((term) => lower.includes(term));
}
