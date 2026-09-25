'use client';

import { useState, useEffect, useRef } from 'react';
import WaterCanvas from '@/components/water-canvas';
import AmbientWave from '@/components/ambient-wave';
import FloatingOrb from '@/components/floating-orb';
import { ArrowRight } from 'lucide-react';
import { createSession, isIndexedDBAvailable, getSession } from '@/lib/field-session';

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
    <main className="min-h-screen bg-[#070d1a] relative overflow-hidden">
      <WaterCanvas particleCount={120} speed={1.2} />
      <AmbientWave speed={0.5} amplitude={80} />
      <FloatingOrb size={500} color="rgba(0, 229, 160, 0.06)" speed={0.4} />
      <FloatingOrb size={400} color="rgba(0, 180, 216, 0.04)" speed={0.6} mouseReact={false} />
      <FloatingOrb size={300} color="rgba(255, 107, 53, 0.03)" speed={0.3} mouseReact={false} />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm text-emerald-300 font-medium">Field Companion</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter mb-3 bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent">
              Field Companion
            </h1>
            <p className="text-lg text-white/50">Collect real data. No assessment. No verdict.</p>
          </div>

          {existingSession ? (
            <div className="bg-[#111d35] border border-emerald-500/15 rounded-2xl p-8 animate-fadeInScale">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">📋</div>
                <h2 className="text-2xl font-bold mb-2 text-white">Continue Previous Session</h2>
                <p className="text-white/40 text-sm">Session for <strong className="text-emerald-300">{existingSession.streamName}</strong> was started but not completed.</p>
              </div>
              <button onClick={handleContinue} className="w-full py-4 btn-primary text-lg flex items-center justify-center gap-3">
                Continue Monitoring
                <ArrowRight className="w-5 h-5" />
              </button>
              <div className="mt-4 text-center">
                <button onClick={() => { setExistingSession(null); setStreamName(''); setVolunteer(''); }} className="text-xs text-white/30 hover:text-white/50 transition-colors">
                  Start a new session instead
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleStart} className="bg-[#111d35] border border-emerald-500/15 rounded-2xl p-8 animate-fadeInScale">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5" htmlFor="stream-name">Stream Name / Location</label>
                  <input
                    id="stream-name"
                    type="text"
                    value={streamName}
                    onChange={(e) => setStreamName(e.target.value)}
                    placeholder="e.g., Cedar Creek, Riverside Park"
                    className="w-full p-3.5 bg-[#070d1a] border border-emerald-500/15 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5" htmlFor="volunteer">Volunteer Name <span className="text-white/20">(optional)</span></label>
                  <input
                    id="volunteer"
                    type="text"
                    value={volunteer}
                    onChange={(e) => setVolunteer(e.target.value)}
                    placeholder="Your name"
                    className="w-full p-3.5 bg-[#070d1a] border border-emerald-500/15 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5" htmlFor="session-date">Date</label>
                    <input id="session-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3.5 bg-[#070d1a] border border-emerald-500/15 rounded-xl text-white focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5" htmlFor="session-time">Time</label>
                    <input id="session-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full p-3.5 bg-[#070d1a] border border-emerald-500/15 rounded-xl text-white focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all" />
                  </div>
                </div>
                {error && <div className="text-red-300 text-sm text-center">{error}</div>}
                <button type="submit" disabled={loading} className="w-full py-4 btn-primary text-lg flex items-center justify-center gap-3">
                  {loading ? 'Starting session...' : 'Start Monitoring Session'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 bg-[#111d35] border border-emerald-500/10 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-400 text-sm">ℹ</span>
              </div>
              <div>
                <p className="text-sm text-white/70 font-medium">What you will collect</p>
                <p className="text-xs text-white/40 mt-1 leading-relaxed">
                  Five official OneAquaHealth indicators across citizen observations and laboratory samples. No scores, no tiers, no verdicts — just structured field data aligned with the OneAquaHealth indicator framework (doi:10.5281/zenodo.20345207).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
