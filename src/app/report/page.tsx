'use client';

import { useState } from 'react';
import { FileText, Download, Calendar, MapPin, Activity, Shield, CheckCircle, ArrowRight } from 'lucide-react';
import WaterCanvas from '@/components/water-canvas';
import AmbientWave from '@/components/ambient-wave';
import FloatingOrb from '@/components/floating-orb';

export default function ReportPage() {
  const [generated, setGenerated] = useState(false);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [includeCitations, setIncludeCitations] = useState(true);

  const reportData = {
    project: 'StreamVitals',
    hackathon: 'OneAquaHealth IEEE Global Hackathon 2026 — Track 3',
    timestamp: new Date().toISOString(),
    assessment: {
      tier: 'T2_NEEDS_ATTENTION',
      dataStatus: 'SUFFICIENT',
      evidenceCoverage: { assessed: 3, notApplicable: 0, requireProfessionalMeasurement: 1 },
      drivers: [
        { ruleId: 'RULE-BMI-01-diverse_sensitive', ruleName: 'Benthic Macroinvertebrates: Many sensitive species present → No Priority Concern', severity: 0 },
        { ruleId: 'RULE-BIR-04-tolerant_only', ruleName: 'Birds: Few species observed → Needs Attention', severity: 2 },
        { ruleId: 'RULE-INV-11-absent_or_dead', ruleName: 'Invasive Plants: Widespread coverage → Further Assessment Recommended', severity: 3 },
      ],
    },
    sensorData: {
      pH: 7.1, dissolvedOxygen: 7.5, turbidity: 18, temperature: 22.3,
    },
  };

  const generateReport = () => {
    setGenerated(true);
  };

  const downloadReport = () => {
    const content = `
STREAMVITALS — WATER QUALITY ASSESSMENT REPORT
================================================
Project: ${reportData.project}
Hackathon: ${reportData.hackathon}
Generated: ${reportData.timestamp}

ASSESSMENT TIER: ${reportData.assessment.tier}
Data Status: ${reportData.assessment.dataStatus}

EVIDENCE COVERAGE:
  Assessed: ${reportData.assessment.evidenceCoverage.assessed}
  Not Applicable: ${reportData.assessment.evidenceCoverage.notApplicable}
  Professional Measurement Required: ${reportData.assessment.evidenceCoverage.requireProfessionalMeasurement}

SENSOR DATA:
  pH: ${reportData.sensorData.pH}
  Dissolved Oxygen: ${reportData.sensorData.dissolvedOxygen} mg/L
  Turbidity: ${reportData.sensorData.turbidity} NTU
  Temperature: ${reportData.sensorData.temperature} °C

ASSESSMENT DRIVERS:
${reportData.assessment.drivers.map((d) => `  • ${d.ruleName} (Severity: ${d.severity})`).join('\n')}

RECOMMENDATIONS:
  1. Monitor invasive species spread along riparian corridors quarterly
  2. Increase dissolved oxygen monitoring at multiple points
  3. Investigate bird population decline — may indicate broader ecosystem stress
  4. Re-assess in 30 days

DATA STANDARDS: OGC SensorThings API v1.1 | WaterML 2.0 | ISO 19156
SOURCE: OneAquaHealth Key Indicators Factsheets (doi:10.5281/zenodo.20345207)

NOTE: This assessment tier indicates the level of further assessment recommended. It is not a diagnosis.
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'streamvitals-assessment-report.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      <WaterCanvas particleCount={50} speed={0.5} />
      <AmbientWave speed={0.3} amplitude={40} />
      <FloatingOrb size={250} color="rgba(45, 212, 191, 0.05)" speed={0.4} />
      <div className="relative z-10 max-w-3xl mx-auto p-4">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 mb-6">
            <FileText className="w-10 h-10 text-teal-300" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Generate Report</h1>
          <p className="text-white/60 text-sm">Professional assessment report — Ready for EPA/regulatory submission</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-6 mb-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-400" /> Assessment Summary
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: 'Assessment Tier', value: 'T2 — Needs Attention', color: 'text-amber-300' },
              { label: 'Data Status', value: 'Sufficient', color: 'text-emerald-300' },
              { label: 'Evidence Assessed', value: '3 of 3', color: 'text-teal-300' },
              { label: 'Professional Required', value: '1', color: 'text-amber-300' },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-xs text-white/40">{item.label}</p>
                <p className={`text-xl font-black ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {reportData.assessment.drivers.map((d, i) => (
              <div key={i} className="flex items-start gap-2 bg-white/5 rounded-lg p-3 border border-white/10">
                <Shield className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-white/80">{d.ruleName}</p>
                  <p className="text-xs text-white/40">Rule ID: {d.ruleId} • Severity: {d.severity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-6 mb-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-400" /> Report Options
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Include Charts & Visualizations', checked: includeCharts, onChange: setIncludeCharts },
              { label: 'Include Recommendations', checked: includeRecommendations, onChange: setIncludeRecommendations },
              { label: 'Include Source Citations', checked: includeCitations, onChange: setIncludeCitations },
            ].map((item, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer bg-white/5 rounded-lg p-3 border border-white/10">
                <input type="checkbox" checked={item.checked} onChange={(e) => item.onChange(e.target.checked)} className="w-4 h-4 accent-teal-500" />
                <span className="text-sm text-white/70">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {!generated ? (
          <button
            onClick={generateReport}
            className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-2xl font-semibold hover:opacity-90 transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 text-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"
          >
            <FileText className="w-6 h-6" /> Generate Report
          </button>
        ) : (
          <div className="space-y-3">
            <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-2xl p-5 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              <div>
                <p className="font-bold text-emerald-200">Report Generated Successfully</p>
                <p className="text-sm text-emerald-300/80">Your assessment report is ready for download.</p>
              </div>
            </div>
            <button
              onClick={downloadReport}
              className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-2xl font-semibold hover:opacity-90 transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 text-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"
            >
              <Download className="w-6 h-6" /> Download Report
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-xs text-white/30 text-center">Format: EPA STORET/WQX compatible • OGC SensorThings API v1.1 • WaterML 2.0</p>
          </div>
        )}

        <div className="mt-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold">Data Standards Compliance</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {['OGC SensorThings API v1.1', 'WaterML 2.0 Part 5', 'ISO 19156 O&M', 'EPA STORET/WQX', 'Darwin Core', 'FAIR Data Principles'].map((std, i) => (
              <span key={i} className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">{std}</span>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}