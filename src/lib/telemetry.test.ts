import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { processTelemetry } from './telemetry-server';
import { POST } from '../../app/api/client-errors/route';
import { reportClientError, reportVital } from './telemetry';

const validError = {
  type: 'error' as const,
  source: 'window' as const,
  message: 'TypeError: boom',
  url: 'https://streamvitals.vercel.app/field/bmi-01',
  at: '2026-10-02T12:00:00.000Z',
};

const validVital = {
  type: 'vital' as const,
  name: 'LCP' as const,
  value: 123.456,
  url: 'https://streamvitals.vercel.app/',
  at: '2026-10-02T12:00:00.000Z',
};

describe('processTelemetry (server)', () => {
  let spy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    spy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it('accepts a valid error payload and logs one JSON line', () => {
    const r = processTelemetry(validError, '1.2.3.4');
    expect(r.status).toBe(200);
    expect(r.logged).toContain('TypeError: boom');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[telemetry]'));
  });

  it('accepts a valid vital payload', () => {
    const r = processTelemetry(validVital, '1.2.3.4');
    expect(r.status).toBe(200);
    expect(r.logged).toContain('LCP');
  });

  it('rejects payloads missing required fields', () => {
    expect(processTelemetry({ type: 'error', source: 'window' }, 'ip').status).toBe(400);
    expect(processTelemetry({ ...validError, message: '' }, 'ip').status).toBe(400);
    expect(processTelemetry({ ...validVital, name: 'FCP' }, 'ip').status).toBe(400);
    expect(processTelemetry({ ...validVital, value: Number.POSITIVE_INFINITY }, 'ip').status).toBe(400);
    expect(processTelemetry('not an object', 'ip').status).toBe(400);
    expect(spy).not.toHaveBeenCalled();
  });

  it('rejects oversized fields (client trims, server enforces)', () => {
    expect(processTelemetry({ ...validError, message: 'x'.repeat(601) }, 'ip').status).toBe(400);
    expect(processTelemetry({ ...validError, stack: 'x'.repeat(2501) }, 'ip').status).toBe(400);
    expect(processTelemetry({ ...validError, url: 'x'.repeat(401) }, 'ip').status).toBe(400);
  });

  it('rate-limits per IP: over budget is dropped with 200 and no log', () => {
    for (let i = 0; i < 30; i++) {
      expect(processTelemetry(validError, '9.9.9.9').status).toBe(200);
    }
    const dropped = processTelemetry(validError, '9.9.9.9');
    expect(dropped.status).toBe(200);
    expect(dropped.logged).toBeNull();
    expect(spy).toHaveBeenCalledTimes(30);
    // A different IP still gets through.
    expect(processTelemetry(validError, '8.8.8.8').logged).not.toBeNull();
  });
});

describe('POST route', () => {
  it('returns 400 for malformed JSON', async () => {
    const req = new Request('http://localhost/api/client-errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{broken',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 200 for a valid payload', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = new Request('http://localhost/api/client-errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '7.7.7.7' },
      body: JSON.stringify(validError),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; dropped: boolean };
    expect(body.ok).toBe(true);
    expect(body.dropped).toBe(false);
    spy.mockRestore();
  });
});

describe('reportClientError / reportVital (client)', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('never throws even when fetch rejects', () => {
    fetchMock.mockRejectedValue(new Error('network down'));
    expect(() => reportClientError('window', new Error('x'))).not.toThrow();
  });

  it('deduplicates identical errors (one report per unique message)', () => {
    reportClientError('window', new Error('unique-boom-1'));
    reportClientError('window', new Error('unique-boom-1'));
    reportClientError('window', new Error('unique-boom-2'));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('trims oversized messages before sending', () => {
    reportClientError('window', new Error('y'.repeat(5000)));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string) as { message: string };
    expect(body.message.length).toBeLessThanOrEqual(401); // 400 + ellipsis
  });

  it('sends vital metrics rounded to 3 decimals', () => {
    reportVital('CLS', 0.123456);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string) as { type: string; name: string; value: number };
    expect(body.type).toBe('vital');
    expect(body.name).toBe('CLS');
    expect(body.value).toBe(0.123);
  });
});
