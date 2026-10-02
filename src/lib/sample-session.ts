import { createSession, type FieldSession } from './field-session';
import { LAB_PROTOCOL_GUIDANCE } from '@/data/lab-protocol-guidance';

// Deterministically built demonstration session. Every human-readable string
// carries an explicit synthetic marker so it can never be mistaken for (or
// quoted as) field data: stream name, volunteer, and every note. No photos,
// no GPS — review shows both absences honestly.
export const SAMPLE_SESSION_ID = 'sample-demo';

export function buildSampleSession(now: string = new Date().toISOString()): FieldSession {
  const date = now.split('T')[0];
  return {
    sessionId: SAMPLE_SESSION_ID,
    streamName: 'SAMPLE STREAM — synthetic demo',
    volunteer: 'Sample Volunteer (synthetic)',
    date,
    isSample: true,
    indicators: [
      { indicatorId: 'BMI-01', indicatorName: 'Benthic Macroinvertebrates', type: 'citizen_observable', state: 'diverse_sensitive', photos: [], notes: '[SYNTHETIC SAMPLE] Diverse sensitive taxa noted — demonstration entry.', timestamp: now, status: 'complete' },
      { indicatorId: 'BIR-04', indicatorName: 'Birds', type: 'citizen_observable', state: 'many_species', photos: [], notes: '[SYNTHETIC SAMPLE] Multiple riverine species along the transect — demonstration entry.', timestamp: now, status: 'complete' },
      { indicatorId: 'INV-11', indicatorName: 'Invasive Alien Plants of the Riparian Corridor', type: 'citizen_observable', state: 'none_seen', photos: [], notes: '', timestamp: now, status: 'complete' },
      { indicatorId: 'FCL-06', indicatorName: 'Fecal Coliforms', type: 'lab_only', photos: [], notes: '[SYNTHETIC SAMPLE] Lab sample recorded for demonstration.', sampleLabel: `SMP-${date.replace(/-/g, '')}-001`, labProtocolGuidance: LAB_PROTOCOL_GUIDANCE['FCL-06'], timestamp: now, status: 'pending_lab_analysis' },
      { indicatorId: 'DIA-10', indicatorName: 'Diatoms and Diatom Teratology', type: 'lab_only', photos: [], notes: '[SYNTHETIC SAMPLE] Lab sample recorded for demonstration.', sampleLabel: `SMP-${date.replace(/-/g, '')}-002`, labProtocolGuidance: LAB_PROTOCOL_GUIDANCE['DIA-10'], timestamp: now, status: 'pending_lab_analysis' },
    ],
    startedAt: now,
  };
}

// Stores the sample under its fixed ID (repeat loads replace, never duplicate)
// and does NOT touch the caller's in-progress session pointer — the review
// page opens it via ?session=sample-demo instead.
export async function loadSampleSession(): Promise<{ ok: true } | { ok: false; error: string }> {
  const result = await createSession(buildSampleSession());
  return result.success ? { ok: true } : { ok: false, error: result.error || 'Could not create the sample session' };
}
