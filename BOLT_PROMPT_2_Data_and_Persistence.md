# BOLT Prompt 2: Data and Persistence

## Data Layer

### Indicators Source
- `src/data/indicators.json` — Master indicator definitions (5 indicators)
- `src/data/indicators.ts` — TypeScript types and helpers
- Each indicator has: `id`, `name`, `category`, `description`, `unit`, `fieldNotes`, `labRequired` (for FCL-06/DIA-10)

### IndexedDB Persistence
- Library: `idb` (lightweight IndexedDB wrapper)
- Database: `streamvitals-db`
- Store: `field-sessions`
- Session structure:
  ```typescript
  interface FieldSession {
    sessionId: string;
    startTime: number;
    observations: Record<string, ObservationData>;
    status: 'in-progress' | 'review' | 'submitted';
    createdAt: string;
  }
  ```
- `src/lib/field-session.ts` — Session CRUD operations
- `src/lib/factsheet-content.ts` — Offline factsheet content cache

### API Routes
- `GET /api/sensors` — Returns sensor configuration
- `POST /api/ai/assistant` — AI assistant endpoint (Groq proxy)
- `POST /api/provenance` — Data provenance logging
- `POST /api/export` — Data export (CSV/JSON)

## Key Rules
- All data stored in IndexedDB before API submission
- Session ID persisted in `sessionStorage`
- Field observations validated before storage
- FCL-06/DIA-10 data flagged as `labRequired: true`
