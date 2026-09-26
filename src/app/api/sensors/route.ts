import { NextResponse } from 'next/server';
import { indicators } from '@/data/indicators';

export async function GET() {
  const sensorEndpoints = indicators
    .filter((ind) => ind.is_lab_only === false)
    .map((ind) => ({
      id: ind.id,
      name: ind.name,
      code: ind.code,
      category: ind.category,
      states: ind.states,
      citation: ind.citation,
    }));

  return NextResponse.json({
    endpoints: sensorEndpoints,
    protocol: 'OGC SensorThings API v1.1',
    watermlVersion: '2.0',
    updateIntervalSeconds: 30,
  });
}
