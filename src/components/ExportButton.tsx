'use client';

import { useCallback, useState } from 'react';
import { Download, FileText, Printer } from 'lucide-react';
import { getFullSession } from '@/lib/field-session';
import { indicators } from '@/data/indicators';

interface ExportButtonProps {
  sessionId: string;
}

export default function ExportButton({ sessionId }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const getIndicatorName = (id: string) => {
    const ind = indicators.find((i) => i.id === id);
    return ind?.name || id;
  };

  const getStateLabel = (indicatorId: string, state: string) => {
    const ind = indicators.find((i) => i.id === indicatorId);
    return ind?.citizen_state_labels?.[state] || state;
  };

  const generateJSON = useCallback(async () => {
    const result = await getFullSession(sessionId);
    if (!result.session) return;
    const session = result.session;

    const exportData = {
      exportTimestamp: new Date().toISOString(),
      framework: 'OneAquaHealth Key Indicators',
      doi: '10.5281/zenodo.20345207',
      session: {
        sessionId: session.sessionId,
        streamName: session.streamName,
        volunteer: session.volunteer,
        date: session.date,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
      },
      indicators: session.indicators.map((ind) => ({
        indicatorId: ind.indicatorId,
        indicatorName: ind.indicatorName,
        type: ind.type,
        state: ind.state,
        status: ind.status,
        photos: result.photos.filter((p) => p.indicatorId === ind.indicatorId).map((p) => ({ photoId: p.photoId, timestamp: p.timestamp })),
        notes: ind.notes,
        sampleLabel: ind.sampleLabel,
        labProtocolGuidance: ind.labProtocolGuidance,
        timestamp: ind.timestamp,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `field-session-${session.sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sessionId]);

  const generateCSV = useCallback(async () => {
    const result = await getFullSession(sessionId);
    if (!result.session) return;
    const session = result.session;

    const headers = ['indicatorId', 'indicatorName', 'type', 'state', 'status', 'photos', 'notes', 'sampleLabel', 'timestamp'];
    const rows = session.indicators.map((ind) => [
      ind.indicatorId, ind.indicatorName, ind.type, ind.state || '', ind.status,
      result.photos.filter((p) => p.indicatorId === ind.indicatorId).length.toString(),
      ind.notes.replace(/,/g, ';'), ind.sampleLabel || '', ind.timestamp,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `field-session-${session.sessionId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sessionId]);

  const generateHumanReadable = useCallback(async () => {
    const result = await getFullSession(sessionId);
    if (!result.session) return;
    const session = result.session;

    const lines: string[] = [];
    lines.push('═══════════════════════════════════════════');
    lines.push('   FIELD MONITORING SESSION SUMMARY');
    lines.push('   OneAquaHealth Indicator Framework');
    lines.push('═══════════════════════════════════════════');
    lines.push('');
    lines.push(`Stream / Location:  ${session.streamName}`);
    lines.push(`Volunteer:          ${session.volunteer || 'Not provided'}`);
    lines.push(`Date:               ${session.date}`);
    lines.push(`Session started:    ${session.startedAt}`);
    lines.push(`Session completed:  ${session.completedAt || 'In progress'}`);
    lines.push('');
    lines.push('───────────────────────────────────────────');
    lines.push('INDICATOR RECORDS');
    lines.push('───────────────────────────────────────────');

    for (const ind of session.indicators) {
      lines.push('');
      lines.push(`  ${ind.indicatorName} (${ind.indicatorId})`);
      lines.push(`  Type: ${ind.type}`);
      lines.push(`  Status: ${ind.status}`);
      if (ind.state) {
        const label = getStateLabel(ind.indicatorId, ind.state);
        lines.push(`  Observation: ${label}`);
      }
      if (ind.sampleLabel) {
        lines.push(`  Sample Label: ${ind.sampleLabel}`);
      }
      if (ind.labProtocolGuidance) {
        lines.push(`  Lab Guidance: ${ind.labProtocolGuidance}`);
      }
      lines.push(`  Photos: ${result.photos.filter((p) => p.indicatorId === ind.indicatorId).length}`);
      if (ind.notes) {
        lines.push(`  Notes: ${ind.notes}`);
      }
      lines.push(`  Recorded: ${ind.timestamp}`);
    }

    lines.push('');
    lines.push('═══════════════════════════════════════════');
    lines.push('   END OF SESSION SUMMARY');
    lines.push('═══════════════════════════════════════════');

    const text = lines.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `field-session-${session.sessionId}-summary.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sessionId, getStateLabel]);

  const handlePrint = useCallback(async () => {
    const result = await getFullSession(sessionId);
    if (!result.session) return;
    const session = result.session;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const lines: string[] = [];
    lines.push('<!DOCTYPE html><html><head><title>Field Session Summary</title>');
    lines.push('<style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#1a1a2e;line-height:1.6}h1{color:#0d9b6e;border-bottom:2px solid #0d9b6e;padding-bottom:8px}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{border:1px solid #ddd;padding:8px 12px;text-align:left}th{background:#0d9b6e;color:#fff}tr:nth-child(even){background:#f8f9fa}.lab{background:#fffbeb}.section{margin:20px 0}h2{color:#1a1a2e}</style></head><body>');
    lines.push('<h1>Field Monitoring Session Summary</h1>');
    lines.push(`<p><strong>Stream / Location:</strong> ${session.streamName}</p>`);
    lines.push(`<p><strong>Volunteer:</strong> ${session.volunteer || 'Not provided'}</p>`);
    lines.push(`<p><strong>Date:</strong> ${session.date}</p>`);
    lines.push(`<p><strong>Started:</strong> ${session.startedAt}</p>`);
    lines.push('<div class="section"><h2>Indicator Records</h2><table><tr><th>Indicator</th><th>Type</th><th>Status</th><th>Observation</th><th>Photos</th></tr>');

    for (const ind of session.indicators) {
      const label = ind.state ? getStateLabel(ind.indicatorId, ind.state) : '—';
      const photoCount = result.photos.filter((p) => p.indicatorId === ind.indicatorId).length;
      const rowClass = ind.type === 'lab_only' ? 'class="lab"' : '';
      lines.push(`<tr ${rowClass}><td>${ind.indicatorName}</td><td>${ind.type}</td><td>${ind.status}</td><td>${label}</td><td>${photoCount}</td></tr>`);
    }

    lines.push('</table></div>');

    if (session.completedAt) {
      lines.push(`<p><strong>Completed:</strong> ${session.completedAt}</p>`);
    }
    lines.push('<p style="margin-top:30px;color:#888;font-size:12px">Generated by StreamVitals Field Companion • OneAquaHealth Key Indicators Framework</p>');
    lines.push('</body></html>');

    printWindow.document.write(lines.join('\n'));
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }, [sessionId, getStateLabel]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={generateJSON} disabled={exporting} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2.5 font-semibold text-sm flex items-center gap-2 shadow-sm shadow-emerald-200 transition-all disabled:opacity-40">
          <Download className="w-4 h-4" /> Export JSON
        </button>
        <button onClick={generateCSV} disabled={exporting} className="bg-white hover:bg-gray-50 text-emerald-700 border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-sm flex items-center gap-2 shadow-sm transition-all disabled:opacity-40">
          <Download className="w-4 h-4" /> Export CSV
        </button>
        <button onClick={generateHumanReadable} disabled={exporting} className="bg-white hover:bg-gray-50 text-emerald-700 border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-sm flex items-center gap-2 shadow-sm transition-all disabled:opacity-40">
          <FileText className="w-4 h-4" /> Print Summary
        </button>
        <button onClick={handlePrint} disabled={exporting} className="bg-white hover:bg-gray-50 text-emerald-700 border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-sm flex items-center gap-2 shadow-sm transition-all disabled:opacity-40">
          <Printer className="w-4 h-4" /> Print Page
        </button>
      </div>
      <p className="text-xs text-[#1a1a2e]/30">Export structured data aligned with the OneAquaHealth indicator framework.</p>
    </div>
  );
}