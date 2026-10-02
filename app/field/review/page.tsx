'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, X } from 'lucide-react';
import { indicators } from '@/data/indicators';
import { getFullSession, type FieldSession } from '@/lib/field-session';
import { assess, summarizeAssessments, type Band } from '@/lib/assessment/engine';
import { fetchGbifBaseline, GBIF_DEFAULT_RADIUS_KM, type GbifBaseline } from '@/lib/gbif';
import { encodeShare, buildShareUrl, SHARE_QR_MAX_CHARS } from '@/lib/session-share';
import qrcode from 'qrcode-generator';
import ExportButton from '@/components/ExportButton';

const FIELD_INDICATORS = ['BMI-01', 'BIR-04', 'INV-11', 'FCL-06', 'DIA-10'];

const BAND_CHIP: Record<Band, string> = {
  favorable: 'bg-[rgba(13,155,110,0.12)] text-[#0a7d58]',
  moderate: 'bg-[rgba(180,83,9,0.12)] text-[#b45309]',
  degraded: 'bg-[rgba(232,93,58,0.12)] text-[#c2410c]',
  pending_lab: 'bg-[rgba(0,0,0,0.06)] text-[rgba(0,0,0,0.62)]',
  unassessable: 'bg-[rgba(0,0,0,0.04)] text-[rgba(0,0,0,0.55)]',
};

