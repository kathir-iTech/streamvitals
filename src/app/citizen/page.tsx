'use client';

import { useState } from 'react';
import { MapPin, Camera, Upload, CheckCircle, Clock, Share2, Heart, Star } from 'lucide-react';
import WaterCanvas from '@/components/water-canvas';
import AmbientWave from '@/components/ambient-wave';
import FloatingOrb from '@/components/floating-orb';

export default function CitizenSciencePage() {
  const [reports, setReports] = useState([
    { id: 'CIT-001', user: 'Jane D.', location: 'HUC-10 Stream Alpha', report: 'High turbidity near bridge, visible algal bloom', time: '2026-09-22 10:30', verified: true, upvotes: 12, photos: 2 },
    { id: 'CIT-002', user: 'Mike R.', location: 'HUC-11 Stream Beta', report: 'No fish observed this week, water clarity low', time: '2026-09-21 16:45', verified: true, upvotes: 8, photos: 1 },
    { id: 'CIT-003', user: 'Sarah L.', location: 'HUC-08 Stream Gamma', report: 'Invasive plant species spreading along eastern bank', time: '2026-09-21 09:15', verified: false, upvotes: 5, photos: 3 },
    { id: 'CIT-004', user: 'Tom K.', location: 'HUC-10 Stream Delta', report: 'Normal water conditions, diverse bird population', time: '2026-09-20 14:20', verified: true, upvotes: 15, photos: 0 },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ location: '', description: '' });

  const submitReport = () => {
    if (!formData.location || !formData.description) return;
    const newReport = {
      id: `CIT-${String(reports.length + 1).padStart(3, '0')}`,
      user: 'You',
      location: formData.location,
      report: formData.description,
      time: new Date().toLocaleString(),
      verified: false,
      upvotes: 0,
      photos: 0,
    };
    setReports([newReport, ...reports]);
    setShowForm(false);
    setFormData({ location: '', description: '' });
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      <WaterCanvas particleCount={60} speed={0.5} />
      <AmbientWave speed={0.3} amplitude={40} />
      <FloatingOrb size={300} color="rgba(45, 212, 191, 0.05)" speed={0.4} />
      <div className="relative z-10 max-w-5xl mx-auto p-4">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-teal-400 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Citizen Science Hub</h1>
            <p className="text-white/80 text-sm">Community-powered stream monitoring — Your observations matter</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all flex items-center gap-2">
            <MapPin className="w-4 h-4" /> {showForm ? 'Cancel' : 'Drop a Pin'}
          </button>
        </div>

        {showForm && (
          <div className="bg-[#111d35] backdrop-blur-xl rounded-2xl border border-emerald-500/15 p-6 mb-6 animate-scaleIn">
            <h2 className="text-lg font-bold mb-4">Report an Observation</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Stream Location (e.g., HUC-10 Stream Alpha)" className="w-full p-3 bg-[#111d35] border border-emerald-500/20 rounded-xl text-white text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              <textarea placeholder="Describe what you observe..." className="w-full h-24 p-3 bg-[#111d35] border border-emerald-500/20 rounded-xl text-white text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none resize-none" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              <div className="flex gap-3">
                <button className="flex-1 py-3 bg-[#111d35] border border-emerald-500/15 text-white rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                  <Camera className="w-4 h-4" /> Photo
                </button>
                <button onClick={submitReport} className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Submit Report
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Active Contributors', value: '247', icon: Heart, color: 'text-emerald-300' },
            { label: 'Verified Reports', value: '1,203', icon: CheckCircle, color: 'text-emerald-300' },
            { label: 'Streams Monitored', value: '38', icon: MapPin, color: 'text-amber-300' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#111d35] backdrop-blur-xl rounded-2xl border border-emerald-500/15 p-6">
              <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-white/80">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="bg-[#111d35] backdrop-blur-xl rounded-2xl border border-emerald-500/15 p-5 hover:border-emerald-500/20 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{report.user}</p>
                    <p className="text-xs text-white/80">{report.location} • {report.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {report.verified ? (
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  )}
                  <button className="flex items-center gap-1 text-xs text-white/80 hover:text-white/80 transition-all">
                    <Heart className="w-3 h-3" /> {report.upvotes}
                  </button>
                </div>
              </div>
              <p className="text-sm text-white/80 mb-2">{report.report}</p>
              {report.photos > 0 && (
                <div className="flex gap-2 mb-2">
                  {Array.from({ length: report.photos }).map((_, i) => (
                    <div key={i} className="w-16 h-16 bg-[#111d35] rounded-lg border border-emerald-500/15 flex items-center justify-center">
                      <Camera className="w-4 h-4 text-white/40" />
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3 mt-2">
                <button className="text-xs text-white/80 hover:text-white/80 transition-all flex items-center gap-1">
                  <Heart className="w-3 h-3" /> Upvote
                </button>
                <button className="text-xs text-white/80 hover:text-white/80 transition-all flex items-center gap-1">
                  <Share2 className="w-3 h-3" /> Share
                </button>
                <button className="text-xs text-white/80 hover:text-white/80 transition-all flex items-center gap-1">
                  <Star className="w-3 h-3" /> Flag
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-teal-500/10 border border-teal-400/20 rounded-2xl p-5 mt-6 backdrop-blur-xl">
          <p className="text-teal-200 text-sm">
            <CheckCircle className="w-4 h-4 inline mr-1" /> Community reports follow Darwin Core metadata standards for FAIR compliance. All reports are subject to expert verification before inclusion in official datasets.
          </p>
        </div>
      </div>
      </div>
    </main>
  );
}