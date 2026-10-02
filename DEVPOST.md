# StreamVitals — Devpost Description

> Paste-ready text for the Devpost submission. English only — the app UI is
> English-only, and the video says so plainly.

---

## StreamVitals

**A field companion that makes sure the thing being assessed is actually what the citizen observed.**

StreamVitals guides a citizen through the five official OneAquaHealth indicators — Benthic Macroinvertebrates (BMI-01), Birds (BIR-04), Invasive Alien Plants (INV-11), Fecal Coliforms (FCL-06), and Diatoms (DIA-10) — with one structured workflow per indicator. FCL-06 and DIA-10 are laboratory-only: for those the app shows a prominent sample ID to write on the container, the factsheet's own collection protocol, photo capture, and sampling notes. Observations, photos, notes, and sample IDs persist in the browser (IndexedDB) and export as CSV, JSON, or a printable Lab Submission Sheet.

**Track 1 only.** Nothing in this product grades, scores, tiers, or adjudicates an observation. The only AI component is a bounded Q&A panel that answers from the OneAquaHealth Key Indicators factsheets (doi:10.5281/zenodo.20345207, CC-BY 4.0) and refuses everything else.

### The note check is rule-based, not AI

`src/lib/note-quality.ts` is a deterministic keyword-and-contradiction rule set — no model, no API call, no inference. It warns (never blocks) when a note uses assessment language the framework cannot record, or contradicts the selected observation state. The volunteer can keep the note with an explicit "Keep my note anyway" click, and the resulting `note_flag` travels into the JSON and CSV exports, so the flag is visible downstream instead of hidden.

### The bounded assistant, shown honestly

The Field Assistant answers indicator protocol/state/sampling questions from the bundled factsheet. Offline (or while no model key is configured) it falls back to the factsheet card for the specific indicator, refuses diagnostic questions, refuses nonsense with a pointer to what it *can* answer, and answers meta questions ("why do you keep saying the same thing?") by explaining the fallback instead of pretending. Three different questions get three different, correct responses — asserted in the test suite, not just demonstrated.

### What this project does NOT do — and what we removed rather than fake

Most hackathon entries list what they built. This section is the part we're proudest of: **every capability claim in this submission is one a judge can verify in five minutes, so we deleted anything we couldn't back.** StreamVitals does not assess stream health, does not assign tiers or scores, does not identify species beyond the factsheet, and does not predict anything. During the build we removed four features that had been scaffolded as if they were real:

1. **A fabricated `/api/sensors` endpoint** — it returned invented sensor readings for a project that has no sensors. Removed and called out as fabricated in the commit that deleted it; the stale README entry is gone too.
2. **An `/api/analyze` route** — an AI-analysis endpoint that would have contradicted the entire Track 1 boundary (AI may interpret input; AI may not adjudicate). Removed.
3. **A monitoring map page** — 219 lines implying a live, crowd-sourced stream map that never existed. Removed.
4. **An offline-first PWA** — service worker and manifest deleted; we kept only what's actually true: data entry survives a dropped connection on an already-open session, loading a new page does not, and the README says exactly that. No "offline-first" claim.

We also corrected two live claims before submission: the provenance endpoint no longer says Track 3 (we never entered it) and no longer advertises a FHIR R4 export that doesn't exist.

### Built with

Next.js 16 (App Router) · TypeScript (strict) · Tailwind CSS 4 · IndexedDB persistence · Groq (`openai/gpt-oss-120b`) for the bounded assistant only · Vitest (41 tests) + Playwright (end-to-end smoke test) · Vercel.

### Sources

OneAquaHealth Key Indicators Factsheets Collection — Schmeller et al. (2026), Zenodo, doi:10.5281/zenodo.20345207 (CC-BY 4.0). Collection instructions shown to volunteers were checked line by line against the source text; four instructions that could not be traced to the factsheet were removed rather than left in place (see README → Factsheet Provenance).

### Honest limits

- English-only UI; no multilingual label set was built.
- No service worker: works without connectivity for data entry on an already-open session; requires a connection to load a new page and to reach the AI assistant.
- The note-check rules and their tests were written by the same author, so the suite demonstrates self-consistency, not accuracy against a labelled corpus.
- Real-camera and sunlight readability testing on physical phones is pending; mobile validation so far is device emulation (Chromium + WebKit engines).
