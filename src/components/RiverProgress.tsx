'use client';

import { useMemo } from 'react';

interface RiverProgressProps {
  currentIndex: number;
  total: number;
  indicatorIds: string[];
  completedIds: string[];
  labOnlyIds: string[];
}

const LABELS: Record<string, string> = {
  'BMI-01': 'Macroinvertebrates',
  'BIR-04': 'Birds',
  'INV-11': 'Invasive Plants',
  'FCL-06': 'Fecal Coliforms',
  'DIA-10': 'Diatoms',
};

export default function RiverProgress({ currentIndex, total, indicatorIds, completedIds, labOnlyIds }: RiverProgressProps) {
  const progress = useMemo(() => {
    return ((currentIndex + 1) / total) * 100;
  }, [currentIndex, total]);

  return (
    <div className="w-full bg-[#111d35] border border-emerald-500/15 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-white/40 uppercase tracking-wider">Field Progress</span>
        <span className="text-xs text-emerald-400 font-bold">{currentIndex + 1} / {total}</span>
      </div>
      <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-px w-full bg-white/20" />
        </div>
      </div>
      <div className="flex justify-between mt-3">
        {indicatorIds.map((id, i) => {
          const isComplete = completedIds.includes(id);
          const isCurrent = i === currentIndex;
          const isLab = labOnlyIds.includes(id);
          return (
            <div key={id} className="flex flex-col items-center gap-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                isComplete ? 'bg-emerald-500 text-white' :
                isCurrent ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300' :
                isLab ? 'bg-amber-500/20 border-2 border-amber-400/50 text-amber-300/70' :
                'bg-white/5 border border-white/10 text-white/30'
              }`}>
                {isComplete ? '✓' : isLab ? '📋' : i + 1}
              </div>
              <span className={`text-[9px] ${isCurrent ? 'text-emerald-300 font-medium' : 'text-white/30'}`}>{LABELS[id] || id}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
