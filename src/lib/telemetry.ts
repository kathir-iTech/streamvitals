// Privacy-conscious client telemetry: errors and two layout metrics POSTed to
// /api/client-errors, which rate-limits them and writes one JSON line to the
// serverless logs (Vercel dashboard). No cookies, no third-party service, no
// session content — only message, stack, and URL. Fire-and-forget by contract:
// reporting can never break the app, and duplicate errors are deduped.

const ENDPOINT = '/api/client-errors';
const seen = new Set<string>();

function trim(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

async function send(payload: Record<string, unknown>): Promise<void> {
  try {
    await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Telemetry failures are silent by design.
  }
}

export function reportClientError(source: 'error-boundary' | 'window' | 'rejection', error: unknown): void {
  const message = trim(error instanceof Error ? `${error.name}: ${error.message}` : String(error), 400);
  const key = `${source}:${message}`;
  if (seen.has(key)) return;
  seen.add(key);
  if (seen.size > 50) seen.clear();
  const stack = error instanceof Error ? trim(error.stack || '', 2000) : undefined;
  void send({
    type: 'error',
    source,
    message,
    ...(stack ? { stack } : {}),
    url: trim(window.location.href, 300),
    at: new Date().toISOString(),
  });
}

export function reportVital(name: 'LCP' | 'CLS', value: number): void {
  void send({
    type: 'vital',
    name,
    value: Math.round(value * 1000) / 1000,
    url: trim(window.location.href, 300),
    at: new Date().toISOString(),
  });
}
