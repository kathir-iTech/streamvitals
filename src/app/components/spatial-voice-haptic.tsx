'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Volume2, Mic, MicOff } from 'lucide-react';

export default function SpatialUI() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [streamHealth, setStreamHealth] = useState({
    healthy: 3,
    warning: 2,
    critical: 1,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <Navigation className="w-5 h-5 text-teal-400" />
        <h3 className="text-sm font-bold">Spatial Health Map</h3>
      </div>
      <p className="text-xs text-white/40 mb-3">Cursor position: ({position.x}, {position.y}) — Data rendered in 3D space</p>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-lg p-3 text-center">
          <p className="text-emerald-300 text-2xl font-black">{streamHealth.healthy}</p>
          <p className="text-xs text-emerald-400">Healthy</p>
        </div>
        <div className="bg-amber-500/20 border border-amber-400/30 rounded-lg p-3 text-center">
          <p className="text-amber-300 text-2xl font-black">{streamHealth.warning}</p>
          <p className="text-xs text-amber-400">Warning</p>
        </div>
        <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3 text-center">
          <p className="text-red-300 text-2xl font-black">{streamHealth.critical}</p>
          <p className="text-xs text-red-400">Critical</p>
        </div>
      </div>
    </div>
  );
}

export function VoiceNavigation() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';
      rec.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        setTranscript(result[0].transcript);
      };
      setRecognition(rec);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) return;
    if (listening) {
      recognition.stop();
      setListening(false);
    } else {
      recognition.start();
      setListening(true);
    }
  };

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <Volume2 className={`w-5 h-5 ${listening ? 'text-red-400 animate-pulse' : 'text-teal-400'}`} />
        <h3 className="text-sm font-bold">Voice Navigation</h3>
      </div>
      <button onClick={toggleListening} className={`w-full py-2 rounded-lg text-sm font-semibold transition-all ${listening ? 'bg-red-500/20 border border-red-400/30 text-red-300' : 'bg-white/10 border border-white/15 text-white'}`}>
        {listening ? 'Listening...' : 'Start Voice Command'}
      </button>
      {transcript && (
        <p className="text-xs text-white/40 mt-2">Transcribed: "{transcript}"</p>
      )}
      <p className="text-xs text-white/30 mt-1">Try: "Go to dashboard", "Show analytics", "Export data"</p>
    </div>
  );
}

export function HapticFeedback() {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported('vibrate' in navigator);
  }, []);

  const triggerHaptic = (pattern: string) => {
    if (!supported) return;
    const patterns: Record<string, number[]> = {
      light: [50],
      medium: [100],
      heavy: [200],
      success: [50, 50, 100],
      error: [200, 50, 200],
      warning: [100, 50, 100, 50, 100],
    };
    (navigator as any).vibrate(patterns[pattern] || [100]);
  };

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-bold">Haptic Feedback</span>
        <span className={`text-xs px-2 py-0.5 rounded ${supported ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
          {supported ? 'Supported' : 'Not Available'}
        </span>
      </div>
      <div className="flex gap-2">
        {['light', 'medium', 'success', 'error', 'warning'].map((pattern) => (
          <button
            key={pattern}
            onClick={() => triggerHaptic(pattern)}
            disabled={!supported}
            className="flex-1 py-2 bg-white/10 border border-white/15 text-white rounded-lg text-xs hover:bg-white/20 disabled:opacity-30 transition-all capitalize"
          >
            {pattern}
          </button>
        ))}
      </div>
    </div>
  );
}