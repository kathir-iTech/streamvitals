'use client';

import { use, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Shield, AlertTriangle, FlaskConical } from 'lucide-react';
import { indicators } from '@/data/indicators';
import { updateSession, getSession, createSession } from '@/lib/field-session';
import { checkNoteQuality } from '@/lib/note-quality';
import BoundedAssistant from '@/components/BoundedAssistant';
import PhotoCapture from '@/components/PhotoCapture';

const FIELD_INDICATORS = ['BMI-01', 'BIR-04', 'INV-11', 'FCL-06', 'DIA-10'];

export default function IndicatorPage({ params }: { params: Promise<{ indicator: string }> }) {
  const router = useRouter();
  const { indicator: rawIndicatorId } = use(params);
  const indicatorId = FIELD_INDICATORS.find((id) => id.toLowerCase() === rawIndicatorId.toLowerCase()) || rawIndicatorId;
  const indicator = indicators.find((i) => i.id === indicatorId);
  const currentIndex = FIELD_INDICATORS.indexOf(indicatorId);
  const isLabOnly = indicator?.lab_only || false;
  const isCitizen = indicator?.citizen_observable || false;

  const [selectedState, setSelectedState] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [sampleLabel, setSampleLabel] = useState<string>('');
  const [noteFlag, setNoteFlag] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const id = sessionStorage.getItem('current_session_id');
    if (id) setSessionId(id);
  }, []);

  useEffect(() => {
    // Client-side navigation keeps this component mounted, so form state must
    // be cleared when the indicator changes before loading the new record —
    // a full reload used to do this implicitly.
    setSelectedState('');
    setNotes('');
    setNoteFlag('');
    setSampleLabel('');
    setPhotos([]);
    if (!sessionId) return;
    getSession(sessionId).then((session) => {
      if (session && !session.completedAt) {
        const indicatorRecord = session.indicators.find((ind: any) => ind.indicatorId === indicatorId);
        if (indicatorRecord) {
          setSelectedState(indicatorRecord.state || '');
          setNotes(indicatorRecord.notes || '');
          setNoteFlag(indicatorRecord.note_flag || '');
          if (indicatorRecord.sampleLabel) setSampleLabel(indicatorRecord.sampleLabel);
        }
      }
    }).catch(() => {});
  }, [sessionId, indicatorId]);

  const stateLabels = indicator?.citizen_state_labels || {};
  const stateKeys = (indicator?.states || []).map((s: any) => s.id);
  const stateDescriptions: Record<string, string> = {};
  (indicator?.states || []).forEach((s: any) => { if (s?.id && s?.label) stateDescriptions[s.id] = s.label; });
  const progress = ((currentIndex + 1) / FIELD_INDICATORS.length) * 100;
  const noteQuality = useMemo(
    () => checkNoteQuality(indicatorId, selectedState, notes),
    [indicatorId, selectedState, notes]
  );
  // Warns rather than blocks: once the volunteer explicitly chooses to keep the
  // note, noteFlag is set and the warning clears.
  const noteBlocked = !noteFlag && isCitizen && notes.trim().length > 0 && !noteQuality.ok;
  const pendingFlag = !noteFlag && noteQuality.issues.length > 0
    ? noteQuality.issues.map((i) => i.kind).join(';')
    : '';

  const handleStateSelect = useCallback((state: string) => {
    setSelectedState(state);
  }, []);

  const handleSaveIndicator = useCallback(async () => {
    if (!sessionId) return;
    setSaving(true);
    try {
      const result = await getSession(sessionId);
      if (result) {
        const updatedIndicators = result.indicators.map((ind: any) => {
          if (ind.indicatorId === indicatorId) {
            return {
              ...ind,
              state: selectedState || undefined,
              photos,
              notes,
              note_flag: noteFlag || (isCitizen ? pendingFlag : ''),
              timestamp: new Date().toISOString(),
            };
          }
          return ind;
        });
        await updateSession(sessionId, { indicators: updatedIndicators });
      } else {
        const now = new Date().toISOString();
        const newSession = {
          sessionId,
          streamName: '',
          volunteer: '',
          date: '',
          indicators: [{
            indicatorId,
            indicatorName: indicator?.name || '',
            type: (isCitizen ? 'citizen_observable' : 'lab_only') as 'citizen_observable' | 'lab_only',
            state: selectedState || undefined,
            photos,
            notes,
            note_flag: noteFlag || (isCitizen ? pendingFlag : ''),
            timestamp: now,
            status: isCitizen ? 'complete' as const : 'pending_lab_analysis' as const,
          }],
          startedAt: now,
        };
        await createSession(newSession);
      }
    } catch (err) {
      console.error('Failed to save indicator data:', err);
    } finally {
      setSaving(false);
    }
  }, [sessionId, indicatorId, selectedState, notes, photos, indicator, isCitizen, noteFlag, pendingFlag]);

  const handleNext = useCallback(async () => {
    await handleSaveIndicator();
    if (currentIndex < FIELD_INDICATORS.length - 1) {
      router.push(`/field/${FIELD_INDICATORS[currentIndex + 1].toLowerCase()}`);
    } else {
      router.push('/field/review');
    }
  }, [currentIndex, handleSaveIndicator, router]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      router.push(`/field/${FIELD_INDICATORS[currentIndex - 1].toLowerCase()}`);
    }
  }, [currentIndex, router]);

  if (!indicator) {
    return (
      <main className="min-h-screen bg-[#ffffff] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-black tracking-tighter mb-4 text-black">Indicator not found</h1>
          <a href="/field" className="btn-pill">Return to Field Companion</a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#ffffff]">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-block px-5 py-2 rounded-full bg-[rgba(13,155,110,0.08)] border border-[rgba(13,155,110,0.15)] text-[#0d9b6e] text-sm font-bold uppercase tracking-wider">
              {indicator.id}
            </span>
            {isLabOnly && (
              <span className="inline-block px-5 py-2 rounded-full bg-[rgba(232,93,58,0.08)] border border-[rgba(232,93,58,0.15)] text-[#e85d3a] text-sm font-bold">Pending Lab Analysis</span>
            )}
          </div>
          <span className="text-sm text-[rgba(0,0,0,0.3)] font-medium">{currentIndex + 1} / {FIELD_INDICATORS.length}</span>
        </div>

        <div className="mb-8">
          <div className="h-1 bg-[rgba(0,0,0,0.06)] rounded-full overflow-hidden">
            <div className="h-full bg-black rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-3 text-black leading-[1.05]">{indicator.name}</h1>
        <p className="text-lg text-[rgba(0,0,0,0.5)] mb-6 max-w-2xl">{indicator.citizen_question}</p>

        {indicator.why_this_matters && (
          <div className="bg-[rgba(13,155,110,0.07)] border-2 border-[rgba(13,155,110,0.3)] border-l-8 border-l-[#0d9b6e] rounded-xl p-6 mb-6">
            <p className="text-base font-black text-[#0d9b6e] mb-2">Why this matters — One Health</p>
            <p className="text-base text-[rgba(0,0,0,0.75)] leading-relaxed">{indicator.why_this_matters}</p>
            {indicator.why_this_matters_source && (
              <p className="text-[11px] text-[rgba(0,0,0,0.35)] mt-2 italic">Source: {indicator.why_this_matters_source}</p>
            )}
          </div>
        )}

        <div className="step-card mb-8" suppressHydrationWarning>
          {isLabOnly && sampleLabel && (
            <div className="bg-[#0d9b6e] text-white rounded-xl p-6 mb-6" data-testid="sample-id-card">
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/70 mb-2">Write this ID on the container</p>
              <p className="text-4xl font-black tracking-tighter font-mono" data-testid="sample-id-value">{sampleLabel}</p>
              <p className="text-xs text-white/80 mt-2">Write this exact ID on the bottle or container before it goes to the lab.</p>
            </div>
          )}

          <div className="flex items-start gap-3 mb-6">
            <Shield className="w-5 h-5 text-[#0d9b6e] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-[#0d9b6e]">{isLabOnly ? 'Collection Protocol' : 'Visual Anchor'}</p>
              <p className="text-sm text-[rgba(0,0,0,0.5)] mt-1">{indicator.visual_anchor_guide}</p>
            </div>
          </div>

          {isLabOnly && (
            <div className="mt-4 bg-[rgba(232,93,58,0.04)] border border-[rgba(232,93,58,0.12)] rounded-xl p-5">
              <p className="text-[#e85d3a] text-sm font-bold mb-2 flex items-center gap-2"><FlaskConical className="w-4 h-4" /> Laboratory Protocol Required</p>
              <p className="text-[rgba(0,0,0,0.6)] text-sm leading-relaxed">{indicator.lab_guidance || indicator.protocol_question}</p>
              <p className="text-[#e85d3a] text-sm mt-3 font-medium">You cannot determine the result in the field.</p>
            </div>
          )}

          {isCitizen && stateKeys.length > 0 && (
            <fieldset className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3" aria-label="Select your observation">
              {stateKeys.map((state) => {
                const label = stateLabels[state] || state.replace(/_/g, ' ');
                const description = stateDescriptions[state] || '';
                const isSelected = selectedState === state;
                return (
                  <button
                    key={state}
                    type="button"
                    onClick={() => handleStateSelect(state)}
                    className={`relative px-5 py-5 rounded-xl border-2 font-bold text-sm transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'border-[#0d9b6e] bg-[rgba(13,155,110,0.06)] shadow-sm'
                        : 'border-[rgba(0,0,0,0.08)] bg-white hover:border-[#0d9b6e] hover:bg-[rgba(13,155,110,0.03)] hover:shadow-sm'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <div className="text-base font-black text-black leading-snug">{label}</div>
                    {description && (
                      <div className="text-xs font-medium text-[rgba(0,0,0,0.5)] mt-1 leading-snug">{description}</div>
                    )}
                    {isSelected && (
                      <div className="text-xs font-black mt-2 uppercase tracking-wider text-[#0d9b6e]">Selected</div>
                    )}
                  </button>
                );
              })}
            </fieldset>
          )}

          <div className="mt-6 space-y-4" suppressHydrationWarning>
            <PhotoCapture sessionId={sessionId} indicatorId={indicatorId} onPhotosChange={(ids) => setPhotos(ids)} />
            <div>
              <label className="block text-sm font-medium text-[rgba(0,0,0,0.5)] mb-1.5" htmlFor={`notes-${indicatorId}`}>
                {isLabOnly ? 'Sampling Notes' : 'Field Notes'}
              </label>
              <textarea
                id={`notes-${indicatorId}`}
                placeholder={isLabOnly
                  ? 'Collection time, weather, sample condition, handling notes...'
                  : 'Optional observations, weather conditions, equipment used...'}
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                suppressHydrationWarning
                className="w-full px-4 py-3 bg-[#f5faf7] border border-[rgba(0,0,0,0.08)] rounded-xl text-black placeholder-[rgba(0,0,0,0.25)] focus:ring-2 focus:ring-[#0d9b6e] focus:outline-none transition-all resize-none text-sm font-medium"
              />
              {noteBlocked && (
                <div data-testid="note-quality-warning" role="alert" className="mt-2 bg-[rgba(232,93,58,0.06)] border border-[rgba(232,93,58,0.2)] rounded-xl p-4">
                  <p className="text-sm font-bold text-[#e85d3a] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Check your note before continuing
                  </p>
                  <ul className="mt-2 space-y-1">
                    {noteQuality.issues.map((issue, i) => (
                      <li key={i} className="text-sm text-[rgba(0,0,0,0.6)]">• {issue.message}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-[rgba(0,0,0,0.4)] mt-2">This is a rule-based wording check, not AI. It only looks for assessment words and notes that contradict your selection. It never judges the water.</p>
                  <button
                    onClick={() => setNoteFlag(pendingFlag)}
                    data-testid="keep-note-override"
                    className="mt-3 btn-pill-outline text-xs"
                  >
                    Keep my note anyway
                  </button>
                </div>
              )}
              {noteFlag && (
                <div data-testid="note-flag-recorded" className="mt-2 bg-[rgba(13,155,110,0.06)] border border-[rgba(13,155,110,0.2)] rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-xs text-[#0d9b6e] font-medium">Note kept, with a recorded flag ({noteFlag}). It will be marked in the export.</p>
                  <button
                    onClick={() => { setNoteFlag(''); setNotes(''); }}
                    data-testid="clear-note-override"
                    className="text-xs text-[rgba(0,0,0,0.4)] underline hover:text-black"
                  >
                    Clear and rewrite
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pb-24 sm:pb-0">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="btn-pill-outline flex items-center gap-2"
            aria-label="Previous indicator"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>
          <button
            onClick={handleNext}
            disabled={saving || (isCitizen && !selectedState) || noteBlocked}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 btn-pill-accent disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : (currentIndex === FIELD_INDICATORS.length - 1 ? 'Review Session' : 'Next Indicator')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <BoundedAssistant indicatorId={indicatorId} />
    </main>
  );
}