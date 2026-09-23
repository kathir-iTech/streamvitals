import { Droplets } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-teal-400 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-600 rounded-full blur-3xl opacity-10" />
      </div>

      <div className="max-w-lg w-full text-center relative z-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 mb-8">
          <Droplets className="w-10 h-10 text-teal-300" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-4">StreamVitals</h1>
        <p className="text-lg text-white/60 mb-12">
          OneAquaHealth IEEE Global Hackathon 2026 — Track 3: AI-Supported Assessment
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/guided"
            className="px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl hover:bg-teal-50 transition-colors text-lg shadow-lg"
          >
            Answer Questions
          </Link>
          <Link
            href="/free-text"
            className="px-8 py-4 bg-transparent border-2 border-teal-400 text-teal-300 font-semibold rounded-xl hover:bg-teal-400 hover:text-slate-900 transition-colors text-lg"
          >
            Describe What You See
          </Link>
        </div>
        <p className="mt-8 text-sm text-white/40">
          AI may interpret input. AI may not adjudicate.
        </p>
      </div>
    </main>
  );
}
