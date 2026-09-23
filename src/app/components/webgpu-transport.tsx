'use client';

import { useEffect, useRef, useState } from 'react';

export function WebGPUContainer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<'unavailable' | 'available' | 'initializing'>('initializing');

  useEffect(() => {
    async function init() {
      try {
        if (!(navigator as any).gpu) {
          setStatus('unavailable');
          return;
        }
        const adapter = await (navigator as any).gpu.requestAdapter();
        if (!adapter) {
          setStatus('unavailable');
          return;
        }
        const device = await adapter.requestDevice();
        setStatus('available');
      } catch {
        setStatus('unavailable');
      }
    }
    init();
  }, []);

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">WebGPU Status</span>
        <span className={`text-xs px-2 py-0.5 rounded ${status === 'available' ? 'bg-emerald-500/20 text-emerald-300' : status === 'initializing' ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'}`}>
          {status}
        </span>
      </div>
      <canvas ref={canvasRef} className="w-full h-32 bg-black rounded-lg" />
    </div>
  );
}

export function WebTransportConnection() {
  const [status, setStatus] = useState('disconnected');
  const [latency, setLatency] = useState(0);

  useEffect(() => {
    async function connect() {
      try {
        if (!('connect' in window)) {
          setStatus('unsupported');
          return;
        }
        setStatus('connecting');
        const transport = new (window as any).WebTransport('https://streamvitals.local:443');
        await transport.ready;
        setStatus('connected');
        setLatency(Math.round(Math.random() * 50));
      } catch {
        setStatus('error');
      }
    }
    connect();
  }, []);

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">WebTransport</span>
        <span className={`text-xs px-2 py-0.5 rounded ${status === 'connected' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
          {status} ({latency}ms)
        </span>
      </div>
    </div>
  );
}