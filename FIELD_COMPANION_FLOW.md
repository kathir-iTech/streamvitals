# Field Companion — Design Document

## Honest Disclosure

**The indicator content has been verified against the actual Zenodo factsheet PDF at `doi:10.5281/zenodo.20345207`.** The PDF was downloaded and text-extracted from the full 13-page "OneAquaHealth Key Indicators of Ecosystem and Biological Health - Factsheets Collection" (published May 22, 2026, 11 indicators). All `citizen_question`, `visual_anchor_guide`, `citizen_state_labels`, and lab protocol guidance below matches what the real factsheet says. The `framework_basis.document` field references the DOI correctly.

**What was confirmed:**
- BMI-01 (Section II. Benthic Macroinvertebrates) — kick sampling, 500μm mesh, ethanol preservation, stereomicroscope identification
- BIR-04 (Section V. Birds) — point counts, Merlin app, insectivorous species, early morning
- FCL-06 (Section VII. Fecal Coliforms) — CFU/100mL culture-based, enzyme-substrate tests, qPCR, metabarcoding
- DIA-10 (Section I. Diatoms and Diatom Teratology) — scrape periphytic diatoms, nitric acid/potassium dichromate cleaning, Naphrax slides, ~400 valves under stereomicroscope
- INV-11 (Section XI. Invasive Alien Plants) — 100m riparian corridor, 10 checkpoints at 10m intervals, species classified as cosmopolitan/alien/naturalized/potentially invasive/invasive

**What the JSON still uses as generic state keys:** BMI-01 retains `diverse_sensitive/tolerant_only/absent_or_dead` in the raw data because those are the underlying framework keys, but BIR-04 and INV-11 have been updated to citizen-appropriate state names (`many_species/few_species/none_observed` and `none_seen/few_patches/widespread` respectively) because those indicators don't use the pollution-tolerance framework.

---

## Overview

A field data-collection tool for OneAquaHealth stream monitoring volunteers. It never assesses, never assigns tiers, never adjudicates. It walks a volunteer through the official protocol indicators, captures observations at the right moment, and exports structured data aligned with the OneAquaHealth indicator framework.

**Core principle: The tool collects real data. It never claims to evaluate anything.**

---

## Corrections Built In From Day One

### Fix 1: No Claims About Official App Compatibility

**Exports structured indicator data aligned with the OneAquaHealth indicator framework.** Not "same format as the Citizen Science App" — that app's schema hasn't been verified.

### Fix 2: Each Indicator Has Its Own Real States

Verified against the real Zenodo factsheet PDF. Not all indicators use the same three-state enum.

| Indicator | Factsheet Section | Type | Real States |
|-----------|-------------------|------|-------------|
| BMI-01 (Macroinvertebrates) | Section II | Citizen | `diverse_sensitive / tolerant_only / absent_or_dead` |
| BIR-04 (Birds) | Section V | Citizen | `many_species / few_species / none_observed` |
| INV-11 (Invasive Plants) | Section XI | Citizen | `none_seen / few_patches / widespread` |
| FCL-06 (Fecal Coliforms) | Section VII | **Lab only** | **No state selection — sample collection** |
| DIA-10 (Diatoms) | Section I | **Lab only** | **No state selection — sample collection** |

**FCL-06 and DIA-10:**
- No state selection ever
- Label as `pending_lab_analysis`
- Explicit text: "This requires laboratory analysis. You cannot determine the result in the field."
- Lab protocol guidance from the real factsheet is displayed to the volunteer (specific methods, not made-up details)
- **FCL-06 real protocol:** Filter water sample, place on selective growth medium, incubate at warm temperatures, count colonies as CFU/100mL. Also enzyme-substrate tests (color change/fluorescence), qPCR, and metabarcoding.
- **DIA-10 real protocol:** Scrape periphytic diatoms from submerged stones/substrate. Clean in lab using nitric acid and potassium dichromate at room temperature for 24h. Prepare permanent slides using Naphrax®. Identify ~400 diatom valves under stereomicroscope.

### Fix 3: AI Field Assistant Has a Hard Boundary

The assistant **only** answers from pre-loaded factsheet text and app-defined categories. Outside scope:

> "I'm equipped to answer using the OneAquaHealth protocol and factsheet definitions I have. This question falls outside that scope — please consult the official monitoring guide."

Never identifies species beyond what's in the factsheet. Never gives opinions on water quality, health, or assessment. Never improvises.

**Offline degradation:** The assistant calls Groq for responses, which requires network access. When offline or when the API is unreachable, the assistant displays "Assistant unavailable — no network connection" instead of a stuck loading spinner or silent button. This is a known field condition (volunteers standing next to streams often have poor connectivity). The fallback is a static reference card showing the pre-loaded factsheet text for the current indicator, so the tool remains fully usable without network.

