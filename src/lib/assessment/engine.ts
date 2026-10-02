// Deterministic assessment engine for StreamVitals (Track 3).
//
// Hard boundaries, enforced by tests:
//   - This module never imports AI/assistant code and never performs network
//     calls. Assessment is a pure function of (indicatorId, stateId).
//   - No timestamps, no randomness: assess(x) is referentially transparent, so
//     the same observation always yields the same assessment, everywhere.
//   - Every band carries a chain of evidence back to the OneAquaHealth
//     factsheet (doi:10.5281/zenodo.20345207). Citizen states are explicitly
//     labelled as tolerance/extent proxies — they are NOT laboratory indices
//     (BMWP, IBD, IPS all require taxon-level laboratory identification).
//
// Engine version is semantic: bump MINOR when a rule is added, MAJOR when an
// existing band mapping changes (a changed mapping rewrites history, so it is
// a breaking change for stored exports that cite the engine version).

export const ENGINE_VERSION = 'streamvitals-assessment/1.0.0';

export type Band = 'favorable' | 'moderate' | 'degraded' | 'pending_lab' | 'unassessable';

export interface ChainStep {
  step: string;
  ruleId: string;
  basis: string;
}

export interface Assessment {
  indicatorId: string;
  engine: string;
  method: 'citizen-state-proxy' | 'lab-protocol' | 'none';
  band: Band;
  bandLabel: string;
  stateId: string | null;
  stateLabel: string | null;
  confidence: 'deterministic-rule' | 'awaiting-laboratory' | 'insufficient-input';
  scoredBy: string;
  chain: ChainStep[];
  caveats: string[];
}

const BAND_LABELS: Record<Band, string> = {
  favorable: 'Favorable signal',
  moderate: 'Moderate signal',
  degraded: 'Degraded signal',
  pending_lab: 'Awaiting laboratory analysis',
  unassessable: 'Not assessable from this input',
};

const SCORED_BY =
  'Deterministic rules (streamvitals-assessment/1.0.0). No AI, no network, no hidden state.';

const FACTSHEET = 'OneAquaHealth Key Indicators Factsheets, doi:10.5281/zenodo.20345207';

interface StateRule {
  band: Exclude<Band, 'pending_lab' | 'unassessable'>;
  ruleId: string;
  derivation: string;
  citations: string[];
  caveats: string[];
}

