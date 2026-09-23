import { NextResponse } from 'next/server';
import { indicators } from '@/data/indicators';

export async function GET() {
  const sensorEndpoints = indicators
    .filter((ind) => ind.sensor_health_indicator)
    .map((ind) => ({
      id: ind.id,
      name: ind.name,
      sensorParameters: ind.sensor_parameters || [],
      ogcEndpoint: `https://ogc.example.org/sensorthings/v1.1/Datastreams?$filter=name eq '${ind.ogc_sensorthings_model?.datastreamName || ind.id}'`,
      watermlConcept: ind.waterml_concept,
      epaStoretParameter: ind.epa_storet_parameter,
      thresholds: Object.entries(ind.states || {}).reduce(
        (acc, [state, data]) => {
          if (data.sensor_thresholds) {
            acc[state] = data.sensor_thresholds;
          }
          return acc;
        },
        {} as Record<string, Record<string, number>>
      ),
    }));

  return NextResponse.json({
    endpoints: sensorEndpoints,
    protocol: 'OGC SensorThings API v1.1',
    waterml_version: '2.0',
    data_standard: 'ISO 19156 Observations and Measurements',
    update_interval_seconds: 30,
  });
}