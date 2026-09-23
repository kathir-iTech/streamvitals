'use client';

import { useState } from 'react';
import { Shield, FileText, CheckCircle, AlertCircle, Download, Calendar, Building2, Scale } from 'lucide-react';

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState<'epa' | 'state' | 'wqp' | 'audit'>('epa');

  const complianceData = {
    epa: [
      { id: 'STORET-001', parameter: 'pH', standard: '6.5-8.5', status: 'compliant', source: 'EPA STORET WQX' },
      { id: 'STORET-002', parameter: 'Dissolved Oxygen', standard: '≥5.0 mg/L', status: 'compliant', source: 'EPA STORET WQX' },
      { id: 'STORET-003', parameter: 'Turbidity', standard: '≤50 NTU', status: 'warning', source: 'EPA STORET WQX' },
      { id: 'STORET-004', parameter: 'Fecal Coliform', standard: '≤200 CFU/100mL', status: 'non-compliant', source: 'EPA STORET WQX' },
      { id: 'STORET-005', parameter: 'Temperature', standard: '≤30°C', status: 'compliant', source: 'EPA STORET WQX' },
    ],
    state: [
      { id: 'STA-001', parameter: 'pH', standard: '6.0-9.0', status: 'compliant', source: 'State Water Quality Standards' },
      { id: 'STA-002', parameter: 'Chlorophyll-a', standard: '≤20 µg/L', status: 'compliant', source: 'State Water Quality Standards' },
      { id: 'STA-003', parameter: 'TSS', standard: '≤50 mg/L', status: 'warning', source: 'State Water Quality Standards' },
    ],
    wqp: [
      { id: 'WQP-001', dataset: 'National Water Quality Portal', status: 'synced', lastSync: '2026-09-22' },
      { id: 'WQP-002', dataset: 'Storet Center', status: 'synced', lastSync: '2026-09-21' },
      { id: 'WQP-003', dataset: 'Watershed Atlas', status: 'pending', lastSync: null },
    ],
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 text-white p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-teal-400 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Regulatory Compliance</h1>
          <p className="text-white/60 text-sm">EPA STORET/WQX &middot; WaterML 2.0 &middot; OGC SensorThings API &middot; Automated Reporting</p>
        </div>

        <div className="flex gap-2 mb-6">
          {(['epa', 'state', 'wqp', 'audit'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab ? 'bg-teal-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {tab === 'epa' ? 'EPA STORET/WQX' : tab === 'state' ? 'State Standards' : tab === 'wqp' ? 'WQP Sync' : 'Audit Trail'}
            </button>
          ))}
        </div>

        {activeTab === 'epa' && (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/15 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-bold">EPA STORET/WQX Compliance</h2>
            </div>
            <div className="space-y-3">
              {complianceData.epa.map((item, i) => (
                <div key={i} className={`rounded-xl p-4 border ${item.status === 'compliant' ? 'bg-emerald-500/5 border-emerald-400/20' : item.status === 'warning' ? 'bg-amber-500/5 border-amber-400/20' : 'bg-red-500/5 border-red-400/20'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{item.parameter}</p>
                      <p className="text-xs text-white/40">{item.id} &middot; {item.source}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${item.status === 'compliant' ? 'bg-emerald-500/20 text-emerald-300' : item.status === 'warning' ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'}`}>
                        {item.status === 'compliant' ? '✓ Compliant' : item.status === 'warning' ? '⚠ Warning' : '✗ Non-Compliant'}
                      </span>
                      <span className="text-xs text-white/30">{item.standard}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full py-3 bg-white/10 border border-white/15 text-white rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Export WQX Report
            </button>
          </div>
        )}

        {activeTab === 'state' && (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/15 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-bold">State Water Quality Standards</h2>
            </div>
            <div className="space-y-3">
              {complianceData.state.map((item, i) => (
                <div key={i} className={`rounded-xl p-4 border ${item.status === 'compliant' ? 'bg-emerald-500/5 border-emerald-400/20' : 'bg-amber-500/5 border-amber-400/20'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{item.parameter}</p>
                      <p className="text-xs text-white/40">{item.id} &middot; {item.source}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${item.status === 'compliant' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                      {item.status === 'compliant' ? '✓ Compliant' : '⚠ Warning'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'wqp' && (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/15 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-bold">WQP Data Sync</h2>
            </div>
            <div className="space-y-3">
              {complianceData.wqp.map((item, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{item.dataset}</p>
                    <p className="text-xs text-white/40">{item.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${item.status === 'synced' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                      {item.status === 'synced' ? '✓ Synced' : '⏳ Pending'}
                    </span>
                    {item.lastSync && <span className="text-xs text-white/30">{item.lastSync}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/15 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-bold">Audit Trail & Chain of Custody</h2>
            </div>
            <div className="space-y-4">
              {[
                { action: 'Assessment submitted', time: '2026-09-22T14:30:00Z', user: 'Field Technician', signature: 'Ed25519:abc123...' },
                { action: 'Data verified', time: '2026-09-22T14:35:00Z', user: 'Lead Scientist', signature: 'Ed25519:def456...' },
                { action: 'WQX export generated', time: '2026-09-22T15:00:00Z', user: 'System', signature: 'Ed25519:ghi789...' },
              ].map((entry, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-4 border border-white/10">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{entry.action}</p>
                    <p className="text-xs text-white/40">{entry.time}</p>
                    <p className="text-xs text-white/30 font-mono">{entry.signature}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/30 mt-4">All audit entries are Ed25519-signed with chain-of-custody provenance tracking. Data is immutable once recorded.</p>
          </div>
        )}

        <div className="bg-teal-500/10 border border-teal-400/20 rounded-2xl p-5 backdrop-blur-xl">
          <div className="flex items-start gap-2">
            <Scale className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-teal-200 text-sm">Open Data Standards</h3>
              <p className="text-teal-300/80 text-sm mt-1">All compliance data conforms to OGC SensorThings API v1.1, WaterML 2.0 Part 5, ISO 19156 Observations and Measurements, and EPA STORET/WQX formats. FAIR-compliant data management.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}