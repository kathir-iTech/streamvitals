'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Smartphone, ClipboardCheck, BarChart3, Download } from 'lucide-react';
import qrcode from 'qrcode-generator';
import { loadSampleSession, SAMPLE_SESSION_ID } from '@/lib/sample-session';

const STEPS = [
  { icon: Smartphone, title: 'Start a session', body: 'Enter any stream name or location (e.g. "Cedar Creek"). A volunteer name is optional. GPS is optional and stays on your device.' },
  { icon: ClipboardCheck, title: 'Record an observation', body: 'Pick one state per indicator, type a field note, add a photo if you have one. Lab indicators give you a sample ID instead of a guess.' },
  { icon: BarChart3, title: 'See the assessment', body: 'On review: the deterministic band, the rule that fired, the factsheet passage behind it. Ask the assistant a question — it explains, it never scores.' },
  { icon: Download, title: 'Export or share', body: 'JSON, CSV, or a printable lab sheet. The share link/QR moves the session to another device with no account.' },
];

export default function TryPage() {
  const router = useRouter();
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const qr = qrcode(0, 'M');
        qr.addData('https://streamvitals.vercel.app');
        qr.make();
        setQrDataUrl(qr.createDataURL(5, 8));
      } catch {
        setQrDataUrl('');
      }
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const handleLoadSample = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await loadSampleSession();
      if (result.ok) {
        router.push(`/field/review?session=${encodeURIComponent(SAMPLE_SESSION_ID)}`);
      } else {
        setError(result.error);
      }
    } catch {
      setError('Could not load the sample session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#ffffff]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div data-testid="try-page" className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4 bg-[rgba(13,155,110,0.08)] border border-[rgba(13,155,110,0.15)] px-4 py-2 rounded-full">
            <span className="w-1.5 h-1.5 bg-[#0a7d58] rounded-full" />
            <span className="text-xs font-semibold text-[#075d44] tracking-wide uppercase">5-minute walkthrough</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-3 text-black leading-[1.05]">Try StreamVitals</h1>
          <p className="text-lg text-[rgba(0,0,0,0.62)]">No account, no install. Everything you record stays in your browser.</p>
        </div>

        <ol className="space-y-4 mb-10">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4 bg-[#f5faf7] border border-[rgba(0,0,0,0.06)] rounded-2xl p-5">
              <span className="w-8 h-8 rounded-full bg-[#0a7d58] text-white font-black text-sm flex items-center justify-center flex-shrink-0">{i + 1}</span>
              <div>
                <p className="font-bold text-black flex items-center gap-2"><step.icon className="w-4 h-4 text-[#0a7d58]" /> {step.title}</p>
                <p className="text-sm text-[rgba(0,0,0,0.62)] mt-1">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="grid sm:grid-cols-2 gap-5 mb-10">
          <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-2xl p-6 text-center">
            <p className="text-sm font-bold text-black mb-3">Just exploring?</p>
            <p className="text-xs text-[rgba(0,0,0,0.62)] mb-4">Load a session built from clearly-labeled synthetic data — states, notes, and bands with a banner saying exactly that.</p>
            <button
              type="button"
              data-testid="try-load-sample"
              onClick={() => void handleLoadSample()}
              disabled={loading}
              className="btn-pill-accent text-sm"
            >
              {loading ? 'Loading…' : 'Load the sample session'}
              <ArrowRight className="w-4 h-4" />
            </button>
            {error && <p className="text-xs text-red-500 font-medium mt-3">{error}</p>}
          </div>
          <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-2xl p-6 text-center">
            <p className="text-sm font-bold text-black mb-3">On a phone?</p>
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- qrcode-generator emits a data URL; next/image cannot optimize it
              <img src={qrDataUrl} alt="QR code linking to the StreamVitals app" width={132} height={132} className="mx-auto rounded-lg" />
            ) : (
              <p className="text-xs text-[rgba(0,0,0,0.55)]">streamvitals.vercel.app</p>
            )}
            <p className="text-xs text-[rgba(0,0,0,0.55)] mt-3">Scan to open the app</p>
          </div>
        </div>

        <div className="bg-[rgba(13,155,110,0.05)] border border-[rgba(13,155,110,0.15)] rounded-2xl p-6">
          <p className="text-sm font-bold text-[#075d44] mb-2">What we promise</p>
          <ul className="text-xs text-[rgba(0,0,0,0.62)] space-y-1.5 list-disc list-inside">
            <li>Your sessions, photos, and notes are stored in your browser (IndexedDB) and exported only when you export them.</li>
            <li>Share links carry data in the URL fragment — never sent to any server. Photos never leave the device.</li>
            <li>Assessment is deterministic (streamvitals-assessment/1.0.0). The assistant may explain — it never scores, and its API call is rate-limited per IP.</li>
            <li>If something breaks, one anonymous error line (message + page URL) goes to our server logs. No cookies, no tracking, no third parties.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