export default function ReviewPage() {
  const router = useRouter();
  const [session, setSession] = useState<FieldSession | null>(null);
  const [photos, setPhotos] = useState<{ photoId: string; indicatorId: string; timestamp: string; dataUrl: string }[]>([]);
  const [lightbox, setLightbox] = useState<{ dataUrl: string; label: string } | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [baseline, setBaseline] = useState<GbifBaseline | null>(null);
  const [baselineState, setBaselineState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [shareUrl, setShareUrl] = useState('');
  const [shareQr, setShareQr] = useState('');
  const [shareError, setShareError] = useState('');

  const handleCreateShare = async () => {
    if (!session) return;
    try {
      const payload = await encodeShare(session);
      setShareUrl(buildShareUrl(window.location.origin, payload));
      setShareError('');
      if (payload.length <= SHARE_QR_MAX_CHARS) {
        try {
          const qr = qrcode(0, 'L');
          qr.addData(payload);
          qr.make();
          setShareQr(qr.createDataURL(6, 8));
        } catch {
          setShareQr('');
        }
      } else {
        setShareQr('');
      }
    } catch {
      setShareError('Could not create a share link for this session.');
    }
  };

  useEffect(() => {
    let sessionId = '';
    try { sessionId = sessionStorage.getItem('current_session_id') || ''; } catch { }
    if (!sessionId) { router.push('/field'); return; }
    getFullSession(sessionId).then((result) => {
      if (result.session) {
        setSession(result.session);
        setPhotos(result.photos);
        if (result.session.completedAt) {
          setSessionComplete(true);
        }
        const loc = result.session.location;
        if (loc) {
          if (result.session.gbifBaseline) {
            setBaseline(result.session.gbifBaseline);
          } else {
            setBaselineState('loading');
            fetchGbifBaseline(loc.lat, loc.lng, GBIF_DEFAULT_RADIUS_KM)
              .then(async (b) => {
                setBaseline(b);
                setBaselineState('idle');
                const { updateSession } = await import('@/lib/field-session');
                await updateSession(sessionId, { gbifBaseline: b });
              })
              .catch(() => setBaselineState('error'));
          }
        }
      } else {
        router.push('/field');
      }
    }).catch(() => {
      router.push('/field');
    });
  }, [router]);

  const handleComplete = useCallback(async () => {
    const sessionId = (() => { try { return sessionStorage.getItem('current_session_id') || ''; } catch { return ''; } })();
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
    router.push('/field');
  }, [router]);

  const getStateLabel = (indicatorId: string, state: string) => {
    const ind = indicators.find((i) => i.id === indicatorId);
    return ind?.citizen_state_labels?.[state] || state;
  };

  const getIndicator = (id: string) => indicators.find((i) => i.id === id);

  if (!session) {
    return (
      <main className="min-h-screen bg-[#ffffff] flex items-center justify-center p-6">
        <p className="text-[rgba(0,0,0,0.62)]">Loading session...</p>
      </main>
    );
  }

  const labIndicators = FIELD_INDICATORS.filter((id) => getIndicator(id)?.lab_only);
  const totalPhotos = photos.length;
  const totalNotes = session.indicators.filter((i) => i.notes).length;
  const assessmentSummary = summarizeAssessments(
    session.indicators.map((ind) => ({ indicatorId: ind.indicatorId, state: ind.state }))
  );

  return (
    <main className="min-h-screen bg-[#ffffff]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 bg-[rgba(13,155,110,0.08)] border border-[rgba(13,155,110,0.15)] px-4 py-2 rounded-full">
            <span className="w-1.5 h-1.5 bg-[#0a7d58] rounded-full" />
            <span className="text-xs font-semibold text-[#075d44] tracking-wide uppercase">Session Review</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-3 text-black leading-[1.05]">Field Data Review</h1>
          <p className="text-lg text-[rgba(0,0,0,0.62)]">Your collected observations before export</p>
        </div>

        <div className="bg-[#f5faf7] border border-[rgba(0,0,0,0.06)] rounded-2xl p-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 text-center border border-[rgba(0,0,0,0.04)]">
              <p className="text-4xl font-black tracking-tighter text-[#0a7d58]">{session.indicators.length}</p>
              <p className="text-xs text-[rgba(0,0,0,0.62)] mt-1 font-medium">Indicators</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center border border-[rgba(0,0,0,0.04)]">
              <p className="text-4xl font-black tracking-tighter text-[#0a7d58]" data-testid="photo-total">{totalPhotos}</p>
              <p className="text-xs text-[rgba(0,0,0,0.62)] mt-1 font-medium">Photos</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center border border-[rgba(0,0,0,0.04)]">
              <p className="text-4xl font-black tracking-tighter text-[#0a7d58]">{totalNotes}</p>
              <p className="text-xs text-[rgba(0,0,0,0.62)] mt-1 font-medium">Notes</p>
            </div>
            <div className="bg-[rgba(232,93,58,0.04)] rounded-xl p-6 text-center border border-[rgba(232,93,58,0.1)]">
              <p className="text-4xl font-black tracking-tighter text-[#c2410c]">{labIndicators.length}</p>
              <p className="text-xs text-[rgba(0,0,0,0.62)] mt-1 font-medium">Pending Lab</p>
            </div>
          </div>

          <div className="space-y-3">
            {session.indicators.map((ind, i) => {
              const indInfo = getIndicator(ind.indicatorId);
              const isLab = ind.type === 'lab_only';
              const indicatorPhotos = photos.filter((p) => p.indicatorId === ind.indicatorId && p.dataUrl.startsWith('data:'));
              const photoCount = indicatorPhotos.length;
              const band = assess(ind.indicatorId, ind.state);
              return (
                <div key={ind.indicatorId} className={`rounded-xl border p-5 ${isLab ? 'bg-[rgba(232,93,58,0.04)] border-[rgba(232,93,58,0.1)]' : 'bg-white border-[rgba(0,0,0,0.06)]'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[rgba(0,0,0,0.55)]">{i + 1}</span>
                      <span className="font-bold text-black">{ind.indicatorName}</span>
                      {isLab && (
                        <span className="text-[10px] bg-[rgba(232,93,58,0.1)] text-[#c2410c] px-4 py-1 rounded-full font-bold">Lab Sample</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        data-testid={`band-chip-${ind.indicatorId}`}
                        className={`text-[10px] px-3 py-1 rounded-full font-black ${BAND_CHIP[band.band]}`}
                      >
                        {band.bandLabel}
                      </span>
                      {ind.state ? (
                        <span className="text-xs bg-[rgba(13,155,110,0.08)] text-[#0a7d58] px-4 py-1 rounded-full font-bold">
                          {getStateLabel(ind.indicatorId, ind.state)}
                        </span>
                      ) : isLab ? (
                        <span className="text-xs bg-[rgba(232,93,58,0.1)] text-[#c2410c] px-4 py-1 rounded-full font-bold">Pending Lab Analysis</span>
                      ) : null}
                      {photoCount > 0 && (
                        <span className="text-xs text-[rgba(0,0,0,0.55)]">{photoCount} photo{photoCount !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                  {indicatorPhotos.length > 0 && (
                    <div className="flex gap-2 mt-3 ml-6 flex-wrap" data-testid={`review-photos-${ind.indicatorId}`}>
                      {indicatorPhotos.map((p) => (
                        <button
                          key={p.photoId}
                          type="button"
                          aria-label={`View photo for ${ind.indicatorName}`}
                          onClick={() => setLightbox({ dataUrl: p.dataUrl, label: `${ind.indicatorName} — captured ${p.timestamp}` })}
                          className="rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a7d58]"
                        >
                          <Image
                            src={p.dataUrl}
                            alt=""
                            width={64}
                            height={64}
                            unoptimized
                            data-testid={`review-photo-${p.photoId}`}
                            className="w-16 h-16 object-cover rounded-lg border border-[rgba(0,0,0,0.08)] hover:opacity-80 transition-opacity"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                  {ind.state && !isLab && (
                    <p className="text-sm text-[rgba(0,0,0,0.62)] ml-6 mt-2">{indInfo?.visual_anchor_guide}</p>
                  )}
                  {isLab && ind.sampleLabel && (
                    <p className="text-sm text-[#c2410c] ml-6 mt-1 font-medium">Sample: {ind.sampleLabel}</p>
                  )}
                  {ind.notes && (
                    <p className="text-sm text-[rgba(0,0,0,0.55)] ml-6 mt-1 italic">&ldquo;{ind.notes}&rdquo;</p>
                  )}
                  {ind.note_flag && (
                    <p className="text-[11px] text-[#c2410c] ml-6 mt-1 font-semibold" data-testid={`note-flag-${ind.indicatorId}`}>
                      Note flagged: {ind.note_flag} (kept by volunteer)
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#f5faf7] border border-[rgba(0,0,0,0.06)] rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <h2 className="text-xl font-black tracking-tighter text-black">Session assessment</h2>
            <span className="text-[10px] font-mono text-[rgba(0,0,0,0.62)]">{assessmentSummary.engine}</span>
          </div>
          <div data-testid="assessment-summary" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            <div className="bg-white rounded-xl p-5 text-center border border-[rgba(0,0,0,0.04)]">
              <p className="text-3xl font-black tracking-tighter text-[#0a7d58]">{assessmentSummary.counts.favorable}</p>
              <p className="text-xs text-[rgba(0,0,0,0.62)] mt-1 font-medium">Favorable</p>
            </div>
            <div className="bg-white rounded-xl p-5 text-center border border-[rgba(0,0,0,0.04)]">
              <p className="text-3xl font-black tracking-tighter text-[#b45309]">{assessmentSummary.counts.moderate}</p>
              <p className="text-xs text-[rgba(0,0,0,0.62)] mt-1 font-medium">Moderate</p>
            </div>
            <div className="bg-white rounded-xl p-5 text-center border border-[rgba(0,0,0,0.04)]">
              <p className="text-3xl font-black tracking-tighter text-[#c2410c]">{assessmentSummary.counts.degraded}</p>
              <p className="text-xs text-[rgba(0,0,0,0.62)] mt-1 font-medium">Degraded</p>
            </div>
            <div className="bg-white rounded-xl p-5 text-center border border-[rgba(0,0,0,0.04)]">
              <p className="text-3xl font-black tracking-tighter text-[rgba(0,0,0,0.62)]">{assessmentSummary.counts.pending_lab}</p>
              <p className="text-xs text-[rgba(0,0,0,0.62)] mt-1 font-medium">Pending lab</p>
            </div>
          </div>
          <p className="text-sm text-[rgba(0,0,0,0.55)] leading-relaxed">
            {assessmentSummary.worstBand
              ? `Worst band across assessed indicators: ${assessmentSummary.worstBand}. `
              : 'No citizen indicator has been assessed yet. '}
            Scored by deterministic rules from the observation states — the same state always produces the same band, and no model is consulted. Open any indicator to inspect its chain of evidence.
          </p>
        </div>

        <section aria-label="GBIF baseline" className="bg-[#f5faf7] border border-[rgba(0,0,0,0.06)] rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <h2 className="text-xl font-black tracking-tighter text-black">Session location &amp; nearby baseline</h2>
            {baseline && <span className="text-[10px] font-mono text-[rgba(0,0,0,0.62)]">{baseline.engine} · within {baseline.radiusKm} km</span>}
          </div>
          {session.location ? (
            <p className="text-sm text-[rgba(0,0,0,0.55)] mb-4" data-testid="review-location">
              GPS: <span className="font-bold text-black">{session.location.lat.toFixed(5)}, {session.location.lng.toFixed(5)}</span>
              {session.location.accuracyM !== null && <span> (±{Math.round(session.location.accuracyM)} m)</span>}
              <span className="text-[rgba(0,0,0,0.55)]"> — captured {session.location.capturedAt}; stored in this session and its exports only.</span>
            </p>
          ) : (
            <p className="text-sm text-[rgba(0,0,0,0.62)] mb-4">No GPS captured for this session — baseline below unavailable.</p>
          )}

          {baselineState === 'loading' && (
            <p className="text-sm text-[rgba(0,0,0,0.62)]">Loading GBIF baseline for this location…</p>
          )}
          {baselineState === 'error' && (
            <p className="text-sm text-[#c2410c]">GBIF baseline unavailable (offline or the API could not be reached). Your session data is unaffected.</p>
          )}
          {baseline && (
            <div data-testid="gbif-baseline">
              <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.04)] divide-y divide-[rgba(0,0,0,0.04)]">
                {baseline.rows.map((row) => (
                  <div key={row.scientificName} className="flex items-center justify-between px-4 py-2.5 text-sm gap-3">
                    <span className="text-black font-medium">
                      {row.label}
                      <span className="text-[rgba(0,0,0,0.55)] text-xs ml-2 font-mono">{row.indicatorId}</span>
                    </span>
                    <span className="font-bold whitespace-nowrap">
                      {row.status === 'ok' ? (
                        <span className="text-[#0a7d58]">{(row.count ?? 0).toLocaleString('en-US')} records</span>
                      ) : row.status === 'no_match' ? (
                        <span className="text-[rgba(0,0,0,0.55)]">no GBIF match</span>
                      ) : (
                        <span className="text-[#c2410c]">unavailable</span>
                      )}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-4 py-2.5 text-sm gap-3 bg-[rgba(232,93,58,0.03)]">
                  <span className="text-black font-medium">Fecal coliforms (FCL-06)<span className="text-[rgba(0,0,0,0.55)] text-xs ml-2 font-mono">FCL-06</span></span>
                  <span className="text-[rgba(0,0,0,0.62)] text-xs font-semibold whitespace-nowrap">no taxon group — laboratory indicator</span>
                </div>
              </div>
              <p className="text-xs text-[rgba(0,0,0,0.62)] mt-3 leading-relaxed">{baseline.attribution}</p>
              <p className="text-xs text-[rgba(0,0,0,0.55)] mt-1 leading-relaxed">
                Taxa: EPT orders (BMI-01), Aves (BIR-04), the factsheet&rsquo;s three abbreviated IAP examples expanded to full binomials (INV-11), Bacillariophyta (DIA-10). Counts fetched {baseline.capturedAt}.
              </p>
            </div>
          )}
        </section>

        <div className="bg-[#f5faf7] border border-[rgba(0,0,0,0.06)] rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-black tracking-tighter mb-2 text-black">Share across devices</h2>
          <p className="text-sm text-[rgba(0,0,0,0.55)] leading-relaxed mb-4">
            Move this session to a phone or laptop without an account: the share link carries the session data in its URL fragment, which browsers never send to any server. Photos stay on this device.
          </p>
          {!shareUrl ? (
            <button type="button" data-testid="create-share-link" onClick={() => void handleCreateShare()} className="btn-pill-outline text-sm">
              Create share link
            </button>
          ) : (
            <div className="space-y-3">
              <input
                data-testid="share-link-input"
                readOnly
                value={shareUrl}
                aria-label="Session share link"
                onFocus={(e) => e.target.select()}
                className="w-full px-4 py-3 bg-white border border-[rgba(0,0,0,0.08)] rounded-xl text-black font-mono text-xs focus:ring-2 focus:ring-[#0d9b6e] focus:outline-none"
              />
              <div className="flex items-start gap-5 flex-wrap">
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(shareUrl)}
                  className="btn-pill-outline text-sm"
                >
                  Copy link
                </button>
                {shareQr ? (
                  <Image data-testid="share-qr" src={shareQr} alt="QR code encoding the session share link" width={124} height={124} unoptimized className="bg-white border border-[rgba(0,0,0,0.08)] rounded-xl" />
                ) : (
                  <p className="text-xs text-[rgba(0,0,0,0.62)] max-w-xs">This session is too large for a QR code — open the link directly or copy and paste it on the other device.</p>
                )}
              </div>
              <p className="text-xs text-[rgba(0,0,0,0.62)] leading-relaxed" data-testid="share-note">
                Treat this link like a password: anyone who has it can read and import the session. Photos and photo counts are not part of share links.
              </p>
            </div>
          )}
          {shareError && <p className="text-sm text-red-500 font-medium mt-2">{shareError}</p>}
        </div>

        <div className="bg-[#f5faf7] border border-[rgba(0,0,0,0.06)] rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-black tracking-tighter mb-6 text-black">Human-Readable Summary</h2>
          <div className="bg-white rounded-xl p-6 border border-[rgba(0,0,0,0.04)]">
            <div className="text-center mb-6">
              <h3 className="text-lg font-black text-[#0a7d58]">Field Monitoring Session</h3>
              <p className="text-[rgba(0,0,0,0.62)] text-sm">OneAquaHealth Key Indicators Framework</p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-[rgba(0,0,0,0.62)]">Stream / Location:</span><span className="font-bold text-black">{session.streamName}</span></div>
              <div className="flex justify-between"><span className="text-[rgba(0,0,0,0.62)]">Volunteer:</span><span className="font-bold text-black">{session.volunteer || 'Not provided'}</span></div>
              <div className="flex justify-between"><span className="text-[rgba(0,0,0,0.62)]">Date:</span><span className="font-bold text-black">{session.date}</span></div>
              <div className="flex justify-between"><span className="text-[rgba(0,0,0,0.62)]">Session started:</span><span className="font-bold text-black">{session.startedAt}</span></div>
              {session.location && (
                <div className="flex justify-between"><span className="text-[rgba(0,0,0,0.62)]">GPS:</span><span className="font-bold text-black">{session.location.lat.toFixed(5)}, {session.location.lng.toFixed(5)}</span></div>
              )}
              <hr className="border-[rgba(0,0,0,0.06)]" />
              {session.indicators.map((ind) => {
                const isLab = ind.type === 'lab_only';
                const stateLabel = ind.state ? getStateLabel(ind.indicatorId, ind.state) : null;
                return (
                  <div key={ind.indicatorId} className={`rounded p-2 ${isLab ? 'bg-[rgba(232,93,58,0.04)]' : ''}`}>
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-bold text-black text-sm">{ind.indicatorName} <span className="text-xs text-[rgba(0,0,0,0.62)] font-medium">({ind.indicatorId})</span></span>
                      <span className={`text-xs px-4 py-1 rounded-full font-bold whitespace-nowrap ${isLab ? 'bg-[rgba(232,93,58,0.1)] text-[#c2410c]' : 'bg-[rgba(13,155,110,0.08)] text-[#0a7d58]'}`}>
                        {isLab ? 'Lab Sample — Pending analysis' : (stateLabel || 'No observation recorded')}
                      </span>
                    </div>
                    <div className="text-[rgba(0,0,0,0.62)] mt-1 ml-6 text-sm">
                      {isLab ? (
                        <>{ind.sampleLabel ? `Sample ${ind.sampleLabel}` : 'Sample pending lab analysis'}</>
                      ) : (
                        <>{stateLabel || 'No state selected'}</>
                      )}
                      {ind.notes && <span> — Notes recorded</span>}
                    </div>
                  </div>
                );
              })}
              <hr className="border-[rgba(0,0,0,0.06)]" />
              <div className="flex justify-between text-[rgba(0,0,0,0.55)] text-xs">
                <span>Total photos: {totalPhotos}</span>
                <span>Total notes: {totalNotes}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#f5faf7] border border-[rgba(0,0,0,0.06)] rounded-2xl p-8 mb-8">
          <ExportButton sessionId={session.sessionId} />
        </div>

        <div className="flex gap-3 pb-24 sm:pb-0">
          <button
            onClick={handleContinueLater}
            className="flex-1 py-4 btn-pill-outline flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Continue Later
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 py-4 btn-pill-accent flex items-center justify-center gap-2"
          >
            Complete Session
          </button>
        </div>

        {sessionComplete && (
          <div className="mt-6 bg-[rgba(13,155,110,0.06)] border border-[rgba(13,155,110,0.15)] rounded-xl p-5 text-center">
            <p className="text-[#0a7d58] font-bold">Session completed successfully.</p>
            <p className="text-[#0a7d58] text-sm mt-1">Your data has been exported and saved.</p>
          </div>
        )}

        <p className="text-center text-xs text-[rgba(0,0,0,0.55)] mt-6">
          This data is structured for the OneAquaHealth indicator framework (doi:10.5281/zenodo.20345207). Assessment is produced by deterministic rules (streamvitals-assessment/1.0.0) — no AI, no model, no hidden state.
        </p>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.8)] flex items-center justify-center p-4"
          data-testid="photo-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          onClick={() => setLightbox(null)}
        >
          <div className="bg-white rounded-2xl p-4 max-w-3xl max-h-full overflow-auto" onClick={(e) => e.stopPropagation()}>
            <Image src={lightbox.dataUrl} alt={lightbox.label} width={960} height={720} unoptimized className="max-h-[70vh] w-auto mx-auto rounded-xl" />
            <div className="flex items-center justify-between mt-3 gap-4">
              <span className="text-xs text-[rgba(0,0,0,0.55)]">{lightbox.label}</span>
              <button type="button" onClick={() => setLightbox(null)} aria-label="Close photo" className="text-[rgba(0,0,0,0.55)] hover:text-black transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}