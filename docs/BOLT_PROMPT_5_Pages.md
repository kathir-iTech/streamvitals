# BOLT PROMPT 5: PAGES & NAVIGATION
Paste this fifth into Bolt AI.

## src/app/field/page.tsx
```typescript
'use client';
import { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { saveSession, isIndexedDBAvailable, getSession } from '@/lib/field-session';
const INDICATOR_IDS = ['BMI-01', 'BIR-04', 'INV-11', 'FCL-06', 'DIA-10'];
const LAB_ONLY_IDS = ['FCL-06', 'DIA-10'];
export default function FieldPage() {
  const [streamName, setStreamName] = useState('');
  const [volunteerName, setVolunteerName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [date, setDate] = useState('');
  const [existingSession, setExistingSession] = useState<{ sessionId: string; streamName: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const hasChecked = useRef(false);
  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;
    const now = new Date(); setDate(now.toISOString().split('T')[0]);
    if (isIndexedDBAvailable()) {
      getSession('current').then((session) => {
        if (session && !session.completedAt) { setExistingSession({ sessionId: session.sessionId, streamName: session.streamName }); sessionStorage.setItem('current_session_id', session.sessionId); }
      }).catch(() => {});
    }
  }, []);
  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamName.trim()) { setError('Please enter a stream name or location'); return; }
    setLoading(true); setError('');
    try {
      const sessionId = 'sess-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
      const now = new Date().toISOString();
      const observations: Record<string, any> = {};
      INDICATOR_IDS.forEach((id) => { observations[id] = { indicatorId: id, selectedState: null, photoBlob: null, notes: '', timestamp: now, isLabSample: LAB_ONLY_IDS.includes(id), status: LAB_ONLY_IDS.includes(id) ? 'pending_lab_analysis' : 'pending' }; });
      const session = { sessionId, streamName: streamName.trim(), volunteerName: volunteerName.trim(), locationName: locationName.trim(), timestamp: now, observations, startedAt: now };
      const result = await saveSession(session);
      if (result.success) { sessionStorage.setItem('current_session_id', sessionId); window.location.href = '/field/bmi-01'; } else { setError(result.error || 'Failed to create session'); }
    } catch { setError('Failed to start session'); } finally { setLoading(false); }
  };
  const handleContinue = () => { if (existingSession) { window.location.href = '/field/bmi-01'; } };
  return (
    <main className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-tighter text-black mb-2">StreamVitals</h1>
          <p className="text-gray-500 text-lg">OneAquaHealth IEEE Global Hackathon 2026</p>
          <p className="text-gray-400 mt-2">Collect real field data across official indicators. No assessment, no verdict.</p>
        </div>
        <form onSubmit={handleStart} className="card space-y-4">
          <div><label className="block text-sm font-medium text-gray-600 mb-1">Stream Name / Location</label><input id="stream-name" type="text" value={streamName} onChange={(e) => setStreamName(e.target.value)} placeholder="e.g., Cedar Creek" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:ring-2 focus:ring-[#059669] focus:outline-none text-sm" required /></div>
          <div><label className="block text-sm font-medium text-gray-600 mb-1">Volunteer Name</label><input type="text" value={volunteerName} onChange={(e) => setVolunteerName(e.target.value)} placeholder="Your name" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:ring-2 focus:ring-[#059669] focus:outline-none text-sm" /></div>
          <div><label className="block text-sm font-medium text-gray-600 mb-1">Location</label><input type="text" value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="GPS or address" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:ring-2 focus:ring-[#059669] focus:outline-none text-sm" /></div>
          <div><label className="block text-sm font-medium text-gray-600 mb-1">Date</label><input id="session-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-[#059669] focus:outline-none text-sm" /></div>
          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
          <button type="submit" disabled={loading} className="btn-pill w-full">{loading ? 'Starting...' : 'Start Monitoring'}</button>
          <p className="text-xs text-gray-400 text-center">5 indicators · CC-BY factsheet · doi:10.5281/zenodo.20345207</p>
        </form>
        {existingSession && (<div className="mt-4 p-4 bg-white border border-gray-200 rounded-xl"><p className="text-sm text-gray-600">Continue session for <span className="font-bold text-[#059669]">{existingSession.streamName}</span></p><button onClick={handleContinue} className="mt-2 btn-pill-outline text-sm">Continue Monitoring</button></div>)}
      </div>
    </main>
  );
}
```

