import { ArrowLeft, ArrowRight, Shield } from 'lucide-react';
import { indicators } from '@/data/indicators';
import BoundedAssistant from '@/components/BoundedAssistant';
import PhotoCapture from '@/components/PhotoCapture';

const FIELD_INDICATORS = ['BMI-01', 'BIR-04', 'INV-11', 'FCL-06', 'DIA-10'];

export default async function IndicatorPage({ params }: { params: Promise<{ indicator: string }> }) {
  const { indicator: rawIndicatorId } = await params;
  const indicatorId = FIELD_INDICATORS.find((id) => id.toLowerCase() === rawIndicatorId.toLowerCase()) || rawIndicatorId;
  const indicator = indicators.find((i) => i.id === indicatorId);
  const currentIndex = FIELD_INDICATORS.indexOf(indicatorId);
  const isLabOnly = indicator?.lab_only || false;
  const isCitizen = indicator?.citizen_observable || false;

  if (!indicator) {
    return (
      <main className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1a1a2e] mb-4">Indicator not found</h1>
          <a href="/field" className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold shadow-sm shadow-emerald-200 hover:shadow-md transition-all">Return to Field Companion</a>
        </div>
      </main>
    );
  }

  const stateLabels = indicator.citizen_state_labels || {};
  const stateKeys = Object.keys(indicator.states || {});

  const progress = ((currentIndex + 1) / FIELD_INDICATORS.length) * 100;

  return (
    <main className="min-h-screen bg-[#f8f9fc]">
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold uppercase tracking-wider">
              {indicator.id}
            </span>
            {isLabOnly && (
              <span className="inline-block px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-bold">Pending Lab Analysis</span>
            )}
          </div>
          <span className="text-sm text-[#1a1a2e]/40 font-medium">{currentIndex + 1} of {FIELD_INDICATORS.length}</span>
        </div>

        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <h1 className="text-3xl font-black tracking-tighter mb-2 text-[#1a1a2e]">{indicator.name}</h1>
        <p className="text-[#1a1a2e]/50 text-lg mb-8">{indicator.citizen_question}</p>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm shadow-gray-100 mb-8">
          <div className="flex items-start gap-3 mb-4">
            <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-emerald-700">Visual Anchor</p>
              <p className="text-sm text-[#1a1a2e]/60 mt-1">{indicator.visual_anchor_guide}</p>
            </div>
          </div>
          {isLabOnly && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-amber-700 text-sm font-medium mb-2">Laboratory Protocol Required</p>
              <p className="text-amber-600/80 text-sm leading-relaxed">{indicator.visual_anchor_guide}</p>
              <p className="text-amber-700/60 text-sm mt-3">This requires laboratory analysis. You cannot determine the result in the field.</p>
            </div>
          )}
          {isCitizen && stateKeys.length > 0 && (
            <fieldset className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3" aria-label="Select your observation">
              {stateKeys.map((state) => {
                const label = stateLabels[state] || state.replace(/_/g, ' ');
                return (
                  <a
                    key={state}
                    href={`/field/${indicatorId}?state=${state}`}
                    className="relative px-4 py-4 rounded-xl border-2 border-gray-200 font-bold text-sm transition-all cursor-pointer bg-white hover:border-emerald-500 hover:bg-emerald-50/50 hover:shadow-sm"
                  >
                    <div className="text-xs font-black mb-1 uppercase tracking-wider text-[#1a1a2e]/40">{label}</div>
                  </a>
                );
              })}
            </fieldset>
          )}
          {isCitizen && (
            <div className="mt-6 space-y-4">
              <PhotoCapture sessionId="" indicatorId={indicatorId} />
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e]/70 mb-1.5" htmlFor={`notes-${indicatorId}`}>Field Notes</label>
                <textarea
                  id={`notes-${indicatorId}`}
                  placeholder="Optional observations, weather conditions, equipment used..."
                  rows={3}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[#1a1a2e] placeholder-[#1a1a2e]/30 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all resize-none"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <a
            href={currentIndex > 0 ? `/field/${FIELD_INDICATORS[currentIndex - 1]}` : '#'}
            className={`flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-[#1a1a2e] rounded-xl font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all focus:ring-2 focus:ring-emerald-400 focus:outline-none ${currentIndex === 0 ? 'opacity-30' : ''}`}
            aria-label="Previous indicator"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </a>
          <a
            href={currentIndex < FIELD_INDICATORS.length - 1 ? `/field/${FIELD_INDICATORS[currentIndex + 1]}` : '/field/review'}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold disabled:opacity-30 disabled:cursor-not-allowed shadow-sm shadow-emerald-200 hover:shadow-md transition-all"
          >
            {currentIndex === FIELD_INDICATORS.length - 1 ? 'Review Session' : 'Next Indicator'}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
      <div className="hidden lg:block fixed right-0 top-0 h-full w-72 border-l border-gray-200 p-4 overflow-y-auto">
        <BoundedAssistant indicatorId={indicatorId} />
      </div>
    </main>
  );
}