'use client';

import { useCountUp } from './scroll-animations';

interface HealthScoreProps {
  score: number;
  label?: string;
  className?: string;
}

export default function HealthScore({ score, label = 'Stream Health Score' }: HealthScoreProps) {
  const { current, ref } = useCountUp(score, 2000);
  const getColor = (s: number) => s >= 80 ? 'text-emerald-300' : s >= 60 ? 'text-teal-300' : s >= 40 ? 'text-amber-300' : 'text-red-300';
  const getBg = (s: number) => s >= 80 ? 'bg-emerald-500' : s >= 60 ? 'bg-teal-500' : s >= 40 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div ref={ref} className="text-center">
      <div className="relative w-32 h-32 mx-auto mb-3">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
          <circle
            cx="50" cy="50" r="45" fill="none"
            stroke="currentColor" strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${(current / 100) * 283} 283`}
            className={getColor(score)}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dasharray 2s ease-out' }}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-4xl font-black ${getColor(score)}`}>
          {current}
        </span>
      </div>
      <p className="text-sm text-white/40">{label}</p>
    </div>
  );
}
