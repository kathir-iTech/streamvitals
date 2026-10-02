# StreamVitals — Devpost Description

> Paste-ready text for the Devpost submission. English only — the app UI is
> English-only, and the video says so plainly.

---

## StreamVitals

**A field companion that makes sure the thing being assessed is actually what the citizen observed.**

### The problem

The OneAquaHealth Key Indicators factsheet tells research teams what to measure — and it is written for them: Latin names, lab protocols, section numbers. The volunteer standing at a stream on a Saturday morning does not have it open. When the sheet and the sighting do not line up, the free-text note fills the gap: *"healthy stream."*

That word is an assessment smuggled into observation data. Downstream it is worthless — a reviewer cannot tell what was actually seen. And the signal behind these five indicators is not abstract: the factsheet ties fecal coliforms to enteric pathogens such as *E. coli* O157 and norovirus, and diatom blooms to oxygen depletion and fish kills (doi:10.5281/zenodo.20345207). The data has to be trustworthy because the health signal it carries is real.

StreamVitals closes that gap without adding a second AI problem on top of the first.

### What it does — five features, all in the live app

1. **Guided observation.** Five official indicators — BMI-01 Benthic Macroinvertebrates, BIR-04 Birds, INV-11 Invasive Alien Plants, FCL-06 Fecal Coliforms, DIA-10 Diatoms. Three field indicators offer three observation states each (nine states total), photo capture, and a field note; the session persists in IndexedDB and survives a refresh.
2. **Lab mode that admits what it cannot know.** FCL-06 and DIA-10 cannot be judged in the field, so the app does not pretend: it shows a prominent **sample ID** to write on the container, the factsheet's own collection protocol, photo capture, and sampling notes. Pending lab analysis means pending.
3. **A deterministic note check — not AI.** `src/lib/note-quality.ts` is keyword and contradiction rules with no model and no API call. It flags assessment language ("healthy", "tier 1", "score") and notes that contradict the selected state. It warns; it never blocks. "Keep my note anyway" writes a `note_flag` that travels into the JSON and CSV exports, so the flag is visible downstream instead of hidden.
4. **A bounded Field Assistant.** In-scope protocol questions are answered from the factsheet text itself (Groq, `openai/gpt-oss-120b`, factsheet injected into the prompt). Meta questions and out-of-scope questions never reach a model at all — they are answered locally by a scope gate. Offline, the assistant quotes the bundled indicator card. It never grades, scores, or identifies species beyond the factsheet.
5. **Review and export you can audit.** The review page shows exactly what the volunteer typed — names, states, notes, sample IDs — and exports CSV, JSON, a print summary, and a printable Lab Submission Sheet. The frequencies panel on `/field` shows counts of what was recorded, labelled frequencies, never predictions.

### How it works

1. Name the stream and the volunteer, start a session (stored in the browser).
2. Choose one of the five indicators.
3. Record the observation — state, photo, note; lab indicators get a sample ID and protocol instead.
4. The note check runs on every note and warns without blocking.
5. Ask the Field Assistant — factsheet answers only; the scope gate handles everything else.
6. Review and export — CSV, JSON, print, Lab Submission Sheet.

### The number

**41 automated tests** (Vitest: 7 session + 14 factsheet/assistant + 15 note rules + 5 frequencies), plus an end-to-end Playwright walkthrough of the entire session that fails if the review page ever shows data the volunteer did not enter. **0 AI calls in the recording path.** The assistant's median answer time is ~1.9 s (5 live probes against the deployed app, 2026-10-02, min 1.4 s / max 4.1 s).

### Before / after — the same note, two datasets

- **Before:** the note field silently accepts *"healthy stream."* The reviewer cannot recover what was seen, and one judgment contaminates the record.
- **After:** the note check flags it, the volunteer consciously keeps it, and `note_flag` ships in the CSV/JSON next to the observation. The reviewer sees the observation and the human judgment — separated, both intact.

### What this project does NOT do — and what we removed rather than fake

Most hackathon entries list what they built. This section is the part we're proudest of: **every capability claim in this submission is one a judge can verify in five minutes, so we deleted anything we couldn't back.** StreamVitals does not assess stream health, does not assign tiers or scores, does not identify species beyond the factsheet, and does not predict anything. During the build we removed four features that had been scaffolded as if they were real:

1. **A fabricated `/api/sensors` endpoint** — it returned invented sensor readings for a project that has no sensors. Removed and called out as fabricated in the commit that deleted it; the stale README entry is gone too.
2. **An `/api/analyze` route** — an AI-analysis endpoint that would have contradicted the entire Track 1 boundary (AI may interpret input; AI may not adjudicate). Removed.
3. **A monitoring map page** — 219 lines implying a live, crowd-sourced stream map that never existed. Removed.
4. **An offline-first PWA** — service worker and manifest deleted; we kept only what's actually true: data entry survives a dropped connection on an already-open session, loading a new page does not, and the README says exactly that. No "offline-first" claim.

We also corrected two live claims before submission: the provenance endpoint no longer says Track 3 (we never entered it) and no longer advertises a FHIR R4 export that doesn't exist.

### What's next

1. **Field pilot** — run the companion beside volunteers at OneAquaHealth research-city streams; the comparison we do not yet have is paper sheet versus phone on the same visit.
2. **Multilingual volunteer labels** — the factsheets are multilingual; the volunteer-facing UI currently is not.
3. **Pipeline hand-off** — CSV/JSON exports already carry indicator IDs, states, notes, and note flags in a fixed schema; the next step is ingesting them into the OneAquaHealth Citizen Science App pipeline instead of manual review.

### Built with

Next.js 16 (App Router) · TypeScript (strict) · Tailwind CSS 4 · IndexedDB persistence · Groq (`openai/gpt-oss-120b`) for the bounded assistant only · Vitest (41 tests) + Playwright (end-to-end smoke test) · Vercel.

### Sources

OneAquaHealth Key Indicators Factsheets Collection — Schmeller et al. (2026), Zenodo, doi:10.5281/zenodo.20345207 (CC-BY 4.0). Collection instructions shown to volunteers were checked line by line against the source text; four instructions that could not be traced to the factsheet were removed rather than left in place (see README → Factsheet Provenance).

### Honest limits

- English-only UI; no multilingual label set was built.
- No service worker: works without connectivity for data entry on an already-open session; requires a connection to load a new page and to reach the AI assistant.
- The note-check rules and their tests were written by the same author, so the suite demonstrates self-consistency, not accuracy against a labelled corpus.
- The automated end-to-end test runs in desktop Chromium; real-camera, real-sunlight readability testing on physical phones is pending.
- Lab indicators produce no result in this app — a sample ID is not a measurement.
