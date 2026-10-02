'use client';

import Link from 'next/link';
import { indicators } from '@/data/indicators';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f8f9fc]">
      <div className="hero-split">
        <div className="animate-fadeInUp">
          <div className="inline-flex items-center gap-2 mb-6 bg-[rgba(13,155,110,0.08)] border border-[rgba(13,155,110,0.15)] px-4 py-2 rounded-full">
            <span className="w-1.5 h-1.5 bg-[#0a7d58] rounded-full" />
            <span className="text-xs font-semibold text-[#075d44] tracking-wide uppercase">OneAquaHealth IEEE 2026</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 text-black leading-[1.05]">
            Take the<br />stream&rsquo;s vitals
          </h1>
          <p className="text-lg text-[rgba(0,0,0,0.62)] leading-relaxed max-w-md mb-10">
            Collect real field data across five official OneAquaHealth indicators, then see a deterministic assessment with its full chain of evidence. AI may explain — AI never scores.
          </p>
          <Link href="/field" className="btn-pill-accent text-lg">
            Start Monitoring <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
        <div className="hero-right">
          <StreamIllustration />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-black tracking-tighter mb-8 text-black">Five Official Indicators</h2>
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0a7d58] mb-4">Field-observable (3)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {indicators.filter((ind) => ind.citizen_observable && !ind.lab_only).map((ind) => (
            <Link
              key={ind.id}
              href={`/field/${ind.id}`}
              className="bg-white border border-[rgba(0,0,0,0.06)] rounded-xl p-6 hover:border-[#0d9b6e] hover:bg-[rgba(13,155,110,0.03)] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="inline-block px-3 py-1 rounded-full bg-[rgba(13,155,110,0.08)] text-[#0a7d58] text-xs font-bold uppercase tracking-wider">
                  {ind.id}
                </span>
              </div>
              <h3 className="text-lg font-bold text-black mb-2 group-hover:text-[#0a7d58] transition-colors">{ind.name}</h3>
              <p className="text-sm text-[rgba(0,0,0,0.62)] mb-3">{ind.category}</p>
              <p className="text-xs text-[rgba(0,0,0,0.55)]">{ind.citizen_question.substring(0, 80)}...</p>
              <div className="mt-4 flex items-center text-[#0a7d58] text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                Select indicator <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          ))}
        </div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#c2410c] mb-4">Lab samples (2)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {indicators.filter((ind) => ind.lab_only).map((ind) => (
            <Link
              key={ind.id}
              href={`/field/${ind.id}`}
              className="bg-white border border-[rgba(0,0,0,0.06)] rounded-xl p-6 hover:border-[#e85d3a] hover:bg-[rgba(232,93,58,0.03)] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="inline-block px-3 py-1 rounded-full bg-[rgba(13,155,110,0.08)] text-[#0a7d58] text-xs font-bold uppercase tracking-wider">
                  {ind.id}
                </span>
                <span className="text-[10px] bg-[rgba(232,93,58,0.1)] text-[#c2410c] px-3 py-1 rounded-full font-bold">Lab Required</span>
              </div>
              <h3 className="text-lg font-bold text-black mb-2 group-hover:text-[#c2410c] transition-colors">{ind.name}</h3>
              <p className="text-sm text-[rgba(0,0,0,0.62)] mb-3">{ind.category}</p>
              <p className="text-xs text-[rgba(0,0,0,0.55)]">{ind.citizen_question.substring(0, 80)}...</p>
              <div className="mt-4 flex items-center text-[#c2410c] text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                Select indicator <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="stats-strip">
        <div className="stat-item">
          <span className="text-3xl font-black tracking-tighter text-[#0a7d58]">72</span>
          <span className="text-xs text-[rgba(0,0,0,0.62)] font-medium">Automated tests</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="text-3xl font-black tracking-tighter text-[#0a7d58]">5</span>
          <span className="text-xs text-[rgba(0,0,0,0.62)] font-medium">OneAquaHealth Indicators</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="text-3xl font-black tracking-tighter text-[#0a7d58]">9</span>
          <span className="text-xs text-[rgba(0,0,0,0.62)] font-medium">Citizen observation states</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="text-3xl font-black tracking-tighter text-[#0a7d58]">CC-BY</span>
          <span className="text-xs text-[rgba(0,0,0,0.62)] font-medium">Factsheet License</span>
        </div>
      </div>
    </main>
  );
}

function StreamIllustration() {
  return (
    <svg width="100%" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
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
