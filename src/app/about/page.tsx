import { ArrowLeft, Scale, BookOpen, Users, Eye, Heart, MapPin, Wrench, Layers, Database } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-teal-400 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl w-full relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/verdict" className="text-teal-300 hover:text-teal-200">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">How It Works</h1>
        </div>

        <div className="space-y-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-6">
            <div className="flex items-start gap-3">
              <Eye className="w-6 h-6 text-teal-400 flex-shrink-0 mt-1" />
              <div>
                <h2 className="font-bold text-white mb-1">AI May Interpret Input</h2>
                <p className="text-white/60 text-sm">
                  The AI Observation Quality Gate converts free-text notes into structured fields.
                  It extracts evidence spans and maps them to the fixed vocabulary defined in the
                  OneAquaHealth factsheets.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-6">
            <div className="flex items-start gap-3">
              <BookOpen className="w-6 h-6 text-teal-400 flex-shrink-0 mt-1" />
              <div>
                <h2 className="font-bold text-white mb-1">AI May Not Adjudicate</h2>
                <p className="text-white/60 text-sm">
                  The deterministic evidence engine evaluates confirmed observations against cited rules
                  from the OneAquaHealth Key Indicators Factsheets. It produces a triage tier, never a diagnosis.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-6">
            <div className="flex items-start gap-3">
              <Users className="w-6 h-6 text-teal-400 flex-shrink-0 mt-1" />
              <div>
                <h2 className="font-bold text-white mb-1">Human Confirmation Required</h2>
                <p className="text-white/60 text-sm">
                  Every AI-proposed field is shown with its evidence span and must be explicitly
                  confirmed or corrected before assessment proceeds. Uncertain flags are visible.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-6">
            <div className="flex items-start gap-3">
              <Wrench className="w-6 h-6 text-teal-400 flex-shrink-0 mt-1" />
              <div>
                <h2 className="font-bold text-white mb-1">Deterministic Engine</h2>
                <p className="text-white/60 text-sm">
                  The assessment uses a deterministic evidence engine — no AI model makes the final
                  assessment decision. Every rule is cited and traceable.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-6">
            <div className="flex items-start gap-3">
              <Database className="w-6 h-6 text-teal-400 flex-shrink-0 mt-1" />
              <div>
                <h2 className="font-bold text-white mb-1">Open Data Standards</h2>
                <p className="text-white/60 text-sm">
                  All sensor data conforms to OGC SensorThings API v1.1, WaterML 2.0, and ISO 19156.
                  EPA STORET/WQX integration for regulatory compliance.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-teal-500/10 border border-teal-400/20 rounded-xl p-4">
            <p className="text-teal-200 text-sm">
              <strong>Note:</strong> StreamVitals is a submission for the OneAquaHealth IEEE Global
              Hackathon 2026, Track 3 (AI-Supported Assessment). The assessment tier indicates the
              level of further assessment recommended — it is not a diagnosis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}