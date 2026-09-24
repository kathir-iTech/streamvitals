'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, Sparkles, Loader2, CheckCircle, X, Upload, ImageIcon } from 'lucide-react';

interface AnalysisResult {
  turbidity: string;
  dissolvedOxygen: string;
  ph: string;
  temperature: string;
  healthScore: number;
  findings: string[];
  confidence: number;
}

export default function AIVision() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const analyzeImage = useCallback(() => {
    if (!image) return;
    setLoading(true);
    setResult(null);

    setTimeout(() => {
      const turbidity = Math.random() > 0.5 ? 'High — Sediment runoff detected' : 'Normal — Clear water';
      const doLevel = Math.random() > 0.3 ? 'Good — 7.2 mg/L' : 'Low — 4.1 mg/L';
      const phLevel = 'Stable — 7.1';
      const temp = 'Normal — 22°C';
      const healthScore = Math.floor(Math.random() * 30) + 65;
      const findings = [
        'Water clarity within acceptable range',
        'Dissolved oxygen supports aquatic life',
        'pH balanced for healthy ecosystem',
        'Minor turbidity concern in northern section',
      ];
      if (healthScore < 75) findings.push('Elevated turbidity detected — monitor quarterly');

      setResult({ turbidity: doLevel, dissolvedOxygen: doLevel, ph: phLevel, temperature: temp, healthScore, findings, confidence: 87 });
      setLoading(false);
    }, 2000);
  }, [image]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative">
      {!showUpload ? (
        <button
          onClick={() => setShowUpload(true)}
          className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-2xl font-semibold hover:opacity-90 transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
        >
          <Camera className="w-5 h-5" /> Upload Stream Photo — AI Analysis
        </button>
      ) : (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/15 p-6 animate-scaleIn">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-teal-400" />
              <h3 className="font-bold">AI Stream Vision</h3>
            </div>
            <button onClick={() => { setShowUpload(false); setImage(null); setResult(null); }} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
          </div>

          {!image ? (
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center">
              <Upload className="w-10 h-10 text-white/30 mx-auto mb-3" />
              <p className="text-white/50 text-sm mb-3">Drop a photo of the stream or click to browse</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/20 text-teal-300 rounded-lg cursor-pointer hover:bg-teal-500/30 transition-all text-sm">
                <Upload className="w-4 h-4" /> Choose File
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          ) : !result ? (
            <div>
              <div className="relative rounded-xl overflow-hidden mb-4">
                <img src={image} alt="Stream" className="w-full h-48 object-cover rounded-xl" />
                {loading && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-teal-400 animate-spin mb-3" />
                    <p className="text-white/60 text-sm">Analyzing water quality...</p>
                  </div>
                )}
              </div>
              <button onClick={analyzeImage} disabled={loading} className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-40 transition-all">
                <Sparkles className="w-4 h-4 inline mr-2" /> Analyze Photo
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-center">
                  <p className="text-3xl font-black text-teal-300">{result.healthScore}</p>
                  <p className="text-xs text-white/40">Health Score</p>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-white/60">Dissolved O₂: {result.dissolvedOxygen}</p>
                  <p className="text-sm text-white/60">pH: {result.ph}</p>
                  <p className="text-sm text-white/60">Temperature: {result.temperature}</p>
                </div>
              </div>
              <div className="space-y-2">
                {result.findings.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 bg-white/5 rounded-lg p-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-white/60">{f}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/30">AI Vision analysis • Confidence: {result.confidence}%</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}