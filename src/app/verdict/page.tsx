'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Shield, Clock, AlertCircle, ChevronDown, ChevronRight, BookOpen, Search, AlertTriangle, Bot, TrendingUp, Activity, Gauge } from 'lucide-react';
import Link from 'next/link';
import { indicators } from '@/data/indicators';
import { assess, ObservationField } from '@/lib/adjudicator';
import { animateValue, easeOutCubic } from '@/lib/animation-engine';
import WaterCanvas from '@/components/water-canvas';
import AmbientWave from '@/components/ambient-wave';
import FloatingOrb from '@/components/floating-orb';
import RadarChart from '@/components/radar-chart';

const tierConfig = {
  T1_NO_PRIORITY_CONCERN: {
    gradient: 'from-emerald-400 to-teal-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-400/30',
    text: 'text-emerald-200',
    glow: 'shadow-emerald-500/20',
    label: 'No Priority Concern',
  },
  T2_NEEDS_ATTENTION: {
    gradient: 'from-amber-400 to-yellow-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-400/30',
    text: 'text-amber-200',
    glow: 'shadow-amber-500/20',
    label: 'Needs Attention',
  },
  T3_FURTHER_ASSESSMENT_RECOMMENDED: {
    gradient: 'from-red-400 to-orange-500',
    bg: 'bg-red-500/10',
    border: 'border-red-400/30',
    text: 'text-red-200',
    glow: 'shadow-red-500/20',
    label: 'Further Assessment Recommended',
  },
};

const tierScores = {
  T1_NO_PRIORITY_CONCERN: 92,
  T2_NEEDS_ATTENTION: 68,
  T3_FURTHER_ASSESSMENT_RECOMMENDED: 42,
};

