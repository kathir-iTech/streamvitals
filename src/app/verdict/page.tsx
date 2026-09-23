'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Clock, AlertCircle, ChevronDown, ChevronRight, BookOpen, Search, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { indicators } from '@/data/indicators';
import { assess, ObservationField } from '@/lib/adjudicator';

const tierConfig = {
  T1_NO_PRIORITY_CONCERN: {
    gradient: 'from-emerald-400 to-teal-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-400/30',
    text: 'text-emerald-200',
    glow: 'shadow-emerald-500/20',
  },
  T2_NEEDS_ATTENTION: {
    gradient: 'from-amber-400 to-yellow-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-400/30',
    text: 'text-amber-200',
    glow: 'shadow-amber-500/20',
  },
  T3_FURTHER_ASSESSMENT_RECOMMENDED: {
    gradient: 'from-red-400 to-orange-500',
    bg: 'bg-red-500/10',
    border: 'border-red-400/30',
    text: 'text-red-200',
    glow: 'shadow-red-500/20',
  },
};

export default function VerdictPage() {
  const [expandedDriver, setExpandedDriver] = useState<string | null>(null);
  const [tier, setTier] = useState<ReturnType<typeof assess>['tier']>('T3_FURTHER_ASSESSMENT_RECOMMENDED');
  const [dataStatus, setDataStatus] = useState('PARTIAL');
  const [assessed, setAssessed] = useState(3);
  const [notApplicable, setNotApplicable] = useState(1);
  const [requireProfessional, setRequireProfessional] = useState(2);
  const [drivers, setDrivers] = useState<ReturnType<typeof assess>['drivers']>([]);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const confirmData = sessionStorage.getItem('streamvitals_confirm');
    if (!confirmData) {
      setError('No assessment data found. Please complete the guided flow from the homepage.');
      return;
    }
    try {
      const parsed = JSON.parse(confirmData);
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
      if (observations.length === 0) {
        setError('No confirmed observations found. Please complete the guided flow.');
        return;
      }
      const result = assess(observations);
      setTier(result.tier);
      setDataStatus(result.dataStatus);
      setAssessed(result.evidenceCoverage.assessed);
      setNotApplicable(result.evidenceCoverage.notApplicable);
      setRequireProfessional(result.evidenceCoverage.requireProfessionalMeasurement);
      setDrivers(result.drivers);
      setError(null);
      setTimeout(() => setRevealed(true), 100);
    } catch {
      setError('Failed to process your assessment. Please try again.');
    }
  }, []);

  const config = tierConfig[tier];

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 text-white flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-10 left-20 w-64 h-64 bg-red-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-orange-500 rounded-full blur-3xl" />
        </div>
        <div className="max-w-lg w-full bg-white/10 backdrop-blur-xl rounded-3xl p-10 text-center border border-white/20 relative z-10">
          <AlertTriangle className="w-12 h-12 text-red-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-white/70 mb-6">{error}</p>
          <div className="flex gap-3">
            <button onClick={() => window.location.href = '/guided'} className="flex-1 py-3 bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">
              Start Over
            </button>
            <button onClick={() => window.location.href = '/confirm'} className="flex-1 py-3 bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">
              Go Back
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-10 left-20 w-64 h-64 bg-teal-400 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-600 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="max-w-2xl w-full relative z-10">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Assessment Result</h1>
        </div>

        <div className={`relative overflow-hidden rounded-3xl border ${config.border} ${config.bg} backdrop-blur-xl p-8 mb-6 transition-all duration-700 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-10 pointer-events-none`} />
          <div className="relative text-center">
            <p className={`text-sm font-medium uppercase tracking-wider ${config.text} mb-2`}>Assessment Tier</p>
            <div className={`text-4xl font-black bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent mb-3`}>
              {tier.replace('T3_', '').replace('T2_', '').replace('T1_', '').replace(/_/g, ' ')}
            </div>
            <p className="text-white/60 text-sm">Produced by the deterministic evidence engine using cited rules from OneAquaHealth Factsheets. This is not a diagnosis.</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Data Status', value: dataStatus, style: dataStatus === 'SUFFICIENT' ? 'text-emerald-200' : dataStatus === 'PARTIAL' ? 'text-amber-200' : 'text-red-200' },
            { label: 'Evidence', value: `${assessed} assessed`, style: 'text-teal-200' },
            { label: 'Rules Applied', value: `${drivers.length}`, style: 'text-teal-200' },
          ].map((card, i) => (
            <div key={i} className={`bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-5 transition-all duration-700 delay-${i * 100} ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <p className="text-white/50 text-xs uppercase tracking-wider mb-1">{card.label}</p>
              <p className={`text-2xl font-bold ${card.style}`}>{card.value}</p>
            </div>
          ))}
        </div>

        <div className={`bg-white/10 backdrop-blur-xl rounded-3xl border border-white/15 p-6 mb-6 transition-all duration-700 delay-200 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-teal-400" />
            <h2 className="text-lg font-bold">Rule Inspector</h2>
          </div>
          <p className="text-white/50 text-sm mb-4">Click each rule to see the full chain: observation → indicator → rule → source citation → One Health text.</p>
          <div className="space-y-3">
            {drivers.map((driver) => (
              <div key={driver.ruleId} className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
                <button
                  onClick={() => setExpandedDriver(expandedDriver === driver.ruleId ? null : driver.ruleId)}
                  className="w-full p-4 flex items-center justify-between hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {expandedDriver === driver.ruleId ? (
                      <ChevronDown className="w-4 h-4 text-teal-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-teal-400/50" />
                    )}
                    <div>
                      <div className="font-medium text-white text-sm">{driver.ruleName}</div>
                      <div className="text-xs text-white/40">{driver.indicatorName}</div>
                    </div>
                  </div>
                </button>
                {expandedDriver === driver.ruleId && (
                  <div className="px-4 pb-4 border-t border-white/10 pt-3 space-y-3">
                    <div className="flex items-start gap-2 text-sm">
                      <BookOpen className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-white/80">Source Citation:</span>
                        <span className="text-white/40 ml-1">{driver.source || 'See OneAquaHealth Factsheets'}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Shield className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-white/80">One Health Message:</span>
                        <span className="text-white/40 ml-1">{driver.oneHealthMessage}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Clock className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-white/80">Rule ID:</span>
                        <span className="text-white/40 ml-1 font-mono text-xs">{driver.ruleId}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-orange-500/10 border border-orange-400/20 rounded-2xl p-5 mb-6 backdrop-blur-xl transition-all duration-700 delay-300">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-200 text-sm">This is not a diagnosis</h3>
              <p className="text-orange-300/80 text-sm mt-1">StreamVitals produces a triage tier, not a diagnosis. The tier indicates the level of further assessment recommended for the urban stream.</p>
            </div>
          </div>
        </div>

        <div className="bg-teal-500/10 border border-teal-400/20 rounded-2xl p-5 mb-8 backdrop-blur-xl transition-all duration-700 delay-300">
          <p className="text-teal-200 text-sm">
            <strong>AI may interpret input. AI may not adjudicate.</strong> The deterministic evidence engine evaluates confirmed observations against real, cited rules from the OneAquaHealth Health Assessment Framework. No AI model is involved in the assessment decision.
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={() => window.location.href = '/confirm'} className="flex-1 py-4 bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded-2xl font-semibold hover:bg-white/20 transition-all focus:ring-2 focus:ring-teal-400 focus:outline-none">
            Retake Assessment
          </button>
          <button onClick={() => window.location.href = '/reference-context'} className="flex-1 py-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-2xl font-semibold hover:opacity-90 transition-all focus:ring-2 focus:ring-teal-400 focus:outline-none shadow-lg shadow-teal-500/20">
            View Reference Context
          </button>
        </div>
      </div>
    </main>
  );
}
