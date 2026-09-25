'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { ArrowLeft, ArrowRight, Check, Shield } from 'lucide-react';
import { indicators } from '@/data/indicators';
import { getSession, updateSession } from '@/lib/field-session';
import BoundedAssistant from '@/components/BoundedAssistant';
import RiverProgress from '@/components/RiverProgress';
import PhotoCapture from '@/components/PhotoCapture';

const FIELD_INDICATORS = ['BMI-01', 'BIR-04', 'INV-11', 'FCL-06', 'DIA-10'];

export default function IndicatorPage({ params }: { params: Promise<{ indicator: string }> }) {
  const { indicator: indicatorId } = use(params);
  const indicator = indicators.find((i) => i.id === indicatorId);
  const currentIndex = FIELD_INDICATORS.indexOf(indicatorId);
  const isLabOnly = indicator?.lab_only || false;
  const isCitizen = indicator?.citizen_observable || false;

  const [session, setSession] = useState<{ sessionId: string; indicators: any[] } | null>(null);
  const [selectedState, setSelectedState] = useState<string>('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const sessionId = sessionStorage.getItem('current_session_id');
    if (sessionId) {
      getSession(sessionId).then((s) => {
        if (s) {
          setSession(s);
          const indRecord = s.indicators.find((i: any) => i.indicatorId === indicatorId);
          if (indRecord) {
            setSelectedState(indRecord.state || '');
            setNotes(indRecord.notes || '');
            setPhotos(indRecord.photos || []);
          }
        }
      });
    }
  }, [indicatorId]);

  if (!indicator) {
    return (
      <main className="min-h-screen bg-[#070d1a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Indicator not found</h1>
          <button onClick={() => window.location.href = '/field'} className="btn-primary">Return to Field Companion</button>
        </div>
      </main>
    );
  }

  const stateLabels = indicator.citizen_state_labels || {};
  const stateKeys = Object.keys(indicator.states || {});

  return (
    <main className="min-h-screen bg-[#070d1a] relative overflow-hidden">
      <RiverProgress
        currentIndex={currentIndex}
        total={FIELD_INDICATORS.length}
        indicatorIds={FIELD_INDICATORS}
        completedIds={session?.indicators.filter((i: any) => i.state).map((i: any) => i.indicatorId) || []}
        labOnlyIds={FIELD_INDICATORS.filter((id) => indicators.find((ind) => ind.id === id)?.lab_only) || []}
      />
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        <div className="flex-1 flex flex-col items-center justify-start p-4 lg:p-8">
          <div className="max-w-xl w-full">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-bold uppercase tracking-wider">
                {indicator.id}
              </span>
              {isLabOnly && (
                <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/20 text-amber-300 text-sm font-bold">
                  Pending Lab Analysis
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black tracking-tighter mb-2 text-white">{indicator.name}</h1>
            <p className="text-white/50 text-lg mb-6">{indicator.citizen_question}</p>
            <div className="bg-[#111d35] border border-emerald-500/15 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-3 mb-4">
                <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-emerald-300">Visual Anchor</p>
                  <p className="text-sm text-white/60 mt-1">{indicator.visual_anchor_guide}</p>
                </div>
              </div>
              {isLabOnly && (
                <div className="mt-4 bg-amber-500/5 border border-amber-400/15 rounded-xl p-4">
                  <p className="text-amber-300 text-sm font-medium mb-2">Laboratory Protocol Required</p>
                  <p className="text-amber-200/80 text-sm leading-relaxed">{indicator.visual_anchor_guide}</p>
                  <p className="text-amber-300/60 text-sm mt-3">This requires laboratory analysis. You cannot determine the result in the field.</p>
                </div>
              )}
              {isCitizen && stateKeys.length > 0 && (
                <fieldset className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3" aria-label="Select your observation">
                  {stateKeys.map((state, i) => {
                    const label = stateLabels[state] || state.replace(/_/g, ' ');
                    const isSelected = selectedState === state;
                    return (
                      <button
                        key={state}
                        type="button"
                        onClick={() => {
                          setSelectedState(state);
                          if (session) {
                            const updatedIndicators = session.indicators.map((i: any) =>
                              i.indicatorId === indicatorId ? { ...i, state, timestamp: new Date().toISOString() } : i
                            );
                            updateSession(session.sessionId, { indicators: updatedIndicators });
                          }
                        }}
                        className={`relative px-4 py-4 rounded-xl border-2 font-bold text-sm transition-all duration-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-400 scale-[1.02] shadow-lg shadow-emerald-500/20'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/25 hover:scale-[1.02]'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none flex items-center justify-center">
                            <Check className="w-5 h-5 text-emerald-400" />
                          </div>
                        )}
                        <div className={`text-xs font-black mb-1 uppercase tracking-wider ${isSelected ? 'text-emerald-300' : 'text-white/30'}`}>
                          {label}
                        </div>
                      </button>
                    );
                  })}
                </fieldset>
              )}
              {isCitizen && (
                <div className="mt-6 space-y-4">
                  <PhotoCapture sessionId={session?.sessionId || ''} indicatorId={indicatorId} />
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5" htmlFor={`notes-${indicatorId}`}>Field Notes</label>
                    <textarea
                      id={`notes-${indicatorId}`}
                      value={notes}
                      onChange={(e) => {
                        setNotes(e.target.value);
                        if (session) {
                          const updatedIndicators = session.indicators.map((i: any) =>
                            i.indicatorId === indicatorId ? { ...i, notes: e.target.value } : i
                          );
                          updateSession(session.sessionId, { indicators: updatedIndicators });
                        }
                      }}
                      placeholder="Optional observations, weather conditions, equipment used..."
                      rows={3}
                      className="w-full p-3.5 bg-[#070d1a] border border-emerald-500/15 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (currentIndex > 0) window.location.href = `/field/${FIELD_INDICATORS[currentIndex - 1]}`;
                }}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-6 py-3 bg-[#111d35] border border-emerald-500/20 text-white rounded-xl font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-500/10 hover:border-emerald-400/40 transition-all focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                aria-label="Previous indicator"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
              <button
                onClick={() => {
                  if (currentIndex < FIELD_INDICATORS.length - 1) {
                    window.location.href = `/field/${FIELD_INDICATORS[currentIndex + 1]}`;
                  } else {
                    window.location.href = '/field/review';
                  }
                }}
                disabled={!isCitizen || (!selectedState && !isLabOnly)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {currentIndex === FIELD_INDICATORS.length - 1 ? 'Review Session' : 'Next Indicator'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="lg:w-72 border-l border-emerald-500/10 lg:block hidden">
          <BoundedAssistant indicatorId={indicatorId} />
        </div>
      </div>
    </main>
  );
}
