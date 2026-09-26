'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  seconds: number;
  onComplete?: () => void;
}

export default function CountdownTimer({ seconds, onComplete }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onComplete?.();
      return;
    }
    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) { clearInterval(timer); onComplete?.(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [remaining, onComplete]);

  const progress = (remaining / seconds) * 100;
  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <div className="flex items-center gap-3 bg-white border border-[rgba(0,0,0,0.06)] rounded-full px-5 py-3 shadow-sm">
      <Clock className="w-5 h-5 text-[#0d9b6e]" />
      <div className="flex-1">
        <div className="h-1.5 bg-[rgba(0,0,0,0.06)] rounded-full overflow-hidden mb-2">
          <div className="h-full bg-black rounded-full transition-all duration-[1s] linear" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-lg font-mono font-bold text-black">{minutes}:{secs.toString().padStart(2, '0')}</span>
      </div>
    </div>
  );
}
