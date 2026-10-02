# StreamVitals — Devpost Description

> Paste-ready text for the Devpost submission. English only — the app UI is
> English-only, and the video says so plainly.

---

## StreamVitals

**A field companion that makes sure the thing being assessed is actually what the citizen observed — and that assesses it with deterministic rules, not a model.**

**Deterministic rules assess. AI may explain — AI never scores.**

### The problem

The OneAquaHealth Key Indicators factsheet tells research teams what to measure — and it is written for them: Latin names, lab protocols, section numbers. The volunteer standing at a stream on a Saturday morning does not have it open. When the sheet and the sighting do not line up, the free-text note fills the gap: *"healthy stream."*

That word is an assessment smuggled into observation data. Downstream it is worthless — a reviewer cannot tell what was actually seen. And the signal behind these five indicators is not abstract: the factsheet ties fecal coliforms to enteric pathogens such as *E. coli* O157 and norovirus, and diatom blooms to oxygen depletion and fish kills (doi:10.5281/zenodo.20345207). The data has to be trustworthy because the health signal it carries is real.

StreamVitals closes that gap without adding a second AI problem on top of the first.

### What it does — seven features, all in the live app

1. **Guided observation.** Five official indicators — BMI-01 Benthic Macroinvertebrates, BIR-04 Birds, INV-11 Invasive Alien Plants, FCL-06 Fecal Coliforms, DIA-10 Diatoms. Three field indicators offer three observation states each (nine states total), photo capture, and a field note; the session persists in IndexedDB and survives a refresh.
2. **Lab mode that admits what it cannot know.** FCL-06 and DIA-10 cannot be judged in the field, so the app does not pretend: it shows a prominent **sample ID** to write on the container, the factsheet's own collection protocol, photo capture, and sampling notes. Pending lab analysis means pending — the assessment band says `pending_lab`, never a verdict.
3. **A deterministic assessment engine — the Track 3 core.** `src/lib/assessment/engine.ts` (`streamvitals-assessment/1.0.0`) maps every observation state to a band (favorable / moderate / degraded, or `pending_lab` for lab indicators) and attaches the chain of evidence: the rule that fired, the factsheet passage behind it, and the honesty caveats (e.g. "a BMWP score would quantify this — it requires laboratory identification"). Same state, same band, every time. The module touches no network, no clock, no model — its test suite reads the source and fails if it ever does.
4. **A deterministic note check — not AI.** `src/lib/note-quality.ts` is keyword and contradiction rules with no model and no API call. It flags assessment language ("healthy", "tier 1", "score") and notes that contradict the selected state. It warns; it never blocks. "Keep my note anyway" writes a `note_flag` that travels into the JSON and CSV exports, so the flag is visible downstream instead of hidden. Your note stays an observation; the band comes from feature 3.
5. **A bounded Field Assistant.** In-scope protocol questions are answered from the factsheet text itself (Groq, `openai/gpt-oss-120b`, factsheet injected into the prompt). Meta questions and out-of-scope questions never reach a model at all — they are answered locally by a scope gate, and health-judgement questions are pointed at the deterministic card. It never grades, scores, or identifies species beyond the factsheet.
6. **Review and export you can audit.** The review page shows exactly what the volunteer typed — names, states, notes, sample IDs — plus the session's assessment grid (per-indicator band chips, counts, worst band) — and exports CSV, JSON, a print summary, and a printable Lab Submission Sheet, every one of them carrying the band, the engine version, and the chain rule IDs. The frequencies panel on `/field` shows counts of what was recorded, labelled frequencies, never predictions.
7. **Session location + GBIF baseline.** Optional GPS capture at session start (browser Geolocation API) — coordinates live in the session record on the device and its exports, never on a server of ours. With a location present, the review page fetches a baseline from `api.gbif.org/v1` browser-side (no key, no proxy): 8 taxa — EPT orders (BMI-01), Aves (BIR-04), the factsheet's three abbreviated IAP examples expanded to full binomials (INV-11), Bacillariophyta (DIA-10); FCL-06 is stated as "no taxon group — laboratory indicator". Counts within 50 km, timestamped, stored with the session, and labelled "presence data for context only, not a water-quality assessment — absence of records is not absence of species".

### How it works

1. Name the stream and the volunteer (optionally capture the GPS location), start a session (stored in the browser).
2. Choose one of the five indicators.
3. Record the observation — state, photo, note; lab indicators get a sample ID and protocol instead.
4. The deterministic engine assesses the state — band, chain of evidence, caveats — on the card, at view and export time.
5. The note check runs on every note and warns without blocking.
6. Ask the Field Assistant — factsheet answers only; the scope gate handles everything else, and judgements point back at the card.
7. Review and export — session assessment grid, GBIF baseline (if GPS captured), CSV, JSON, print, Lab Submission Sheet.

