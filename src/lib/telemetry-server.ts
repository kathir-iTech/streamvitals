import { z } from 'zod';
import { createRateLimit } from './rate-limit';

// Server-side half of client telemetry: validation, per-IP budget, one JSON
// log line. Kept out of app/ so the route module only exports route handlers
// (Next's generated route types reject any other export).
export const limitTelemetry = createRateLimit(30, 60000);

const errorPayload = z.object({
  type: z.literal('error'),
  source: z.enum(['error-boundary', 'window', 'rejection']),
  message: z.string().min(1).max(600),
  stack: z.string().max(2500).optional(),
  url: z.string().max(400),
  at: z.string().max(40),
});

const vitalPayload = z.object({
  type: z.literal('vital'),
  name: z.enum(['LCP', 'CLS']),
  value: z.number().finite(),
  url: z.string().max(400),
  at: z.string().max(40),
});

const payload = z.discriminatedUnion('type', [errorPayload, vitalPayload]);

export interface TelemetryResult {
  status: number;
  logged: string | null;
}

export function processTelemetry(body: unknown, ip: string): TelemetryResult {
  const parsed = payload.safeParse(body);
  if (!parsed.success) return { status: 400, logged: null };
  if (!limitTelemetry(`telemetry:${ip}`)) return { status: 200, logged: null };
  const line = JSON.stringify(parsed.data);
  console.error(`[telemetry] ${line}`);
  return { status: 200, logged: line };
}
