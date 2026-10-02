export interface NoteQualityIssue {
  kind: 'contradiction' | 'unsupported';
  message: string;
  matched: string;
}

export interface NoteQualityResult {
  ok: boolean;
  issues: NoteQualityIssue[];
}

const UNSUPPORTED_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /\bhealthy\b|\bunhealthy\b/i, label: 'health verdict' },
  { pattern: /\bpolluted\b|\bcontaminated\b/i, label: 'pollution verdict' },
  { pattern: /\bsafe\b|\bunsafe\b|\bdrinkable\b/i, label: 'safety verdict' },
  { pattern: /\btier\s*[123t]\b|\b[123t]\s*tier\b|\btier\b/i, label: 'tier rating' },
  { pattern: /\bscore\b|\brating\b|\bgrade\b|\bseverity\b|\bverdict\b|\bassessment\b/i, label: 'assessment language' },
  { pattern: /\bgood quality\b|\bbad quality\b|\bpoor quality\b|\bexcellent quality\b/i, label: 'quality verdict' },
  { pattern: /\bproves\b.*\b(pollution|health|clean|dirty)\b|\bconfirms\b.*\b(pollution|health)\b/i, label: 'causal claim' },
];

interface ContradictionRule {
  state: string;
  patterns: RegExp[];
  describe: string;
}

// A bare taxon name is not a contradiction if the volunteer wrote it under a
// negation ("did not see knotweed", "no mayfly found"). Without this guard the
// rules flag ordinary sentences that actually agree with the selected state.
const NEGATORS = new Set([
  'no', 'not', 'never', 'none', 'nothing', 'without', 'zero', 'absent',
  'neither', 'nor', 'cannot', 'cant', "can't", 'didnt', "didn't", 'wasnt',
  "wasn't", 'werent', "weren't", 'isnt', "isn't", 'arent', "aren't", 'dont',
  "don't", 'doesnt', "doesn't", 'unable', 'failed', 'sign', 'signs', 'trace',
  'traces', 'evidence', ' sighting', 'sightings',
]);

function isNegated(text: string, index: number): boolean {
  const before = text.slice(Math.max(0, index - 60), index).toLowerCase();
  const words = before.replace(/[^a-z'\s-]/g, ' ').split(/[\s-]+/).filter(Boolean);
  for (let i = words.length - 1; i >= 0; i--) {
    if (NEGATORS.has(words[i])) return true;
    // Coordination ("did not see knotweed or balsam") keeps the negation alive,
    // so allow a few filler words before giving up.
    if (words.length - 1 - i >= 5) break;
  }
  return false;
}

const CONTRADICTION_RULES: Record<string, ContradictionRule[]> = {
  'BMI-01': [
    {
      state: 'diverse_sensitive',
      patterns: [/\bno (life|insects|macro|bugs)\b/i, /\bdead\b/i, /\bonly (worms|leeches|midges|tolerant)\b/i, /\babsent\b/i, /\bnothing found\b/i, /\bnone found\b/i],
      describe: 'notes describe absence or tolerant-only life',
    },
    {
      state: 'tolerant_only',
      patterns: [/\bmayfly\b/i, /\bstonefly\b/i, /\bcaddisfly\b/i, /\bdiverse sensitive\b/i],
      describe: 'notes mention sensitive taxa',
    },
    {
      state: 'absent_or_dead',
      patterns: [/\bmayfly\b/i, /\bstonefly\b/i, /\bcaddisfly\b/i, /\babundant\b/i, /\blots of\b.*\b(insects|larvae|bugs)\b/i, /\bmany\b.*\b(insects|larvae)\b/i],
      describe: 'notes describe live organisms present',
    },
  ],
  'BIR-04': [
    {
      state: 'many_species',
      patterns: [/\bno birds?\b/i, /\bno avian\b/i, /\bnone seen\b/i, /\bsilent\b.*\b(no|without)\b/i, /\bno activity\b/i],
      describe: 'notes describe no bird activity',
    },
    {
      state: 'none_observed',
      patterns: [/\bkingfisher\b/i, /\bdipper\b/i, /\bwagtail\b/i, /\bflock\b/i, /\bmultiple species\b/i, /\bmany birds?\b/i, /\bseveral\b.*\bbirds?\b/i],
      describe: 'notes describe birds present',
    },
  ],
  'INV-11': [
    {
      state: 'none_seen',
      patterns: [/\bknotweed\b/i, /\bbalsam\b/i, /\bhogweed\b/i, /\bdense (coverage|patches)\b/i, /\bwidespread\b/i, /\bchoking\b/i],
      describe: 'notes describe invasive plants present',
    },
    {
      state: 'widespread',
      patterns: [/\bno invasive\b/i, /\bnone seen\b/i, /\bnative only\b/i, /\bclear banks?\b/i, /\bno knotweed\b/i],
      describe: 'notes describe absence of invasives',
    },
  ],
};

export function checkNoteQuality(indicatorId: string, selectedState: string, notes: string): NoteQualityResult {
  const issues: NoteQualityIssue[] = [];
  const text = (notes || '').trim();
  if (!text) return { ok: true, issues };

  for (const { pattern, label } of UNSUPPORTED_PATTERNS) {
    const m = text.match(pattern);
    if (m) {
      issues.push({
        kind: 'unsupported',
        matched: m[0],
        message: `Note includes ${label} (“${m[0]}”) which cannot be determined in the field. Please stick to what you observed — the deterministic assessment rules produce the judgement, your note stays an observation.`,
      });
      break;
    }
  }

  if (selectedState) {
    const rules = CONTRADICTION_RULES[indicatorId] || [];
    for (const rule of rules) {
      if (rule.state !== selectedState) continue;
      for (const pattern of rule.patterns) {
        const m = text.match(pattern);
        if (m && m.index !== undefined && !isNegated(text, m.index)) {
          issues.push({
            kind: 'contradiction',
            matched: m[0],
            message: `Note mentions (“${m[0]}”) which conflicts with your selected observation — ${rule.describe}. Please check your observation or update your note.`,
          });
          break;
        }
      }
      break;
    }
  }

  return { ok: issues.length === 0, issues };
}
