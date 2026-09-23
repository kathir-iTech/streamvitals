'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { indicators } from '@/data/indicators';

export default function ConfirmPage() {
  const [confirmedFields, setConfirmedFields] = useState<Record<string, boolean>>({});
  const [uncertainFields, setUncertainFields] = useState<Record<string, boolean>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const citizenIndicators = indicators.filter((ind) => ind.citizen_observable);

  useEffect(() => {
    const stored = sessionStorage.getItem('streamvitals_answers');
    if (stored) {
      try {
        setAnswers(JSON.parse(stored));
      } catch {
        setError('Failed to load your answers. Please start over.');
      }
    }
  }, []);

  useEffect(() => {
    const defaults: Record<string, boolean> = {};
    const conf: Record<string, boolean> = {};
    const unc: Record<string, boolean> = {};
    for (const ind of citizenIndicators) {
      defaults[ind.id] = !!answers[ind.id];
      conf[ind.id] = !!answers[ind.id];
      unc[ind.id] = false;
    }
    setConfirmedFields(conf);
    setUncertainFields(unc);
  }, [answers, citizenIndicators]);

  const toggleConfirm = (id: string) => {
    setConfirmedFields((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleUncertain = (id: string) => {
    setUncertainFields((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const allConfirmed = citizenIndicators.every((ind) => confirmedFields[ind.id]);

  const handleProceed = () => {
    if (!allConfirmed) return;
    try {
      const confirmData = JSON.stringify({ confirmedFields, uncertainFields, answers });
      sessionStorage.setItem('streamvitals_confirm', confirmData);
      setError(null);
      window.location.href = '/verdict';
    } catch (e) {
      setError('Something went wrong saving your answers. Please try again.');
    }
  };

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 text-white flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-10 left-20 w-64 h-64 bg-red-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-orange-500 rounded-full blur-3xl" />
        </div>
        <div className="max-w-lg w-full bg-white/10 backdrop-blur-xl rounded-3xl p-10 text-center border border-white/20 relative z-10">
          <p className="text-red-300 text-sm font-medium mb-2">Something went wrong</p>
          <p className="text-white/70 mb-6">{error}</p>
          <button onClick={() => window.location.href = '/guided'} className="w-full py-3 bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">
            Start Over
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-10 left-20 w-64 h-64 bg-teal-400 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-lg w-full relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Confirm Your Observations</h1>
          <p className="text-white/60 text-sm">Review each field before proceeding.</p>
        </div>

        <div className="space-y-3 mb-6">
          {citizenIndicators.map((ind) => (
            <div
              key={ind.id}
              className={`bg-white/10 backdrop-blur-xl rounded-2xl border transition-all duration-300 ${
                confirmedFields[ind.id]
                  ? 'border-emerald-400/40 bg-emerald-500/10'
                  : 'border-white/15 bg-white/5'
              }`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{ind.name}</h3>
                    <p className="text-white/50 text-sm">{ind.plain_term}</p>
                  </div>
                  <button
                    onClick={() => toggleConfirm(ind.id)}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      confirmedFields[ind.id]
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-white/30'
                    }`}
                  >
                    {confirmedFields[ind.id] && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-white/40">Answer:</span>
                  <span className="text-sm text-white/80 font-medium">
                    {ind.citizen_state_labels && answers[ind.id]
                      ? ind.citizen_state_labels[answers[ind.id]] || answers[ind.id]
                      : answers[ind.id] || 'Not answered'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-white/40">Confidence:</span>
                  {(['high', 'uncertain'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => toggleUncertain(ind.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        uncertainFields[ind.id] === (level === 'uncertain')
                          ? 'bg-white/20 text-white'
                          : 'text-white/30'
                      }`}
                    >
                      {level === 'high' ? 'High' : 'Uncertain'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleProceed}
          disabled={!allConfirmed}
          className={`w-full py-4 rounded-2xl font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 focus:ring-2 focus:ring-teal-400 focus:outline-none ${
            allConfirmed
              ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/20 hover:opacity-90'
              : 'bg-white/10 border border-white/15 text-white/40'
          }`}
          aria-label="Proceed to assessment"
        >
          Proceed to Assessment <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </main>
  );
}
