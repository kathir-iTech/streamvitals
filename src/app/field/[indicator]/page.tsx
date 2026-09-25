import { ArrowLeft, ArrowRight, Check, Shield } from 'lucide-react';
import { indicators } from '@/data/indicators';
import BoundedAssistant from '@/components/BoundedAssistant';
import RiverProgress from '@/components/RiverProgress';
import PhotoCapture from '@/components/PhotoCapture';

const FIELD_INDICATORS = ['BMI-01', 'BIR-04', 'INV-11', 'FCL-06', 'DIA-10'];

export default async function IndicatorPage({ params }: { params: Promise<{ indicator: string }> }) {
  const { indicator: indicatorId } = await params;
  const indicator = indicators.find((i) => i.id === indicatorId);
  const currentIndex = FIELD_INDICATORS.indexOf(indicatorId);
  const isLabOnly = indicator?.lab_only || false;
  const isCitizen = indicator?.citizen_observable || false;

  if (!indicator) {
    return (
      <main className="min-h-screen bg-[#070d1a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Indicator not found</h1>
          <a href="/field" className="btn-primary inline-block">Return to Field Companion</a>
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
        completedIds={[]}
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
                    return (
                      <a
                        key={state}
                        href={`/field/${indicatorId}?state=${state}`}
                        className="relative px-4 py-4 rounded-xl border-2 font-bold text-sm transition-all duration-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none cursor-pointer bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/25 hover:scale-[1.02]"
                      >
                        <div className="text-xs font-black mb-1 uppercase tracking-wider text-white/30">{label}</div>
                      </a>
                    );
                  })}
                </fieldset>
              )}
              {isCitizen && (
                <div className="mt-6 space-y-4">
                  <PhotoCapture sessionId="" indicatorId={indicatorId} />
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5" htmlFor={`notes-${indicatorId}`}>Field Notes</label>
                    <textarea
                      id={`notes-${indicatorId}`}
                      placeholder="Optional observations, weather conditions, equipment used..."
                      rows={3}
                      className="w-full p-3.5 bg-[#070d1a] border border-emerald-500/15 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <a
                href={currentIndex > 0 ? `/field/${FIELD_INDICATORS[currentIndex - 1]}` : '#'}
                className={`flex items-center gap-2 px-6 py-3 bg-[#111d35] border border-emerald-500/20 text-white rounded-xl font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-500/10 hover:border-emerald-400/40 transition-all focus:ring-2 focus:ring-emerald-400 focus:outline-none ${currentIndex === 0 ? 'opacity-30' : ''}`}
                aria-label="Previous indicator"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </a>
              <a
                href={currentIndex < FIELD_INDICATORS.length - 1 ? `/field/${FIELD_INDICATORS[currentIndex + 1]}` : '/field/review'}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {currentIndex === FIELD_INDICATORS.length - 1 ? 'Review Session' : 'Next Indicator'}
                <ArrowRight className="w-4 h-4" />
              </a>
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
