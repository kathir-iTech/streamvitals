'use client';

import { useState } from 'react';
import { Database, Cloud, Clock, Download, Upload, Shield, Activity, Layers, FileJson } from 'lucide-react';

export default function ManagePage() {
  const [timeSeries, setTimeSeries] = useState([
    { time: '2026-09-22 14:00', pH: 7.2, DO: 8.1, turbidity: 12 },
    { time: '2026-09-22 13:30', pH: 7.1, DO: 8.3, turbidity: 15 },
    { time: '2026-09-22 13:00', pH: 7.0, DO: 7.9, turbidity: 18 },
    { time: '2026-09-22 12:30', pH: 6.9, DO: 7.5, turbidity: 22 },
    { time: '2026-09-22 12:00', pH: 7.0, DO: 7.8, turbidity: 16 },
  ]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 text-white p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-teal-400 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Data Management</h1>
          <p className="text-white/60 text-sm">TimescaleDB &middot; InfluxDB &middot; OGC STA &middot; FROST Server &middot; Metadata Management</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Storage', value: '128GB', icon: Database, color: 'text-teal-300' },
            { label: 'Uptime', value: '99.99%', icon: Activity, color: 'text-emerald-300' },
            { label: 'Sensor Nodes', value: '24', icon: Layers, color: 'text-amber-300' },
            { label: 'Data Points', value: '1.2M', icon: FileJson, color: 'text-purple-300' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-6">
              <div className="flex items-center gap-3 mb-3">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider">{stat.label}</p>
                  <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/15 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Cloud className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold">Storage Architecture</h2>
            </div>
            <div className="space-y-3">
              {[
                { name: 'TimescaleDB', desc: 'Time-series sensor data', status: 'Active' },
                { name: 'InfluxDB', desc: 'IoT telemetry metrics', status: 'Active' },
                { name: 'PostgreSQL', desc: 'Metadata & OGC STA', status: 'Active' },
                { name: 'S3', desc: 'Archival & exports', status: 'Active' },
              ].map((db, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{db.name}</p>
                    <p className="text-xs text-white/40">{db.desc}</p>
                  </div>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">{db.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/15 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-bold">Time-Series Data (Latest)</h2>
            </div>
            <div className="space-y-2">
              {timeSeries.map((point, i) => (
                <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
                  <span className="text-xs text-white/40">{point.time}</span>
                  <div className="flex gap-4 text-xs">
                    <span className="text-emerald-300">pH: {point.pH}</span>
                    <span className="text-teal-300">DO: {point.DO}</span>
                    <span className="text-amber-300">Turb: {point.turbidity}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/30 mt-3">Update interval: 30 seconds &middot; OGC SensorThings API endpoint</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/15 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold">Data Integrity</h2>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Encryption at Rest', status: 'AES-256' },
                { label: 'Encryption in Transit', status: 'TLS 1.3' },
                { label: 'Backup Schedule', status: 'Daily' },
                { label: 'Retention Policy', status: '5 years' },
                { label: 'Audit Logging', status: 'Enabled' },
                { label: 'Access Control', status: 'RBAC' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
                  <span className="text-sm text-white/70">{item.label}</span>
                  <span className="text-xs text-emerald-300 font-mono">{item.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/15 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileJson className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-bold">Metadata Standards</h2>
            </div>
            <div className="space-y-2">
              {[
                { standard: 'OGC SensorThings API v1.1', description: 'Sensor observation exchange', compliance: 'Full' },
                { standard: 'WaterML 2.0 Part 5', description: 'Water quality data model', compliance: 'Full' },
                { standard: 'ISO 19156 (O&M)', description: 'Observations & Measurements', compliance: 'Full' },
                { standard: 'OGC API – Functions', description: 'Server-side processing', compliance: 'Partial' },
                { standard: 'Darwin Core', description: 'Biodiversity metadata', compliance: 'Full' },
                { standard: 'WQP/STORET', description: 'EPA data exchange', compliance: 'Full' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
                  <div>
                    <p className="text-sm font-medium">{item.standard}</p>
                    <p className="text-xs text-white/40">{item.description}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${item.compliance === 'Full' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                    {item.compliance}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <button className="flex-1 py-3 bg-white/10 border border-white/15 text-white rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Export Dataset
          </button>
          <button className="flex-1 py-3 bg-white/10 border border-white/15 text-white rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" /> Import Data
          </button>
        </div>

        <div className="bg-teal-500/10 border border-teal-400/20 rounded-2xl p-5 backdrop-blur-xl">
          <p className="text-teal-200 text-sm">
            <Shield className="w-4 h-4 inline mr-1" /> Data provenance is maintained using Ed25519-signed manifests. All sensor readings are tagged with OGC observation IDs and can be queried via SensorThings API REST endpoints.
          </p>
        </div>
      </div>
    </main>
  );
}