import { ArrowLeft, Scale, BookOpen, Users } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/verdict" className="text-teal-600 hover:text-teal-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">How It Works</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div className="flex items-start gap-3">
            <Scale className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="font-bold text-slate-800 mb-1">AI May Interpret Input</h2>
              <p className="text-sm text-slate-600">
                The AI Observation Quality Gate converts free-text notes into structured fields.
                It extracts evidence spans and maps them to the fixed vocabulary defined in the
                OneAquaHealth factsheets.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <BookOpen className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="font-bold text-slate-800 mb-1">AI May Not Adjudicate</h2>
              <p className="text-sm text-slate-600">
                The deterministic evidence engine — never called "AI" anywhere in this product —
                evaluates confirmed observations against cited rules from the OneAquaHealth Key
                Indicators Factsheets. It produces a triage tier, never a diagnosis.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="font-bold text-slate-800 mb-1">Human Confirmation Required</h2>
              <p className="text-sm text-slate-600">
                Every AI-proposed field is shown with its evidence span and must be explicitly
                confirmed or corrected before assessment proceeds. Uncertain flags are visible.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <h3 className="font-semibold text-slate-800 mb-2">Data Sources</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• OneAquaHealth Key Indicators Factsheets (Zenodo doi:10.5281/zenodo.20345207)</li>
              <li>• OneAquaHealth Health Assessment Framework</li>
              <li>• OAH-FHIR Implementation Guide (draft/CI-build — not certified)</li>
            </ul>
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
            <p className="text-sm text-teal-800">
              <strong>Note:</strong> StreamVitals is a submission for the OneAquaHealth IEEE Global
              Hackathon 2026, Track 3 (AI-Supported Assessment). The assessment tier indicates the
              level of further assessment recommended — it is not a diagnosis and does not imply
              a stream is safe or clear.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
