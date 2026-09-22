'use client';

import { useState } from 'react';
import { CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { indicators } from '@/data/indicators.json';

export default function ConfirmPage() {
  const [confirmedFields, setConfirmedFields] = useState<Record<string, boolean>>({});
  const [uncertainFields, setUncertainFields] = useState<Record<string, boolean>>({});

  const citizenIndicators = indicators.filter((ind) => ind.citizen_observable);

  const toggleConfirm = (id: string) => {
    setConfirmedFields((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleUncertain = (id: string) => {
    setUncertainFields((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const allConfirmed = citizenIndicators.every((ind) => confirmedFields[ind.id]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/guided" className="text-teal-600 hover:text-teal-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Confirm Your Observations</h1>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          Review each field before proceeding. You must confirm all fields.
        </p>
        <div className="space-y-4 mb-6">
          {citizenIndicators.map((ind) => (
            <div
              key={ind.id}
              className={`p-4 rounded-xl border-2 ${
                confirmedFields[ind.id] ? 'border-teal-200 bg-teal-50' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-slate-800">{ind.name}</h3>
                  <p className="text-sm text-slate-500">{ind.plain_term}</p>
                </div>
                <button
                  onClick={() => toggleConfirm(ind.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    confirmedFields[ind.id]
                      ? 'bg-teal-600 border-teal-600 text-white'
                      : 'border-slate-300'
                  }`}
                >
                  {confirmedFields[ind.id] && <CheckCircle2 className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-slate-400">Confidence:</span>
                {(['high', 'uncertain'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => toggleUncertain(ind.id)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      uncertainFields[ind.id] === (level === 'uncertain')
                        ? 'bg-slate-200 text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {level === 'high' ? 'High' : 'Uncertain'}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Link
          href="/verdict"
          className={`w-full py-3 rounded-xl font-semibold text-center flex items-center justify-center gap-2 transition-colors ${
            allConfirmed
              ? 'bg-teal-600 text-white hover:bg-teal-700'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          Proceed to Assessment <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
