# BOLT Prompt 1: Foundation

## Project: StreamVitals Field Companion
### IEEE OneAquaHealth Global Hackathon 2026 — Track 1 + Track 3

## Core Objective
Build a field data collection web application for the OneAquaHealth protocol that enables field researchers to collect water quality indicator observations, store them persistently in IndexedDB, and submit validated data to a backend API.

## Architecture Overview
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4
- **Persistence**: IndexedDB via `idb` library
- **AI**: Groq API proxy (Llama 3.3 70B)
- **Testing**: Vitest
- **Deployment**: Vercel

## Color Scheme (Strict)
- Background: `#f8f9fc`
- Surface/Card: `#ffffff`
- Primary accent: `#059669` (emerald-600)
- Text primary: `#1a1a2e`
- Text secondary: `#6b7280`
- Border: `#e5e7eb`
- **NO** dark mode, NO secondary accent colors

## Pages Required
1. `/` — Home/Landing page with indicator selection
2. `/field` — Field observation entry (indicator list)
3. `/field/[indicator]` — Per-indicator observation form
4. `/field/review` — Data review and confirmation

## Key Constraints
- No tier ratings (T1/T2/T3) anywhere in the UI
- No diagnostic assessments
- Lab-only isolation for FCL-06/DIA-10 indicators
- All navigation via `window.location.href`
- Case-insensitive indicator lookup from `src/data/indicators.json`
- Light theme only — no theme toggles
