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
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm shadow-gray-100">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[#1a1a2e]/40 uppercase tracking-wider">Field Progress</span>
        <span className="text-xs text-emerald-700 font-bold">{currentIndex + 1} / {total}</span>
      </div>
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex justify-between mt-3">
        {indicatorIds.map((id, i) => {
          const isComplete = completedIds.includes(id);
          const isCurrent = i === currentIndex;
          const isLab = labOnlyIds.includes(id);
          return (
            <div key={id} className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                isComplete ? 'bg-emerald-600 text-white' :
                isCurrent ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200' :
                isLab ? 'bg-amber-100 border border-amber-200 text-amber-700' :
                'bg-gray-100 border border-gray-200 text-[#1a1a2e]/30'
              }`}>
                {isComplete ? '✓' : isLab ? '📋' : i + 1}
              </div>
              <span className={`text-[9px] ${isCurrent ? 'text-emerald-700 font-medium' : 'text-[#1a1a2e]/30'}`}>{LABELS[id] || id}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}