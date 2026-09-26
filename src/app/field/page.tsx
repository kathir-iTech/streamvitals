'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { createSession, isIndexedDBAvailable, getSession } from '@/lib/field-session';

function StreamIllustration() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="200" cy="200" r="180" stroke="rgba(13,155,110,0.08)" strokeWidth="1" fill="none"/>
      <circle cx="200" cy="200" r="120" stroke="rgba(13,155,110,0.12)" strokeWidth="1" fill="none"/>
      <circle cx="200" cy="200" r="60" stroke="rgba(13,155,110,0.15)" strokeWidth="1" fill="none"/>
      <path d="M200 40 C200 40 140 140 140 200 C140 260 200 360 200 360 C200 360 260 260 260 200 C260 140 200 40 200 40Z" fill="rgba(13,155,110,0.06)" stroke="#0d9b6e" strokeWidth="2"/>
      <path d="M120 180 L280 180" stroke="rgba(0,0,0,0.08)" strokeWidth="1"/>
      <path d="M160 120 L240 120" stroke="rgba(0,0,0,0.06)" strokeWidth="1"/>
      <path d="M140 240 L260 240" stroke="rgba(0,0,0,0.06)" strokeWidth="1"/>
      <circle cx="200" cy="200" r="8" fill="#0d9b6e" opacity="0.3"/>
      <circle cx="150" cy="180" r="4" fill="#0d9b6e" opacity="0.4"/>
      <circle cx="250" cy="220" r="4" fill="#0d9b6e" opacity="0.4"/>
      <circle cx="180" cy="260" r="3" fill="#0d9b6e" opacity="0.3"/>
      <circle cx="220" cy="140" r="3" fill="#0d9b6e" opacity="0.3"/>
      <line x1="150" y1="180" x2="200" y2="200" stroke="#0d9b6e" strokeWidth="1" opacity="0.3"/>
      <line x1="250" y1="220" x2="200" y2="200" stroke="#0d9b6e" strokeWidth="1" opacity="0.3"/>
      <line x1="180" y1="260" x2="200" y2="200" stroke="#0d9b6e" strokeWidth="1" opacity="0.2"/>
      <line x1="220" y1="140" x2="200" y2="200" stroke="#0d9b6e" strokeWidth="1" opacity="0.2"/>
      <path d="M160 120 L180 100 L200 115 L220 100 L240 120" stroke="#0d9b6e" strokeWidth="1.5" fill="none" opacity="0.5"/>
      <path d="M160 240 L180 260 L200 245 L220 260 L240 240" stroke="#0d9b6e" strokeWidth="1.5" fill="none" opacity="0.5"/>
      <ellipse cx="200" cy="320" rx="30" ry="12" fill="rgba(13,155,110,0.1)" stroke="#0d9b6e" strokeWidth="1.5"/>
      <ellipse cx="130" cy="100" rx="18" ry="10" fill="rgba(13,155,110,0.08)" stroke="#0d9b6e" strokeWidth="1"/>
      <ellipse cx="270" cy="300" rx="18" ry="10" fill="rgba(13,155,110,0.08)" stroke="#0d9b6e" strokeWidth="1"/>
      <rect x="185" y="60" width="30" height="8" rx="4" fill="#0d9b6e" opacity="0.3"/>
    </svg>
  );
}