const CITIZEN_RULES: Record<string, Record<string, StateRule>> = {
  'BMI-01': {
    diverse_sensitive: {
      band: 'favorable',
      ruleId: 'BMI-01/sensitive-present',
      derivation:
        'The selected state reports pollution-sensitive taxa (mayflies, stoneflies) alongside other taxa. Under tolerance-based scoring, a community that still supports sensitive taxa is interpreted as a favorable water-quality signal.',
      citations: [
        'Factsheet §II (Benthic Macroinvertebrates): "metrics such as taxa richness, diversity and biotic scores (e.g. BMWP) are calculated to reflect the community’s sensitivity or tolerance to pollution."',
        'Factsheet §II: "Biotic indices scores are assigned to taxa based on their tolerance to pollution."',
      ],
      caveats: [
        'This is a citizen-state proxy of tolerance composition, not a BMWP score: BMWP requires laboratory taxon-level identification (factsheet §II).',
        'Official protocol is kick sampling across six sub-samples and habitat types with laboratory identification (factsheet §II); a single visual impression is a weaker sample.',
      ],
    },
    tolerant_only: {
      band: 'degraded',
      ruleId: 'BMI-01/tolerant-only',
      derivation:
        'The selected state reports only pollution-tolerant taxa (midges, leeches, aquatic worms). Tolerance-based scoring interprets the loss of sensitive taxa and the dominance of tolerant ones as a degraded water-quality signal.',
      citations: [
        'Factsheet §II: biotic scores "reflect the community’s sensitivity or tolerance to pollution" and are "assigned to taxa based on their tolerance to pollution."',
        `State definition from the indicator dataset: "Tolerant taxa only (Midges, Leeches, Aquatic Worms)" (${FACTSHEET}).`,
      ],
      caveats: [
        'Proxy only — a BMWP score would quantify how degraded; it requires laboratory identification (factsheet §II).',
        'Tolerant dominance can also reflect habitat conditions (fine sediments, low oxygen) rather than pollution alone.',
      ],
    },
    absent_or_dead: {
      band: 'degraded',
      ruleId: 'BMI-01/absent',
      derivation:
        'The selected state reports no living macroinvertebrates. Because the factsheet treats macroinvertebrate community structure as the biological indicator of ecosystem condition, an empty or dead sample is recorded as a degraded signal — with an explicit absence caveat.',
      citations: [
        'Factsheet §II: macroinvertebrate communities reflect cumulative environmental conditions; community structure "reveals patterns of water quality, habitat integrity and ecosystem functioning."',
        `State definition: "No macroinvertebrates observed / Dead organisms" (${FACTSHEET}).`,
      ],
      caveats: [
        'Absence alone does not prove pollution: season, flow, shading and sampling method all affect whether organisms are found (official protocol: six sub-samples across habitat types, factsheet §II).',
        'Proxy only — not a laboratory index.',
      ],
    },
  },
  'BIR-04': {
    many_species: {
      band: 'favorable',
      ruleId: 'BIR-04/multi-species',
      derivation:
        'The selected state reports multiple riverine bird species active along the transect. The factsheet treats a diverse, balanced bird community — including insectivorous species — as the signature of a healthy ecosystem.',
      citations: [
        'Factsheet §V (Birds): "A healthy ecosystem harbours a diverse and balanced community of birds, including more sensitive bird species like insectivorous birds."',
        `Importance: "The number of insectivorous bird species between areas differing in degree of urbanisation … will elucidate about the resilience of the ecosystem regarding pest control (disease vector mosquitoes, plant pests, etc)." (${FACTSHEET})`,
      ],
      caveats: [
        'Protocol fidelity: official counts are 10-minute point counts within three hours after sunrise, with feeding-guild classification (factsheet §V). Counts outside that window are weaker evidence.',
      ],
    },
    few_species: {
      band: 'moderate',
      ruleId: 'BIR-04/few-species',
      derivation:
        'The selected state reports a single riverine species or only generalists. Fewer riverine/insectivorous species than the habitat can support is a moderate signal of reduced ecosystem resilience.',
      citations: [
        'Factsheet §V: the indicator measures "the number of insectivorous bird species" as the countable quantity.',
        'Factsheet §V (Rational): urbanization pressure example — "an increase in population density per km² from 500 to 3000, or an increase of impervious area by 35%, may lead to a loss of one insectivorous bird species in that area."',
      ],
      caveats: [
        'The state does not record a species count or feeding guilds, so the engine cannot compute the insectivorous richness the official indicator uses (factsheet §V, Wilman et al. 2014 classification).',
        'Time of day and season strongly affect detections (factsheet §V).',
      ],
    },
    none_observed: {
      band: 'degraded',
      ruleId: 'BIR-04/no-activity',
      derivation:
        'The selected state reports no avian activity in the 10-minute window. The factsheet links bird community health to ecosystem resilience, so no recorded activity within the protocol window is a degraded signal — flagged for protocol verification.',
      citations: [
        'Factsheet §V: indicator measured by "bird censuses (point counts) through the detection of their sounds (songs and calls)" over 10 minutes.',
        `Factsheet §V rational: "A healthy ecosystem harbours a diverse and balanced community of birds." (${FACTSHEET})`,
      ],
      caveats: [
        'Zero detections can also mean the census was outside the protocol window (early morning, ≤10 minutes; factsheet §V), during migration/off-season, or in poor weather. Verify the protocol before treating this as site condition.',
      ],
    },
  },
  'INV-11': {
    none_seen: {
      band: 'favorable',
      ruleId: 'INV-11/none',
      derivation:
        'The selected state reports no invasive alien plants along the riparian margin. Because the factsheet uses IAP presence as a disturbance signal, absence of IAPs leaves no disturbance signal from this indicator.',
      citations: [
        'Factsheet §XI (Invasive Alien Plants): IAPs "can serve as indicators of ecological degradation and disturbance."',
        `Factsheet §XI: "AIPs are a cost-effective, sensitive, and easily observable indicator of disturbance, ecosystem stress, and biodiversity decline." (${FACTSHEET})`,
      ],
      caveats: [
        'One survey pass over part of the official 100 m / 10-checkpoint transect (factsheet §XI) may miss isolated patches; absence is a signal from this indicator, not proof of pristine habitat.',
      ],
    },
    few_patches: {
      band: 'moderate',
      ruleId: 'INV-11/isolated',
      derivation:
        'The selected state reports isolated IAP patches along the margin. Presence at low extent means the disturbance indicator is triggered but localized.',
      citations: [
        'Factsheet §XI: IAP "presence can reflect habitat disturbance (e.g., soil movement, bank erosion, vegetation clearing), hydrological alteration … nutrient enrichment or pollution."',
        `Factsheet §XI method: relative coverage (%) is estimated along a 100 m stretch at 10 checkpoints — extent is the measured quantity. (${FACTSHEET})`,
      ],
      caveats: [
        'Patch extent was not measured as coverage percent; the official classification (cosmopolitan / alien / naturalized / potentially invasive / invasive) requires species identification per national legislation (factsheet §XI).',
      ],
    },
    widespread: {
      band: 'degraded',
      ruleId: 'INV-11/widespread',
      derivation:
        'The selected state reports dense, widespread IAP coverage dominating the banks. Under the factsheet’s indicator logic, high IAP extent signals strong habitat disturbance, biodiversity loss and reduced ecosystem resilience.',
      citations: [
        'Factsheet §XI: IAP presence reflects "loss of native biodiversity (as invasives displace or suppress indigenous plants), and reduced ecosystem stability or resilience."',
        `Factsheet §XI: coverage extent along the 100 m transect is the measured quantity; widespread dominance is the high-extent end of that scale. (${FACTSHEET})`,
      ],
      caveats: [
        'Species-level identification and coverage percent are still required for the official record (factsheet §XI).',
      ],
    },
  },
};

