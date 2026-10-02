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

// Shared refusal, used by the API route's offline branch, the Groq system
// prompt, and the client-side fallback. The last sentence points the user at
// what the assistant CAN answer instead of leaving a dead end.
export const OUT_OF_SCOPE_RESPONSE = "I'm equipped to answer using the OneAquaHealth protocol and factsheet definitions I have. This question falls outside that scope — please consult the official monitoring guide. I can answer questions about this indicator's protocol, states, or sampling — try rephrasing around one of those. For a health judgement about this observation, open the deterministic assessment card on this page: rules produce it, not me.";

// Meta questions ("why do you keep saying the same thing?") get a distinct,
// honest answer explaining the offline fallback, not the scope refusal.
export const META_RESPONSE = "Answered honestly: this panel is in offline mode, so it returns the bundled factsheet reference for this indicator rather than a live model reply — which is why answers can look repetitive. Ask about this indicator's protocol, states, or sampling and you'll get the indicator-specific factsheet reference.";

const META_MARKERS = [
  'keep saying', 'same thing', 'same answer', 'always say',
  'repeating', 'canned', 'different answer', 'you keep repeat',
];

export function isMetaQuestion(question: string): boolean {
  const lower = question.toLowerCase();
  return META_MARKERS.some((marker) => lower.includes(marker));
}

// Vocabulary-presence check: a genuine question about this indicator almost
// always contains at least one of these words. A question containing none of
// them gets the scope refusal — that catches arbitrary nonsense, which a
// blocklist of bad questions can never do. Deliberately no function words
// ("what", "is", "the"), or everything would pass.
const INDICATOR_VOCABULARY = [
  'indicator', 'indicators',
  'bmi-01', 'bir-04', 'inv-11', 'fcl-06', 'dia-10',
  'macroinvertebrate', 'macroinvertebrates', 'benthic',
  'bird', 'birds', 'avian', 'riverine',
  'plant', 'plants', 'invasive', 'alien', 'riparian', 'knotweed', 'balsam', 'hogweed',
  'coliform', 'fecal', 'faecal',
  'diatom', 'diatoms', 'periphyton', 'periphytic', 'teratology',
  'sample', 'samples', 'sampling', 'collect', 'collection', 'container',
  'protocol', 'state', 'states', 'photo', 'photos', 'picture',
  'note', 'notes', 'observation', 'observations', 'observe', 'observed',
  'factsheet', 'oneaquahealth', 'stream', 'streams', 'river', 'water',
  'lab', 'laboratory', 'filtration', 'membrane', 'filter',
  'slide', 'vial', 'microscope', 'species', 'taxa', 'larvae', 'larva', 'nymph',
  'equipment', 'transect', 'riffle', 'record', 'monitor',
];

export function hasIndicatorVocabulary(question: string): boolean {
  const lower = question.toLowerCase();
  return INDICATOR_VOCABULARY.some((word) => lower.includes(word));
}

// The single offline answer pipeline, shared by the server route (browser
// online, no Groq key) and the client fallback (device offline or request
// failed). Order: diagnostic/adjudication blocklist -> meta -> vocabulary ->
// factsheet card for the specific indicator.
export function getOfflineAssistantResponse(indicatorId: string, question: string): string {
  if (typeof question === 'string' && question.trim()) {
    if (isOutOfScope(question)) return OUT_OF_SCOPE_RESPONSE;
    if (isMetaQuestion(question)) return META_RESPONSE;
    if (!hasIndicatorVocabulary(question)) return OUT_OF_SCOPE_RESPONSE;
  }

  const content = getFactsheetContent(indicatorId);
  if (!content) return `Indicator ${indicatorId} not found in factsheet content.`;

  if (content.lab_only) {
    return `Based on the OneAquaHealth factsheet (${content.source}):\n\n${content.name} — laboratory-only indicator. You cannot determine the result in the field.\n\nProtocol Question: ${content.citizen_question}\n\nVisual Anchor: ${content.visual_anchor_guide}\n\nCollect your sample according to the protocol and send it to the laboratory for analysis.`;
  }

  const stateLabels = Object.entries(content.citizen_state_labels).map(([, label]) => `- ${label}`).join('\n');
  return `Based on the OneAquaHealth factsheet (${content.source}):\n\n${content.name}\n\nProtocol Question: ${content.citizen_question}\n\nVisual Anchor: ${content.visual_anchor_guide}\n\nState definitions:\n${stateLabels}\n\nThis indicator is citizen-observable. Record your observation and continue to the next indicator.`;
}

export function isOutOfScope(question: string): boolean {
  const lower = question.toLowerCase();
  const outOfScopeTerms = [
    'is my stream healthy', 'what tier', 'what score', 'how bad is',
    'what result', 'is it contaminated', 'should i drink', 'is it safe',
    'assessment tier', 'what category', 'how polluted', 'what level of concern',
    'triage', 'severity', 'policy', 'adjudicate', 'evaluate', 'verdict',
    'purpose of this work', 'purpose of the work',
    'purpose of this project', 'purpose of the project',
    'point of this work',
  ];
  return outOfScopeTerms.some((term) => lower.includes(term));
}
