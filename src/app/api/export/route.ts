import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { format, data } = await request.json();
  const supportedFormats = ['csv', 'geojson', 'json'];

  if (!format || !supportedFormats.includes(format)) {
    return NextResponse.json(
      { error: `Unsupported format. Supported: ${supportedFormats.join(', ')}` },
      { status: 400 }
    );
  }

  if (format === 'json') {
    return NextResponse.json(data);
  }

  if (format === 'csv') {
    const headers = ['indicatorId', 'name', 'category', 'is_lab_only', 'selectedState', 'notes'];
    const rows = (data || []).map((d: any) =>
      [
        d.indicatorId || '',
        d.name || '',
        d.category || '',
        d.is_lab_only ? 'true' : 'false',
        d.selectedState || '',
        (d.notes || '').replace(/,/g, ';'),
      ].join(',')
    );
    return new NextResponse([headers.join(','), ...rows].join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="streamvitals-export.csv"',
      },
    });
  }

  return NextResponse.json({ message: `Export format ${format} ready` });
}
