# BOLT PROMPT 2: DATA SCHEMA & PERSISTENCE LAYER
Paste this second into Bolt AI.

## src/data/indicators.json
Create with EXACTLY 5 indicators. Each has: id, name, code, category, is_lab_only, protocol_question, visual_anchor_guide, states (array of {id, label}), citation, lab_guidance (only for lab-only indicators).

Indicator IDs: BMI-01, BIR-04, INV-11, FCL-06, DIA-10

- BMI-01: is_lab_only=false, states=[{id:"diverse_sensitive",label:"Diverse sensitive taxa present (Mayflies, Stoneflies)"},{id:"tolerant_only",label:"Tolerant taxa only (Midges, Leeches, Aquatic Worms)"},{id:"absent_or_dead",label:"No macroinvertebrates observed / Dead organisms"}]
- BIR-04: is_lab_only=false, states=[{id:"many_species",label:"Multiple riverine bird species observed active along transect"},{id:"few_species",label:"Single riverine species or generalist birds observed"},{id:"none_observed",label:"No avian activity recorded during 10-minute window"}]
- INV-11: is_lab_only=false, states=[{id:"none_seen",label:"No invasive alien plant species observed"},{id:"few_patches",label:"Isolated patches along the riparian margin"},{id:"widespread",label:"Dense, widespread coverage dominating stream banks"}]
- FCL-06: is_lab_only=true, states=[] (EMPTY ARRAY), lab_guidance="Requires membrane filtration or enzyme-substrate culture testing in an accredited laboratory (Method 9222 / ISO 9308-1). Cannot be evaluated visually in the field."
- DIA-10: is_lab_only=true, states=[] (EMPTY ARRAY), lab_guidance="Requires nitric acid / potassium dichromate oxidation, resin mounting (Naphrax®), and microscopic valve identification (~400 valves) under 1000x magnification (EN 13942)."

All citations: "Schmeller, D., et al. (2026). OneAquaHealth Key Indicators Factsheets Collection. Zenodo. doi:10.5281/zenodo.20345207"

## src/data/indicators.ts
```typescript
import indicatorsData from './indicators.json';
export interface IndicatorState { id: string; label: string; }
export interface Indicator {
  id: string; name: string; code: string; category: string;
  is_lab_only: boolean; protocol_question: string;
  visual_anchor_guide: string; states: IndicatorState[];
  lab_guidance?: string; citation: string;
}
export const indicators: Indicator[] = indicatorsData as unknown as Indicator[];
```

## src/lib/field-session.ts
Implement IndexedDB wrapper with:
- Database Name: StreamVitalsDB, Version: 1
- Object Stores: sessions (keyPath: sessionId), photos (keyPath: photoId, index by-session)
- Functions: saveSession(session), getSession(sessionId), getAllSessions(), deleteSession(sessionId), savePhoto(photoId, sessionId, indicatorId, blob), getSessionPhotos(sessionId), isIndexedDBAvailable(), downsampleImage(dataUrl, maxSizeKB)
- ALL functions return { success: boolean, data?: T, error?: string }
- Handle QuotaExceededError, NotFoundError gracefully
- downsampleImage compresses canvas to <1MB Blob before IndexedDB storage
- Export interfaces: FieldSession, IndicatorObservation

## src/lib/factsheet-content.ts
```typescript
export const factsheetQuestions: Record<string, string> = {
  'BMI-01': 'Turn over 3 riverbed stones in riffle areas. What macroinvertebrate organisms do you observe?',
  'BIR-04': 'Conduct a 10-minute visual/auditory observation along a 100m stream transect. What riverine birds are present?',
  'INV-11': 'Examine both stream banks along a 50m stretch. Do you see invasive plant coverage?',
  'FCL-06': 'Collect a 250mL water sample in a sterile container for laboratory membrane filtration (CFU/100mL).',
  'DIA-10': 'Scrape periphytic diatoms from 5 submerged stones into a sample vial for slide preparation.',
};
export const factsheetGuides: Record<string, string> = {
  'BMI-01': 'Look for Mayfly, Stonefly, or Caddisfly larvae under stones (sensitive) vs. aquatic worms/leeches (tolerant).',
  'BIR-04': 'Listen and observe for Kingfishers, Dippers, or Grey Wagtails along the bank using the Merlin Mobile App guide.',
  'INV-11': 'Check for Japanese Knotweed, Himalayan Balsam, or Giant Hogweed patches choking native vegetation.',
  'FCL-06': 'Submerge sterile container 10cm below surface facing upstream. Seal tightly, label with sample ID, store at 4°C.',
  'DIA-10': 'Use a toothbrush to scrape 10cm² area per stone into distilled water vial. Preserve with 70% ethanol or Lugol\'s iodine.',
};
export const factsheetSources: Record<string, string> = {
  'BMI-01': 'Section II. Benthic Macroinvertebrates', 'BIR-04': 'Section V. Birds', 'INV-11': 'Section XI. Invasive Alien Plants', 'FCL-06': 'Section VII. Fecal Coliforms', 'DIA-10': 'Section I. Diatoms and Diatom Teratology',
};
export function getFactsheetContent(indicatorId: string): { question: string; guide: string; source: string } {
  return { question: factsheetQuestions[indicatorId] || '', guide: factsheetGuides[indicatorId] || '', source: factsheetSources[indicatorId] || '' };
}
```

CONSTRAINTS:
- FCL-06 and DIA-10 MUST have empty states arrays
- All citizen indicators (BMI-01, BIR-04, INV-11) MUST have exactly 3 states each
- No tier ratings (T1/T2/T3) anywhere
- No diagnostic assessment text anywhere
