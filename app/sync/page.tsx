'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { decodeShare } from '@/lib/session-share';
import type { FieldSession } from '@/lib/field-session';

export default function SyncPage() {
  const [preview, setPreview] = useState<FieldSession | null>(null);
  const [linkError, setLinkError] = useState('');
  const [pasted, setPasted] = useState('');
  const [importError, setImportError] = useState('');
  const [imported, setImported] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const hash = window.location.hash.replace(/^#/, '');
      if (!hash) return;
      void decodeShare(hash).then((decoded) => {
        if (decoded) setPreview(decoded);
        else setLinkError('This share link is invalid or was truncated. Ask for a fresh link, or paste the payload below.');
      });
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleLoadPasted = () => {
    const value = pasted.trim();
    if (!value) return;
    const fragment = value.includes('#') ? value.slice(value.indexOf('#') + 1) : value;
    void decodeShare(fragment).then((decoded) => {
      if (decoded) {
        setPreview(decoded);
        setLinkError('');
        setImportError('');
      } else {
        setLinkError('That does not decode to a valid session. Paste the full link or the whole share payload.');
      }
    });
  };

  const handleImport = async () => {
    if (!preview) return;
    setImportError('');
    try {
      const { createSession } = await import('@/lib/field-session');
      const result = await createSession(preview);
      if (!result.success) {
        setImportError(result.error || 'Import failed.');
        return;
      }
      sessionStorage.setItem('current_session_id', preview.sessionId);
      setImported(true);
    } catch {
      setImportError('Import failed — this browser cannot write to its local session store.');
    }
  };

  return (
    <main className="min-h-screen bg-[#ffffff]">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4 bg-[rgba(13,155,110,0.08)] border border-[rgba(13,155,110,0.15)] px-4 py-2 rounded-full">
            <span className="w-1.5 h-1.5 bg-[#0a7d58] rounded-full" />
            <span className="text-xs font-semibold text-[#075d44] tracking-wide uppercase">Cross-device sync</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-3 text-black leading-[1.05]">Import a shared session</h1>
          <p className="text-lg text-[rgba(0,0,0,0.62)]">
            Share links carry the session in the URL fragment — no account, no server storage.
          </p>
        </div>

        {!preview && (
          <div className="bg-[#f5faf7] border border-[rgba(0,0,0,0.06)] rounded-2xl p-8 mb-8">
            <h2 className="text-lg font-black text-black mb-2">Paste a share payload</h2>
            <p className="text-sm text-[rgba(0,0,0,0.62)] mb-4">
              Open <strong>Create share link</strong> on the other device&rsquo;s review page, then paste the full link (or just the part after <code className="text-[#0a7d58]">#</code>) here.
            </p>
            <textarea
              data-testid="sync-paste"
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              rows={4}
              aria-label="Paste a session share link"
              placeholder="http://…/sync#…"
              className="w-full px-4 py-3 bg-white border border-[rgba(0,0,0,0.08)] rounded-xl text-black font-mono text-xs focus:ring-2 focus:ring-[#0d9b6e] focus:outline-none"
            />
            <button type="button" data-testid="sync-load" onClick={handleLoadPasted} className="btn-pill-outline text-sm mt-3">
              Load preview
            </button>
          </div>
        )}

        {linkError && (
          <p className="text-sm text-red-500 font-medium mb-6" data-testid="sync-error">{linkError}</p>
        )}

        {preview && (
          <div className="bg-[#f5faf7] border border-[rgba(0,0,0,0.06)] rounded-2xl p-8 mb-8" data-testid="sync-preview">
            <h2 className="text-lg font-black text-black mb-4">Session preview</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[rgba(0,0,0,0.62)]">Stream:</span><span className="font-bold text-black">{preview.streamName}</span></div>
              <div className="flex justify-between"><span className="text-[rgba(0,0,0,0.62)]">Volunteer:</span><span className="font-bold text-black">{preview.volunteer || 'Not provided'}</span></div>
              <div className="flex justify-between"><span className="text-[rgba(0,0,0,0.62)]">Date:</span><span className="font-bold text-black">{preview.date}</span></div>
              <div className="flex justify-between"><span className="text-[rgba(0,0,0,0.62)]">Indicators:</span><span className="font-bold text-black">{preview.indicators.length}</span></div>
              <div className="flex justify-between"><span className="text-[rgba(0,0,0,0.62)]">GPS:</span><span className="font-bold text-black">{preview.location ? `${preview.location.lat.toFixed(5)}, ${preview.location.lng.toFixed(5)}` : 'Not captured'}</span></div>
              <div className="flex justify-between"><span className="text-[rgba(0,0,0,0.62)]">GBIF baseline:</span><span className="font-bold text-black">{preview.gbifBaseline ? `${preview.gbifBaseline.rows.length} taxa` : 'None'}</span></div>
              <div className="flex justify-between"><span className="text-[rgba(0,0,0,0.62)]">Photos:</span><span className="font-bold text-[rgba(0,0,0,0.62)]">Not part of share links — stay on the original device</span></div>
            </div>
            {!imported ? (
              <>
                <button type="button" data-testid="sync-import" onClick={handleImport} className="btn-pill-accent text-sm mt-6">
                  Import into this browser
                </button>
                {importError && <p className="text-sm text-red-500 font-medium mt-2">{importError}</p>}
              </>
            ) : (
              <div className="mt-6 bg-[rgba(13,155,110,0.06)] border border-[rgba(13,155,110,0.15)] rounded-xl p-5 text-center" data-testid="sync-success">
                <p className="text-[#0a7d58] font-bold">Session imported into this browser.</p>
                <div className="flex gap-3 justify-center mt-3">
                  <Link href="/field/review" className="btn-pill-accent text-sm">Open review</Link>
                  <Link href="/field" className="btn-pill-outline text-sm">Back to /field</Link>
                </div>
              </div>
            )}
            <p className="text-xs text-[rgba(0,0,0,0.55)] mt-4 leading-relaxed">
              Importing writes the session into this browser&rsquo;s local store (IndexedDB); if a session with the same ID exists here, it is replaced.
            </p>
          </div>
        )}

        <p className="text-center text-xs text-[rgba(0,0,0,0.55)]">
          Sync via share links — no accounts, no server storage. Server-side sync is on the roadmap.
        </p>

        <div className="mt-8 text-center">
          <Link href="/field" className="inline-flex items-center gap-2 text-sm text-[rgba(0,0,0,0.62)] hover:text-[#0a7d58] font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to /field
          </Link>
        </div>
      </div>
    </main>
  );
}
