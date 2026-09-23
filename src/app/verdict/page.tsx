'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Clock, AlertCircle, ChevronDown, ChevronRight, BookOpen, Search, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { indicators } from '@/data/indicators';
import { assess, ObservationField } from '@/lib/adjudicator';

export default function VerdictPage() {
  const [expandedDriver, setExpandedDriver] = useState<string | null>(null);
  const [tier, setTier] = useState<ReturnType<typeof assess>['tier']>('T3_FURTHER_ASSESSMENT_RECOMMENDED');
  const [dataStatus, setDataStatus] = useState('PARTIAL');
  const [assessed, setAssessed] = useState(3);
  const [notApplicable, setNotApplicable] = useState(1);
  const [requireProfessional, setRequireProfessional] = useState(2);
  const [drivers, setDrivers] = useState<ReturnType<typeof assess>['drivers']>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dataParam = params.get('data');
    if (dataParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(dataParam));
        const { confirmedFields, uncertainFields, answers } = parsed;
        const citizenIndicators = indicators.filter((ind) => ind.citizen_observable);
        const observations: ObservationField[] = citizenIndicators
          .filter((ind) => answers[ind.id])
          .map((ind) => ({
            indicatorId: ind.id,
            state: answers[ind.id] as 'diverse_sensitive' | 'tolerant_only' | 'absent_or_dead',
            confirmed: !!confirmedFields[ind.id],
            confidence: uncertainFields[ind.id] ? 'uncertain' : 'high',
          }));
        const result = assess(observations);
        setTier(result.tier);
        setDataStatus(result.dataStatus);
        setAssessed(result.evidenceCoverage.assessed);
        setNotApplicable(result.evidenceCoverage.notApplicable);
        setRequireProfessional(result.evidenceCoverage.requireProfessionalMeasurement);
        setDrivers(result.drivers);
      } catch {
        setTier('T3_FURTHER_ASSESSMENT_RECOMMENDED');
      }
    }
  }, []);

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

  const citizenIndicators = indicators.filter((ind) => ind.citizen_observable);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/confirm" className="text-teal-600 hover:text-teal-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Assessment Result</h1>
        </div>

        <div className={`p-6 rounded-2xl border-2 ${tierColors[tier]} mb-6`}>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6" />
            <span className="text-sm font-medium opacity-75">Assessment Tier</span>
          </div>
          <div className="text-3xl font-bold mb-1">{tierLabels[tier]}</div>
          <p className="text-sm opacity-75">
            Produced by the deterministic evidence engine using cited rules from OneAquaHealth Factsheets.
            This is not a diagnosis.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="text-xs text-slate-500 mb-1">Data Status</div>
            <div className="font-bold text-slate-800">{dataStatus}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="text-xs text-slate-500 mb-1">Evidence Coverage</div>
            <div className="font-bold text-slate-800 text-sm">
              {assessed} assessed
            </div>
            <div className="text-xs text-slate-500">
              {notApplicable} not applicable, {requireProfessional} require professional measurement
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="text-xs text-slate-500 mb-1">Rules Applied</div>
            <div className="font-bold text-slate-800">{drivers.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold text-slate-800">Rule Inspector</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Click each rule to see the full chain: observation → indicator → rule → source citation → One Health text.
          </p>
          <div className="space-y-3">
            {drivers.map((driver) => (
              <div key={driver.ruleId} className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedDriver(expandedDriver === driver.ruleId ? null : driver.ruleId)}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {expandedDriver === driver.ruleId ? (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    )}
                    <div>
                      <div className="font-medium text-slate-800 text-sm">{driver.ruleName}</div>
                      <div className="text-xs text-slate-400">{driver.indicatorName}</div>
                    </div>
                  </div>
                </button>
                {expandedDriver === driver.ruleId && (
                  <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <BookOpen className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-slate-700">Source Citation:</span>
                        <span className="text-slate-500 ml-1">{driver.source}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Shield className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-slate-700">One Health Message:</span>
                        <span className="text-slate-500 ml-1">{driver.oneHealthMessage}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Clock className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-slate-700">Rule ID:</span>
                        <span className="text-slate-500 ml-1 font-mono text-xs">{driver.ruleId}</span>
                      </div>
                    </div>
                  </div>
                )}
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

        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-teal-800">
            <strong>AI may interpret input. AI may not adjudicate.</strong> The deterministic evidence
            engine evaluates confirmed observations against real, cited rules from the OneAquaHealth
            Health Assessment Framework. No AI model is involved in the assessment decision.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/confirm"
            className="flex-1 py-3 bg-white border border-teal-600 text-teal-600 rounded-xl font-semibold text-center hover:bg-teal-50 transition-colors"
          >
            Retake Assessment
          </Link>
          <Link
            href="/reference-context"
            className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-semibold text-center hover:bg-teal-700 transition-colors"
          >
            View Reference Context
          </Link>
        </div>
      </div>
    </div>
  );
}
