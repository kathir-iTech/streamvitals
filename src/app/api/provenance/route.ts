import { NextResponse } from 'next/server';
import { buildProvenanceManifest } from '@/lib/provenance';

export async function GET() {
  const manifest = buildProvenanceManifest();
  return NextResponse.json(manifest);
}
