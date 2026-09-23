'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { indicators } from '@/data/indicators';

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

  useEffect(() => {
    const stored = sessionStorage.getItem('streamvitals_answers');
    if (stored) {
      try {
        setAnswers(JSON.parse(stored));
      } catch {}
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('streamvitals_answers', JSON.stringify(answers));
  }, [answers]);

  const currentIndicator = citizenIndicators[step];

  if (!currentIndicator) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 text-white flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-10 left-20 w-64 h-64 bg-teal-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
        </div>
        <div className="max-w-lg w-full bg-white/10 backdrop-blur-xl rounded-3xl p-10 text-center border border-white/20 relative z-10">
          <div className="text-5xl mb-4">✓</div>
          <h1 className="text-3xl font-bold mb-3">All questions answered</h1>
          <p className="text-white/70 mb-8">Your observations are ready for assessment.</p>
          <Link href="/confirm" className="inline-block px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl hover:bg-teal-50 transition-colors text-lg shadow-lg">
            Review Answers
          </Link>
        </div>
      </main>
    );
  }

  const handleAnswer = (state: string) => {
    setAnswers((prev) => ({ ...prev, [currentIndicator.id]: state }));
    setSelectedState(state);
    setJustAnswered(true);
    setTimeout(() => {
      setJustAnswered(false);
      setStep((prev) => prev + 1);
      setSelectedState(null);
    }, 1200);
  };

  const canProceed = answers[currentIndicator.id];
  const IconComponent = indicatorIcons[currentIndicator.id] || BugIcon;
  const labels = currentIndicator.citizen_state_labels || {};

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-10 left-20 w-64 h-64 bg-teal-400 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-600 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="max-w-lg w-full relative z-10">
        <div className="mb-8 text-center">
          <div className="inline-block w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center mb-4">
            <IconComponent className="w-8 h-8 text-teal-300" />
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
              <h2 className="text-xl font-semibold mb-2 leading-relaxed">{currentIndicator.citizen_question}</h2>
              <p className="text-white/50 text-sm">{currentIndicator.visual_anchor_guide}</p>
            </div>

            <fieldset className="grid grid-cols-3 gap-3 mb-6" aria-label="Select a state">
              {Object.entries(currentIndicator.states).map(([state]) => {
                const isSelected = answers[currentIndicator.id] === state;
                return (
                  <button
                    key={state}
                    type="button"
                    onClick={() => handleAnswer(state)}
                    disabled={!!answers[currentIndicator.id] && !justAnswered}
                    className={`relative px-4 py-5 rounded-2xl border-2 font-medium text-sm transition-all duration-300 focus:ring-2 focus:ring-teal-400 focus:outline-none ${
                      isSelected
                        ? 'bg-white/20 border-white scale-105 shadow-lg'
                        : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/40 hover:scale-[1.02]'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 pointer-events-none" />
                    )}
                    <div className="relative font-semibold">{labels[state] || state.replace(/_/g, ' ')}</div>
                  </button>
                );
              })}
            </fieldset>

            <div className={`transition-all duration-500 overflow-hidden ${
              justAnswered ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
            }`}>
              <div className={`p-4 rounded-xl border ${answerColors[selectedState || ''] || ''}`}>
                <p className={`text-sm font-medium ${answerTextColors[selectedState || ''] || 'text-white'}`}>
                  {answerMessages[selectedState || ''] || ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (!canProceed) return;
            setStep((prev) => prev + 1);
            setSelectedState(null);
          }}
          disabled={!canProceed}
          className="w-full py-4 bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded-2xl font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2 mt-4 focus:ring-2 focus:ring-teal-400 focus:outline-none"
          aria-label="Next question"
        >
          {step < citizenIndicators.length - 1 ? 'Next' : 'Review Answers'}
          <Send className="w-4 h-4" />
        </button>
      </div>
    </main>
  );
}
