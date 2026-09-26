# BOLT Prompt 5: Pages

## Page Structure

### `/` — Home/Landing Page (`src/app/page.tsx`)
- Title: StreamVitals — OneAquaHealth Field Companion
- List of 5 indicators as clickable cards
- Each card navigates via `window.location.href` to `/field/[indicator]`
- Light theme with `#f8f9fc` background
- Shows indicator name, category, and status (available/limited)

### `/field` — Field Dashboard (`src/app/field/page.tsx`)
- Overview of current session
- List of all indicators with status (not-started/in-progress/complete)
- RiverProgress visualization
- Navigation to individual indicator pages
- Session timer display

### `/field/[indicator]` — Per-Indicator Form (`src/app/field/[indicator]/page.tsx`)
- Dynamic route `[indicator]` for each of 5 indicators
- Observation form with indicator-specific fields
- Photo capture (optional)
- Save to IndexedDB on each field change
- Navigate to review page on completion
- Uses case-insensitive indicator lookup

### `/field/review` — Data Review (`src/app/field/review/page.tsx`)
- Summary of all collected observations
- Edit capability
- Export button
- Submit button (POST to `/api/provenance`)
- Clear confirmation before submission

## Page Rules
- All navigation via `window.location.href` only
- No React Router
- No `<Link>` components from Next.js
- Session state from `sessionStorage`
- Persistent IndexedDB storage