const LAB_METHODS: Record<string, { step: string; basis: string; caveat: string }> = {
  'FCL-06': {
    step:
      'Official measurement (factsheet §VII): a known volume of water is filtered onto a selective growth medium; after incubation, visible colonies are counted and reported as colony-forming units per 100 mL (CFU/100 mL). qPCR and eDNA methods are also described.',
    basis:
      `Factsheet §VII (Fecal Coliforms): colony counts "expressed as colony-forming units per 100 mL (CFU/100 mL)"; presence "suggests inputs from human or animal waste and therefore a potential exposure to enteric pathogens" (${FACTSHEET}).`,
    caveat:
      'We do not grade what we did not measure: no CFU/100 mL result exists until the laboratory reports one, so this indicator stays in pending state by rule.',
  },
  'DIA-10': {
    step:
      'Official measurement (factsheet §I): periphyton is scraped, cleaned and mounted; about 400 diatom valves are identified and counted to species level; biotic indices (IBD, IPS) and teratology counts produce the biological quality status.',
    basis:
      `Factsheet §I (Diatoms): "About 400 diatom valves are identified and counted per sample, following the European standard"; "Common biotic indices … are the Biological Diatom Index (IBD) … and the Indice de Polluosensibilité (IPS)" (${FACTSHEET}).`,
    caveat:
      'We do not grade what we did not measure: index reference values are river-type specific and member-state adopted (factsheet §I), so no index can be computed before laboratory identification.',
  },
};

function build(result: {
  indicatorId: string;
  method: Assessment['method'];
  band: Band;
  stateId: string | null;
  stateLabel: string | null;
  confidence: Assessment['confidence'];
  chain: ChainStep[];
  caveats: string[];
}): Assessment {
  return {
    indicatorId: result.indicatorId,
    engine: ENGINE_VERSION,
    method: result.method,
    band: result.band,
    bandLabel: BAND_LABELS[result.band],
    stateId: result.stateId,
    stateLabel: result.stateLabel,
    confidence: result.confidence,
    scoredBy: SCORED_BY,
    chain: result.chain,
    caveats: result.caveats,
  };
}

