'use client';

import { useState, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import Link from 'next/link';
import { indicators } from '@/data/indicators';
import WaterCanvas from '@/components/water-canvas';
import AmbientWave from '@/components/ambient-wave';
import FloatingOrb from '@/components/floating-orb';

function BugIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M12 8v4" />
      <path d="M9 12H7a4 4 0 000 8h2" />
      <path d="M15 12h2a4 4 0 000-8h-2" />
      <path d="M12 16v2" />
      <path d="M9 20h6" />
    </svg>
  );
}

function BirdIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
      <path d="M12 2C8 2 4 6 4 10c0 4 4 8 8 10s8-6 8-10c0-4-4-8-8-8z" />
    </svg>
  );
}

function LeafIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.5 2 7 0 2.8-2 5-4.5 6.5" />
      <path d="M11 20c0 0-2 1-3 3s-1 2-1 3c0 0 1-1 2-2s1-2 1-3" />
      <path d="M2 21c0-3 1.5-4 3-4s2 1 2 2c0 1-1 2-2 2" />
    </svg>
  );
}

const indicatorIcons: Record<string, React.ElementType> = {
  'BMI-01': BugIcon,
  'BIR-04': BirdIcon,
  'INV-11': LeafIcon,
};

const citizenIndicators = indicators.filter((ind) => ind.citizen_observable);

const answerColors: Record<string, string> = {
  diverse_sensitive: 'bg-emerald-500/15 border-emerald-400/40',
  tolerant_only: 'bg-amber-500/15 border-amber-400/40',
  absent_or_dead: 'bg-red-500/15 border-red-400/40',
};

const answerTextColors: Record<string, string> = {
  diverse_sensitive: 'text-emerald-200',
  tolerant_only: 'text-amber-200',
  absent_or_dead: 'text-red-200',
};

const answerMessages: Record<string, string> = {
  diverse_sensitive: "Good sign — sensitive species can't survive in polluted water. This matches the OneAquaHealth factsheet evidence.",
  tolerant_only: 'Moderate signal — tolerant species tolerate stress, but sensitive ones are absent. Further investigation recommended.',
  absent_or_dead: 'Concerning — no life detected or organisms dead. This indicates significant ecological stress.',
};

const stateLabels: Record<string, string> = {
  diverse_sensitive: 'THRIVING',
  tolerant_only: 'STRESSED',
  absent_or_dead: 'CRITICAL',
};

const stateColors: Record<string, string> = {
  diverse_sensitive: 'text-emerald-300 bg-emerald-500/20',
  tolerant_only: 'text-amber-300 bg-amber-500/20',
  absent_or_dead: 'text-red-300 bg-red-500/20',
};

