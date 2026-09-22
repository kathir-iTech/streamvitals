'use client';

import { Link } from 'next/link';
import { ArrowLeft, MapPin, AlertCircle } from 'lucide-react';
import { indicators } from '@/data/indicators.json';

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/verdict" className="text-teal-600 hover:text-teal-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Reference Context</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold text-slate-800">Five-City Reference Context</h2>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Same observation · same StreamVitals assessment · five reference contexts.
            The core verdict logic does not change by city unless a specifically cited rule says otherwise.
          </p>

          <div className="space-y-4">
            {cities.map((city) => (
              <div key={city.slug} className="border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-800">{city.name}</span>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {city.country}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {indicatorsForContext.map((ind) => (
                    <div key={ind.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">{ind.plain_term}</span>
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        Reference context not available
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                  <AlertCircle className="w-3 h-3" />
                  Per-city reference data from OneAquaHealth factsheets not available. See
                  <a href="https://apps.oneaquahealth.eu/resmap/" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                    OAH Resilience Map
                  </a>
                  .
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Per-city reference values are drawn from the OneAquaHealth
            factsheet collection (doi:10.5281/zenodo.20345207). The factsheets describe methodology
            and indicator definitions but do not publish quantitative per-city baseline values
            for citizen-observable indicators. The OAH Resilience Map (apps.oneaquahealth.eu/resmap/)
            is a client-side application and does not expose per-city data via a public API.
          </p>
        </div>
      </div>
    </div>
  );
}
