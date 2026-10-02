'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { createSession, isIndexedDBAvailable, getSession, getAllSessions, type SessionLocation } from '@/lib/field-session';
import { computeObservationFrequencies, type IndicatorFrequency } from '@/lib/observation-frequencies';
import { indicators } from '@/data/indicators';
import { LAB_PROTOCOL_GUIDANCE } from '@/data/lab-protocol-guidance';

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
  const [frequencies, setFrequencies] = useState<IndicatorFrequency[]>([]);
  const [location, setLocation] = useState<SessionLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
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
      getAllSessions().then((sessions) => {
        setFrequencies(computeObservationFrequencies(sessions));
      }).catch(() => {});
    }
  }, []);

  const stateLabel = (indicatorId: string, state: string): string => {
    const ind = indicators.find((i) => i.id === indicatorId);
    return ind?.citizen_state_labels?.[state] || state.replace(/_/g, ' ');
  };

  const handleCaptureLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationError('Location is not available in this browser — you can start without it.');
      return;
    }
    setLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracyM: typeof pos.coords.accuracy === 'number' ? pos.coords.accuracy : null,
          capturedAt: new Date().toISOString(),
        });
        setLocating(false);
      },
      (err) => {
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied — you can start without it.'
            : 'Could not read the location — you can start without it.',
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

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
          { indicatorId: 'FCL-06', indicatorName: 'Fecal Coliforms', type: 'lab_only' as const, photos: [], notes: '', sampleLabel: `SMP-${date.replace(/-/g, '')}-001`, labProtocolGuidance: LAB_PROTOCOL_GUIDANCE['FCL-06'], status: 'pending_lab_analysis' as const, timestamp: now },
          { indicatorId: 'DIA-10', indicatorName: 'Diatoms and Diatom Teratology', type: 'lab_only' as const, photos: [], notes: '', sampleLabel: `SMP-${date.replace(/-/g, '')}-002`, labProtocolGuidance: LAB_PROTOCOL_GUIDANCE['DIA-10'], status: 'pending_lab_analysis' as const, timestamp: now },
        ],
        startedAt: now,
        ...(location ? { location } : {}),
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
              Collect real field data across five official OneAquaHealth indicators, then see a deterministic assessment with its full chain of evidence. AI may explain — AI never scores.
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
                  <label className="block text-sm font-medium text-[rgba(0,0,0,0.5)] mb-1.5" htmlFor="volunteer-name">Volunteer Name</label>
                  <input
                    id="volunteer-name"
                    type="text"
                    value={volunteer}
                    onChange={(e) => setVolunteer(e.target.value)}
                    placeholder="e.g., Jordan Reyes"
                    className="w-full px-4 py-3 bg-[#f5faf7] border border-[rgba(0,0,0,0.08)] rounded-full text-black placeholder-[rgba(0,0,0,0.25)] focus:ring-2 focus:ring-[#0d9b6e] focus:outline-none transition-all text-sm font-medium"
                  />
                </div>
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
              <div>
                <label className="block text-sm font-medium text-[rgba(0,0,0,0.5)] mb-1.5">Session location (optional, stays on your device)</label>
                {location ? (
                  <div data-testid="session-location" className="w-full max-w-sm px-4 py-3 bg-[#f5faf7] border border-[rgba(13,155,110,0.25)] rounded-full text-sm font-medium flex items-center justify-between gap-3">
                    <span className="text-black">
                      {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                      {location.accuracyM !== null && <span className="text-[rgba(0,0,0,0.45)]"> (±{Math.round(location.accuracyM)} m)</span>}
                    </span>
                    <button type="button" onClick={() => setLocation(null)} className="text-xs text-[rgba(0,0,0,0.4)] hover:text-red-500 font-semibold">Remove</button>
                  </div>
                ) : (
                  <button type="button" data-testid="capture-location" onClick={handleCaptureLocation} disabled={locating} className="btn-pill-outline text-sm">
                    {locating ? 'Locating…' : 'Use my location (GPS)'}
                  </button>
                )}
                {locationError && <p className="text-xs text-red-500 font-medium mt-1.5">{locationError}</p>}
              </div>
              {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
              <button type="submit" disabled={loading} className="btn-pill-accent text-lg whitespace-nowrap">
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

      {frequencies.length > 0 && (
        <section aria-label="Observation frequencies" className="max-w-5xl mx-auto px-6 pb-12">
          <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-2xl p-6">
            <h2 className="text-sm font-bold text-black mb-1">Observation frequencies</h2>
            <p className="text-xs text-[rgba(0,0,0,0.4)] mb-5">
              Counts of states recorded in your saved sessions — frequencies of what was observed, not predictions of stream condition.
            </p>
            <div className="space-y-4">
              {frequencies.map((f) => (
                <div key={f.indicatorId}>
                  <p className="text-xs font-bold text-[rgba(0,0,0,0.6)] mb-2">{f.indicatorName}</p>
                  <div className="flex flex-wrap gap-2">
                    {f.states.map((s) => (
                      <span key={s.state} className="text-[11px] bg-[#f5faf7] border border-[rgba(13,155,110,0.15)] text-[rgba(0,0,0,0.6)] px-3 py-1.5 rounded-full">
                        {stateLabel(f.indicatorId, s.state)} <span className="font-bold text-[#0d9b6e]">{s.count}×</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