## src/app/field/[indicator]/page.tsx
IMPORTANT: The file path must be `src/app/field/[indicator]/page.tsx`. The `[indicator]` directory name uses square brackets for Next.js dynamic routes.

```typescript
'use client';
import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { indicators } from '@/data/indicators';
import { saveSession, getSession } from '@/lib/field-session';
import PhotoCapture from '@/components/PhotoCapture';
import BoundedAssistant from '@/components/BoundedAssistant';
import RiverProgress from '@/components/RiverProgress';
import ExportButton from '@/components/ExportButton';
const INDICATOR_IDS = ['BMI-01', 'BIR-04', 'INV-11', 'FCL-06', 'DIA-10'];
const LAB_ONLY_IDS = ['FCL-06', 'DIA-10'];
export default function IndicatorPage({ params }: { params: { indicator: string } }) {
  const indicator = indicators.find(i => i.id.toLowerCase() === params.indicator.toLowerCase());
  const [session, setSession] = useState<any>(null);
  const [selectedState, setSelectedState] = useState('');
  const [notes, setNotes] = useState('');
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const sessionId = sessionStorage.getItem('current_session_id');
    if (!sessionId) { window.location.href = '/field'; return; }
    getSession(sessionId).then((result) => {
      if (result.data) { setSession(result.data); setCompletedIds(Object.keys(result.data.observations || {}).filter((id: string) => result.data.observations[id].selectedState)); }
      else { window.location.href = '/field'; }
      setLoading(false);
    }).catch(() => { window.location.href = '/field'; });
  }, []);
  const saveProgress = useCallback(async () => {
    const sessionId = sessionStorage.getItem('current_session_id');
    if (!sessionId || !indicator) return;
    const updated = { ...session, observations: { ...session.observations, [indicator.id]: { ...session.observations[indicator.id], selectedState, notes, timestamp: new Date().toISOString() } } };
    await saveSession(updated);
    const newCompleted = [...completedIds];
    if (!newCompleted.includes(indicator.id)) newCompleted.push(indicator.id);
    setCompletedIds(newCompleted);
  }, [session, indicator, selectedState, notes, completedIds]);
  const handleNext = () => {
    saveProgress();
    const currentIdx = INDICATOR_IDS.findIndex(id => id === indicator?.id);
    if (currentIdx + 1 < INDICATOR_IDS.length) { window.location.href = '/field/' + INDICATOR_IDS[currentIdx + 1].toLowerCase(); }
    else { window.location.href = '/field/review'; }
  };
  const isLabOnly = indicator?.is_lab_only === true;
  if (loading || !indicator) return <main className="min-h-screen bg-[#f8f9fc] flex items-center justify-center"><p className="text-gray-500">Loading...</p></main>;
  const currentIdx = INDICATOR_IDS.findIndex(id => id === indicator.id);
  return (
    <main className="min-h-screen bg-[#f8f9fc] p-6">
      <div className="max-w-2xl mx-auto">
        <RiverProgress currentIndex={currentIdx} total={INDICATOR_IDS.length} completedIds={completedIds} labOnlyIds={LAB_ONLY_IDS} />
        <button onClick={() => window.history.back()} className="btn-pill-outline text-sm mb-6"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button>
        <div className="card">
          <div className="flex items-center gap-2 mb-4"><span className="text-xs font-black text-gray-400">{indicator.code}</span><h2 className="text-2xl font-black text-black">{indicator.name}</h2>{isLabOnly && <span className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-bold">Lab Only</span>}</div>
          {isLabOnly ? (
            <div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-4"><p className="font-bold text-blue-800 mb-2">🔬 Laboratory Analysis Required</p><p className="text-sm text-blue-700">{indicator.lab_guidance}</p></div>
              <div className="mb-4"><label className="block text-sm font-medium text-gray-600 mb-1">Sample Label</label><input type="text" defaultValue={'SMP-' + new Date().toISOString().split('T')[0] + '-' + indicator.code} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" /></div>
              <div className="mb-4"><label className="block text-sm font-medium text-gray-600 mb-1">Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm h-24 resize-none" placeholder="Record observations or sample notes..." /></div>
              <button onClick={() => { saveProgress(); window.location.href = currentIdx < INDICATOR_IDS.length - 1 ? '/field/' + INDICATOR_IDS[currentIdx + 1].toLowerCase() : '/field/review'; } } className="btn-pill w-full">Log Sample Collection <ArrowRight className="w-4 h-4 ml-2" /></button>
            </div>
          ) : (
            <div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-4"><p className="font-bold text-green-800 mb-2">📋 Protocol Question</p><p className="text-sm text-green-700">{indicator.protocol_question}</p></div>
              <div className="mb-4"><p className="font-medium text-gray-700 mb-2">Visual Reference</p><p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{indicator.visual_anchor_guide}</p></div>
              <div className="mb-4"><p className="font-medium text-gray-700 mb-2">Select observation state:</p><div className="space-y-2">{indicator.states.map((state) => (<label key={state.id} className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:border-[#059669] transition-all ${selectedState === state.id ? 'border-[#059669] bg-green-50' : 'border-gray-200 bg-white'}`}><input type="radio" name={indicator.id} value={state.id} checked={selectedState === state.id} onChange={(e) => setSelectedState(e.target.value)} className="accent-[#059669]" /><span className="text-sm">{state.label}</span></label>))}</div></div>
              <PhotoCapture sessionId={sessionStorage.getItem('current_session_id') || ''} indicatorId={indicator.id} />
              <div className="mb-4"><label className="block text-sm font-medium text-gray-600 mb-1">Additional Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm h-24 resize-none" placeholder="Optional notes..." /></div>
              <BoundedAssistant indicatorId={indicator.id} />
              <div className="mt-4 flex justify-end"><button onClick={handleNext} disabled={!selectedState} className="btn-pill">{currentIdx < INDICATOR_IDS.length - 1 ? 'Next Indicator' : 'Review All'} <ArrowRight className="w-4 h-4 ml-2" /></button></div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
