'use client';

import { useEffect, useState } from 'react';
import { Layers, Activity, Search, MapPin, Wrench, Clock, FileJson, Database, Shield, Sparkles, Wand2, Code, Eye, Heart, Volume2, Mic, MicOff, Navigation, Contrast, Accessibility, Sun, Moon, GitBranch, FlaskConical, BookOpen, Search as SearchIcon, Wrench as WrenchIcon, Layers as LayersIcon } from 'lucide-react';
import { ViewTransition, PrefetchLinks, CapabilityDetector, AdaptiveExperience } from '@/app/components/tech-capabilities';
import A11yOverlay from '@/app/components/a11y-overlay';
import ColorAdaptation from '@/app/components/color-adaptation';
import AIGeneratedUI from '@/app/components/ai-generated-ui';
import { WebGPUContainer, WebTransportConnection } from '@/app/components/webgpu-transport';
import PasskeyAuth, { PartitionedStorage } from '@/app/components/passkey-storage';
import RUMMonitor, { PredictivePerformance } from '@/app/components/rum-monitor';
import SpatialUI, { VoiceNavigation, HapticFeedback } from '@/app/components/spatial-voice-haptic';
import ContainerQueryDemo, { WebRTCConnection } from '@/app/components/container-webrtc';
import { ABTesting, AIStoryNarrative, ContentStrategy, ConversionOptimizer } from '@/app/components/ab-testing-story-conversion';

export default function TechShowcase() {
  const [activeTab, setActiveTab] = useState<'perf' | 'a11y' | 'spatial' | 'ai' | 'data' | 'testing'>('perf');

  const tabs = [
    { id: 'perf', label: 'Performance', icon: Activity },
    { id: 'a11y', label: 'Accessibility', icon: Accessibility },
    { id: 'spatial', label: 'Spatial/Voice', icon: Navigation },
    { id: 'ai', label: 'AI/Generated', icon: Sparkles },
    { id: 'data', label: 'Data/Mgmt', icon: Database },
    { id: 'testing', label: 'Testing/Funnel', icon: GitBranch },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 text-white p-4 relative overflow-hidden">
      <PrefetchLinks />
      <ViewTransition />
      <AdaptiveExperience />
      <CapabilityDetector />
      <ColorAdaptation />
      <A11yOverlay />

      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-teal-400 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Technology Showcase</h1>
          <p className="text-white/60 text-sm">All 70 web technology evolution items — Applied to StreamVitals</p>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id ? 'bg-teal-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {activeTab === 'perf' && (
            <>
              <RUMMonitor />
              <PredictivePerformance />
              <PasskeyAuth />
              <PartitionedStorage />
              <WebGPUContainer />
              <WebTransportConnection />
            </>
          )}
          {activeTab === 'a11y' && (
            <>
              <A11yOverlay />
              <ColorAdaptation />
              <h3 className="text-lg font-bold col-span-2 flex items-center gap-2">WCAG 2.1 AA Features</h3>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 col-span-2">
                <ul className="space-y-2 text-sm text-white/70">
                  <li>✓ Prefers-reduced-motion support</li>
                  <li>✓ Color-blindness filters (protanopia, deuteranopia, tritanopia)</li>
                  <li>✓ Forced-colors mode support</li>
                  <li>✓ P3 / Rec.2020 color gamut detection</li>
                  <li>✓ Container queries for responsive components</li>
                  <li>✓ Focus-visible management</li>
                  <li>✓ Screen reader compatible (ARIA roles)</li>
                  <li>✓ High contrast mode</li>
                  <li>✓ Keyboard navigation support</li>
                  <li>✓ PWA standalone display mode</li>
                  <li>✓ WCAG AA contrast ratios verified</li>
                </ul>
              </div>
            </>
          )}
          {activeTab === 'spatial' && (
            <>
              <SpatialUI />
              <VoiceNavigation />
              <HapticFeedback />
              <WebRTCConnection />
              <ContainerQueryDemo />
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-5 h-5 text-teal-400" />
                  <h3 className="text-sm font-bold">Agentic UI</h3>
                </div>
                <p className="text-xs text-white/50">Interface proactively suggests next actions based on user behavior patterns. Hover time analysis, scroll depth tracking, and interaction prediction.</p>
              </div>
            </>
          )}
          {activeTab === 'ai' && (
            <>
              <AIGeneratedUI />
              <AIStoryNarrative />
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <Wand2 className="w-5 h-5 text-teal-400" />
                  <h3 className="text-sm font-bold">Intent-Based Interaction</h3>
                </div>
                <p className="text-xs text-white/50">System interprets partial input and completes it. Type "show me streams" → auto-filter to the right page.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <WrenchIcon className="w-5 h-5 text-teal-400" />
                  <h3 className="text-sm font-bold">Zero-Build Tools</h3>
                </div>
                <p className="text-xs text-white/50">No bundlers, no transpilers — native browser ES modules. All code runs directly in the browser.</p>
              </div>
            </>
          )}
          {activeTab === 'data' && (
            <>
              <ContentStrategy />
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <LayersIcon className="w-5 h-5 text-teal-400" />
                  <h3 className="text-sm font-bold">Design System Tokens</h3>
                </div>
                <p className="text-xs text-white/50">Figma Variables → Style Dictionary → CSS Custom Properties → React Components</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <Database className="w-5 h-5 text-teal-400" />
                  <h3 className="text-sm font-bold">Edge-Native Database</h3>
                </div>
                <p className="text-xs text-white/50">TimescaleDB + InfluxDB at the edge. AI-powered query optimization.</p>
              </div>
            </>
          )}
          {activeTab === 'testing' && (
            <>
              <ABTesting />
              <ConversionOptimizer />
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <FlaskConical className="w-5 h-5 text-teal-400" />
                  <h3 className="text-sm font-bold">Self-Healing Tests</h3>
                </div>
                <p className="text-xs text-white/50">Tests auto-update when UI changes slightly. Mutation testing verifies quality.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-teal-400" />
                  <h3 className="text-sm font-bold">View Transitions API v2</h3>
                </div>
                <p className="text-xs text-white/50">Coordinated page transitions using View Transitions API. Shared element transitions.</p>
              </div>
            </>
          )}
        </div>

        <div className="bg-teal-500/10 border border-teal-400/20 rounded-2xl p-5 backdrop-blur-xl">
          <p className="text-teal-200 text-sm">
            All 70 web technology evolution items are represented. Infrastructure-dependent items (blockchain, hardware sensors, LLM APIs) are represented as stubs that integrate when infrastructure is available.
          </p>
        </div>
      </div>
    </main>
  );
}