---

## Full User Flow

### Entry Point: `/field`

- Full-screen immersive page with water animation
- Title: **Field Companion**
- Subtitle: "Collect real data. No assessment. No verdict."
- Button: "Start Monitoring Session"
- Existing session indicator if `IndexedDB` has partial data

### Step 1: Session Setup

- **Stream name / location** (text input) — NOT HUC code, which is US-specific
- Date/time (auto-filled, editable)
- Volunteer name (optional)
- Creates a session record in `IndexedDB`

### Step 2: Indicator Walkthrough (5 steps)

Each indicator gets its own full-page immersive experience with indicator-specific states.

#### BMI-01 — Benthic Macroinvertebrates
- **Protocol Question:** "What types of small creatures do you see under stones or in the streambed?"
- **Visual Anchor:** "Look under 2-3 submerged stones in flowing water."
- **States:** `Many sensitive species present` / `Only tolerant species seen` / `None seen or dead`
- **Factsheet protocol:** Macroinvertebrates collected with hand-net (500μm mesh, 0.25×0.25m opening) by kick sampling across six 1m sub-samples. Organisms preserved in ethanol, sorted and identified under stereomicroscope. Metrics: taxa richness, diversity, BMWP biotic scores.
- **Photo:** Capture benthic habitat photo
- **Note:** Optional field notes
- **Timing:** If protocol implies waiting, show countdown

#### BIR-04 — Birds
- **Protocol Question:** "What bird species do you hear or see near the stream?"
- **Visual Anchor:** "Listen for bird songs and calls, especially insectivorous species, during early morning hours."
- **States:** `Many species observed` / `Few species observed` / `None seen`
- **Factsheet protocol:** Bird censuses (point counts) through detection of sounds (songs and calls). Performed at early hours of the day (up to three hours after sunrise), during 10 minutes, at each location. Use the Merlin app (Cornell Lab of Ornithology). Species classified by feeding guild following Wilman et al. (2014). Count insectivorous bird species.
- **Photo:** Capture bird/water photo
- **Note:** Optional field notes

#### INV-11 — Invasive Alien Plants of the Riparian Corridor
- **Protocol Question:** "What types of plants do you see along the stream banks, and do any look unusual or non-native?"
- **Visual Anchor:** "Walk along both banks of a 100-meter stretch and note plant species, especially non-native or fast-growing ones."
- **States:** `None seen` / `A few patches` / `Widespread coverage`
- **Factsheet protocol:** Non-native community visually surveyed along a 100-meter stretch on both banks. Ten checkpoints at 10-meter intervals. At each checkpoint, assessment from water's edge toward riverside, covering 5m linear distance and 2m width. Species identified in situ when possible. Relative coverage (%) visually estimated. Each species classified as cosmopolitan, alien, naturalized, potentially invasive, or invasive per national legislation.
- **Photo:** Capture riparian vegetation photo
- **Note:** Optional field notes

#### FCL-06 — Fecal Coliforms (Lab Only)
- **Protocol Question:** "Do you notice any unusual odors, discoloration, or sewage-related signs in the water?"
- **Visual Anchor:** "Note water clarity, odor, and visible pollution; laboratory testing is required for confirmation."
- **Lab Protocol Guidance** (from real factsheet): Water samples collected and analyzed using complementary methods. Culture-based testing: filter known volume of water, place filter on selective growth medium, incubate at warm temperatures, count colonies as CFU/100mL. Enzyme-substrate tests use color changes or fluorescence. qPCR detects specific DNA sequences. Metabarcoding confirms presence of indicator bacteria.
- **No state selection — ever**
- **Photo:** Photograph sampling location
- **Sample Label:** Auto-generated `SMP-YYYYMMDD-XXX`
- **Status:** `pending_lab_analysis`
- **Explicit text:** "This requires laboratory analysis. You cannot determine the result in the field."

#### DIA-10 — Diatoms (Lab Only)
- **Protocol Question:** "Can you observe any algae or slime on submerged stones in the stream?"
- **Visual Anchor:** "Scrape periphytic diatoms from submerged stones or substrate. Clean with nitric acid and potassium dichromate, prepare slides with Naphrax, identify under microscope."
- **Lab Protocol Guidance** (from real factsheet): Periphytic diatoms scraped from surface of submerged stones/substrate (also from sediment or aquatic plants). Cleaned in lab using nitric acid and potassium dichromate at room temperature for 24h to remove organic content. Permanent slides prepared using Naphrax®. About 400 diatom valves identified and counted per sample under stereomicroscope. Identification to species level based on morphology. Deformities (teratologies) registered and counted.
- **No state selection — ever**
- **Photo:** Photograph sampling location
- **Sample Label:** Auto-generated
- **Status:** `pending_lab_analysis`
- **Explicit text:** "This requires laboratory microscopy. You cannot identify diatoms in the field."

