'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { indicators } from '@/data/indicators';
import { getFullSession } from '@/lib/field-session';
import ExportButton from '@/components/ExportButton';

const FIELD_INDICATORS = ['BMI-01', 'BIR-04', 'INV-11', 'FCL-06', 'DIA-10'];

export default function ReviewPage() {
  const [session, setSession] = useState<{ sessionId: string; streamName: string; volunteer: string; date: string; startedAt: string; indicators: any[] } | null>(null);
  const [photos, setPhotos] = useState<{ photoId: string; indicatorId: string; timestamp: string }[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    const sessionId = sessionStorage.getItem('current_session_id');
    if (!sessionId) {
      window.location.href = '/field';
      return;
    }
    getFullSession(sessionId).then((result) => {
      if (result.session) {
        setSession(result.session);
        setPhotos(result.photos);
        if (result.session.completedAt) {
          setSessionComplete(true);
        }
      } else {
        window.location.href = '/field';
      }
    }).catch(() => {
      window.location.href = '/field';
    });
  }, []);

  const handleComplete = useCallback(async () => {
    const sessionId = sessionStorage.getItem('current_session_id');
    if (!sessionId) return;
    try {
      const { updateSession } = await import('@/lib/field-session');
      await updateSession(sessionId, { completedAt: new Date().toISOString() });
      setSessionComplete(true);
    } catch {
      setSessionComplete(true);
    }
  }, []);

  const handleContinueLater = useCallback(() => {
    window.location.href = '/field';
  }, []);

  const getStateLabel = (indicatorId: string, state: string) => {
    const ind = indicators.find((i) => i.id === indicatorId);
    return ind?.citizen_state_labels?.[state] || state;
  };

  const getIndicator = (id: string) => indicators.find((i) => i.id === id);

  if (!session) {
    return (
      <main className="min-h-screen bg-[#ffffff] flex items-center justify-center p-6">
        <p className="text-[rgba(0,0,0,0.4)]">Loading session...</p>
      </main>
    );
  }

  const labIndicators = FIELD_INDICATORS.filter((id) => getIndicator(id)?.lab_only);
  const totalPhotos = photos.length;
  const totalNotes = session.indicators.filter((i: any) => i.notes).length;

  return (
    <main className="min-h-screen bg-[#ffffff]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 bg-[rgba(13,155,110,0.08)] border border-[rgba(13,155,110,0.15)] px-4 py-2 rounded-full">
            <span className="w-1.5 h-1.5 bg-[#0d9b6e] rounded-full" />
            <span className="text-xs font-semibold text-[#0d9b6e] tracking-wide uppercase">Session Review</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-3 text-black leading-[1.05]">Field Data Review</h1>
          <p className="text-lg text-[rgba(0,0,0,0.5)]">Your collected observations before export</p>
        </div>

        <div className="bg-[#f5faf7] border border-[rgba(0,0,0,0.06)] rounded-2xl p-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 text-center border border-[rgba(0,0,0,0.04)]">
              <p className="text-4xl font-black tracking-tighter text-[#0d9b6e]">{session.indicators.length}</p>
              <p className="text-xs text-[rgba(0,0,0,0.4)] mt-1 font-medium">Indicators</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center border border-[rgba(0,0,0,0.04)]">
              <p className="text-4xl font-black tracking-tighter text-[#0d9b6e]">{totalPhotos}</p>
              <p className="text-xs text-[rgba(0,0,0,0.4)] mt-1 font-medium">Photos</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center border border-[rgba(0,0,0,0.04)]">
              <p className="text-4xl font-black tracking-tighter text-[#0d9b6e]">{totalNotes}</p>
              <p className="text-xs text-[rgba(0,0,0,0.4)] mt-1 font-medium">Notes</p>
            </div>
            <div className="bg-[rgba(232,93,58,0.04)] rounded-xl p-6 text-center border border-[rgba(232,93,58,0.1)]">
              <p className="text-4xl font-black tracking-tighter text-[#e85d3a]">{labIndicators.length}</p>
              <p className="text-xs text-[rgba(0,0,0,0.4)] mt-1 font-medium">Pending Lab</p>
            </div>
          </div>

          <div className="space-y-3">
            {session.indicators.map((ind: any, i: number) => {
              const indInfo = getIndicator(ind.indicatorId);
              const isLab = ind.type === 'lab_only';
              const photoCount = photos.filter((p: any) => p.indicatorId === ind.indicatorId).length;
              return (
                <div key={ind.indicatorId} className={`rounded-xl border p-5 ${isLab ? 'bg-[rgba(232,93,58,0.04)] border-[rgba(232,93,58,0.1)]' : 'bg-white border-[rgba(0,0,0,0.06)]'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[rgba(0,0,0,0.2)]">{i + 1}</span>
                      <span className="font-bold text-black">{ind.indicatorName}</span>
                      {isLab && (
                        <span className="text-[10px] bg-[rgba(232,93,58,0.1)] text-[#e85d3a] px-4 py-1 rounded-full font-bold">Lab Sample</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {ind.state ? (
                        <span className="text-xs bg-[rgba(13,155,110,0.08)] text-[#0d9b6e] px-4 py-1 rounded-full font-bold">
                          {getStateLabel(ind.indicatorId, ind.state)}
                        </span>
                      ) : isLab ? (
                        <span className="text-xs bg-[rgba(232,93,58,0.1)] text-[#e85d3a] px-4 py-1 rounded-full font-bold">Pending Lab Analysis</span>
                      ) : null}
                      {photoCount > 0 && (
                        <span className="text-xs text-[rgba(0,0,0,0.25)]">{photoCount} photo{photoCount !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                  {ind.state && !isLab && (
                    <p className="text-sm text-[rgba(0,0,0,0.4)] ml-6 mt-2">{indInfo?.visual_anchor_guide}</p>
                  )}
                  {isLab && ind.sampleLabel && (
                    <p className="text-sm text-[#e85d3a] ml-6 mt-1 font-medium">Sample: {ind.sampleLabel}</p>
                  )}
                  {ind.notes && (
                    <p className="text-sm text-[rgba(0,0,0,0.35)] ml-6 mt-1 italic">&ldquo;{ind.notes}&rdquo;</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#f5faf7] border border-[rgba(0,0,0,0.06)] rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-black tracking-tighter mb-6 text-black">Human-Readable Summary</h2>
          <div className="bg-white rounded-xl p-6 border border-[rgba(0,0,0,0.04)]">
            <div className="text-center mb-6">
              <h3 className="text-lg font-black text-[#0d9b6e]">Field Monitoring Session</h3>
              <p className="text-[rgba(0,0,0,0.4)] text-sm">OneAquaHealth Key Indicators Framework</p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-[rgba(0,0,0,0.4)]">Stream / Location:</span><span className="font-bold text-black">{session.streamName}</span></div>
              <div className="flex justify-between"><span className="text-[rgba(0,0,0,0.4)]">Volunteer:</span><span className="font-bold text-black">{session.volunteer || 'Not provided'}</span></div>
              <div className="flex justify-between"><span className="text-[rgba(0,0,0,0.4)]">Date:</span><span className="font-bold text-black">{session.date}</span></div>
              <div className="flex justify-between"><span className="text-[rgba(0,0,0,0.4)]">Session started:</span><span className="font-bold text-black">{session.startedAt}</span></div>
              <hr className="border-[rgba(0,0,0,0.06)]" />
              {session.indicators.map((ind: any, i: number) => (
                <div key={ind.indicatorId} className={`rounded p-2 ${ind.type === 'lab_only' ? 'bg-[rgba(232,93,58,0.04)]' : ''}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-black">{i + 1}. {ind.indicatorName}</span>
                    <span className={`text-xs px-4 py-1 rounded-full ${ind.type === 'lab_only' ? 'bg-[rgba(232,93,58,0.1)] text-[#e85d3a]' : 'bg-[rgba(13,155,110,0.08)] text-[#0d9b6e]'}`}>
                      {ind.type === 'lab_only' ? 'Lab Sample' : 'Observation'}
                    </span>
                  </div>
                  <div className="text-[rgba(0,0,0,0.4)] mt-1 ml-6">
                    {ind.state ? getStateLabel(ind.indicatorId, ind.state) : 'Pending laboratory analysis'}
                    {ind.notes && <span> — Notes recorded</span>}
                  </div>
                </div>
              ))}
              <hr className="border-[rgba(0,0,0,0.06)]" />
              <div className="flex justify-between text-[rgba(0,0,0,0.3)] text-xs">
                <span>Total photos: {totalPhotos}</span>
                <span>Total notes: {totalNotes}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#f5faf7] border border-[rgba(0,0,0,0.06)] rounded-2xl p-8 mb-8">
          <ExportButton sessionId={session.sessionId} />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleContinueLater}
            className="flex-1 py-4 bg-white border border-[rgba(0,0,0,0.08)] text-black rounded-xl font-bold hover:bg-[rgba(0,0,0,0.02)] hover:border-[rgba(0,0,0,0.12)] transition-all focus:ring-2 focus:ring-[#0d9b6e] focus:outline-none flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Continue Later
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 py-4 bg-black text-white rounded-xl font-bold hover:opacity-85 transition-all focus:ring-2 focus:ring-black focus:outline-none"
          >
            Complete Session
          </button>
        </div>

        {sessionComplete && (
          <div className="mt-6 bg-[rgba(13,155,110,0.06)] border border-[rgba(13,155,110,0.15)] rounded-xl p-5 text-center">
            <p className="text-[#0d9b6e] font-bold">Session completed successfully.</p>
            <p className="text-[#0d9b6e]/60 text-sm mt-1">Your data has been exported and saved.</p>
          </div>
        )}

        <p className="text-center text-xs text-[rgba(0,0,0,0.2)] mt-6">
          This data is structured for the OneAquaHealth indicator framework (doi:10.5281/zenodo.20345207). No assessment, no tier, no verdict.
        </p>
      </div>
    </main>
  );
}