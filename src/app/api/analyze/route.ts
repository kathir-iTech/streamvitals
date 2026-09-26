import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { observations } = body;

    if (!observations || !Array.isArray(observations)) {
      return NextResponse.json({ error: 'Observations array required' }, { status: 400 });
    }

    const validatedCount = observations.filter((o: any) => o.selectedState).length;

    return NextResponse.json({
      observationCount: observations.length,
      validatedCount,
      dataStatus:
        validatedCount >= observations.length
          ? 'SUFFICIENT'
          : validatedCount >= Math.ceil(observations.length / 2)
            ? 'PARTIAL'
            : 'INSUFFICIENT',
      note: 'This is field data collection only. No diagnostic assessment or tier assignment.',
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
