'use client';

import { useState } from 'react';
import { Users, MapPin, Upload, CheckCircle, Star, Heart, Share2 } from 'lucide-react';

export default function CitizenPage() {
  const [reports, setReports] = useState([
    { id: 'CIT-001', user: 'Jane D.', location: 'HUC-10 Stream A', report: 'High turbidity near bridge', time: '2026-09-22 10:30', verified: true },
    { id: 'CIT-002', user: 'Mike R.', location: 'HUC-11 Stream B', report: 'No fish observed this week', time: '2026-09-21 16:45', verified: true },
    { id: 'CIT-003', user: 'Sarah L.', location: 'HUC-08 Stream C', report: 'Algal bloom near inlet', time: '2026-09-21 09:15', verified: false },
  ]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 text-white p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-teal-400 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Community Science Hub</h1>
          <p className="text-white/60 text-sm">Public dashboards &middot; Citizen reports &middot; Collaborative analysis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Active Contributors', value: '247', icon: Users, color: 'text-teal-300' },
            { label: 'Verified Reports', value: '1,203', icon: CheckCircle, color: 'text-emerald-300' },
            { label: 'Streams Monitored', value: '38', icon: MapPin, color: 'text-amber-300' },
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

        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/15 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="w-5 h-5 text-teal-400" />
            <h2 className="text-lg font-bold">Submit a Citizen Report</h2>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-4">
            <input type="text" placeholder="Stream Location (e.g., HUC-10 Stream A)" className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none" />
            <textarea placeholder="Describe what you observe at the stream..." className="w-full h-24 p-3 bg-white/5 border border-white/20 rounded-xl text-white text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none resize-none" />
            <div className="flex gap-3">
              <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all">
                <Upload className="w-4 h-4 inline mr-2" /> Submit Report
              </button>
              <button type="button" className="flex-1 py-3 bg-white/10 border border-white/15 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">
                <MapPin className="w-4 h-4 inline mr-2" /> Pin on Map
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/15 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-red-400" />
            <h2 className="text-lg font-bold">Recent Community Reports</h2>
          </div>
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{report.user}</span>
                    <span className="text-xs text-white/30">{report.time}</span>
                    {report.verified && <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">✓ Verified</span>}
                  </div>
                  <span className="text-xs text-white/40 font-mono">{report.id}</span>
                </div>
                <p className="text-sm text-white/70">{report.report}</p>
                <p className="text-xs text-teal-400 mt-1">{report.location}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-teal-500/10 border border-teal-400/20 rounded-2xl p-5 mt-6 backdrop-blur-xl">
          <p className="text-teal-200 text-sm">
            Citizen science data follows Darwin Core metadata standards for FAIR compliance. All public reports are subject to expert verification before inclusion in official datasets.
          </p>
        </div>
      </div>
    </main>
  );
}