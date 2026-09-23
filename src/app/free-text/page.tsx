'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { indicators } from '@/data/indicators';

export default function FreeTextPage() {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAiEnabled, setIsAiEnabled] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('streamvitals_free_text');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setText(parsed.text || '');
        setIsAiEnabled(parsed.isAiEnabled ?? true);
      } catch {}
    }
  }, []);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsProcessing(false);
    sessionStorage.setItem('streamvitals_free_text', JSON.stringify({ text, isAiEnabled }));
  };

  const handleSkip = () => {
    const citizenIndicators = indicators.filter((ind) => ind.citizen_observable);
    const answers: Record<string, string> = {};
    for (const ind of citizenIndicators) {
      const states = Object.keys(ind.states);
      answers[ind.id] = states[0];
    }
    sessionStorage.setItem('streamvitals_answers', JSON.stringify(answers));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/" className="text-teal-600 hover:text-teal-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Take the Stream's Vitals</h1>
        </div>
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-teal-600" />
            <span className="text-sm font-medium text-teal-700">AI Observation Quality Gate</span>
          </div>
          <label className="flex items-center gap-2 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={isAiEnabled}
              onChange={(e) => setIsAiEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm text-slate-600">Enable AI to extract observations from your text</span>
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe what you see at the stream... e.g. I see small insects under rocks, the water is murky, and there are no birds today."
            className="w-full h-48 p-4 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none text-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || isProcessing}
            className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? 'Processing...' : 'Extract Observations'}
            {isAiEnabled && <Sparkles className="w-4 h-4" />}
          </button>
          <Link
            href="/confirm"
            onClick={handleSkip}
            className="px-6 py-3 border border-slate-300 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
          >
            Skip AI
          </Link>
        </div>
        <p className="mt-4 text-xs text-slate-400 text-center">
          AI may interpret input. AI may not adjudicate. All fields require your confirmation.
        </p>
      </div>
    </div>
  );
}
