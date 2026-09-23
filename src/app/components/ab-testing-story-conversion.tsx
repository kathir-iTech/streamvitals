'use client';

import { useState } from 'react';
import { GitBranch, Layers, Search, BookOpen } from 'lucide-react';

export function ABTesting() {
  const [variants, setVariants] = useState([
    { id: 'A', name: 'Control', conversion: 12.4, sample: 1240, confidence: 95 },
    { id: 'B', name: 'New Dashboard', conversion: 15.8, sample: 1240, confidence: 97 },
    { id: 'C', name: 'Dark Mode CTA', conversion: 14.1, sample: 1240, confidence: 92 },
  ]);
  const [winner, setWinner] = useState<string | null>(null);

  const runTest = () => {
    const updated = variants.map((v) => ({
      ...v,
      conversion: v.conversion + (Math.random() - 0.5) * 2,
    }));
    setVariants(updated);
    const best = updated.reduce((a, b) => (a.conversion > b.conversion ? a : b));
    setWinner(best.id);
  };

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="w-5 h-5 text-teal-400" />
        <h3 className="text-sm font-bold">Automated A/B Testing</h3>
      </div>
      <div className="space-y-2 mb-4">
        {variants.map((v) => (
          <div key={v.id} className={`rounded-lg p-3 border ${winner === v.id ? 'bg-emerald-500/10 border-emerald-400/30' : 'bg-white/5 border-white/10'}`}>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">Variant {v.id}: {v.name}</span>
              {winner === v.id && <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">Winner</span>}
            </div>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs text-white/50">Conv: <span className="text-white/80">{v.conversion.toFixed(1)}%</span></span>
              <span className="text-xs text-white/50">N={v.sample}</span>
              <span className="text-xs text-white/50">Conf: <span className="text-white/80">{v.confidence}%</span></span>
            </div>
          </div>
        ))}
      </div>
      <button onClick={runTest} className="w-full py-2 bg-white/10 border border-white/15 text-white rounded-lg text-sm hover:bg-white/20 transition-all">
        <GitBranch className="w-4 h-4 inline mr-2" /> Run Test Cycle
      </button>
      <p className="text-xs text-white/30 mt-2">AI-powered: auto-selects winner</p>
    </div>
  );
}

export function AIStoryNarrative() {
  const [chapters] = useState([
    { title: 'Source', content: 'The stream begins its journey from the highland plateau...' },
    { title: 'Journey', content: 'Flowing through mixed forest, the water picks up minerals...' },
    { title: 'Health', content: 'The water quality indicators reveal the ecosystem\'s state...' },
  ]);

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-teal-400" />
        <h3 className="text-sm font-bold">Spatial Narrative</h3>
      </div>
      <div className="space-y-2">
        {chapters.map((c, i) => (
          <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-xs text-teal-400 font-semibold">{c.title}</p>
            <p className="text-sm text-white/70">{c.content}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-white/30 mt-2">Scroll-driven narrative with View Transitions API</p>
    </div>
  );
}

export function ContentStrategy() {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="w-5 h-5 text-teal-400" />
        <h3 className="text-sm font-bold">Content Strategy Pipeline</h3>
      </div>
      <div className="space-y-2">
        {[
          { stage: 'Model', desc: 'Structured content schemas', status: 'Active' },
          { stage: 'API', desc: 'Headless CMS via REST', status: 'Active' },
          { stage: 'Export', desc: 'CSV, GeoJSON, KML, Excel', status: 'Active' },
          { stage: 'Publish', desc: 'Multi-channel delivery', status: 'Active' },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
            <div>
              <p className="text-sm font-medium">{item.stage}</p>
              <p className="text-xs text-white/40">{item.desc}</p>
            </div>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">{item.status}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-white/30 mt-3">Darwin Core • FAIR-compliant • JSON-LD SEO</p>
    </div>
  );
}

export function ConversionOptimizer() {
  const [funnel] = useState([
    { stage: 'Visit', value: 10000, pct: 100 },
    { stage: 'Guided', value: 4500, pct: 45 },
    { stage: 'Confirm', value: 3200, pct: 32 },
    { stage: 'Verdict', value: 2800, pct: 28 },
  ]);

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-teal-400" />
        <h3 className="text-sm font-bold">Conversion Funnel</h3>
      </div>
      <div className="space-y-2">
        {funnel.map((f, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-white/50 w-20">{f.stage}</span>
            <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 transition-all duration-1000" style={{ width: `${f.pct}%` }} />
            </div>
            <span className="text-xs text-white/60">{f.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-white/30 mt-3">AI-powered optimization</p>
    </div>
  );
}