export default function GuidedPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('streamvitals_answers');
    if (stored) {
      try { setAnswers(JSON.parse(stored)); } catch {}
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('streamvitals_answers', JSON.stringify(answers));
  }, [answers]);

  const currentIndicator = citizenIndicators[step];

  if (!currentIndicator) {
    return (
      <main className="min-h-screen bg-[#070d1a] relative overflow-hidden">
        <WaterCanvas particleCount={100} speed={1} />
        <AmbientWave speed={0.3} amplitude={50} />
        <FloatingOrb size={400} color="rgba(0, 229, 160, 0.08)" speed={0.5} />
        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-[#111d35] border border-emerald-500/20 rounded-2xl p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
            <div className="relative">
              <div className="text-6xl mb-4 animate-bounce-in">✓</div>
              <h1 className="text-3xl font-black mb-3 text-white">All Questions Answered</h1>
              <p className="text-white/60 mb-8">Your observations are ready for assessment.</p>
              <Link href="/confirm" className="btn-primary inline-block">
                Review Answers →
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const handleAnswer = (state: string) => {
    setAnswers((prev) => ({ ...prev, [currentIndicator.id]: state }));
    setSelectedState(state);
  };

  const handleNext = () => {
    setSelectedState(null);
    setStep((prev) => prev + 1);
  };

  const canProceed = answers[currentIndicator.id];
  const IconComponent = indicatorIcons[currentIndicator.id] || BugIcon;
  const labels = currentIndicator.citizen_state_labels || {};
  const progressWidth = Math.min(100, ((step + 1) / citizenIndicators.length) * 100);

  return (
    <main className="min-h-screen bg-[#070d1a] relative overflow-hidden">
      <WaterCanvas particleCount={80} speed={0.8} />
      <AmbientWave speed={0.4} amplitude={50} />
      <FloatingOrb size={300} color="rgba(0, 229, 160, 0.06)" speed={0.6} />
      <FloatingOrb size={200} color="rgba(0, 180, 216, 0.04)" speed={0.8} mouseReact={false} />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
          <div className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 rounded-full transition-all duration-700 ease-out relative" style={{ width: `${progressWidth}%` }}>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50" />
          </div>
        </div>

        <div className="max-w-lg w-full relative z-10">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 mb-4 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
              <span className="text-sm text-emerald-300 font-medium">Step {step + 1} of {citizenIndicators.length}</span>
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            </div>
            <div className="inline-block w-24 h-24 rounded-2xl bg-[#111d35] border border-emerald-500/20 flex items-center justify-center mb-5 animate-float">
              <IconComponent className="w-12 h-12 text-emerald-300" />
            </div>
            <h1 className="text-5xl font-black tracking-tighter mb-2 bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent">StreamVitals</h1>
            <p className="text-white/50 text-lg">Take the stream's vitals</p>
          </div>

          <div className="relative">
            <div className="bg-[#111d35] border border-emerald-500/15 rounded-2xl p-8 animate-fadeInScale">
              <div className="text-center mb-8">
                <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-bold mb-4 uppercase tracking-wider">
                  {currentIndicator.name}
                </span>
                <h2 className="text-2xl font-bold mb-3 leading-relaxed text-white">{currentIndicator.citizen_question}</h2>
                <p className="text-white/40 text-sm">{currentIndicator.visual_anchor_guide}</p>
              </div>

              <fieldset className="grid grid-cols-3 gap-3 mb-6" aria-label="Select a state">
                {Object.entries(currentIndicator.states).map(([state], i) => {
                  const isSelected = answers[currentIndicator.id] === state;
                  return (
                    <button
                      key={state}
                      type="button"
                      onClick={() => handleAnswer(state)}
                      className={`relative px-4 py-6 rounded-xl border-2 font-bold text-sm transition-all duration-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-400 scale-105 shadow-lg shadow-emerald-500/20'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/25 hover:scale-[1.02]'
                      }`}
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />
                      )}
                      <div className={`text-xs font-black mb-1 ${isSelected ? 'text-emerald-300' : 'text-white/30'} uppercase tracking-wider`}>
                        {stateLabels[state] || state.replace(/_/g, ' ')}
                      </div>
                      <div className={`relative font-medium ${isSelected ? 'text-white' : 'text-white/60'}`}>
                        {labels[state] || state.replace(/_/g, ' ')}
                      </div>
                    </button>
                  );
                })}
              </fieldset>

              <div className={`transition-all duration-300 overflow-hidden ${selectedState ? 'max-h-32 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}>
                <div className={`p-4 rounded-xl border ${answerColors[selectedState || ''] || ''}`}>
                  <p className={`text-sm font-medium ${answerTextColors[selectedState || ''] || 'text-white'}`}>
                    {answerMessages[selectedState || ''] || ''}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="w-full py-4 bg-[#111d35] border border-emerald-500/20 text-white rounded-xl font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-500/10 hover:border-emerald-400/40 hover:text-emerald-300 transition-all duration-300 flex items-center justify-center gap-3 mt-4 text-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none shadow-lg"
            aria-label="Next question"
          >
            {step < citizenIndicators.length - 1 ? 'Next Question' : 'Review Answers'}
            <Send className="w-5 h-5" />
          </button>
        </div>

        <Link href="/ai-copilot" className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:opacity-90 transition-all" aria-label="Open AI Copilot">
          <Bot className="w-5 h-5" /> AI Copilot
        </Link>
      </div>
    </main>
  );
}