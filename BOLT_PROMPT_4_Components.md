# BOLT Prompt 4: Components

## Component Library

### RiverProgress.tsx
- Visual river flow diagram showing indicator progression
- Uses Tailwind CSS classes with `#059669` accent
- Displays current position in the observation workflow

### PhotoCapture.tsx
- Camera capture interface for field photos
- Uses browser `getUserMedia` API
- Captures images and stores in IndexedDB session
- Optional field — not required for all indicators

### CountdownTimer.tsx
- Field observation countdown timer
- Visual timer component with `#059669` styling
- Auto-saves session at intervals
- Pauses/resumes on visibility change

### BoundedAssistant.tsx
- AI chat interface bounded to factsheet scope
- Sends queries to `/api/ai/assistant` route
- Displays offline fallback when API unavailable
- Enforces "no tier assignment" constraint in UI

### ExportButton.tsx
- Exports collected data via `/api/export`
- Generates downloadable CSV/JSON file
- Confirms export with session summary

## Component Rules
- All components use `#f8f9fc` background, `#ffffff` cards, `#059669` accents
- No conditional dark/light mode
- TypeScript strict typing for all props
- No external UI libraries (no shadcn, no Radix)
