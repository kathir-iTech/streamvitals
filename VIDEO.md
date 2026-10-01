# StreamVitals — Video Script

> English only. The app UI is English-only — the script states this plainly
> rather than implying multilingual support that does not exist.
> Target: ~2:30. One take per section is fine; judges prefer a working demo
> over production polish.

---

## 0:00 — Hook (screen: home page)

**Narration:**
"This is StreamVitals, a field companion for the OneAquaHealth protocol. It does one thing on purpose: it makes sure the thing being assessed is actually what the citizen observed. It does not grade the stream. It does not score it. It records."

## 0:20 — Start a session (screen: /field, type stream + volunteer, start)

**Narration:**
"You name the stream and the volunteer, start a session, and you're in the workflow. Five official indicators. Three you observe directly — macroinvertebrates, birds, invasive plants."

*(Show: select a state on BMI-01, add a note. If the note contains a verdict word like 'healthy', show the warning and the "Keep my note anyway" click — the flag rides along into the export.)*

## 0:45 — The two lab indicators (screen: FCL-06, then DIA-10)

**Narration:**
"Fecal coliforms and diatoms can't be judged in the field — so the app doesn't pretend. It shows a sample ID to write on the container, the collection protocol straight from the factsheet, photo capture, and sampling notes. Pending lab analysis means pending."

## 1:10 — Review and export (screen: /field/review)

**Narration:**
"Review shows exactly what was recorded — names, states, notes, sample IDs. Export as CSV, JSON, or print the lab submission sheet. Everything here came from what the volunteer typed. Nothing is generated."

## 1:30 — The bounded assistant (screen: open Field Assistant on FCL-06)

**Narration:**
"The assistant answers from the OneAquaHealth factsheets only. Watch three different questions."

*(Show on screen, one after another:)*
1. "What do I collect for this sample?" → factsheet card for fecal coliforms.
2. "What is the capital of France?" → refused, with a pointer to what it can answer.
3. "Why do you keep saying the same thing?" → an honest explanation that it's running from the bundled factsheet fallback.

**Narration:**
"Three questions, three different answers — and the test suite asserts exactly that."

## 1:55 — The honesty slide (screen: static card, readable for 10s)

**On-screen text (read aloud):**
- Track 1 only — no assessment, no tiers, no scores.
- We removed four scaffolded features we couldn't back: a fabricated sensors endpoint, an AI-analyze route, a fake monitoring map, and an 'offline-first' PWA claim.
- Sources: OneAquaHealth factsheets, doi:10.5281/zenodo.20345207 (CC-BY 4.0).
- **The app interface is English only.**

**Narration:**
"If a claim is in this app, you can verify it in five minutes. That's the standard we held it to."

## 2:15 — Close (screen: home page)

**Narration:**
"StreamVitals — the stream's vitals, recorded by the people who actually saw it. Try it live at streamvitals.vercel.app."

---

### Demo data note
Use a real session with real notes on all five indicators. Do not upload synthetic photos as field photos — if the demo has no photos, show it with no photos.
