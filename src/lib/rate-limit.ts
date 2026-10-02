// Sliding-window rate limiter for the assistant proxy. Keeps the paid Groq
// call behind a per-IP budget so the endpoint cannot be hammered as an open
// proxy. In-memory and per serverless instance: a best-effort cost guard, not
// a distributed quota (there is no datastore, and we do not pretend otherwise).
export function createRateLimit(limit: number, windowMs: number, now: () => number = Date.now) {
  const buckets = new Map<string, number[]>();
  return (key: string): boolean => {
    const timestamp = now();
    const recent = (buckets.get(key) || []).filter((t) => timestamp - t < windowMs);
    if (recent.length >= limit) {
      buckets.set(key, recent);
      return false;
    }
    recent.push(timestamp);
    buckets.set(key, recent);
    if (buckets.size > 10000) buckets.clear();
    return true;
  };
}
