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
  const progress = useMemo(() => ((currentIndex + 1) / total) * 100, [currentIndex, total]);

  return (
    <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[rgba(0,0,0,0.35)] uppercase tracking-wider font-semibold">Field Progress</span>
        <span className="text-xs text-[#0d9b6e] font-bold">{currentIndex + 1} / {total}</span>
      </div>
      <div className="h-1 bg-[rgba(0,0,0,0.06)] rounded-full overflow-hidden">
        <div className="h-full bg-black rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex justify-between mt-3">
        {indicatorIds.map((id, i) => {
          const isComplete = completedIds.includes(id);
          const isCurrent = i === currentIndex;
          const isLab = labOnlyIds.includes(id);
          return (
            <div key={id} className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                isComplete ? 'bg-black text-white' :
                isCurrent ? 'bg-black text-white' :
                isLab ? 'bg-[rgba(232,93,58,0.08)] border border-[rgba(232,93,58,0.15)] text-[#e85d3a]' :
                'bg-[rgba(0,0,0,0.04)] border border-[rgba(0,0,0,0.08)] text-[rgba(0,0,0,0.25)]'
              }`}>
                {isComplete ? '✓' : isLab ? '📋' : i + 1}
              </div>
              <span className={`text-[9px] ${isCurrent ? 'text-black font-bold' : 'text-[rgba(0,0,0,0.25)]'}`}>{LABELS[id] || id}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
