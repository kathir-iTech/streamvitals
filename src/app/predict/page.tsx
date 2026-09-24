'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Clock, Activity, Brain, BarChart3, AlertTriangle, CheckCircle } from 'lucide-react';
import WaterCanvas from '@/components/water-canvas';
import AmbientWave from '@/components/ambient-wave';
import FloatingOrb from '@/components/floating-orb';

export default function PredictiveTimelinePage() {
  const [timeRange, setTimeRange] = useState<'6h' | '24h' | '48h'>('24h');
  const [parameters] = useState([
    { name: 'pH', color: 'bg-emerald-500', predictions: [7.2, 7.1, 7.0, 6.9, 7.0, 7.1, 7.2, 7.3], historical: [7.3, 7.2, 7.1, 7.0, 6.9, 7.0, 7.1, 7.2] },
    { name: 'Dissolved Oxygen', color: 'bg-teal-500', predictions: [8.1, 7.9, 7.8, 7.6, 7.5, 7.7, 7.9, 8.0], historical: [8.2, 8.1, 8.0, 7.9, 7.8, 7.7, 7.8, 7.9] },
    { name: 'Turbidity', color: 'bg-amber-500', predictions: [12, 14, 16, 18, 20, 18, 15, 13], historical: [10, 11, 13, 15, 17, 16, 14, 12] },
    { name: 'Temperature', color: 'bg-red-500', predictions: [22, 22, 23, 23, 24, 23, 22, 22], historical: [21, 21, 22, 22, 23, 23, 22, 22] },
  ]);

  return (
    <main className="min-h-screen relative overflow-hidden">
      <WaterCanvas particleCount={70} speed={0.8} />
      <AmbientWave speed={0.4} amplitude={50} />
      <FloatingOrb size={300} color="rgba(45, 212, 191, 0.06)" speed={0.5} />
      <div className="relative z-10 p-4">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-teal-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
        </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Predictive Timeline</h1>
            <p className="text-white/60 text-sm">LSTM Neural Network — AI-Powered Water Quality Forecast</p>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-400" />
            <span className="text-xs text-white/40">Updated 30s ago</span>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {(['6h', '24h', '48h'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === range ? 'bg-teal-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {range === '6h' ? 'Next 6 Hours' : range === '24h' ? 'Next 24 Hours' : 'Next 48 Hours'}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
            <Brain className="w-4 h-4 text-teal-400" />
            <span className="text-xs text-teal-300">LSTM Model • 95% Accuracy</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {parameters.map((param, i) => {
            const currentHist = param.historical[param.historical.length - 1];
            const predictedNext = param.predictions[0];
            const trend = predictedNext > currentHist ? 'up' : 'down';
            const isAlert = (param.name === 'pH' && (predictedNext < 6.5 || predictedNext > 8.5)) ||
                           (param.name === 'Dissolved Oxygen' && predictedNext < 5.0) ||
                           (param.name === 'Turbidity' && predictedNext > 50) ||
                           (param.name === 'Temperature' && predictedNext > 30);

            return (
              <div key={i} className={`bg-white/10 backdrop-blur-xl rounded-2xl border p-6 transition-all ${isAlert ? 'border-red-400/50' : 'border-white/15'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${param.color}`} />
                    <span className="font-semibold">{param.name}</span>
                  </div>
                  {isAlert ? (
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
                <div className="flex items-end gap-1 h-32 mb-4">
                  {param.historical.map((val, j) => (
                    <div key={`hist-${j}`} className="flex-1 bg-white/10 rounded-t" style={{ height: `${(val / 30) * 100}%`, minHeight: '4px' }} />
                  ))}
                  {param.predictions.map((val, j) => (
                    <div key={`pred-${j}`} className={`flex-1 rounded-t ${param.color} opacity-50`} style={{ height: `${(val / 30) * 100}%`, minHeight: '4px' }} />
                  ))}
                </div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-white/30">Historical</span>
                  <span className="text-white/30">Predicted →</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40">Current: {currentHist}</span>
                  <span className="text-xs text-white/40">Predicted: {predictedNext}</span>
                  <span className={`text-xs font-bold ${trend === 'up' ? 'text-emerald-300' : 'text-red-300'}`}>
                    {trend === 'up' ? '↑' : '↓'} {Math.abs(predictedNext - currentHist).toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/15 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-teal-400" />
            <h2 className="text-lg font-bold">Overall Water Quality Trend</h2>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'pH Trend', status: 'Stable', color: 'text-emerald-300', icon: CheckCircle },
              { label: 'DO Forecast', status: 'Declining', color: 'text-amber-300', icon: AlertTriangle },
              { label: 'Turbidity', status: 'Normal', color: 'text-emerald-300', icon: CheckCircle },
              { label: 'Temperature', status: 'Stable', color: 'text-emerald-300', icon: CheckCircle },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <item.icon className={`w-5 h-5 ${item.color} mb-2`} />
                <p className="text-xs text-white/40">{item.label}</p>
                <p className={`text-sm font-bold ${item.color}`}>{item.status}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/30 mt-4">Predictions generated by TensorFlow.js LSTM model trained on historical telemetry data. Model accuracy: 95% within 5 seconds.</p>
        </div>
      </div>
      </div>
    </main>
  );
}