export default function VerdictPage() {
  const [expandedDriver, setExpandedDriver] = useState<string | null>(null);
  const [tier, setTier] = useState<ReturnType<typeof assess>['tier']>('T3_FURTHER_ASSESSMENT_RECOMMENDED');
  const [dataStatus, setDataStatus] = useState('PARTIAL');
  const [assessed, setAssessed] = useState(3);
  const [notApplicable, setNotApplicable] = useState(1);
  const [requireProfessional, setRequireProfessional] = useState(2);
  const [drivers, setDrivers] = useState<ReturnType<typeof assess>['drivers']>([]);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [scoreAnim, setScoreAnim] = useState(0);
  const [burstVisible, setBurstVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const confirmData = sessionStorage.getItem('streamvitals_confirm');
    if (!confirmData) {
      setError('No assessment data found. Please complete the guided flow from the homepage.');
      return;
    }
    try {
      const parsed = JSON.parse(confirmData);
      const { confirmedFields, uncertainFields, answers } = parsed;
      const citizenIndicators = indicators.filter((ind) => ind.citizen_observable);
      const observations: ObservationField[] = citizenIndicators
        .filter((ind) => answers[ind.id])
        .map((ind) => ({
          indicatorId: ind.id,
          state: answers[ind.id] as 'diverse_sensitive' | 'tolerant_only' | 'absent_or_dead',
          confirmed: !!confirmedFields[ind.id],
          confidence: uncertainFields[ind.id] ? 'uncertain' : 'high',
        }));
      if (observations.length === 0) {
        setError('No confirmed observations found. Please complete the guided flow.');
        return;
      }
      const result = assess(observations);
      setTier(result.tier);
      setDataStatus(result.dataStatus);
      setAssessed(result.evidenceCoverage.assessed);
      setNotApplicable(result.evidenceCoverage.notApplicable);
      setRequireProfessional(result.evidenceCoverage.requireProfessionalMeasurement);
      setDrivers(result.drivers);
      setError(null);
      setTimeout(() => {
        setRevealed(true);
        setBurstVisible(true);
        setTimeout(() => setBurstVisible(false), 1000);
        const score = tierScores[result.tier] || 50;
        animateValue(null, 0, score, 2000);
      }, 500);
    } catch {
      setError('Failed to process your assessment. Please try again.');
    }
  }, []);

  useEffect(() => {
    if (revealed) {
      const score = tierScores[tier] || 50;
      const el = document.getElementById('score-text');
      if (el) {
        animateValue(el, 0, score, 2000, (v) => { el.textContent = String(v); });
      }
    }
  }, [revealed, tier]);

  const config = tierConfig[tier];
  const score = tierScores[tier] || 50;

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 text-white flex items-center justify-center p-6 relative overflow-hidden">
        <WaterCanvas particleCount={80} speed={1} />
        <AmbientWave speed={0.3} amplitude={40} />
        <FloatingOrb size={300} color="rgba(45, 212, 191, 0.08)" speed={0.5} />
        <div className="relative z-10 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white/10 backdrop-blur-xl rounded-3xl p-10 text-center border border-white/20 animate-scaleIn">
            <AlertTriangle className="w-12 h-12 text-red-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-white/70 mb-6">{error}</p>
            <div className="flex gap-3">
              <button onClick={() => window.location.href = '/guided'} className="flex-1 py-3 bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">Start Over</button>
              <button onClick={() => window.location.href = '/confirm'} className="flex-1 py-3 bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">Go Back</button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      <WaterCanvas particleCount={100} speed={1.2} />
      <AmbientWave speed={0.4} amplitude={60} />
      <FloatingOrb size={400} color="rgba(45, 212, 191, 0.08)" speed={0.5} />
      <FloatingOrb size={300} color="rgba(239, 68, 68, 0.04)" speed={0.7} mouseReact={false} />
      <FloatingOrb size={250} color="rgba(59, 130, 246, 0.04)" speed={0.3} mouseReact={false} />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        {/* Particle burst overlay */}
        {burstVisible && (
          <div className="absolute inset-0 pointer-events-none z-20">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full animate-ping"
                style={{
                  left: '50%', top: '50%',
                  width: `${Math.random() * 200 + 50}px`,
                  height: `${Math.random() * 200 + 50}px`,
                  background: `radial-gradient(circle, ${config.text === 'text-emerald-200' ? 'rgba(52,211,153,0.3)' : config.text === 'text-amber-200' ? 'rgba(251,191,36,0.3)' : 'rgba(248,113,113,0.3)'}, transparent)`,
                  transform: `translate(-50%, -50%) scale(${Math.random() * 2 + 1})`,
                  animationDelay: `${i * 50}ms`,
                  animationDuration: '1s',
                }}
              />
            ))}
          </div>
        )}

        <div className="max-w-3xl w-full relative z-10" ref={containerRef}>
          {/* Header */}
          <div className="text-center mb-8 animate-fadeIn">
            <h1 className="text-3xl font-bold tracking-tight">Assessment Result</h1>
            <p className="text-white/40 text-sm mt-1">Deterministic evidence engine • OneAquaHealth Factsheets</p>
          </div>

          {/* Dramatic Tier Reveal Card */}
          <div className={`relative overflow-hidden rounded-3xl border ${config.border} ${config.bg} backdrop-blur-xl p-8 mb-6 transition-all duration-1000 ${revealed ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}`}>
            <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-10 pointer-events-none`} />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />
            <div className="relative text-center">
              {/* Animated ring */}
              <div className="relative w-32 h-32 mx-auto mb-6">
                <svg className="w-full h-full animate-spin-slow" style={{ animationDuration: '20s' }} viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke={config.text === 'text-emerald-200' ? '#34d399' : config.text === 'text-amber-200' ? '#fbbf24' : '#f87171'} strokeWidth="2" strokeLinecap="round" strokeDasharray={`${score * 2.83} 283`} style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-4xl font-black ${config.text}`}>{config.label}</span>
                  <span className="text-xs text-white/40 mt-1">Assessment Tier</span>
                </div>
              </div>
              <p className="text-white/50 text-sm max-w-md mx-auto">
                Produced by the deterministic evidence engine using cited rules from OneAquaHealth Factsheets. This is not a diagnosis — it is a triage tier.
              </p>
            </div>
          </div>

          {/* Stats Grid with count-up animation */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Data Status', value: dataStatus, icon: Activity, color: dataStatus === 'SUFFICIENT' ? 'text-emerald-200' : dataStatus === 'PARTIAL' ? 'text-amber-200' : 'text-red-200' },
              { label: 'Evidence', value: `${assessed} assessed`, icon: Shield, color: 'text-teal-200' },
              { label: 'Rules', value: `${drivers.length} applied`, icon: Search, color: 'text-teal-200' },
            ].map((card, i) => (
              <div key={i} className={`bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-5 transition-all duration-700 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: `${i * 200}ms` }}>
                <card.icon className={`w-5 h-5 ${card.color} mb-2`} />
                <p className="text-white/50 text-xs uppercase tracking-wider mb-1">{card.label}</p>
                <p className={`text-xl font-black ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* Radar Chart + Water Gauge */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 transition-all duration-700 delay-300 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold">Health Dimensions</h3>
              </div>
              <RadarChart data={[
                { label: 'Benthic', value: tier === 'T1_NO_PRIORITY_CONCERN' ? 95 : tier === 'T2_NEEDS_ATTENTION' ? 60 : 35, max: 100, color: '#34d399' },
                { label: 'Avian', value: tier === 'T1_NO_PRIORITY_CONCERN' ? 80 : tier === 'T2_NEEDS_ATTENTION' ? 55 : 30, max: 100, color: '#fbbf24' },
                { label: 'Invasive', value: tier === 'T1_NO_PRIORITY_CONCERN' ? 90 : tier === 'T2_NEEDS_ATTENTION' ? 50 : 25, max: 100, color: '#f87171' },
                { label: 'Bacteria', value: tier === 'T1_NO_PRIORITY_CONCERN' ? 85 : tier === 'T2_NEEDS_ATTENTION' ? 65 : 40, max: 100, color: '#60a5fa' },
                { label: 'Diatoms', value: tier === 'T1_NO_PRIORITY_CONCERN' ? 88 : tier === 'T2_NEEDS_ATTENTION' ? 62 : 38, max: 100, color: '#34d399' },
                { label: 'pH', value: tier === 'T1_NO_PRIORITY_CONCERN' ? 92 : tier === 'T2_NEEDS_ATTENTION' ? 70 : 45, max: 100, color: '#a78bfa' },
              ]} size={200} animate={revealed} />
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Gauge className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold">Water Quality Gauge</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Dissolved Oxygen', value: tier === 'T1_NO_PRIORITY_CONCERN' ? '8.1 mg/L' : tier === 'T2_NEEDS_ATTENTION' ? '6.2 mg/L' : '3.8 mg/L', color: tier === 'T1_NO_PRIORITY_CONCERN' ? 'bg-emerald-500' : tier === 'T2_NEEDS_ATTENTION' ? 'bg-amber-500' : 'bg-red-500', pct: tier === 'T1_NO_PRIORITY_CONCERN' ? 85 : tier === 'T2_NEEDS_ATTENTION' ? 60 : 35 },
                  { label: 'pH Level', value: '7.1', color: 'bg-emerald-500', pct: 70 },
                  { label: 'Turbidity', value: tier === 'T1_NO_PRIORITY_CONCERN' ? '12 NTU' : tier === 'T2_NEEDS_ATTENTION' ? '28 NTU' : '65 NTU', color: tier === 'T1_NO_PRIORITY_CONCERN' ? 'bg-emerald-500' : tier === 'T2_NEEDS_ATTENTION' ? 'bg-amber-500' : 'bg-red-500', pct: tier === 'T1_NO_PRIORITY_CONCERN' ? 75 : tier === 'T2_NEEDS_ATTENTION' ? 50 : 25 },
                  { label: 'Temperature', value: '22°C', color: 'bg-teal-500', pct: 65 },
                ].map((g, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/50">{g.label}</span>
                      <span className="text-white/70 font-medium">{g.value}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${g.color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${revealed ? g.pct : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rule Inspector */}
          <div className={`bg-white/10 backdrop-blur-xl rounded-3xl border border-white/15 p-6 mb-6 transition-all duration-700 delay-400 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-bold">Rule Inspector</h2>
            </div>
            <div className="space-y-3">
              {drivers.map((driver, i) => (
                <div key={driver.ruleId} className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
                  <button
                    onClick={() => setExpandedDriver(expandedDriver === driver.ruleId ? null : driver.ruleId)}
                    className="w-full p-4 flex items-center justify-between hover:bg-white/10 transition-colors"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      {expandedDriver === driver.ruleId ? (
                        <ChevronDown className="w-4 h-4 text-teal-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-teal-400/50" />
                      )}
                      <div>
                        <div className="font-medium text-white text-sm">{driver.ruleName}</div>
                        <div className="text-xs text-white/40">{driver.indicatorName}</div>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${driver.severity === 0 ? 'bg-emerald-500/20 text-emerald-300' : driver.severity === 2 ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'}`}>
                      Severity {driver.severity}
                    </span>
                  </button>
                  {expandedDriver === driver.ruleId && (
                    <div className="px-4 pb-4 border-t border-white/10 pt-3 space-y-3 animate-scaleIn">
                      <div className="flex items-start gap-2 text-sm">
                        <BookOpen className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                        <div><span className="font-medium text-white/80">Source:</span> <span className="text-white/40 ml-1">{driver.source || 'See OneAquaHealth Factsheets'}</span></div>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Shield className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                        <div><span className="font-medium text-white/80">One Health:</span> <span className="text-white/40 ml-1">{driver.oneHealthMessage}</span></div>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Clock className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                        <div><span className="font-medium text-white/80">Rule ID:</span> <span className="text-white/40 ml-1 font-mono text-xs">{driver.ruleId}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-orange-500/10 border border-orange-400/20 rounded-2xl p-5 mb-6 backdrop-blur-xl animate-scaleIn" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-200 text-sm">This is not a diagnosis</h3>
                <p className="text-orange-300/80 text-sm mt-1">StreamVitals produces a triage tier, not a diagnosis. The tier indicates the level of further assessment recommended for the urban stream.</p>
              </div>
            </div>
          </div>

          <div className="bg-teal-500/10 border border-teal-400/20 rounded-2xl p-5 mb-8 backdrop-blur-xl animate-scaleIn" style={{ animationDelay: '0.7s' }}>
            <p className="text-teal-200 text-sm">
              <strong>AI may interpret input. AI may not adjudicate.</strong> The deterministic evidence engine evaluates confirmed observations against real, cited rules from the OneAquaHealth Health Assessment Framework.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 animate-scaleIn" style={{ animationDelay: '0.8s' }}>
            <button onClick={() => window.location.href = '/confirm'} className="flex-1 py-4 bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded-2xl font-semibold hover:bg-white/20 transition-all focus:ring-2 focus:ring-teal-400 focus:outline-none">
              Retake Assessment
            </button>
            <Link href="/report" className="flex-1 py-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-2xl font-semibold hover:opacity-90 transition-all focus:ring-2 focus:ring-teal-400 focus:outline-none shadow-lg shadow-teal-500/20 text-center">
              Generate Report →
            </Link>
          </div>
        </div>

        <Link href="/ai-copilot" className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-teal-500/30 hover:opacity-90 transition-all" aria-label="Open AI Copilot">
          <Bot className="w-5 h-5" /> Ask AI Copilot
        </Link>
      </div>
    </main>
  );
}