export function assess(indicatorId: string, stateId?: string | null): Assessment {
  const state = stateId && stateId.length > 0 ? stateId : null;

  // Own-property lookups only: prototype keys ("__proto__", "constructor")
  // must never resolve to inherited objects as fake rules — a crafted share
  // link could otherwise crash the review page (found by the fuzz tests).
  const citizen = Object.prototype.hasOwnProperty.call(CITIZEN_RULES, indicatorId)
    ? CITIZEN_RULES[indicatorId]
    : undefined;
  if (citizen) {
    if (!state) {
      return build({
        indicatorId,
        method: 'none',
        band: 'unassessable',
        stateId: null,
        stateLabel: null,
        confidence: 'insufficient-input',
        chain: [
          {
            step: 'Input',
            ruleId: 'input/state-required',
            basis: 'No observation state selected, so no rule can fire.',
          },
        ],
        caveats: ['Select one of the observation states to produce an assessment.'],
      });
    }
    const rule = Object.prototype.hasOwnProperty.call(citizen, state) ? citizen[state] : undefined;
    if (!rule) {
      return build({
        indicatorId,
        method: 'none',
        band: 'unassessable',
        stateId: state,
        stateLabel: state,
        confidence: 'insufficient-input',
        chain: [
          {
            step: 'Input',
            ruleId: 'input/unknown-state',
            basis: `State "${state}" is not defined for ${indicatorId}; refusing to guess.`,
          },
        ],
        caveats: ['Unknown state — export the raw observation instead of relying on this card.'],
      });
    }
    return build({
      indicatorId,
      method: 'citizen-state-proxy',
      band: rule.band,
      stateId: state,
      stateLabel: state,
      confidence: 'deterministic-rule',
      chain: [
        { step: 'Observation', ruleId: `input/${indicatorId}/${state}`, basis: 'Volunteer-selected observation state, recorded verbatim.' },
        { step: 'Rule', ruleId: rule.ruleId, basis: rule.derivation },
        { step: 'Sources', ruleId: `source/factsheet/${indicatorId}`, basis: rule.citations.join(' ') },
      ],
      caveats: rule.caveats,
    });
  }

  const lab = Object.prototype.hasOwnProperty.call(LAB_METHODS, indicatorId)
    ? LAB_METHODS[indicatorId]
    : undefined;
  if (lab) {
    return build({
      indicatorId,
      method: 'lab-protocol',
      band: 'pending_lab',
      stateId: null,
      stateLabel: null,
      confidence: 'awaiting-laboratory',
      chain: [
        { step: 'Observation', ruleId: `input/${indicatorId}/sample`, basis: 'Field record contains sample ID, collection protocol and notes only — no measurement.' },
        { step: 'Rule', ruleId: `${indicatorId}/lab-pending`, basis: lab.step },
        { step: 'Sources', ruleId: `source/factsheet/${indicatorId}`, basis: lab.basis },
      ],
      caveats: [lab.caveat],
    });
  }

  return build({
    indicatorId,
    method: 'none',
    band: 'unassessable',
    stateId: state,
    stateLabel: state,
    confidence: 'insufficient-input',
    chain: [
      {
        step: 'Input',
        ruleId: 'input/unknown-indicator',
        basis: `Indicator "${indicatorId}" has no assessment rules in ${ENGINE_VERSION}.`,
      },
    ],
    caveats: ['Unknown indicator — no rules apply.'],
  });
}

const BAND_RANK: Record<string, number> = { favorable: 0, moderate: 1, degraded: 2 };

export function bandRank(band: Band): number | null {
  return band in BAND_RANK ? BAND_RANK[band] : null;
}

export interface SummaryInput {
  indicatorId: string;
  state?: string | undefined;
}

export interface AssessmentSummary {
  engine: string;
  counts: Record<Exclude<Band, 'unassessable'>, number>;
  unassessable: number;
  worstBand: Exclude<Band, 'pending_lab' | 'unassessable'> | null;
  perIndicator: { indicatorId: string; band: Band; bandLabel: string }[];
}

export function summarizeAssessments(items: SummaryInput[]): AssessmentSummary {
  const counts: Record<Exclude<Band, 'unassessable'>, number> = {
    favorable: 0,
    moderate: 0,
    degraded: 0,
    pending_lab: 0,
  };
  let unassessable = 0;
  let worst: Exclude<Band, 'pending_lab' | 'unassessable'> | null = null;
  const perIndicator: AssessmentSummary['perIndicator'] = [];

  for (const item of items) {
    const a = assess(item.indicatorId, item.state ?? null);
    perIndicator.push({ indicatorId: a.indicatorId, band: a.band, bandLabel: a.bandLabel });
    if (a.band === 'unassessable') {
      unassessable += 1;
      continue;
    }
    counts[a.band] += 1;
    if (a.band === 'favorable' || a.band === 'moderate' || a.band === 'degraded') {
      const rank = BAND_RANK[a.band];
      if (worst === null || rank > BAND_RANK[worst]) {
        worst = a.band;
      }
    }
  }

  return { engine: ENGINE_VERSION, counts, unassessable, worstBand: worst, perIndicator };
}