export default function FieldPage() {
  const [streamName, setStreamName] = useState('');
  const [volunteer, setVolunteer] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [existingSession, setExistingSession] = useState<{ sessionId: string; streamName: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;
    const now = new Date();
    setDate(now.toISOString().split('T')[0]);
    setTime(now.toTimeString().slice(0, 5));
    if (isIndexedDBAvailable()) {
      getSession('current').then((session) => {
        if (session && !session.completedAt) {
          setExistingSession({ sessionId: session.sessionId, streamName: session.streamName });
        }
      }).catch(() => {});
    }
  }, []);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamName.trim()) { setError('Please enter a stream name or location'); return; }
    setLoading(true);
    setError('');
    try {
      const sessionId = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const now = new Date().toISOString();
      const session = {
        sessionId,
        streamName: streamName.trim(),
        volunteer: volunteer.trim(),
        date,
        indicators: [
          { indicatorId: 'BMI-01', indicatorName: 'Benthic Macroinvertebrates', type: 'citizen_observable' as const, photos: [], notes: '', timestamp: now, status: 'complete' as const },
          { indicatorId: 'BIR-04', indicatorName: 'Birds', type: 'citizen_observable' as const, photos: [], notes: '', timestamp: now, status: 'complete' as const },
          { indicatorId: 'INV-11', indicatorName: 'Invasive Alien Plants of the Riparian Corridor', type: 'citizen_observable' as const, photos: [], notes: '', timestamp: now, status: 'complete' as const },
          { indicatorId: 'FCL-06', indicatorName: 'Fecal Coliforms', type: 'lab_only' as const, photos: [], notes: '', sampleLabel: `SMP-${date.replace(/-/g, '')}-001`, labProtocolGuidance: 'Water samples collected and analyzed using complementary methods. Culture-based testing: filter known volume of water, place filter on selective growth medium, incubate at warm temperatures, count colonies as CFU/100mL. Enzyme-substrate tests use color changes or fluorescence. qPCR detects specific DNA sequences. Metabarcoding confirms presence of indicator bacteria.', status: 'pending_lab_analysis' as const, timestamp: now },
          { indicatorId: 'DIA-10', indicatorName: 'Diatoms and Diatom Teratology', type: 'lab_only' as const, photos: [], notes: '', sampleLabel: `SMP-${date.replace(/-/g, '')}-002`, labProtocolGuidance: 'Periphytic diatoms scraped from surface of submerged stones/substrate. Cleaned in lab using nitric acid and potassium dichromate at room temperature for 24h. Permanent slides prepared using Naphrax®. About 400 diatom valves identified and counted per sample under stereomicroscope.', status: 'pending_lab_analysis' as const, timestamp: now },
        ],
        startedAt: now,
      };
      const result = await createSession(session);
      if (result.success) {
        sessionStorage.setItem('current_session_id', sessionId);
        window.location.href = '/field/bmi-01';
      } else {
        setError(result.error || 'Failed to create session');
      }
    } catch (err) {
      setError('Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (existingSession) {
      sessionStorage.setItem('current_session_id', existingSession.sessionId);
      window.location.href = '/field/bmi-01';
    }
  };

  return (
    <main className="min-h-screen bg-[#ffffff]">
      <div className="hero-split">
        <div className="hero-left">
          <div className="animate-fadeInUp">
            <div className="inline-flex items-center gap-2 mb-6 bg-[rgba(13,155,110,0.08)] border border-[rgba(13,155,110,0.15)] px-4 py-2 rounded-full">
              <span className="w-1.5 h-1.5 bg-[#0d9b6e] rounded-full" />
              <span className="text-xs font-semibold text-[#0d9b6e] tracking-wide uppercase">OneAquaHealth IEEE 2026</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 text-black leading-[1.05]">
              Take the<br />stream&rsquo;s vitals
            </h1>
            <p className="text-lg text-[rgba(0,0,0,0.5)] leading-relaxed max-w-md mb-10">
              Collect real field data across five official OneAquaHealth indicators. No assessment, no tier, no verdict — just structured observation.
            </p>
            <form onSubmit={handleStart} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgba(0,0,0,0.5)] mb-1.5" htmlFor="stream-name">Stream Name / Location</label>
                <input
                  id="stream-name"
                  type="text"
                  value={streamName}
                  onChange={(e) => setStreamName(e.target.value)}
                  placeholder="e.g., Cedar Creek, Riverside Park"
                  className="w-full max-w-sm px-4 py-3 bg-[#f5faf7] border border-[rgba(0,0,0,0.08)] rounded-full text-black placeholder-[rgba(0,0,0,0.25)] focus:ring-2 focus:ring-[#0d9b6e] focus:outline-none transition-all text-sm font-medium"
                  required
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[rgba(0,0,0,0.5)] mb-1.5" htmlFor="session-date">Date</label>
                  <input id="session-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 bg-[#f5faf7] border border-[rgba(0,0,0,0.08)] rounded-full text-black focus:ring-2 focus:ring-[#0d9b6e] focus:outline-none text-sm font-medium" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[rgba(0,0,0,0.5)] mb-1.5" htmlFor="session-time">Time</label>
                  <input id="session-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full px-4 py-3 bg-[#f5faf7] border border-[rgba(0,0,0,0.08)] rounded-full text-black focus:ring-2 focus:ring-[#0d9b6e] focus:outline-none text-sm font-medium" />
                </div>
              </div>
              {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
              <button type="submit" disabled={loading} className="btn-pill-accent text-lg">
                {loading ? 'Starting session...' : 'Start Monitoring Session'}
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="pt-2">
                <p className="text-xs text-[rgba(0,0,0,0.3)]">5 official indicators · CC-BY factsheet · DOI:10.5281/zenodo.20345207</p>
              </div>
            </form>
            {existingSession && (
              <div className="mt-8 p-5 bg-[#f5faf7] border border-[rgba(13,155,110,0.15)] rounded-2xl animate-fadeInScale">
                <p className="text-sm text-[rgba(0,0,0,0.6)] font-medium">Continue session for <span className="text-[#0d9b6e] font-bold">{existingSession.streamName}</span></p>
                <button onClick={handleContinue} className="mt-3 btn-pill-outline text-sm">Continue Monitoring <ArrowRight className="w-3 h-3 ml-1" /></button>
              </div>
            )}
          </div>
        </div>
        <div className="hero-right">
          <StreamIllustration />
        </div>
      </div>

      <div className="stats-strip">
        <div className="stat-item">
          <span className="text-3xl font-black tracking-tighter">5</span>
          <span className="text-xs text-[rgba(0,0,0,0.4)] font-medium">OneAquaHealth Indicators</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="text-3xl font-black tracking-tighter">CC-BY</span>
          <span className="text-xs text-[rgba(0,0,0,0.4)] font-medium">Factsheet License</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="text-3xl font-black tracking-tighter">IEEE 2026</span>
          <span className="text-xs text-[rgba(0,0,0,0.4)] font-medium">Hackathon</span>
        </div>
      </div>
    </main>
  );
}