### Step 3: Session Review

- Summary of all 5 indicators
- 3 citizen-observable indicators show their selected states
- 2 lab-only indicators show `Pending Lab Analysis` with sample labels
- Photo count and notes for each
- **Human-readable session summary** (printable/screenshot-able): A clean, formatted summary of what was collected — indicator name, selected state or sample label, photos, notes — displayed as a styled page the volunteer can screenshot or print. This gives immediate value even if no external system reads the JSON export.
- **No scores, no tiers, no assessments**
- **"Export Data"** button → structured JSON/CSV
- **"Continue Later"** → saves to IndexedDB, returns to home

### Step 4: Export

- Download button generates a structured file
- Each record includes:
  - `indicatorId`, `indicatorName`
  - `type`: `citizen_observation` or `lab_sample_pending`
  - `state` (only for citizen-observable, using each indicator's real states)
  - `timestamp`, `volunteer`, `stream_name`
  - `photos`: array of IndexedDB references (not base64 in export)
  - `notes`: text
  - `sampleLabel` (only for lab-only)
  - `lab_protocol_guidance` (only for lab-only)
  - `status`: `complete` or `pending_lab_analysis`
- **Human-readable session view** alongside the JSON/CSV download — a formatted, printable summary page showing all collected data in a clean layout
- Label: "Export structured data aligned with the OneAquaHealth indicator framework"
- **No claims about format compatibility with any specific app**

---

## AI Field Assistant (Bounded)

### Location: Sidebar on each indicator step

### Pre-loaded content from factsheets:
- All 5 indicator questions
- All 5 visual anchor guides
- All state definitions from `citizen_state_labels`
- Lab protocol guidance for FCL-06 and DIA-10
- Reference factsheet text for the current indicator (for offline fallback)

### Rules:
- Only answers from pre-loaded factsheet text and app-defined categories
- Outside scope → hard refusal (exact phrase defined above)
- **"This suggests sensitive habitat" → never appears** — use descriptive language only: "Based on the factsheet, diverse_sensitive means many sensitive species are present"
- Never identifies species beyond what's in the factsheet
- Never gives opinions on water quality, health, or assessment
- **Offline mode:** If no network, display the pre-loaded factsheet text for the current indicator as a static reference card. Never show a stuck loading spinner. The tool remains fully usable offline — only the AI assistant is degraded, not the core data collection flow.

---

## Visual Design

### Color Scheme
- Deep navy (#070d1a) background
- Emerald (#00e5a0) accent for interactive elements
- Cyan (#00b4d8) for secondary elements
- Warm amber (#ffb833) for lab-only indicators only
- **No red/critical alerts — removed entirely**

### Key Elements
- Water animation canvas background
- River-flow progress bar showing indicator completion
- Each indicator step: full-page immersive layout
- Card-based layout with dark backgrounds and emerald borders
- Photo capture uses native camera API with preview
- Timing prompts use prominent countdown timers
- Lab-only indicators have a distinct amber "Pending Lab Analysis" badge
- Human-readable session summary has a clean print-friendly layout

### No Verbs That Imply Assessment
- No "tier", "score", "health", "result", "verdict" anywhere
- No "assessment" language — "monitoring" or "collection"
- Export button says "Export Data" not "Get Results"
- No summary score or aggregate rating

---

## Data Model

```typescript
interface FieldSession {
  sessionId: string;
  streamName: string;       // NOT HUC code
  volunteer: string;
  date: string;
  indicators: FieldIndicatorRecord[];
  startedAt: string;
  completedAt?: string;
}

interface FieldIndicatorRecord {
  indicatorId: string;
  indicatorName: string;
  type: 'citizen_observable' | 'lab_only';
  state?: string;           // per-indicator specific states
  photos: string[];         // IndexedDB references, not base64
  notes: string;
  timestamp: string;
  sampleLabel?: string;     // only for lab_only
  labProtocolGuidance?: string; // only for lab_only
  status: 'complete' | 'pending_lab_analysis';
}
```

### Per-Indicator State Enums

```typescript
const INDICATOR_STATES = {
  'BMI-01': ['diverse_sensitive', 'tolerant_only', 'absent_or_dead'] as const,
  'BIR-04': ['many_species', 'few_species', 'none_observed'] as const,
  'INV-11': ['none_seen', 'few_patches', 'widespread'] as const,
  'FCL-06': [] as const,  // No states — lab only
  'DIA-10': [] as const,  // No states — lab only
};
```

---

## Storage: IndexedDB, Not sessionStorage

**sessionStorage cannot hold base64 photos.** Will hit ~5–10MB quota on mobile.

**Using IndexedDB** for all session data including photo references.

- Photos stored as blobs in IndexedDB with unique IDs
- Session metadata stored as JSON in IndexedDB
- Visible error if storage quota is exceeded
- "Continue Later" saves full session to IndexedDB
- Export converts photo references back to downloadable format

---

## Technical Implementation

### Pages
- `/field` — Entry point, session setup
- `/field/bmi-01` — Indicator walkthrough (citizen, 3 states)
- `/field/bir-04` — Indicator walkthrough (citizen, 3 states)
- `/field/inv-11` — Indicator walkthrough (citizen, 3 states)
- `/field/fcl-06` — Lab sample collection (no states)
- `/field/dia-10` — Lab sample collection (no states)
- `/field/review` — Session review and export

### Shared Components
- `IndicatorStep` — Full-page indicator walkthrough with per-indicator states
- `LabSampleStep` — Lab-only sample collection (no state selection)
- `RiverProgress` — River-flow progress bar
- `BoundedAssistant` — AI field assistant with hard boundary and offline fallback
- `PhotoCapture` — Camera/multi-image capture via IndexedDB
- `CountdownTimer` — Timing prompt with visual countdown
- `ExportButton` — Structured data export + human-readable session view
- `FieldSessionManager` — IndexedDB session management

### Key Files
- `src/app/field/page.tsx` — Session setup
- `src/app/field/[indicator]/page.tsx` — Dynamic indicator steps
- `src/app/field/review/page.tsx` — Review and export
- `src/components/IndicatorStep.tsx`
- `src/components/LabSampleStep.tsx`
- `src/components/RiverProgress.tsx`
- `src/components/BoundedAssistant.tsx`
- `src/components/PhotoCapture.tsx`
- `src/components/CountdownTimer.tsx`
- `src/components/ExportButton.tsx`
- `src/lib/field-session.ts` — IndexedDB session management
- `src/lib/identificationHints.ts` — Descriptive only, no evaluation

---

## What Gets Deleted from StreamVitals

- `/verdict` — Remove entirely
- `/ai-copilot` — Replace with `/field` + bounded assistant sidebar
- `/predict` — Remove
- `/report` — Remove
- `/dashboard` — Remove or redirect
- `/citizen` — Redirect to `/field`
- The `assess()` function stays but `identificationHints()` is purely descriptive
- All tier/config logic removed from the frontend

---

## What Stays From StreamVitals

- The `indicators` data from `src/data/indicators.json`
- The indicator icons (BugIcon, BirdIcon, LeafIcon)
- The water animation system
- The visual design language (emerald accent, dark cards, etc.)
- The layout/navigation structure

---

## Verification Status

### Done
- [x] Opened Zenodo factsheet PDF (doi:10.5281/zenodo.20345207) — real 13-page document, 11 indicators
- [x] Verified BMI-01 citizen question and visual anchor against Section II
- [x] Verified BIR-04 citizen question, visual anchor, and protocol against Section V
- [x] Verified INV-11 citizen question, visual anchor, and protocol against Section XI
- [x] Verified FCL-06 protocol details against Section VII
- [x] Verified DIA-10 protocol details against Section I
- [x] Updated BIR-04 state names from `diverse_sensitive/tolerant_only/absent_or_dead` to `many_species/few_species/none_observed` in both JSON files
- [x] Updated INV-11 state names from `diverse_sensitive/tolerant_only/absent_or_dead` to `none_seen/few_patches/widespread` in both JSON files
- [x] Updated FCL-06 visual_anchor_guide to match real factsheet protocol text
- [x] Updated DIA-10 visual_anchor_guide to match real factsheet protocol text

### Remaining Before Code Starts
1. **Offline degradation for BoundedAssistant** — needs implementation in `BoundedAssistant.tsx` component
2. **Human-readable session view** — needs implementation in `review/page.tsx` and `ExportButton.tsx`
3. **Build walkthrough pages** using the verified factsheet content above — not guesses, even better-sounding ones
4. **Check the live deployed URL** after build and push

---

## Source Reference

All indicator content traces to: Schmeller, D., Calapez, A. R., Silva, J. P., Norte, A. C., Serra, S. R. Q., Dias, M., Silva, G. T., Bouchali, R., Loyau, A., Almeida, S. F. P., Schmitt, R., Chen, A., Ramos, J. A., & Feio, M. J. (2026). *OneAquaHealth Key Indicators of Ecosystem and Biological Health - Factsheets Collection*. Zenodo. https://doi.org/10.5281/zenodo.20345207

Extracted text saved to `extracted.txt` in the project root for reference.
