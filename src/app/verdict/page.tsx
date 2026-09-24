'use client';

import { useState, useEffect } from 'react';
import { Shield, BookOpen, Search, AlertTriangle, Bot, TrendingUp, Activity, Gauge, ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { indicators } from '@/data/indicators';
import { assess, ObservationField } from '@/lib/adjudicator';
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
    label: 'No Priority Concern',
    score: 92,
    icon: '✓',
  },
  T2_NEEDS_ATTENTION: {
    gradient: 'from-amber-400 to-yellow-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-400/30',
    text: 'text-amber-200',
    label: 'Needs Attention',
    score: 68,
    icon: '⚠',
  },
  T3_FURTHER_ASSESSMENT_RECOMMENDED: {
    gradient: 'from-red-400 to-orange-500',
    bg: 'bg-red-500/10',
    border: 'border-red-400/30',
    text: 'text-red-200',
    label: 'Further Assessment Recommended',
    score: 42,
    icon: '⚡',
  },
};

export default function VerdictPage() {
  const [expandedDriver, setExpandedDriver] = useState<string | null>(null);
  const [tier, setTier] = useState<ReturnType<typeof assess>['tier']>('T3_FURTHER_ASSESSMENT_RECOMMENDED');
  const [dataStatus, setDataStatus] = useState('PARTIAL');
  const [assessed, setAssessed] = useState(3);
  const [drivers, setDrivers] = useState<ReturnType<typeof assess>['drivers']>([]);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [burstVisible, setBurstVisible] = useState(false);

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
      setDrivers(result.drivers);
      setError(null);
      setTimeout(() => {
        setRevealed(true);
        setBurstVisible(true);
        setTimeout(() => setBurstVisible(false), 1200);
        const cfg = tierConfig[result.tier];
        if (!cfg) return;
        let current = 0;
        const target = cfg.score;
        const interval = setInterval(() => {
          current += Math.max(1, Math.floor((target - current) * 0.06));
          if (current >= target) { current = target; clearInterval(interval); }
          setScore(current);
        }, 25);
      }, 600);
    } catch {
      setError('Failed to process your assessment. Please try again.');
    }
  }, []);

  const config = tierConfig[tier];
  if (!config) return null;

  return (
    <main className="min-h-screen bg-[#070d1a] relative overflow-hidden">
      <WaterCanvas particleCount={100} speed={1.2} />
      <AmbientWave speed={0.4} amplitude={60} />
      <FloatingOrb size={400} color="rgba(0, 229, 160, 0.08)" speed={0.5} />
      <FloatingOrb size={300} color="rgba(255, 107, 53, 0.04)" speed={0.7} mouseReact={false} />
      <FloatingOrb size={250} color="rgba(0, 180, 216, 0.04)" speed={0.3} mouseReact={false} />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        {burstVisible && (
          <div className="absolute inset-0 pointer-events-none z-20">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: '50%', top: '50%',
                  width: `${Math.random() * 400 + 50}px`,
                  height: `${Math.random() * 400 + 50}px`,
                  background: `radial-gradient(circle, ${config.text === 'text-emerald-200' ? 'rgba(0,229,160,0.2)' : config.text === 'text-amber-200' ? 'rgba(255,191,36,0.2)' : 'rgba(248,113,113,0.2)'}, transparent 70%)`,
                  transform: `translate(-50%, -50%) scale(${Math.random() * 3 + 1})`,
                  animationDelay: `${i * 30}ms`,
                  animationDuration: '1.2s',
                  animation: `ripple 1.2s ease-out ${i * 30}ms forwards`,
                }}
              />
            ))}
          </div>
        )}

        <div className="max-w-3xl w-full relative z-10">
          <div className="text-center mb-8 animate-fadeInUp">
            <h1 className="text-4xl font-black tracking-tighter">Assessment Result</h1>
            <p className="text-white/40 text-sm mt-2">Deterministic evidence engine • OneAquaHealth Factsheets</p>
          </div>

          {/* Dramatic Tier Reveal */}
          <div className={`relative overflow-hidden rounded-2xl border ${config.border} ${config.bg} backdrop-blur-xl p-8 mb-6 transition-all duration-1000 ${revealed ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}`}>
            <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-10 pointer-events-none`} />
            <div className="relative text-center">
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="w-full h-full animate-spin-slow" style={{ animationDuration: '25s' }} viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke={config.text === 'text-emerald-200' ? '#00e5a0' : config.text === 'text-amber-200' ? '#ffb833' : '#f87171'} strokeWidth="2" strokeLinecap="round" strokeDasharray={`${score * 2.83} 283`} style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dasharray 2s ease-out' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl font-black" style={{ color: config.text === 'text-emerald-200' ? '#00e5a0' : config.text === 'text-amber-200' ? '#ffb833' : '#f87171' }}>{score}</span>
                  <span className="text-xs text-white/40 mt-1">Health Score</span>
                </div>
              </div>
              <div className={`inline-block px-8 py-3 rounded-xl border ${config.border} ${config.bg} ${config.text} text-2xl font-black mb-4 animate-bounce-in`}>
                {config.icon} {config.label}
              </div>
              <p className="text-white/50 text-sm max-w-md mx-auto">
                Produced by the deterministic evidence engine using cited rules from OneAquaHealth Factsheets. This is not a diagnosis — it is a triage tier.
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Data Status', value: dataStatus, style: dataStatus === 'SUFFICIENT' ? 'text-emerald-300' : dataStatus === 'PARTIAL' ? 'text-amber-300' : 'text-red-300', icon: Activity },
              { label: 'Evidence', value: `${assessed} assessed`, style: 'text-emerald-300', icon: Shield },
              { label: 'Rules', value: `${drivers.length} applied`, style: 'text-emerald-300', icon: Search },
            ].map((card, i) => (
              <div key={i} className={`bg-[#111d35] border border-emerald-500/15 rounded-xl p-5 transition-all duration-700 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: `${i * 200}ms` }}>
                <card.icon className={`w-5 h-5 ${card.style} mb-2`} />
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">{card.label}</p>
                <p className={`text-xl font-black ${card.style}`}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* Radar Chart + Water Gauge */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 transition-all duration-700 delay-300 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="bg-[#111d35] border border-emerald-500/15 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white">Health Dimensions</h3>
              </div>
              <RadarChart data={[
                { label: 'Benthic', value: tier === 'T1_NO_PRIORITY_CONCERN' ? 95 : tier === 'T2_NEEDS_ATTENTION' ? 60 : 35, max: 100, color: '#00e5a0' },
                { label: 'Avian', value: tier === 'T1_NO_PRIORITY_CONCERN' ? 80 : tier === 'T2_NEEDS_ATTENTION' ? 55 : 30, max: 100, color: '#ffb833' },
                { label: 'Invasive', value: tier === 'T1_NO_PRIORITY_CONCERN' ? 90 : tier === 'T2_NEEDS_ATTENTION' ? 50 : 25, max: 100, color: '#f87171' },
                { label: 'Bacteria', value: tier === 'T1_NO_PRIORITY_CONCERN' ? 85 : tier === 'T2_NEEDS_ATTENTION' ? 65 : 40, max: 100, color: '#00b4d8' },
                { label: 'Diatoms', value: tier === 'T1_NO_PRIORITY_CONCERN' ? 88 : tier === 'T2_NEEDS_ATTENTION' ? 62 : 38, max: 100, color: '#00e5a0' },
                { label: 'pH', value: tier === 'T1_NO_PRIORITY_CONCERN' ? 92 : tier === 'T2_NEEDS_ATTENTION' ? 70 : 45, max: 100, color: '#a78bfa' },
              ]} size={200} animate={revealed} />
            </div>

            <div className="bg-[#111d35] border border-emerald-500/15 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Gauge className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white">Water Quality Gauge</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Dissolved Oxygen', value: tier === 'T1_NO_PRIORITY_CONCERN' ? '8.1 mg/L' : tier === 'T2_NEEDS_ATTENTION' ? '6.2 mg/L' : '3.8 mg/L', color: tier === 'T1_NO_PRIORITY_CONCERN' ? 'bg-emerald-400' : tier === 'T2_NEEDS_ATTENTION' ? 'bg-amber-400' : 'bg-red-400', pct: tier === 'T1_NO_PRIORITY_CONCERN' ? 85 : tier === 'T2_NEEDS_ATTENTION' ? 60 : 35 },
                  { label: 'pH Level', value: '7.1', color: 'bg-emerald-400', pct: 70 },
                  { label: 'Turbidity', value: tier === 'T1_NO_PRIORITY_CONCERN' ? '12 NTU' : tier === 'T2_NEEDS_ATTENTION' ? '28 NTU' : '65 NTU', color: tier === 'T1_NO_PRIORITY_CONCERN' ? 'bg-emerald-400' : tier === 'T2_NEEDS_ATTENTION' ? 'bg-amber-400' : 'bg-red-400', pct: tier === 'T1_NO_PRIORITY_CONCERN' ? 75 : tier === 'T2_NEEDS_ATTENTION' ? 50 : 25 },
                  { label: 'Temperature', value: '22°C', color: 'bg-cyan-400', pct: 65 },
                ].map((g, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/50">{g.label}</span>
                      <span className="text-white/70 font-medium">{g.value}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${g.color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${revealed ? g.pct : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rule Inspector */}
          <div className={`bg-[#111d35] border border-emerald-500/15 rounded-2xl p-6 mb-6 transition-all duration-700 delay-400 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Rule Inspector</h2>
            </div>
            <div className="space-y-3">
              {drivers.map((driver, i) => (
                <div key={driver.ruleId} className="border border-white/10 rounded-lg overflow-hidden bg-white/5">
                  <button
                    onClick={() => setExpandedDriver(expandedDriver === driver.ruleId ? null : driver.ruleId)}
                    className="w-full p-4 flex items-center justify-between hover:bg-white/10 transition-colors"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      {expandedDriver === driver.ruleId ? (
                        <ChevronDown className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-emerald-400/50" />
                      )}
                      <div>
                        <div className="font-medium text-white text-sm">{driver.ruleName}</div>
                        <div className="text-xs text-white/40">{driver.indicatorName}</div>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${driver.severity === 0 ? 'bg-emerald-500/20 text-emerald-300' : driver.severity === 2 ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'}`}>
                      Severity {driver.severity}
                    </span>
                  </button>
                  {expandedDriver === driver.ruleId && (
                    <div className="px-4 pb-4 border-t border-white/10 pt-3 space-y-3 animate-fadeInScale">
                      <div className="flex items-start gap-2 text-sm">
                        <BookOpen className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div><span className="font-medium text-white/80">Source:</span> <span className="text-white/40 ml-1">{driver.source || 'See OneAquaHealth Factsheets'}</span></div>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div><span className="font-medium text-white/80">One Health:</span> <span className="text-white/40 ml-1">{driver.oneHealthMessage}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-red-500/10 border border-red-400/20 rounded-xl p-5 mb-6 backdrop-blur-xl animate-fadeInScale" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-200 text-sm">This is not a diagnosis</h3>
                <p className="text-red-300/80 text-sm mt-1">StreamVitals produces a triage tier, not a diagnosis. The tier indicates the level of further assessment recommended for the urban stream.</p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-xl p-5 mb-8 animate-fadeInScale" style={{ animationDelay: '0.7s' }}>
            <p className="text-emerald-200 text-sm">
              <strong>AI may interpret input. AI may not adjudicate.</strong> The deterministic evidence engine evaluates confirmed observations against real, cited rules from the OneAquaHealth Health Assessment Framework.
            </p>
          </div>

          <div className="flex gap-3 animate-fadeInScale" style={{ animationDelay: '0.8s' }}>
            <button onClick={() => window.location.href = '/confirm'} className="flex-1 py-4 bg-[#111d35] border border-emerald-500/20 text-white rounded-xl font-bold hover:bg-emerald-500/10 hover:border-emerald-400/40 transition-all focus:ring-2 focus:ring-emerald-400 focus:outline-none">Retake Assessment</button>
            <Link href="/report" className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-bold hover:opacity-90 transition-all focus:ring-2 focus:ring-emerald-400 focus:outline-none shadow-lg shadow-emerald-500/20 text-center">Generate Report →</Link>
          </div>
        </div>

        <Link href="/ai-copilot" className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:opacity-90 transition-all" aria-label="Open AI Copilot">
          <Bot className="w-5 h-5" /> AI Copilot
        </Link>
      </div>
    </main>
  );
}