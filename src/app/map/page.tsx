'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Activity, Filter, Search, Layers, ChevronDown, ArrowUp, Bot } from 'lucide-react';
import WaterCanvas from '@/components/water-canvas';
import AmbientWave from '@/components/ambient-wave';
import FloatingOrb from '@/components/floating-orb';
import Link from 'next/link';

export default function LiveMapPage() {
  const [sensors, setSensors] = useState([
    { id: 'BMI-01', name: 'Benthic Macroinvertebrates', lat: 41.0, lon: -85.0, status: 'healthy', ph: 7.2, do: 8.1, turbidity: 12 },
    { id: 'BIR-04', name: 'Birds', lat: 41.5, lon: -84.5, status: 'warning', ph: 6.8, do: 5.5, turbidity: 45 },
    { id: 'INV-11', name: 'Invasive Plants', lat: 40.5, lon: -85.5, status: 'critical', ph: 5.2, do: 3.1, turbidity: 85 },
    { id: 'FCL-06', name: 'Fecal Coliforms', lat: 41.2, lon: -84.8, status: 'healthy', ph: 7.0, do: 7.8, turbidity: 15 },
    { id: 'DIA-10', name: 'Diatoms', lat: 40.8, lon: -85.2, status: 'warning', ph: 6.5, do: 5.2, turbidity: 38 },
    { id: 'BMI-01', name: 'Stream Alpha', lat: 41.3, lon: -84.3, status: 'healthy', ph: 7.4, do: 8.5, turbidity: 8 },
    { id: 'BIR-04', name: 'Stream Beta', lat: 40.7, lon: -85.7, status: 'critical', ph: 4.8, do: 2.1, turbidity: 120 },
  ]);
  const [selectedSensor, setSelectedSensor] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSensors = sensors
    .filter((s) => filterStatus === 'all' || s.status === filterStatus)
    .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const statusColors: Record<string, string> = {
    healthy: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500 animate-pulse',
  };

  const statusLabels: Record<string, string> = {
    healthy: 'Healthy',
    warning: 'Attention Needed',
    critical: 'Critical',
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      <WaterCanvas particleCount={60} speed={0.6} />
      <AmbientWave speed={0.3} amplitude={50} />
      <FloatingOrb size={300} color="rgba(45, 212, 191, 0.06)" speed={0.5} />
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 bg-black/30 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-teal-400" />
          <h1 className="text-2xl font-bold">Live Stream Monitor</h1>
          <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Live
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search streams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white/10 border border-white/15 rounded-lg text-sm text-white placeholder-white/30 focus:ring-2 focus:ring-teal-400 focus:outline-none w-64"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/15 rounded-lg text-sm text-white focus:ring-2 focus:ring-teal-400 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="healthy">Healthy</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-teal-900/50 to-slate-900 pointer-events-none" />
          
          {/* Map area — interactive grid representation */}
          <div className="absolute inset-0 p-4">
            <div className="grid grid-cols-7 grid-rows-5 gap-3 h-full">
              {Array.from({ length: 35 }).map((_, i) => {
                const sensor = filteredSensors[i % filteredSensors.length];
                return (
                  <div
                    key={i}
                    onClick={() => setSelectedSensor(sensor)}
                    className={`rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 ${
                      selectedSensor?.id === sensor.id ? 'ring-2 ring-teal-400 ring-offset-2 ring-offset-slate-900' : ''
                    } border-white/20 bg-white/5 hover:bg-white/10`}
                    style={{
                      borderColor: sensor ? (sensor.status === 'healthy' ? 'rgba(52,211,153,0.5)' : sensor.status === 'warning' ? 'rgba(251,191,36,0.5)' : 'rgba(248,113,113,0.5)') : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    <div className={`w-6 h-6 rounded-full ${statusColors[sensor?.status || 'healthy']} mb-1`} />
                    <span className="text-xs text-white/60 text-center leading-tight px-1">{sensor?.name?.split(' ')[0] || 'Stream'}</span>
                    <span className={`text-xs font-bold ${sensor?.status === 'healthy' ? 'text-emerald-300' : sensor?.status === 'warning' ? 'text-amber-300' : 'text-red-300'}`}>
                      {sensor ? statusLabels[sensor.status] : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sensor detail panel */}
          {selectedSensor && (
            <div className="absolute top-4 right-4 w-80 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/15 p-6 animate-scaleIn">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${statusColors[selectedSensor.status]}`} />
                  <h3 className="font-bold">{selectedSensor.name}</h3>
                </div>
                <button onClick={() => setSelectedSensor(null)} className="text-white/40 hover:text-white">✕</button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between bg-white/5 rounded-lg p-3">
                  <span className="text-xs text-white/40">pH Level</span>
                  <span className={`text-sm font-bold ${selectedSensor.ph >= 6.5 ? 'text-emerald-300' : 'text-red-300'}`}>{selectedSensor.ph}</span>
                </div>
                <div className="flex justify-between bg-white/5 rounded-lg p-3">
                  <span className="text-xs text-white/40">Dissolved Oxygen</span>
                  <span className={`text-sm font-bold ${selectedSensor.do >= 5 ? 'text-emerald-300' : 'text-red-300'}`}>{selectedSensor.do} mg/L</span>
                </div>
                <div className="flex justify-between bg-white/5 rounded-lg p-3">
                  <span className="text-xs text-white/40">Turbidity</span>
                  <span className={`text-sm font-bold ${selectedSensor.turbidity <= 25 ? 'text-emerald-300' : 'text-red-300'}`}>{selectedSensor.turbidity} NTU</span>
                </div>
                <div className="flex justify-between bg-white/5 rounded-lg p-3">
                  <span className="text-xs text-white/40">Status</span>
                  <span className={`text-sm font-bold ${selectedSensor.status === 'healthy' ? 'text-emerald-300' : selectedSensor.status === 'warning' ? 'text-amber-300' : 'text-red-300'}`}>
                    {statusLabels[selectedSensor.status]}
                  </span>
                </div>
                <button className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all mt-2">
                  View Full Assessment →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Side panel: sensor list */}
        <div className="w-80 bg-slate-900/50 backdrop-blur-xl border-l border-white/10 p-4 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold">All Sensors</h3>
            <span className="text-xs text-white/40">({filteredSensors.length})</span>
          </div>
          <div className="space-y-2">
            {filteredSensors.map((sensor, i) => (
              <div
                key={i}
                onClick={() => setSelectedSensor(sensor)}
                className={`bg-white/5 rounded-xl p-3 border border-white/10 cursor-pointer hover:border-white/20 transition-all ${
                  selectedSensor?.id === sensor.id ? 'border-teal-400/50 bg-teal-500/10' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${statusColors[sensor.status]}`} />
                    <span className="text-sm font-medium">{sensor.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${sensor.status === 'healthy' ? 'bg-emerald-500/20 text-emerald-300' : sensor.status === 'warning' ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'}`}>
                    {statusLabels[sensor.status]}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/40">
                  <span>pH: {sensor.ph}</span>
                  <span>DO: {sensor.do}</span>
                  <span>Turb: {sensor.turbidity}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-teal-400" />
              <h4 className="text-sm font-bold">Quick Stats</h4>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="text-center">
                <p className="text-lg font-black text-emerald-300">
                  {filteredSensors.filter((s) => s.status === 'healthy').length}
                </p>
                <p className="text-xs text-white/40">Healthy</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-amber-300">
                  {filteredSensors.filter((s) => s.status === 'warning').length}
                </p>
                <p className="text-xs text-white/40">Warning</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-red-300">
                  {filteredSensors.filter((s) => s.status === 'critical').length}
                </p>
                <p className="text-xs text-white/40">Critical</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-white">{filteredSensors.length}</p>
                <p className="text-xs text-white/40">Total</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Link href="/ai-copilot" className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-teal-500/30 hover:opacity-90 transition-all" aria-label="Open AI Copilot">
        <Bot className="w-5 h-5" /> Ask AI Copilot
      </Link>
    </div>
    </main>
  );
}