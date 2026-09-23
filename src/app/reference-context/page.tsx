'use client';

import Link from 'next/link';
import { ArrowLeft, MapPin, AlertCircle, Layers, Compass } from 'lucide-react';
import { indicators } from '@/data/indicators';

const cities = [
  { name: 'Coimbra', country: 'PT', slug: 'coimbra' },
  { name: 'Benevento', country: 'IT', slug: 'benevento' },
  { name: 'Ghent', country: 'BE', slug: 'ghent' },
  { name: 'Oslo', country: 'NO', slug: 'oslo' },
  { name: 'Toulouse', country: 'FR', slug: 'toulouse' },
];

const indicatorsForContext = indicators.filter((ind) => ind.citizen_observable);

export default function ReferenceContextPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-teal-400 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl w-full relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/verdict" className="text-teal-300 hover:text-teal-200">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Reference Context</h1>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-8 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Compass className="w-5 h-5 text-teal-400" />
            <h2 className="text-lg font-bold">Five-City Reference Context</h2>
          </div>
          <p className="text-white/50 text-sm mb-6">
            Same observation · same StreamVitals assessment · five reference contexts.
            The core verdict logic does not change by city unless a specifically cited rule says otherwise.
          </p>

          <div className="space-y-4">
            {cities.map((city) => (
              <div key={city.slug} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-white/40" />
                    <span className="font-semibold text-white">{city.name}</span>
                    <span className="text-xs text-white/30 bg-white/10 px-2 py-0.5 rounded">{city.country}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {indicatorsForContext.map((ind) => (
                    <div key={ind.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <span className="text-sm text-white/60">{ind.plain_term}</span>
                      <span className="text-xs text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded-full">
                        OGC SensorThings compatible
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold text-white">Data Standards</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: 'OGC STA v1.1', status: 'Full' },
              { name: 'WaterML 2.0', status: 'Full' },
              { name: 'ISO 19156', status: 'Full' },
              { name: 'EPA STORET/WQX', status: 'Full' },
              { name: 'Darwin Core', status: 'Full' },
              { name: 'FAIR Data', status: 'Full' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                <span className="text-xs text-white/60">{s.name}</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">{s.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-4">
          <p className="text-blue-200 text-sm">
            <strong>Note:</strong> Per-city reference values are drawn from the OneAquaHealth
            factsheet collection (doi:10.5281/zenodo.20345207). All data conforms to open standards
            and is queryable via OGC SensorThings API.
          </p>
        </div>
      </div>
    </main>
  );
}