```

## src/app/field/review/page.tsx
```typescript
'use client';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { indicators } from '@/data/indicators';
import { getSession } from '@/lib/field-session';
import ExportButton from '@/components/ExportButton';
import { saveSession } from '@/lib/field-session';
export default function ReviewPage() {
  const [session, setSession] = useState<any>(null);
  const [completed, setCompleted] = useState(false);
  useEffect(() => {
    const sessionId = sessionStorage.getItem('current_session_id');
    if (!sessionId) { window.location.href = '/field'; return; }
    getSession(sessionId).then((result) => { if (result.data) setSession(result.data); else window.location.href = '/field'; });
  }, []);
  const handleComplete = async () => {
    const sessionId = sessionStorage.getItem('current_session_id');
    if (sessionId) { await saveSession({ ...session, completedAt: new Date().toISOString() }); setCompleted(true); }
  };
  if (!session) return <main className="min-h-screen bg-[#f8f9fc] flex items-center justify-center"><p className="text-gray-500">Loading...</p></main>;
  const INDICATOR_IDS = ['BMI-01', 'BIR-04', 'INV-11', 'FCL-06', 'DIA-10'];
  const totalPhotos = Object.values(session.observations || {}).filter((o: any) => o.photoBlob).length;
  const totalNotes = Object.values(session.observations || {}).filter((o: any) => o.notes).length;
  const labPending = Object.values(session.observations || {}).filter((o: any) => o.isLabSample && o.status === 'pending_lab_analysis').length;
  return (
    <main className="min-h-screen bg-[#f8f9fc] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8"><h1 className="text-3xl font-black tracking-tighter text-black">Field Data Review</h1><p className="text-gray-500 mt-2">Your collected observations before export</p></div>
        <div className="card mb-6"><div className="grid grid-cols-3 gap-4 mb-6"><div className="text-center"><p className="text-2xl font-black text-[#059669]">{INDICATOR_IDS.length}</p><p className="text-xs text-gray-400">Indicators</p></div><div className="text-center"><p className="text-2xl font-black text-[#059669]">{totalPhotos}</p><p className="text-xs text-gray-400">Photos</p></div><div className="text-center"><p className="text-2xl font-black text-[#059669]">{totalNotes}</p><p className="text-xs text-gray-400">Notes</p></div></div>
          <div className="space-y-3">{INDICATOR_IDS.map((id, i) => { const obs = session.observations?.[id]; const ind = indicators.find(x => x.id === id); const isLab = ind?.is_lab_only; return (<div key={id} className={`flex items-center justify-between p-4 rounded-xl border ${isLab ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'}`}><div><span className="text-xs text-gray-400">{i + 1}.</span><span className="font-bold text-sm">{ind?.name || id}</span>{isLab && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full ml-2">Lab Sample</span>}</div><div className="flex items-center gap-2">{obs?.selectedState ? <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">{obs.selectedState.replace(/_/g, ' ')}</span> : isLab ? <span className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full">Pending Lab</span> : <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">Not recorded</span>}{obs?.notes && <span className="text-green-500">✓</span>}</div></div>); })}</div>
        </div>
        <div className="card mb-6"><h3 className="font-bold text-lg mb-4">Human-Readable Summary</h3><div className="space-y-2 text-sm"><p><span className="text-gray-500">Stream:</span> <span className="font-medium">{session.streamName}</span></p><p><span className="text-gray-500">Volunteer:</span> <span className="font-medium">{session.volunteerName}</span></p><p><span className="text-gray-500">Location:</span> <span className="font-medium">{session.locationName}</span></p><p><span className="text-gray-500">Date:</span> <span className="font-medium">{session.timestamp?.split('T')[0]}</span></p></div></div>
        <div className="card mb-6"><h3 className="font-bold text-lg mb-4">Export Structured OneAquaHealth Data</h3><ExportButton sessionId={session.sessionId} /></div>
        <div className="flex gap-3"><button onClick={() => window.history.back()} className="btn-pill-outline flex-1"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button><button onClick={handleComplete} className="btn-pill flex-1">{completed ? '✓ Completed' : 'Complete Session'}</button></div>
        {completed && <div className="mt-4 text-center"><p className="text-green-600 font-bold">Session completed successfully.</p></div>}
        <p className="text-center text-xs text-gray-400 mt-4">Data sourced from OneAquaHealth Key Indicators (doi:10.5281/zenodo.20345207). CC-BY 4.0.</p>
      </div>
    </main>
  );
}
```

CONSTRAINTS:
- Case-insensitive indicator lookup: `indicators.find(i => i.id.toLowerCase() === params.indicator.toLowerCase())`
- FCL-06 and DIA-10 render "Laboratory Analysis Required" banner with lab_guidance, sample label input, NO state radio buttons
- Citizen indicators render protocol_question, visual_anchor_guide, state radio buttons, PhotoCapture, BoundedAssistant
- Navigation uses `window.location.href` — NEVER `router.push` with serialized JSON
- `sessionStorage.setItem('current_session_id', sessionId)` for navigation
- Print-friendly CSS: `@media print` rules in globals.css
- Light theme ONLY
- NO tier ratings, NO diagnostic assessments anywhere in any page
