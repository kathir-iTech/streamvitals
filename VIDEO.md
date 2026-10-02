# StreamVitals — Video Script

> English only. The app UI is English-only — the script states this plainly
> rather than implying multilingual support that does not exist.
> **Required length: 3–5 minutes. Target: ~4:15.** One take per section is fine;
> judges prefer a working demo over production polish.
> Record in one continuous screen capture if possible; cut only at section
> boundaries marked CUT.

---

## 0:00 — Hook (screen: home page)

**Narration:**
"This is StreamVitals, a field companion for the OneAquaHealth protocol. It makes sure the thing being assessed is actually what the citizen observed — and when it shows a health band, deterministic rules produced it. AI may explain. AI never scores."

## 0:15 — The problem (screen: home page, slow scroll to the indicator cards)

**Narration:**
"The official factsheet tells research teams what to measure — Latin names, lab protocols, section numbers. A volunteer at the stream on a Saturday morning does not have it open. So the note fills the gap: 'healthy stream.' That word is an assessment smuggled into observation data — a reviewer can no longer tell what was actually seen. The stakes are real: the same factsheet ties fecal coliforms to pathogens like E. coli O157, and diatom blooms to oxygen depletion and fish kills. The data has to be trustworthy because the health signal it carries is real."

## 0:45 — One path, one take: a full session (screen: /field → /field/review)

**Action (click-by-click):**
1. `/field` — type a real stream name and a real volunteer name, start the session.
2. BMI-01 — select one state, add a note that contains the word "healthy". Show the **assessment card** that appears: favorable band, the rule that fired, the factsheet chain.
3. Show the note-check warning appear. Click **"Keep my note anyway"**. Point at the `note_flag` badge.
4. BIR-04 — select a state, move on (keep it fast, show the Next button does not reload the page).
5. FCL-06 — show the **sample ID** to write on the container, scroll the collection protocol, add a sampling note. Point at the card: "Awaiting laboratory analysis — pending, not graded."
6. DIA-10 — one glance: same lab treatment, same pending band, no fake field verdict.
7. `/field/review` — show the summary: names, states, notes, sample IDs, the note flag, and the **session assessment grid** (three favorable chips, two pending).
8. Click **Export CSV**, open the downloaded file, show the `note_flag` column and the `assessment_band` column with their values.
9. Click **Lab Submission Sheet**, show the printable sheet with the sample ID.

**Narration:**
"A session, start to finish. Nine citizen states across three field indicators — everything here came from what the volunteer typed, and every band came from the rules. The note check warned about 'healthy' and the volunteer chose to keep it anyway, so the flag rides along into the export instead of being hidden. Fecal coliforms and diatoms can't be judged in the field — so the app shows a sample ID, the factsheet's own protocol, and a pending band. Pending lab analysis means pending."

## 2:25 — The bounded assistant (screen: open Field Assistant on FCL-06)

**Action:** ask the three questions in order, let each answer render fully:

1. "What do I collect for this sample?" → factsheet-grounded answer (container, volume, membrane filtration).
2. "What is the capital of France?" → refused, with a pointer to what it can answer.
3. "Why do you keep saying the same thing?" → an honest explanation of the local fallback.

**Narration:**
"Three questions, three different answers. In-scope questions are answered from the factsheet text itself; meta and out-of-scope questions never reach a model at all — a local scope gate handles them, and health judgements point back at the deterministic card. Deterministic rules assess; AI explains. And the test suite asserts exactly these three behaviors."

## 3:05 — The tech beat (screen: terminal, then /provenance)

**Action:**
1. In a terminal: `npm test` → let the camera see **"Tests 68 passed"**.
2. Browser: open `streamvitals.vercel.app/provenance` → show track, DOI, citation, AI-boundary statement.

**Narration:**
"Sixty-eight automated tests — session storage, the assistant's three-answer contract, the note rules, the frequencies panel, the assessment engine with its source guard, the GBIF client, and share links — plus an end-to-end walkthrough that fails if the review page ever shows data the volunteer did not enter, an accessibility scan, and an offline-reload test that cuts the network. Zero AI calls in the assessment path: states, bands, note rules, and exports are deterministic. The provenance endpoint publishes the track, the DOI, and the AI boundary as machine-readable JSON."

## 3:40 — Honest limits (screen: static card, readable for 12 s)

**On-screen text (read aloud):**
- Track 3 — deterministic assessment with chains; the assistant never scores.
- **The app interface is English only.** Offline is modest, not offline-first: a service worker keeps already-visited pages available without connection; a first visit and the assistant need one.
- The note-check rules and their tests were written by the same author — self-consistency, not accuracy.
- We removed four scaffolded features we couldn't back: a fabricated sensors endpoint, an AI-analyze route, a fake monitoring map, and an 'offline-first' PWA claim — the last one replaced by a small, tested service worker, never by a promise.
- Sources: OneAquaHealth factsheets, doi:10.5281/zenodo.20345207 (CC-BY 4.0).

**Narration:**
"If a claim is in this app, you can verify it in five minutes. That's the standard we held it to."

## 4:00 — Close (screen: home page)

**Narration:**
"What's next: a field pilot beside volunteers at the research-city streams — paper sheet versus phone on the same visit — and a hand-off of the CSV into the OneAquaHealth Citizen Science App pipeline. StreamVitals — the stream's vitals, recorded by the people who actually saw it. Live at streamvitals.vercel.app."

## 4:15 — END (hold the URL on screen for 3 s before stopping the recording)

---

### Recording checklist

- [ ] Final duration between **3:00 and 5:00** (target ~4:15) — check before upload
- [ ] Real session, real notes, all five indicators touched
- [ ] No synthetic photos as field photos — if the demo has no photos, show it with no photos
- [ ] `npm test` result visible on camera (68 passed)
- [ ] The three assistant questions shown in full, not cut
- [ ] Limits card held long enough to read (~12 s)
- [ ] English-only stated out loud
- [ ] Final URL card held ~3 s
