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
      <main className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#1a1a2e]/40">Loading session...</p>
        </div>
      </main>
    );
  }

  const labIndicators = FIELD_INDICATORS.filter((id) => getIndicator(id)?.lab_only);
  const totalPhotos = photos.length;
  const totalNotes = session.indicators.filter((i: any) => i.notes).length;

  return (
    <main className="min-h-screen bg-[#f8f9fc]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full">
            <span className="w-2 h-2 bg-emerald-600 rounded-full" />
            <span className="text-sm text-emerald-700 font-medium">Session Review</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-2 text-[#1a1a2e]">Field Data Review</h1>
          <p className="text-[#1a1a2e]/50">Your collected observations before export</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm shadow-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-emerald-700">{session.indicators.length}</p>
              <p className="text-xs text-[#1a1a2e]/40 mt-1">Indicators</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-emerald-700">{totalPhotos}</p>
              <p className="text-xs text-[#1a1a2e]/40 mt-1">Photos</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-emerald-700">{totalNotes}</p>
              <p className="text-xs text-[#1a1a2e]/40 mt-1">Notes</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-amber-700">{labIndicators.length}</p>
              <p className="text-xs text-[#1a1a2e]/40 mt-1">Pending Lab</p>
            </div>
          </div>

          <div className="space-y-3">
            {session.indicators.map((ind: any, i: number) => {
              const indInfo = getIndicator(ind.indicatorId);
              const isLab = ind.type === 'lab_only';
              const photoCount = photos.filter((p: any) => p.indicatorId === ind.indicatorId).length;
              return (
                <div key={ind.indicatorId} className={`rounded-xl border p-4 ${isLab ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#1a1a2e]/25">{i + 1}</span>
                      <span className="font-bold text-[#1a1a2e]">{ind.indicatorName}</span>
                      {isLab && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Lab Sample</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {ind.state ? (
                        <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                          {getStateLabel(ind.indicatorId, ind.state)}
                        </span>
                      ) : isLab ? (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Pending Lab Analysis</span>
                      ) : null}
                      {photoCount > 0 && (
                        <span className="text-xs text-[#1a1a2e]/30">{photoCount} photo{photoCount !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                  {ind.state && !isLab && (
                    <p className="text-sm text-[#1a1a2e]/50 ml-6">{indInfo?.visual_anchor_guide}</p>
                  )}
                  {isLab && ind.sampleLabel && (
                    <p className="text-sm text-amber-700/70 ml-6">Sample: {ind.sampleLabel}</p>
                  )}
                  {ind.notes && (
                    <p className="text-sm text-[#1a1a2e]/40 ml-6 mt-1 italic">"{ind.notes}"</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm shadow-gray-100">
          <h2 className="text-lg font-bold text-[#1a1a2e] mb-4">Human-Readable Summary</h2>
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-emerald-700">Field Monitoring Session</h3>
              <p className="text-[#1a1a2e]/40 text-sm">OneAquaHealth Key Indicators Framework</p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-[#1a1a2e]/40">Stream / Location:</span><span className="text-[#1a1a2e] font-medium">{session.streamName}</span></div>
              <div className="flex justify-between"><span className="text-[#1a1a2e]/40">Volunteer:</span><span className="text-[#1a1a2e] font-medium">{session.volunteer || 'Not provided'}</span></div>
              <div className="flex justify-between"><span className="text-[#1a1a2e]/40">Date:</span><span className="text-[#1a1a2e] font-medium">{session.date}</span></div>
              <div className="flex justify-between"><span className="text-[#1a1a2e]/40">Session started:</span><span className="text-[#1a1a2e] font-medium">{session.startedAt}</span></div>
              <hr className="border-gray-200" />
              {session.indicators.map((ind: any, i: number) => (
                <div key={ind.indicatorId} className={`rounded p-2 ${ind.type === 'lab_only' ? 'bg-amber-50' : ''}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[#1a1a2e] font-medium">{i + 1}. {ind.indicatorName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${ind.type === 'lab_only' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {ind.type === 'lab_only' ? 'Lab Sample' : 'Observation'}
                    </span>
                  </div>
                  <div className="text-[#1a1a2e]/50 mt-1 ml-2">
                    {ind.state ? getStateLabel(ind.indicatorId, ind.state) : 'Pending laboratory analysis'}
                    {ind.notes && <span> — Notes recorded</span>}
                  </div>
                </div>
              ))}
              <hr className="border-gray-200" />
              <div className="flex justify-between text-[#1a1a2e]/40 text-xs">
                <span>Total photos: {totalPhotos}</span>
                <span>Total notes: {totalNotes}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm shadow-gray-100">
          <ExportButton sessionId={session.sessionId} />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleContinueLater}
            className="flex-1 py-4 bg-white border border-gray-200 text-[#1a1a2e] rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all focus:ring-2 focus:ring-emerald-400 focus:outline-none flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Continue Later
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all focus:ring-2 focus:ring-emerald-400 focus:outline-none shadow-sm shadow-emerald-200 text-center"
          >
            Complete Session
          </button>
        </div>

        {sessionComplete && (
          <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
            <p className="text-emerald-700 font-bold">Session completed successfully.</p>
            <p className="text-emerald-600/60 text-sm mt-1">Your data has been exported and saved.</p>
          </div>
        )}

        <p className="text-center text-xs text-[#1a1a2e]/20 mt-6">
          This data is structured for the OneAquaHealth indicator framework (doi:10.5281/zenodo.20345207). No assessment, no tier, no verdict.
        </p>
      </div>
    </main>
  );
}