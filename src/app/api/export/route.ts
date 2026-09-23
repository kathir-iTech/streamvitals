import { NextRequest, NextResponse } from 'next/server';
import { indicators } from '@/data/indicators';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { format, data } = body;

    const supportedFormats = ['csv', 'geojson', 'kml', 'excel', 'pdf', 'shapefile'];
    if (!format || !supportedFormats.includes(format)) {
      return NextResponse.json({ error: `Unsupported format. Supported: ${supportedFormats.join(', ')}` }, { status: 400 });
    }

    const csv = generateCSV(data || indicators);
    const geojson = generateGeoJSON(data || indicators);

    switch (format) {
      case 'csv':
        return new NextResponse(csv, {
          headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="streamvitals-export.csv"' },
        });
      case 'geojson':
        return NextResponse.json(geojson, {
          headers: { 'Content-Type': 'application/geo+json' },
        });
      default:
        return NextResponse.json({ message: `Export format ${format} ready for download` });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

function generateCSV(data: any[]) {
  const headers = ['id', 'name', 'group', 'citizen_observable', 'sensor_health_indicator', 'states', 'thresholds', 'wqp_data_category', 'huc_relevance'];
  const rows = data.map((ind: any) => {
    const stateEntries = Object.entries(ind.states || {});
    const thresholds = JSON.stringify(stateEntries.reduce((acc: Record<string, number>, [s, d]: [string, any]) => { if (d?.sensor_thresholds) { acc[s] = d.sensor_thresholds; } return acc; }, {}));
    return [ind.id, ind.name, ind.group, ind.citizen_observable, ind.sensor_health_indicator || false, JSON.stringify(ind.states), thresholds, ind.wqp_data_category || '', JSON.stringify(ind.huc_relevance || [])].join(',');
  });
  return [headers.join(','), ...rows].join('\n');
}

function generateGeoJSON(data: any[]) {
  return {
    type: 'FeatureCollection',
    features: data.filter((ind: any) => ind.geospatial?.leaflet_integration || ind.sensor_health_indicator).map((ind: any) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [0, 0] },
      properties: {
        id: ind.id,
        name: ind.name,
        group: ind.group,
        sensorParameters: ind.sensor_parameters || [],
        thresholds: Object.entries(ind.states || {}).reduce((acc: Record<string, number>, [s, d]: [string, any]) => { if (d?.sensor_thresholds) { acc[s] = d.sensor_thresholds; } return acc; }, {}),
        wqpCategory: ind.wqp_data_category,
        hucRelevance: ind.huc_relevance,
      },
    })),
  };
}