### The number

**61 automated tests** (Vitest: 9 session + 14 factsheet/assistant + 15 note rules + 5 frequencies + 12 assessment engine + 6 GBIF client), plus an end-to-end Playwright walkthrough of the entire session that fails if the review page ever shows data the volunteer did not enter or if the assessment card/chips/location/baseline don't render. **0 AI calls in the assessment path.** The assistant's median answer time is ~1.9 s (5 live probes against the deployed app, 2026-10-02, min 1.4 s / max 4.1 s).

### Before / after — the same note, two datasets

- **Before:** the note field silently accepts *"healthy stream."* The reviewer cannot recover what was seen, and one judgment contaminates the record.
- **After:** the note check flags it, the volunteer consciously keeps it, and `note_flag` ships in the CSV/JSON next to the observation. The reviewer sees the observation and the human judgment — separated, both intact.

### What this project does NOT do — and what we removed rather than fake

Most hackathon entries list what they built. This section is the part we're proudest of: **every capability claim in this submission is one a judge can verify in five minutes, so we deleted anything we couldn't back.** StreamVitals's bands are deterministic citizen-state proxies explicitly labelled as such — no laboratory indices (BMWP/IBD/IPS), no species identification beyond the factsheet, no predictions, and no AI anywhere in the assessment path. During the build we removed four features that had been scaffolded as if they were real:

1. **A fabricated `/api/sensors` endpoint** — it returned invented sensor readings for a project that has no sensors. Removed and called out as fabricated in the commit that deleted it; the stale README entry is gone too.
2. **An `/api/analyze` route** — an AI-analysis endpoint that would have scored observations with a model, contradicting the shipped boundary (deterministic rules assess; AI explains, never scores). Removed.
3. **A monitoring map page** — 219 lines implying a live, crowd-sourced stream map that never existed. Removed.
4. **An offline-first PWA** — service worker and manifest deleted; we kept only what's actually true: data entry survives a dropped connection on an already-open session, loading a new page does not, and the README says exactly that. No "offline-first" claim.

We also corrected two live claims before submission: the provenance endpoint no longer advertises a FHIR R4 export that doesn't exist, and its track statement now matches the track we actually enter — Track 3, with the boundary stated precisely (assessment is deterministic; the assistant never scores).

### What's next

1. **Field pilot** — run the companion beside volunteers at OneAquaHealth research-city streams; the comparison we do not yet have is paper sheet versus phone on the same visit.
2. **Multilingual volunteer labels** — the factsheets are multilingual; the volunteer-facing UI currently is not.
3. **Pipeline hand-off** — CSV/JSON exports already carry indicator IDs, states, notes, and note flags in a fixed schema; the next step is ingesting them into the OneAquaHealth Citizen Science App pipeline instead of manual review.

### Built with

Next.js 16 (App Router) · TypeScript (strict) · Tailwind CSS 4 · IndexedDB persistence · deterministic assessment engine (`streamvitals-assessment/1.0.0`, pure TypeScript — no network, no clock, no model) · GBIF baseline via `api.gbif.org/v1` (browser-direct) · Groq (`openai/gpt-oss-120b`) for the bounded assistant only · Vitest (61 tests) + Playwright (end-to-end smoke test) · Vercel.

### Sources

OneAquaHealth Key Indicators Factsheets Collection — Schmeller et al. (2026), Zenodo, doi:10.5281/zenodo.20345207 (CC-BY 4.0). Collection instructions shown to volunteers were checked line by line against the source text; four instructions that could not be traced to the factsheet were removed rather than left in place (see README → Factsheet Provenance).

### Honest limits

- English-only UI; no multilingual label set was built.
- No service worker: works without connectivity for data entry on an already-open session; requires a connection to load a new page and to reach the AI assistant.
- The note-check rules and their tests were written by the same author, so the suite demonstrates self-consistency, not accuracy against a labelled corpus.
- The automated end-to-end test runs in desktop Chromium; real-camera, real-sunlight readability testing on physical phones is pending.
- Lab indicators produce no band in the field — a sample ID is not a measurement, so the rules return `pending_lab` rather than grade what was not measured.
- Citizen bands are tolerance/extent **proxies** grounded in the factsheet's measurement principles — not BMWP/IBD/IPS indices, which require taxon-level laboratory identification.
