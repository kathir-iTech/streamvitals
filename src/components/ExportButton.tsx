'use client';

import { useCallback, useState } from 'react';
import { Download, FileText, Printer, FlaskConical } from 'lucide-react';
import { getFullSession } from '@/lib/field-session';
import { indicators } from '@/data/indicators';
import { assess, summarizeAssessments, ENGINE_VERSION } from '@/lib/assessment/engine';

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
      assessmentEngine: ENGINE_VERSION,
      session: { sessionId: session.sessionId, streamName: session.streamName, volunteer: session.volunteer, date: session.date, startedAt: session.startedAt, completedAt: session.completedAt, location: session.location ?? null, gbifBaseline: session.gbifBaseline ?? null },
      indicators: session.indicators.map((ind) => ({ indicatorId: ind.indicatorId, indicatorName: ind.indicatorName, type: ind.type, state: ind.state, status: ind.status, photos: result.photos.filter((p) => p.indicatorId === ind.indicatorId).map((p) => ({ photoId: p.photoId, timestamp: p.timestamp })), notes: ind.notes, note_flag: ind.note_flag || '', sampleLabel: ind.sampleLabel, labProtocolGuidance: ind.labProtocolGuidance, timestamp: ind.timestamp, assessment: assess(ind.indicatorId, ind.state) })),
      assessmentSummary: summarizeAssessments(session.indicators.map((ind) => ({ indicatorId: ind.indicatorId, state: ind.state }))),
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
    const headers = ['indicatorId', 'indicatorName', 'type', 'state', 'status', 'photos', 'notes', 'note_flag', 'sampleLabel', 'assessment_band', 'assessment_engine', 'timestamp', 'session_latitude', 'session_longitude', 'location_accuracy_m'];
    const rows = session.indicators.map((ind) => [ind.indicatorId, ind.indicatorName, ind.type, ind.state || '', ind.status, result.photos.filter((p) => p.indicatorId === ind.indicatorId).length.toString(), (ind.notes || '').replace(/,/g, ';'), (ind.note_flag || '').replace(/,/g, ';'), ind.sampleLabel || '', assess(ind.indicatorId, ind.state).band, assess(ind.indicatorId, ind.state).engine, ind.timestamp, session.location ? session.location.lat.toString() : '', session.location ? session.location.lng.toString() : '', session.location && session.location.accuracyM !== null ? Math.round(session.location.accuracyM).toString() : '']);
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
    lines.push('FIELD MONITORING SESSION SUMMARY');
    lines.push(`Stream / Location: ${session.streamName}`);
    lines.push(`Volunteer: ${session.volunteer || 'Not provided'}`);
    lines.push(`Date: ${session.date}`);
    if (session.location) {
      lines.push(`GPS: ${session.location.lat.toFixed(5)}, ${session.location.lng.toFixed(5)}${session.location.accuracyM !== null ? ` (±${Math.round(session.location.accuracyM)} m)` : ''}`);
    }
    if (session.gbifBaseline) {
      lines.push(`GBIF baseline: ${session.gbifBaseline.rows.filter((r) => r.status === 'ok').length} taxa queried within ${session.gbifBaseline.radiusKm} km of the GPS point (api.gbif.org/v1, ${session.gbifBaseline.capturedAt}) — context only, not an assessment.`);
    }
    lines.push('');
    for (const ind of session.indicators) {
      lines.push(`${ind.indicatorName} (${ind.indicatorId})`);
      lines.push(`Type: ${ind.type}`);
      if (ind.state) lines.push(`Observation: ${getStateLabel(ind.indicatorId, ind.state)}`);
      const a = assess(ind.indicatorId, ind.state);
      lines.push(`Assessment: ${a.bandLabel} (${a.engine})`);
      if (ind.notes) lines.push(`Notes: ${ind.notes}`);
      lines.push('');
    }
    const text = lines.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `field-session-${session.sessionId}-summary.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sessionId, getStateLabel]);

  const generateLabSubmissionSheet = useCallback(async () => {
    const result = await getFullSession(sessionId);
    if (!result.session) return;
    const session = result.session;
    const labRecords = session.indicators.filter((ind) => ind.type === 'lab_only');
    if (labRecords.length === 0) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const esc = (v: string) => (v || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const lines: string[] = [];
    lines.push('<!DOCTYPE html><html><head><title>Lab Submission Sheet</title>');
    lines.push('<style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#000;line-height:1.6}h1{color:#0d9b6e;border-bottom:2px solid #0d9b6e;padding-bottom:8px;font-size:24px}h2{font-size:16px;margin-top:28px}table{width:100%;border-collapse:collapse;margin:12px 0}th,td{border:1px solid #ccc;padding:8px 12px;text-align:left;font-size:12px;vertical-align:top}th{background:#0d9b6e;color:#fff;font-size:11px;text-transform:uppercase;letter-spacing:.04em}.id{font-family:ui-monospace,monospace;font-size:18px;font-weight:700;color:#0d9b6e}.meta{font-size:12px;color:#333}@media print{body{margin:0}}</style></head><body>');
    lines.push('<h1>Lab Submission Sheet</h1>');
    lines.push(`<p class="meta"><strong>Stream / Location:</strong> ${esc(session.streamName)} &nbsp;|&nbsp; <strong>Collector:</strong> ${esc(session.volunteer) || 'Not provided'} &nbsp;|&nbsp; <strong>Collection date:</strong> ${esc(session.date)}<br/><strong>Session ID:</strong> ${esc(session.sessionId)}</p>`);
    for (const ind of labRecords) {
      const photos = result.photos.filter((p) => p.indicatorId === ind.indicatorId);
      lines.push('<h2>' + esc(ind.indicatorName) + ' (' + esc(ind.indicatorId) + ')</h2>');
      lines.push('<table>');
      lines.push('<tr><th>Sample ID (write on container)</th><td class="id">' + esc(ind.sampleLabel || 'not assigned') + '</td></tr>');
      lines.push('<tr><th>Indicator</th><td>' + esc(ind.indicatorName) + ' (' + esc(ind.indicatorId) + ')</td></tr>');
      lines.push('<tr><th>Collector</th><td>' + esc(session.volunteer || 'Not provided') + '</td></tr>');
      lines.push('<tr><th>Location</th><td>' + esc(session.streamName) + '</td></tr>');
      lines.push('<tr><th>Collection timestamp</th><td>' + esc(ind.timestamp) + '</td></tr>');
      lines.push('<tr><th>Notes</th><td>' + (ind.notes ? esc(ind.notes) : '&mdash;') + '</td></tr>');
      lines.push('<tr><th>Photos attached</th><td>' + photos.length + ' photo' + (photos.length === 1 ? '' : 's') + '</td></tr>');
      lines.push('</table>');
    }
    lines.push('<p style="margin-top:30px;color:#888;font-size:11px">Fields above are only those collected in the field by StreamVitals Field Companion. Assessment stays pending until the laboratory reports a measurement. Factsheets: doi:10.5281/zenodo.20345207</p>');
    lines.push('</body></html>');
    printWindow.document.write(lines.join('\n'));
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }, [sessionId]);

  const handlePrint = useCallback(async () => {
    const result = await getFullSession(sessionId);
    if (!result.session) return;
    const session = result.session;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const lines: string[] = [];
    lines.push('<!DOCTYPE html><html><head><title>Field Session Summary</title>');
    lines.push('<style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#000;line-height:1.6}h1{color:#0d9b6e;border-bottom:2px solid #0d9b6e;padding-bottom:8px}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{border:1px solid #ddd;padding:8px 12px;text-align:left}th{background:#0d9b6e;color:#fff}tr:nth-child(even){background:#f8f9fa}.lab{background:#fffbeb}</style></head><body>');
    lines.push('<h1>Field Monitoring Session Summary</h1>');
    lines.push(`<p><strong>Stream / Location:</strong> ${session.streamName}</p>`);
    lines.push(`<p><strong>Volunteer:</strong> ${session.volunteer || 'Not provided'}</p>`);
    lines.push(`<p><strong>Date:</strong> ${session.date}</p>`);
    if (session.location) {
      lines.push(`<p><strong>GPS:</strong> ${session.location.lat.toFixed(5)}, ${session.location.lng.toFixed(5)}${session.location.accuracyM !== null ? ` (±${Math.round(session.location.accuracyM)} m)` : ''}</p>`);
    }
    lines.push('<div><h2>Indicator Records</h2><table><tr><th>Indicator</th><th>Type</th><th>Status</th><th>Observation</th><th>Photos</th></tr>');
    for (const ind of session.indicators) {
      const label = ind.state ? getStateLabel(ind.indicatorId, ind.state) : '—';
      const photoCount = result.photos.filter((p) => p.indicatorId === ind.indicatorId).length;
      const rowClass = ind.type === 'lab_only' ? 'class="lab"' : '';
      lines.push(`<tr ${rowClass}><td>${ind.indicatorName}</td><td>${ind.type}</td><td>${ind.status}</td><td>${label}</td><td>${photoCount}</td></tr>`);
    }
    lines.push('</table></div>');
    if (session.completedAt) lines.push(`<p><strong>Completed:</strong> ${session.completedAt}</p>`);
    lines.push('<p style="margin-top:30px;color:#888;font-size:12px">Generated by StreamVitals Field Companion</p>');
    lines.push('</body></html>');
    printWindow.document.write(lines.join('\n'));
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }, [sessionId, getStateLabel]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
<button onClick={generateJSON} disabled={exporting} className="btn-pill-accent text-sm flex items-center gap-2">
           <Download className="w-4 h-4" /> Export JSON
         </button>
         <button onClick={generateCSV} disabled={exporting} className="btn-pill-outline text-sm flex items-center gap-2">
           <Download className="w-4 h-4" /> Export CSV
         </button>
         <button onClick={generateHumanReadable} disabled={exporting} className="btn-pill-outline text-sm flex items-center gap-2">
           <FileText className="w-4 h-4" /> Print Summary
         </button>
          <button onClick={handlePrint} disabled={exporting} className="btn-pill-outline text-sm flex items-center gap-2">
            <Printer className="w-4 h-4" /> Print Page
          </button>
          <button onClick={generateLabSubmissionSheet} disabled={exporting} className="btn-pill-outline text-sm flex items-center gap-2" data-testid="lab-submission-sheet">
            <FlaskConical className="w-4 h-4" /> Lab Submission Sheet
          </button>
      </div>
      <p className="text-xs text-[rgba(0,0,0,0.25)]">Export structured data aligned with the OneAquaHealth indicator framework.</p>
    </div>
  );
}
