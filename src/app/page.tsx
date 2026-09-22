import { Droplets } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Droplets className="w-10 h-10 text-teal-300" />
          <h1 className="text-4xl font-bold tracking-tight">StreamVitals</h1>
        </div>
        <p className="text-lg text-teal-200 mb-12">
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
        <p className="mt-8 text-sm text-teal-400">
          AI may interpret input. AI may not adjudicate.
        </p>
      </div>
    </main>
  );
}
