'use client';

import { useState, useEffect } from 'react';
import { Eye, Heart, MapPin, Share2, TrendingUp, Layers, Camera, Mic } from 'lucide-react';

export default function CitizenScienceHub() {
  const [reports, setReports] = useState([
    { id: 'CIT-001', user: 'Jane D.', location: 'HUC-10 Stream A', report: 'High turbidity near bridge', time: '2026-09-22 10:30', verified: true, upvotes: 12 },
    { id: 'CIT-002', user: 'Mike R.', location: 'HUC-11 Stream B', report: 'No fish observed this week', time: '2026-09-21 16:45', verified: true, upvotes: 8 },
    { id: 'CIT-003', user: 'Sarah L.', location: 'HUC-08 Stream C', report: 'Algal bloom near inlet', time: '2026-09-21 09:15', verified: false, upvotes: 5 },
  ]);

  const submitReport = (report: string) => {
    const newReport = {
      id: `CIT-${String(reports.length + 1).padStart(3, '0')}`,
      user: 'You',
      location: 'HUC-10 Stream A',
      report,
      time: new Date().toLocaleString(),
      verified: false,
      upvotes: 0,
    };
    setReports([newReport, ...reports]);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Contributors', value: '247', icon: Eye, color: 'text-teal-300' },
          { label: 'Verified', value: '1,203', icon: Heart, color: 'text-emerald-300' },
          { label: 'Streams', value: '38', icon: MapPin, color: 'text-amber-300' },
        ].map((s, i) => (
          <div key={i} className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-4">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-white/50">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {reports.map((r) => (
          <div key={r.id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">{r.user}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${r.verified ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                {r.verified ? '✓ Verified' : '⏳ Pending'}
              </span>
            </div>
            <p className="text-sm text-white/70">{r.report}</p>
            <p className="text-xs text-teal-400 mt-1">{r.location} • {r.time} • 👍 {r.upvotes}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DesignSystemTokens() {
  const [tokens, setTokens] = useState({
    colors: { primary: '#0d9488', accent: '#10b981', surface: 'rgba(255,255,255,0.1)' },
    spacing: { 1: '4px', 2: '8px', 3: '12px', 4: '16px', 6: '24px', 8: '32px' },
    radii: { sm: '8px', md: '16px', lg: '24px', xl: '32px' },
    shadows: { sm: '0 1px 2px rgba(0,0,0,0.05)', md: '0 4px 6px rgba(0,0,0,0.07)', lg: '0 10px 15px rgba(0,0,0,0.1)' },
    typography: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem' },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2"><Layers className="w-5 h-5 text-teal-400" /> Design System</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(tokens.colors).map(([key, val]) => (
          <div key={key} className="bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-xs text-white/40 uppercase">{key}</p>
            <p className="text-sm font-mono text-teal-300">{String(val)}</p>
            {key === 'primary' && <div className="w-full h-8 rounded-lg mt-2" style={{ backgroundColor: String(val) }} />}
          </div>
        ))}
      </div>
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <h3 className="text-sm font-semibold mb-2">Storybook + Figma Token Pipeline</h3>
        <p className="text-xs text-white/40">Tokens flow: Figma Variables → Style Dictionary → CSS Custom Properties → React Components</p>
      </div>
    </div>
  );
}