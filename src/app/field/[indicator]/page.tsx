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
      <main className="min-h-screen bg-[#ffffff] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-black tracking-tighter mb-4 text-black">Indicator not found</h1>
          <a href="/field" className="btn-pill">Return to Field Companion</a>
        </div>
      </main>
    );
  }

  const stateLabels = indicator.citizen_state_labels || {};
  const stateKeys = Object.keys(indicator.states || {});
  const progress = ((currentIndex + 1) / FIELD_INDICATORS.length) * 100;

  return (
    <main className="min-h-screen bg-[#ffffff]">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-block px-5 py-2 rounded-full bg-[rgba(13,155,110,0.08)] border border-[rgba(13,155,110,0.15)] text-[#0d9b6e] text-sm font-bold uppercase tracking-wider">
              {indicator.id}
            </span>
            {isLabOnly && (
              <span className="inline-block px-5 py-2 rounded-full bg-[rgba(232,93,58,0.08)] border border-[rgba(232,93,58,0.15)] text-[#e85d3a] text-sm font-bold">Pending Lab Analysis</span>
            )}
          </div>
          <span className="text-sm text-[rgba(0,0,0,0.3)] font-medium">{currentIndex + 1} / {FIELD_INDICATORS.length}</span>
        </div>

        <div className="mb-8">
          <div className="h-1 bg-[rgba(0,0,0,0.06)] rounded-full overflow-hidden">
            <div className="h-full bg-black rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-3 text-black leading-[1.05]">{indicator.name}</h1>
        <p className="text-lg text-[rgba(0,0,0,0.5)] mb-8 max-w-2xl">{indicator.citizen_question}</p>

        <div className="step-card mb-8">
          <div className="flex items-start gap-3 mb-6">
            <Shield className="w-5 h-5 text-[#0d9b6e] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-[#0d9b6e]">Visual Anchor</p>
              <p className="text-sm text-[rgba(0,0,0,0.5)] mt-1">{indicator.visual_anchor_guide}</p>
            </div>
          </div>
          {isLabOnly && (
            <div className="mt-4 bg-[rgba(232,93,58,0.04)] border border-[rgba(232,93,58,0.12)] rounded-xl p-5">
              <p className="text-[#e85d3a] text-sm font-bold mb-2">Laboratory Protocol Required</p>
              <p className="text-[rgba(0,0,0,0.6)] text-sm leading-relaxed">{indicator.visual_anchor_guide}</p>
              <p className="text-[#e85d3a] text-sm mt-3 font-medium">This requires laboratory analysis. You cannot determine the result in the field.</p>
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
                    className="relative px-5 py-4 rounded-xl border-2 border-[rgba(0,0,0,0.08)] font-bold text-sm transition-all cursor-pointer bg-white hover:border-[#0d9b6e] hover:bg-[rgba(13,155,110,0.03)] hover:shadow-sm"
                  >
                    <div className="text-xs font-black mb-1 uppercase tracking-wider text-[rgba(0,0,0,0.35)]">{label}</div>
                  </a>
                );
              })}
            </fieldset>
          )}
          {isCitizen && (
            <div className="mt-6 space-y-4">
              <PhotoCapture sessionId="" indicatorId={indicatorId} />
              <div>
                <label className="block text-sm font-medium text-[rgba(0,0,0,0.5)] mb-1.5" htmlFor={`notes-${indicatorId}`}>Field Notes</label>
                <textarea
                  id={`notes-${indicatorId}`}
                  placeholder="Optional observations, weather conditions, equipment used..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[#f5faf7] border border-[rgba(0,0,0,0.08)] rounded-xl text-black placeholder-[rgba(0,0,0,0.25)] focus:ring-2 focus:ring-[#0d9b6e] focus:outline-none transition-all resize-none text-sm font-medium"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <a
            href={currentIndex > 0 ? `/field/${FIELD_INDICATORS[currentIndex - 1]}` : '#'}
            className={`flex items-center gap-2 px-6 py-3 bg-white border border-[rgba(0,0,0,0.08)] text-black rounded-xl font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[rgba(0,0,0,0.02)] hover:border-[rgba(0,0,0,0.12)] transition-all focus:ring-2 focus:ring-[#0d9b6e] focus:outline-none ${currentIndex === 0 ? 'opacity-30' : ''}`}
            aria-label="Previous indicator"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </a>
          <a
            href={currentIndex < FIELD_INDICATORS.length - 1 ? `/field/${FIELD_INDICATORS[currentIndex + 1]}` : '/field/review'}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 btn-pill-accent disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {currentIndex === FIELD_INDICATORS.length - 1 ? 'Review Session' : 'Next Indicator'}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
      <div className="hidden lg:block fixed right-0 top-0 h-full w-72 border-l border-[rgba(0,0,0,0.06)] p-4 overflow-y-auto bg-[#f5faf7]">
        <BoundedAssistant indicatorId={indicatorId} />
      </div>
    </main>
  );
}