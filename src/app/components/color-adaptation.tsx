'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ColorAdaptation() {
  const [mode, setMode] = useState<'auto' | 'light' | 'dark'>('auto');
  const [ambientLight, setAmbientLight] = useState<number>(50);

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches && mode === 'auto') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if ('AmbientLightSensor' in window) {
      const sensor = new (window as any).AmbientLightSensor();
      sensor.addEventListener('reading', () => setAmbientLight(sensor.illuminance));
      sensor.start();
      return () => sensor.stop();
    }
  }, [mode]);

  useEffect(() => {
    if (mode === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, [mode]);

  useEffect(() => {
    const hue = Math.round(174 + (ambientLight - 50) * 0.5);
    const sat = Math.round(80 + (ambientLight - 50) * 0.2);
    const light = Math.round(50 + (ambientLight - 50) * 0.1);
    document.documentElement.style.setProperty('--theme-hue', `${hue}`);
    document.documentElement.style.setProperty('--theme-saturation', `${sat}%`);
    document.documentElement.style.setProperty('--theme-lightness', `${light}%`);
  }, [ambientLight]);

  return (
    <div className="fixed top-2 left-2 z-50 flex gap-2">
      <button onClick={() => setMode('auto')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${mode === 'auto' ? 'bg-teal-500 text-white' : 'bg-white/10 text-white/60'}`}>Auto</button>
      <button onClick={() => setMode('light')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${mode === 'light' ? 'bg-teal-500 text-white' : 'bg-white/10 text-white/60'}`}>Light</button>
      <button onClick={() => setMode('dark')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${mode === 'dark' ? 'bg-teal-500 text-white' : 'bg-white/10 text-white/60'}`}>Dark</button>
      <span className="text-xs text-white/30 self-center">Ambient: {ambientLight.toFixed(0)} lux</span>
    </div>
  );
}