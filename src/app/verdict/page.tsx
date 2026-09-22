'use client';

import { ArrowLeft, Shield, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { indicators } from '@/data/indicators.json';

export default function VerdictPage() {
  const citizenIndicators = indicators.filter((ind) => ind.citizen_observable);

  // Simulated assessment - the real one comes from the deterministic evidence engine
  const tier = 'T3_FURTHER_ASSESSMENT_RECOMMENDED';
  const dataStatus = 'PARTIAL';
  const assessed = 3;
  const requireProfessional = 2;

  const tierColors = {
    T1_NO_PRIORITY_CONCERN: 'bg-green-100 text-green-800 border-green-200',
    T2_NEEDS_ATTENTION: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    T3_FURTHER_ASSESSMENT_RECOMMENDED: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  const tierLabels = {
    T1_NO_PRIORITY_CONCERN: 'No Priority Concern Detected',
    T2_NEEDS_ATTENTION: 'Needs Attention',
    T3_FURTHER_ASSESSMENT_RECOMMENDED: 'Further Assessment Recommended',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/confirm" className="text-teal-600 hover:text-teal-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Assessment Result</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-teal-600" />
            <h2 className="text-lg font-bold text-slate-800">Deterministic Evidence Engine</h2>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            AI may interpret input. AI may not adjudicate. This assessment is produced by a fully
            deterministic rule-based engine using cited rules from the OneAquaHealth Factsheets.
          </p>

          <div className={`p-6 rounded-xl border-2 ${tierColors[tier]} mb-6`}>
            <div className="text-sm font-medium opacity-75">Assessment Tier</div>
            <div className="text-2xl font-bold">{tierLabels[tier]}</div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="text-sm text-slate-500">Data Status</div>
              <div className="font-semibold text-slate-800">{dataStatus}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="text-sm text-slate-500">Evidence Coverage</div>
              <div className="font-semibold text-slate-800">
                {assessed} assessed, {requireProfessional} require professional measurement
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-slate-800">Evidence Drivers</h3>
            {citizenIndicators.slice(0, 3).map((ind) => (
              <div key={ind.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-teal-500" />
                <div>
                  <div className="text-sm font-medium text-slate-800">{ind.name}</div>
                  <div className="text-xs text-slate-500">
                    Rule: {ind.framework_basis.citation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-800 text-sm">This is not a diagnosis</h3>
              <p className="text-sm text-orange-700">
                StreamVitals produces a triage tier, not a diagnosis. The tier indicates the level
                of further assessment recommended for the urban stream.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/guided"
            className="flex-1 py-3 bg-white border border-teal-600 text-teal-600 rounded-xl font-semibold text-center hover:bg-teal-50 transition-colors"
          >
            Retake Assessment
          </Link>
          <Link
            href="/about"
            className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-semibold text-center hover:bg-teal-700 transition-colors"
          >
            How It Works
          </Link>
        </div>
      </div>
    </div>
  );
}
