'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Send, Bot, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { indicators } from '@/data/indicators';
import WaterCanvas from '@/components/water-canvas';
import AmbientWave from '@/components/ambient-wave';
import FloatingOrb from '@/components/floating-orb';
import { easeOutCubic } from '@/lib/animation-engine';

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

const tierGlow: Record<string, string> = {
  diverse_sensitive: 'shadow-emerald-200/50',
  tolerant_only: 'shadow-amber-200/50',
  absent_or_dead: 'shadow-red-200/50',
};

const answerColors: Record<string, string> = {
  diverse_sensitive: 'bg-emerald-500/20 border-emerald-400/30',
  tolerant_only: 'bg-amber-500/20 border-amber-400/30',
  absent_or_dead: 'bg-red-500/20 border-red-400/30',
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

export default function GuidedPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [justAnswered, setJustAnswered] = useState(false);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [progressAnim, setProgressAnim] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem('streamvitals_answers');
    if (stored) {
      try { setAnswers(JSON.parse(stored)); } catch {}
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('streamvitals_answers', JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    const pct = ((step) / citizenIndicators.length) * 100;
    setProgressAnim(pct);
  }, [step]);

  const currentIndicator = citizenIndicators[step];

  if (!currentIndicator) {
    return (
      <main className="min-h-screen relative overflow-hidden">
        <WaterCanvas particleCount={100} speed={1} />
        <AmbientWave speed={0.3} amplitude={50} />
        <FloatingOrb size={400} color="rgba(45, 212, 191, 0.08)" speed={0.5} />
        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white/10 backdrop-blur-xl rounded-3xl p-10 text-center border border-white/20 relative z-10 animate-scaleIn">
            <div className="text-6xl mb-4 animate-bounce">✓</div>
            <h1 className="text-3xl font-bold mb-3">All questions answered</h1>
            <p className="text-white/70 mb-8">Your observations are ready for assessment.</p>
            <Link href="/confirm" className="inline-block px-8 py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-teal-50 transition-colors text-lg shadow-xl">
              Review Answers →
            </Link>
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
    <main className="min-h-screen relative overflow-hidden">
      <WaterCanvas particleCount={80} speed={0.8} />
      <AmbientWave speed={0.4} amplitude={50} />
      <FloatingOrb size={300} color="rgba(45, 212, 191, 0.06)" speed={0.6} />
      <FloatingOrb size={200} color="rgba(59, 130, 246, 0.04)" speed={0.8} mouseReact={false} />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        {/* River Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
          <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-700 ease-out" style={{ width: `${progressWidth}%` }} />
          <div className="h-full w-8 bg-white/20 rounded-full blur-sm -mt-0.5" style={{ left: `${progressWidth}%`, marginLeft: '-16px' }} />
        </div>

        <div className="max-w-lg w-full relative z-10">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="text-xs text-white/30">Step {step + 1} of {citizenIndicators.length}</span>
              <span className="w-1 h-1 bg-teal-400 rounded-full animate-pulse" />
            </div>
            <div className="inline-block w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center mb-4 animate-scaleIn">
              <IconComponent className="w-10 h-10 text-teal-300" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">StreamVitals</h1>
            <p className="text-white/60 text-sm">Take the stream's vitals</p>
          </div>

          <div className="relative">
            <div className={`bg-white/10 backdrop-blur-xl rounded-3xl border border-white/15 p-8 transition-all duration-500 ${tierGlow[selectedState || ''] || ''}`}>
              <div className="text-center mb-6">
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/70 text-sm font-medium mb-4">
                  {currentIndicator.name}
                </span>
                <h2 className="text-xl font-semibold mb-2 leading-relaxed animate-fadeIn">{currentIndicator.citizen_question}</h2>
                <p className="text-white/50 text-sm animate-fadeIn" style={{ animationDelay: '0.2s' }}>{currentIndicator.visual_anchor_guide}</p>
              </div>

              <fieldset className="grid grid-cols-3 gap-3 mb-6" aria-label="Select a state">
                {Object.entries(currentIndicator.states).map(([state], i) => {
                  const isSelected = answers[currentIndicator.id] === state;
                  return (
                    <button
                      key={state}
                      type="button"
                      onClick={() => handleAnswer(state)}
                      className={`relative px-4 py-5 rounded-2xl border-2 font-medium text-sm transition-all duration-300 focus:ring-2 focus:ring-teal-400 focus:outline-none ${
                        isSelected
                          ? 'bg-white/20 border-white scale-105 shadow-lg animate-scaleIn'
                          : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/40 hover:scale-[1.02]'
                      }`}
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      {isSelected && <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 pointer-events-none" />}
                      <div className="relative font-semibold">{labels[state] || state.replace(/_/g, ' ')}</div>
                    </button>
                  );
                })}
              </fieldset>

              <div className={`transition-all duration-300 overflow-hidden ${selectedState ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}>
                <div className={`p-4 rounded-xl border ${answerColors[selectedState || ''] || ''} animate-scaleIn`}>
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
            className="w-full py-4 bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded-2xl font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2 mt-4 focus:ring-2 focus:ring-teal-400 focus:outline-none"
            aria-label="Next question"
          >
            {step < citizenIndicators.length - 1 ? 'Next' : 'Review Answers'}
            <Send className="w-4 h-4" />
          </button>
        </div>

        <Link href="/ai-copilot" className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-teal-500/30 hover:opacity-90 transition-all" aria-label="Open AI Copilot">
          <Bot className="w-5 h-5" /> Ask AI Copilot
        </Link>
      </div>
    </main>
  );
}