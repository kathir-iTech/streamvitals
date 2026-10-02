'use client';

import { useEffect } from 'react';
import { reportClientError } from '@/lib/telemetry';

// Root-level catch: this replaces the whole document (the root layout is not
// used here), so it is styled inline — no guaranteed CSS in this context.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportClientError('error-boundary', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#f8f9fc' }}>
        <div role="alert" style={{ maxWidth: '32rem', margin: '4rem auto', padding: '2rem', background: '#fff', borderRadius: '1rem', border: '1px solid rgba(0,0,0,0.06)', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.25rem', color: '#000', margin: '0 0 0.5rem' }}>StreamVitals hit an error</h1>
          <p style={{ fontSize: '0.875rem', color: 'rgba(0,0,0,0.62)', margin: '0 0 1.25rem' }}>It was reported to the developer. Your saved session data stays on this device.</p>
          <button
            type="button"
            onClick={reset}
            style={{ background: '#0a7d58', color: '#fff', border: 0, borderRadius: '9999px', padding: '0.625rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', marginRight: '0.75rem' }}
          >
            Try again
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ background: 'transparent', color: '#0a7d58', border: '1px solid rgba(13,155,110,0.4)', borderRadius: '9999px', padding: '0.625rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Reload page
          </button>
        </div>
      </body>
    </html>
  );
}
