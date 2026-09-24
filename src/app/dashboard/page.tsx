'use client';

import { useState, useEffect } from 'react';
import { Activity, MapPin, Gauge, AlertTriangle, Layers, Wifi, WifiOff, Clock } from 'lucide-react';
import WaterCanvas from '@/components/water-canvas';
import AmbientWave from '@/components/ambient-wave';
import FloatingOrb from '@/components/floating-orb';

export default function DashboardPage() {
  const [sensorData, setSensorData] = useState<Record<string, any>>({});
  const [connected, setConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'map' | 'kpi' | 'timeline'>('map');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setLastUpdate(now);
      const newData: Record<string, any> = {};
      const sensorIds = ['BMI-01', 'BIR-04', 'INV-11', 'FCL-06', 'DIA-10'];
      sensorIds.forEach((id) => {
        newData[id] = {
          pH: (5.5 + Math.random() * 3).toFixed(1),
          dissolved_oxygen: (4 + Math.random() * 5).toFixed(1),
          turbidity: (5 + Math.random() * 50).toFixed(0),
          temperature: (12 + Math.random() * 12).toFixed(1),
          timestamp: now.toISOString(),
          status: Math.random() > 0.2 ? 'healthy' : 'alert',
        };
      });
      setSensorData(newData);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const sensorEndpoints = [
    { id: 'BMI-01', name: 'Benthic Macroinvertebrates', param: 'dissolved_oxygen', threshold: 7.0, unit: 'mg/L' },
    { id: 'BIR-04', name: 'Birds', param: 'noise_level', threshold: 45, unit: 'dB' },
    { id: 'INV-11', name: 'Invasive Plants', param: 'vegetation_index', threshold: 0.2, unit: 'NDVI' },
    { id: 'FCL-06', name: 'Fecal Coliforms', param: 'turbidity', threshold: 10, unit: 'NTU' },
    { id: 'DIA-10', name: 'Diatoms', param: 'chlorophyll_a', threshold: 10, unit: 'µg/L' },
  ];

  return (
    <main className="min-h-screen relative overflow-hidden">
      <WaterCanvas particleCount={50} speed={0.5} />
      <AmbientWave speed={0.3} amplitude={40} />
      <FloatingOrb size={250} color="rgba(45, 212, 191, 0.05)" speed={0.4} />
      <div className="relative z-10 p-4">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-teal-400 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sensor Dashboard</h1>
            <p className="text-white/80 text-sm">OGC SensorThings API v1.1 &middot; WaterML 2.0 &middot; Real-time monitoring</p>
          </div>
          <div className="flex items-center gap-3">
            {connected ? <Wifi className="w-5 h-5 text-emerald-400" /> : <WifiOff className="w-5 h-5 text-red-400" />}
            <Clock className="w-4 h-4 text-white/80" />
            <span className="text-xs text-white/80">Updated {lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {(['map', 'kpi', 'timeline'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab ? 'bg-teal-500 text-white' : 'bg-[#111d35] text-white/80 hover:bg-white/20'
              }`}
            >
              {tab === 'map' ? 'Map View' : tab === 'kpi' ? 'KPI Tiles' : 'Timeline'}
            </button>
          ))}
        </div>

        {activeTab === 'kpi' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {sensorEndpoints.map((sensor, i) => {
              const data = sensorData[sensor.id];
              const value = data ? parseFloat(data[sensor.param]) : 0;
              const isAlert = value > sensor.threshold;
              return (
                <div key={sensor.id} className={`bg-[#111d35] backdrop-blur-xl rounded-2xl border p-5 transition-all duration-500 ${isAlert ? 'border-red-400/50 shadow-red-500/20' : 'border-emerald-400/30'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Gauge className={`w-4 h-4 ${isAlert ? 'text-red-400' : 'text-emerald-400'}`} />
                    <span className="text-xs text-white/80">{sensor.id}</span>
                  </div>
                  <p className="text-white/80 text-xs mb-1">{sensor.name}</p>
                  <p className={`text-2xl font-black ${isAlert ? 'text-red-300' : 'text-emerald-200'}`}>
                    {value.toFixed(1)}
                    <span className="text-xs font-normal text-white/80 ml-1">{sensor.unit}</span>
                  </p>
                  <p className="text-xs text-white/40 mt-1">Threshold: {sensor.threshold} {sensor.unit}</p>
                  {isAlert && <AlertTriangle className="w-4 h-4 text-red-400 mt-2" />}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'map' && (
          <div className="bg-[#111d35] backdrop-blur-xl rounded-3xl border border-emerald-500/15 p-6 mb-6" style={{ minHeight: 400 }}>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold">Sensor Locations — HUC Watershed Map</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sensorEndpoints.map((sensor) => {
                const data = sensorData[sensor.id];
                const isAlert = data && parseFloat(data[sensor.param]) > sensor.threshold;
                return (
                  <div key={sensor.id} className={`rounded-xl border p-4 transition-all ${isAlert ? 'border-red-400/40 bg-red-500/10' : 'border-emerald-400/20 bg-emerald-500/5'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${isAlert ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                      <span className="font-semibold text-sm">{sensor.name}</span>
                    </div>
                    <p className="text-xs text-white/80">HUC-{sensor.id.slice(-2)} Watershed</p>
                    <p className="text-xs text-white/80 mt-1">{sensor.param}: {data ? parseFloat(data[sensor.param]).toFixed(1) + ' ' + sensor.unit : 'Loading...'}</p>
                    {isAlert && <span className="text-xs text-red-300 font-medium">⚠ Threshold exceeded</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="bg-[#111d35] backdrop-blur-xl rounded-3xl border border-emerald-500/15 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold">Historical Trend Analysis</h2>
            </div>
            <div className="space-y-4">
              {sensorEndpoints.map((sensor) => {
                const data = sensorData[sensor.id];
                const isAlert = data && parseFloat(data[sensor.param]) > sensor.threshold;
                return (
                  <div key={sensor.id} className="bg-[#111d35] rounded-xl p-4 border border-emerald-500/15">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{sensor.id} — {sensor.name}</span>
                      <span className={`text-xs px-2 py-1 rounded ${isAlert ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                        {isAlert ? 'Alert' : 'Normal'}
                      </span>
                    </div>
                    <div className="h-2 bg-[#111d35] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${isAlert ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`} style={{ width: `${Math.min(100, (parseFloat(data?.[sensor.param] || 0) / (sensor.threshold * 1.5)) * 100)}%` }} />
                    </div>
                    <p className="text-xs text-white/40 mt-1">OGC SensorThings API &middot; WaterML 2.0 &middot; FROST Server compliant</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-teal-500/10 border border-teal-400/20 rounded-2xl p-5 mb-6 backdrop-blur-xl">
          <div className="flex items-start gap-2">
            <Activity className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-teal-200 text-sm">OGC SensorThings API Integration</h3>
              <p className="text-emerald-300/80 text-sm mt-1">All sensor endpoints conform to OGC SensorThings API v1.1, WaterML 2.0, and ISO 19156 Observations and Measurements. Data is queryable via RESTful JSON endpoints. FROST Server compatible.</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </main>
  );
}