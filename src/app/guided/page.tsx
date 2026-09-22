'use client';

import { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { indicators } from '@/data/indicators';

const citizenIndicators = indicators.filter((ind) => ind.citizen_observable);

export default function GuidedPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);

  const currentIndicator = citizenIndicators[step];

  if (!currentIndicator) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8 text-center" role="main" aria-label="All questions answered">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">All questions answered</h1>
          <p className="text-slate-600 mb-6">Review your answers and confirm below.</p>
          <Link href="/confirm" className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors inline-block" aria-label="Review your answers">
            Review Answers
          </Link>
        </div>
      </main>
    );
  }

  const handleAnswer = (state: string) => {
    setAnswers((prev) => ({ ...prev, [currentIndicator.id]: state }));
  };

  const canProceed = answers[currentIndicator.id];

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8" role="main" aria-label="Guided assessment">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/" className="text-teal-600 hover:text-teal-800" aria-label="Go back to home">
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Take the Stream's Vitals</h1>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 mb-6" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={citizenIndicators.length} aria-label={`Question ${step + 1} of ${citizenIndicators.length}`}>
          <div
            className="bg-teal-600 h-2 rounded-full transition-all"
            style={{ width: `${((step + 1) / citizenIndicators.length) * 100}%` }}
          />
        </div>
        <div className="mb-6">
          <span className="text-sm font-medium text-teal-700 bg-teal-50 px-3 py-1 rounded-full" aria-label="Question progress">
            Question {step + 1} of {citizenIndicators.length}
          </span>
        </div>
        <div className="mb-2">
          <img
            src={`https://picsum.photos/seed/stream${step}/400/200`}
            alt={`Visual reference for ${currentIndicator.name}`}
            className="w-full h-48 object-cover rounded-xl mb-4"
            loading="lazy"
          />
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2" id="question-heading">
          {currentIndicator.citizen_question}
        </h2>
        <p className="text-sm text-slate-500 mb-6" id="guide-text">{currentIndicator.visual_anchor_guide}</p>
        <fieldset className="grid grid-cols-3 gap-3 mb-6" aria-labelledby="question-heading">
          <legend className="sr-only">Select a state for {currentIndicator.name}</legend>
          {Object.entries(currentIndicator.states).map(([state, data]) => (
            <button
              key={state}
              type="button"
              onClick={() => handleAnswer(state)}
              aria-pressed={answers[currentIndicator.id] === state}
              className="px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <div className="font-semibold">{state.replace(/_/g, ' ')}</div>
              <div className="text-xs opacity-70">severity: {data.policy_severity}</div>
            </button>
          ))}
        </fieldset>
        <button
          onClick={() => setStep(step + 1)}
          disabled={!canProceed}
          className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          aria-label="Next question"
        >
          Next <Send className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </main>
  );
}
