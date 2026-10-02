import { NextResponse } from 'next/server';
import { processTelemetry } from '@/lib/telemetry-server';

export async function POST(request: Request) {
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }
  const ip = (request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  const { status, logged } = processTelemetry(body, ip);
  return NextResponse.json({ ok: status === 200, dropped: status === 200 && logged === null }, { status });
}
