# StreamVitals

StreamVitals — OneAquaHealth IEEE Global Hackathon 2026, Track 1 + Track 3

**We don't use AI to decide whether the stream is healthy; we use AI to make sure the thing being assessed is actually what the citizen observed.**

## What It Does

A citizen answers guided questions about an urban stream across five official OneAquaHealth indicators — Benthic Macroinvertebrates (BMI-01), Birds (BIR-04), Invasive Alien Plants (INV-11), Fecal Coliforms (FCL-06), and Diatoms (DIA-10). FCL-06 and DIA-10 are laboratory-only and cannot be evaluated in the field. The citizen selects observation states, optionally captures photos, and adds field notes. All data is stored persistently in IndexedDB and exported via CSV, JSON, or print.

A bounded **AI Field Assistant** answers questions using only the OneAquaHealth Key Indicators factsheets (doi:10.5281/zenodo.20345207). It never identifies species beyond what's in the factsheet, never gives opinions on water quality or health, and never assigns tiers, scores, or severity levels.

**AI may interpret input. AI may not adjudicate.**

## How It's Built

- **Frontend**: Next.js 16 (App Router), TypeScript (strict), Tailwind CSS 4
- **AI Layer**: Groq (`llama-3.3-70b-versatile`) — bounded assistant only, never adjudication
- **Persistence**: IndexedDB in the browser, session state in sessionStorage
- **Styling**: Light theme only (#f8f9fc background, #0d9b6e accent, #ffffff cards)
- **Testing**: Vitest with jsdom environment
- **Deployment**: Vercel

## Pages

1. **`/`** — Home page with 5 indicator cards, each navigates to `/field/[indicator]`
2. **`/field`** — Session dashboard, creates or continues a monitoring session
3. **`/field/[indicator]`** — Per-indicator observation form with state selection, photo capture, and field notes
4. **`/field/review`** — Review all observations, export data (JSON/CSV/Print), submit session

## Constraints

- No tier ratings (T1/T2/T3) anywhere in the UI
- No diagnostic assessments
- Lab-only isolation for FCL-06/DIA-10 indicators
- All navigation via `window.location.href` only
- No React Router, no `<Link>` components from Next.js
- Case-insensitive indicator lookup
- Light theme only — no theme toggles, no dark mode

## How to Run Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Data Sources

- **OneAquaHealth Key Indicators Factsheets**: Zenodo doi:10.5281/zenodo.20345207 (CC-BY 4.0)

## Architecture

1. **Home**: Indicator selection with status (available/limited)
2. **Session**: Create or continue a monitoring session
3. **Field**: Per-indicator observation with state selection and optional photo capture
4. **Review**: Summary of all observations with export and submit
5. **AI Assistant**: Bounded factsheet-based Q&A sidebar
6. **API**: Groq proxy for AI, provenance logging, data export

## API Routes

- `GET /api/sensors` — Sensor configuration for citizen-observable indicators
- `POST /api/ai/assistant` — AI assistant (Groq proxy with offline fallback)
- `GET /api/provenance` — Data provenance metadata
- `POST /api/export` — Export session data (CSV/JSON/GeoJSON)

## Testing

- `src/lib/field-session.test.ts` — 7 tests for IndexedDB session management
- `src/lib/factsheet-content.test.ts` — 6 tests for factsheet lookup and out-of-scope detection

Run with `npm test` (uses Vitest with jsdom environment).
