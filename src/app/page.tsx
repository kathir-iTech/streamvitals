'use client';

import { useEffect, useRef } from 'react';
import { Droplets, ArrowRight, MapPin, Bot, TrendingUp, FileText, Users, Search, Activity, Shield } from 'lucide-react';
import WaterCanvas from '@/components/water-canvas';
import FloatingOrb from '@/components/floating-orb';
import AmbientWave from '@/components/ambient-wave';
import HealthScore from '@/components/health-score';
import { useScrollObserver } from '@/components/scroll-animations';
import Link from 'next/link';

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { ref: featuresRef, isVisible: featuresVisible } = useScrollObserver();
  const { ref: statsRef, isVisible: statsVisible } = useScrollObserver();
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollObserver();

  const features = [
    { icon: MapPin, title: 'Live Stream Map', desc: 'Real-time sensor data across watersheds with OGC SensorThings API', href: '/map' },
    { icon: Bot, title: 'AI Copilot', desc: 'Chat with your stream data — LSTM-powered insights and recommendations', href: '/ai-copilot' },
    { icon: TrendingUp, title: 'Predictions', desc: 'LSTM neural network forecasts pH, DO, turbidity 6-48 hours ahead', href: '/predict' },
    { icon: FileText, title: 'Report Generator', desc: 'One-click EPA STORET/WQX compliant assessment reports', href: '/report' },
    { icon: Users, title: 'Citizen Science', desc: 'Community-powered observations with Darwin Core metadata', href: '/citizen' },
    { icon: Activity, title: 'Field Collection', desc: 'Offline-first PWA for remote stream monitoring', href: '/field-collect' },
  ];

  const stats = [
    { value: 247, label: 'Active Contributors' },
    { value: '1,203', label: 'Verified Reports' },
    { value: '38', label: 'Streams Monitored' },
    { value: '95%', label: 'LSTM Accuracy' },
  ];

  return (
    <main ref={heroRef} className="min-h-screen relative overflow-hidden">
      <WaterCanvas particleCount={100} speed={1} />
      <AmbientWave speed={0.5} amplitude={60} />
      <FloatingOrb size={400} color="rgba(45, 212, 191, 0.08)" speed={0.5} />
      <FloatingOrb size={300} color="rgba(59, 130, 246, 0.06)" speed={0.7} mouseReact={false} />
      <FloatingOrb size={200} color="rgba(16, 185, 129, 0.05)" speed={0.3} mouseReact={false} />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-full mb-8 animate-fadeIn">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-white/50">IEEE Global Hackathon 2026 — Track 3</span>
          </div>

          <h1 className="text-7xl md:text-8xl font-black tracking-tight mb-6 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            Stream<span className="bg-gradient-to-r from-teal-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">Vitals</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/60 mb-4 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            AI-Supported Assessment of Urban Stream Health
          </p>
          <p className="text-white/40 max-w-2xl mx-auto mb-10 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            A deterministic evidence engine that evaluates confirmed observations against cited OneAquaHealth rules.
            Not a diagnosis — a triage tier powered by real science.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <Link href="/guided" className="px-10 py-5 bg-white text-slate-900 font-bold rounded-2xl hover:bg-teal-50 transition-all text-lg shadow-xl shadow-teal-500/20 flex items-center gap-2">
              Start Assessment <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/free-text" className="px-10 py-5 bg-transparent border-2 border-teal-400 text-teal-300 font-bold rounded-2xl hover:bg-teal-400 hover:text-slate-900 transition-all text-lg flex items-center gap-2">
              Describe What You See
            </Link>
          </div>

          <HealthScore score={78} className="mt-12" />
        </div>

        {/* Features Section */}
        <div ref={featuresRef} className={`w-full max-w-6xl mx-auto mt-20 transition-all duration-1000 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Complete Assessment Platform</h2>
            <p className="text-white/40 text-sm">Everything you need to monitor, analyze, and report stream health</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <Link key={i} href={f.href} className="group">
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-teal-400/40 hover:bg-white/8 transition-all duration-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-teal-500/10">
                  <f.icon className="w-8 h-8 text-teal-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-white mb-1 group-hover:text-teal-300 transition-colors">{f.title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed">{f.desc}</p>
                  <div className="mt-3 flex items-center gap-1 text-teal-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Explore</span> <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div ref={statsRef} className={`w-full max-w-4xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-1000 delay-200 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {stats.map((s, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-5 text-center">
              <p className="text-2xl font-black text-teal-300">{s.value}</p>
              <p className="text-xs text-white/40 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div ref={ctaRef} className={`mt-16 text-center transition-all duration-1000 delay-300 ${ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 backdrop-blur-xl rounded-3xl border border-teal-400/20 p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-teal-400" />
              <span className="text-sm font-bold text-teal-200">Deterministic • Reproducible • Cited</span>
            </div>
            <p className="text-white/50 text-sm mb-4">
              Every assessment is powered by the OneAquaHealth Key Indicators Factsheets (doi:10.5281/zenodo.20345207).
              The same input always produces the same output — no black boxes, no guesswork.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Activity className="w-3 h-3" /> OGC SensorThings API
              </span>
              <span className="text-xs bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Search className="w-3 h-3" /> WaterML 2.0
              </span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Shield className="w-3 h-3" /> EPA STORET/WQX
              </span>
            </div>
          </div>
        </div>

        <p className="mt-12 text-xs text-white/20 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
          AI may interpret input. AI may not adjudicate.
        </p>
      </div>
    </main>
  );
}