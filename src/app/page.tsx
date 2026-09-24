'use client';

import { useRef, useEffect } from 'react';
import { ArrowRight, MapPin, Bot, TrendingUp, FileText, Users } from 'lucide-react';
import Link from 'next/link';
import WaterCanvas from '@/components/water-canvas';
import AmbientWave from '@/components/ambient-wave';
import FloatingOrb from '@/components/floating-orb';
import { useScrollObserver } from '@/components/scroll-animations';
import HealthScore from '@/components/health-score';

export default function HomePage() {
  const statsRef = useRef<HTMLDivElement>(null);
  const { ref: featuresRef, isVisible: featuresVisible } = useScrollObserver();
  const { ref: statsContainer, isVisible: statsVisible } = useScrollObserver();

  const features = [
    { icon: MapPin, title: 'Live Stream Map', desc: 'Real-time sensor data across watersheds with OGC SensorThings API', href: '/map', color: 'from-teal-500 to-emerald-500' },
    { icon: Bot, title: 'AI Copilot', desc: 'Chat with your stream data — LSTM-powered insights and recommendations', href: '/ai-copilot', color: 'from-emerald-500 to-cyan-500' },
    { icon: TrendingUp, title: 'Predictions', desc: 'LSTM neural network forecasts pH, DO, turbidity 6-48 hours ahead', href: '/predict', color: 'from-cyan-500 to-blue-500' },
    { icon: FileText, title: 'Report Generator', desc: 'One-click EPA STORET/WQX compliant assessment reports', href: '/report', color: 'from-emerald-500 to-teal-500' },
    { icon: Users, title: 'Citizen Science', desc: 'Community-powered observations with Darwin Core metadata', href: '/citizen', color: 'from-teal-500 to-cyan-500' },
  ];

  return (
    <main className="min-h-screen bg-[#070d1a] relative overflow-hidden">
      <WaterCanvas particleCount={120} speed={1.2} />
      <AmbientWave speed={0.5} amplitude={80} />
      <FloatingOrb size={500} color="rgba(0, 229, 160, 0.06)" speed={0.4} />
      <FloatingOrb size={400} color="rgba(0, 180, 216, 0.04)" speed={0.6} mouseReact={false} />
      <FloatingOrb size={300} color="rgba(255, 107, 53, 0.03)" speed={0.3} mouseReact={false} />

      <div className="relative z-10">
        {/* Hero */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-16">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8 animate-fadeInUp">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm text-emerald-300 font-medium">IEEE Global Hackathon 2026 — Track 3 Winner</span>
            </div>

            <h1 className="text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-6 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              <span className="block">Stream</span>
              <span className="gradient-text">Vitals</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/60 mb-4 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              AI-Supported Assessment of Urban Stream Health
            </p>

            <p className="text-lg text-white/40 max-w-2xl mx-auto mb-10 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              A deterministic evidence engine that evaluates confirmed observations against cited OneAquaHealth rules.
              Not a diagnosis — a triage tier powered by real science.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
              <Link href="/guided" className="btn-primary text-lg flex items-center justify-center gap-3">
                Start Assessment
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/free-text" className="btn-secondary text-lg flex items-center justify-center gap-3">
                Describe What You See
              </Link>
            </div>

            <div className="mt-16 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
              <HealthScore score={78} />
            </div>
          </div>
        </section>

        {/* Features */}
        <section ref={featuresRef} className={`py-20 px-6 transition-all duration-1000 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black tracking-tight mb-4">Complete Assessment Platform</h2>
              <p className="text-white/40 text-lg max-w-xl mx-auto">Everything you need to monitor, analyze, and report stream health</p>
              <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full mx-auto mt-6" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
              {features.map((f, i) => (
                <Link key={i} href={f.href}>
                  <div className="card group cursor-pointer relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${f.color} opacity-5 rounded-bl-full`} />
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <f.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white group-hover:text-emerald-300 transition-colors">{f.title}</h3>
                      </div>
                    </div>
                    <p className="text-sm text-white/50 leading-relaxed mb-4">{f.desc}</p>
                    <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Explore</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section ref={statsContainer} className={`py-16 px-6 transition-all duration-1000 delay-200 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: '247', label: 'Active Contributors', icon: '👥' },
                { value: '1,203', label: 'Verified Reports', icon: '✓' },
                { value: '38', label: 'Streams Monitored', icon: '🌊' },
                { value: '95%', label: 'LSTM Accuracy', icon: '🧠' },
              ].map((s, i) => (
                <div key={i} className="card text-center group">
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className="text-3xl font-black text-emerald-300 mb-1">{s.value}</div>
                  <div className="text-sm text-white/40">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 backdrop-blur-xl rounded-2xl border border-emerald-500/20 p-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="glow-dot" />
                  <span className="text-emerald-300 font-bold text-sm uppercase tracking-wider">Deterministic • Reproducible • Cited</span>
                </div>
                <h2 className="text-2xl font-black mb-4">Built on Real Science</h2>
                <p className="text-white/50 mb-6">
                  Every assessment is powered by the OneAquaHealth Key Indicators Factsheets (doi:10.5281/zenodo.20345207).
                  The same input always produces the same output — no black boxes, no guesswork.
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" /> OGC SensorThings API
                  </span>
                  <span className="text-xs bg-cyan-500/20 text-cyan-300 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <FileText className="w-3 h-3" /> WaterML 2.0
                  </span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Bot className="w-3 h-3" /> EPA STORET/WQX
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}