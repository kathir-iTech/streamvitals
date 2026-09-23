'use client';

import { useState, useEffect } from 'react';
import { Wrench } from 'lucide-react';

export default function ContainerQueryDemo() {
  const [width, setWidth] = useState(400);

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <Wrench className="w-5 h-5 text-teal-400" />
        <h3 className="text-sm font-bold">Container Queries</h3>
      </div>
      <p className="text-xs text-white/40 mb-3">Resize to see responsive layout adaptation (CSS @container)</p>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5" style={{ width: `${Math.min(width, 100)}px` }}>
        <div className="container-query p-4">
          <div className="responsive-grid gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/10 rounded-lg p-3 text-xs text-white/60">
                Card {i} — adapts to container width
              </div>
            ))}
          </div>
        </div>
      </div>
      <input type="range" min="200" max="800" value={width} onChange={(e) => setWidth(parseInt(e.target.value))} className="w-full mt-3 accent-teal-500" />
      <p className="text-xs text-white/30 mt-1">Container width: {width}px</p>
    </div>
  );
}

export function WebRTCConnection() {
  const [status, setStatus] = useState('disconnected');

  useEffect(() => {
    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        setStatus('connected');
        stream.getTracks().forEach((t) => t.stop());
      } catch { setStatus('microphone denied'); }
    }
    init();
  }, []);

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-3 h-3 rounded-full bg-teal-500 animate-pulse" />
        <h3 className="text-sm font-bold">WebRTC Stream</h3>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/70">Status: <span className={`text-xs px-2 py-0.5 rounded ${status === 'connected' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>{status}</span></span>
      </div>
      <p className="text-xs text-white/30 mt-2">Real-time P2P audio/video/data channels</p>
    </div>
  );
}