// Session share links: move a session between devices with no accounts and no
// server storage. Payload lives in the URL fragment (never sent to any server),
// base64url-encoded JSON, versioned and validated on decode.
//
// Deliberately EXCLUDED from the payload (and stated in the UI):
//   - photos (they live in a separate IndexedDB store and would blow the URL/QR budget)
//   - static protocol text (restored from src/data/lab-protocol-guidance.ts on import)
//   - baseline attribution/taxon labels (restored from src/lib/gbif.ts on import)

import type { FieldSession, FieldIndicatorRecord, SessionLocation } from './field-session';
import { GBIF_ATTRIBUTION, GBIF_TAXA, type GbifRowStatus } from './gbif';
import { indicators } from '@/data/indicators';
import { LAB_PROTOCOL_GUIDANCE } from '@/data/lab-protocol-guidance';

export const SHARE_VERSION = 1;
// QR byte budget (byte mode, EC level L, version 40) is 2953 bytes.
export const SHARE_QR_MAX_CHARS = 2900;

interface SharedIndicator {
  indicatorId: string;
  state?: string;
  notes: string;
  note_flag?: string;
  sampleLabel?: string;
  status: FieldIndicatorRecord['status'];
  timestamp: string;
}

interface SharedBaselineRow {
  scientificName: string;
  status: GbifRowStatus;
  count?: number;
}

interface SharePayload {
  v: number;
  session: {
    sessionId: string;
    streamName: string;
    volunteer: string;
    date: string;
    startedAt: string;
    completedAt?: string;
    location?: SessionLocation;
  };
  indicators: SharedIndicator[];
  gbifBaseline?: {
    radiusKm: number;
    lat: number;
    lng: number;
    capturedAt: string;
    rows: SharedBaselineRow[];
  };
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(encoded: string): string {
  const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeShare(session: FieldSession): string {
  if (!session.sessionId || !session.streamName || !session.startedAt) {
    throw new Error('Session is missing the fields required for sharing.');
  }
  const payload: SharePayload = {
    v: SHARE_VERSION,
    session: {
      sessionId: session.sessionId,
      streamName: session.streamName,
      volunteer: session.volunteer,
      date: session.date,
      startedAt: session.startedAt,
      ...(session.completedAt ? { completedAt: session.completedAt } : {}),
      ...(session.location ? { location: session.location } : {}),
    },
    indicators: session.indicators.map((ind) => ({
      indicatorId: ind.indicatorId,
      ...(ind.state ? { state: ind.state } : {}),
      notes: ind.notes,
      ...(ind.note_flag ? { note_flag: ind.note_flag } : {}),
      ...(ind.sampleLabel ? { sampleLabel: ind.sampleLabel } : {}),
      status: ind.status,
      timestamp: ind.timestamp,
    })),
    ...(session.gbifBaseline
      ? {
          gbifBaseline: {
            radiusKm: session.gbifBaseline.radiusKm,
            lat: session.gbifBaseline.lat,
            lng: session.gbifBaseline.lng,
            capturedAt: session.gbifBaseline.capturedAt,
            rows: session.gbifBaseline.rows.map((r) => ({
              scientificName: r.scientificName,
              status: r.status,
              ...(typeof r.count === 'number' ? { count: r.count } : {}),
            })),
          },
        }
      : {}),
  };
  return toBase64Url(JSON.stringify(payload));
}

function isValidPartial(value: unknown): value is SharePayload {
  if (!value || typeof value !== 'object') return false;
  const p = value as SharePayload;
  if (p.v !== SHARE_VERSION) return false;
  if (!p.session || typeof p.session !== 'object') return false;
  const s = p.session;
  if (typeof s.sessionId !== 'string' || !s.sessionId) return false;
  if (typeof s.streamName !== 'string' || !s.streamName) return false;
  if (typeof s.startedAt !== 'string' || !s.startedAt) return false;
  if (typeof s.date !== 'string' || typeof s.volunteer !== 'string') return false;
  if (!Array.isArray(p.indicators)) return false;
  return p.indicators.every(
    (ind) =>
      ind &&
      typeof ind.indicatorId === 'string' &&
      typeof ind.notes === 'string' &&
      typeof ind.status === 'string' &&
      typeof ind.timestamp === 'string',
  );
}

export function decodeShare(input: string): FieldSession | null {
  try {
    const encoded = input.startsWith('#') ? input.slice(1) : input;
    if (!encoded || encoded.length > 20000) return null;
    const parsed: unknown = JSON.parse(fromBase64Url(encoded));
    if (!isValidPartial(parsed)) return null;

    const indicatorsOut: FieldIndicatorRecord[] = parsed.indicators.map((ind) => {
      const def = indicators.find((i) => i.id === ind.indicatorId);
      const isLab = Boolean(def?.lab_only);
      return {
        indicatorId: ind.indicatorId,
        indicatorName: def?.name || ind.indicatorId,
        type: isLab ? 'lab_only' : 'citizen_observable',
        ...(ind.state ? { state: ind.state } : {}),
        photos: [],
        notes: ind.notes,
        ...(ind.note_flag ? { note_flag: ind.note_flag } : {}),
        timestamp: ind.timestamp,
        ...(ind.sampleLabel ? { sampleLabel: ind.sampleLabel } : {}),
        ...(isLab && LAB_PROTOCOL_GUIDANCE[ind.indicatorId]
          ? { labProtocolGuidance: LAB_PROTOCOL_GUIDANCE[ind.indicatorId] }
          : {}),
        status: ind.status,
      };
    });

    const baseline = parsed.gbifBaseline;
    return {
      sessionId: parsed.session.sessionId,
      streamName: parsed.session.streamName,
      volunteer: parsed.session.volunteer,
      date: parsed.session.date,
      indicators: indicatorsOut,
      startedAt: parsed.session.startedAt,
      ...(parsed.session.completedAt ? { completedAt: parsed.session.completedAt } : {}),
      ...(parsed.session.location ? { location: parsed.session.location } : {}),
      ...(baseline
        ? {
            gbifBaseline: {
              engine: 'api.gbif.org/v1',
              radiusKm: baseline.radiusKm,
              lat: baseline.lat,
              lng: baseline.lng,
              capturedAt: baseline.capturedAt,
              attribution: GBIF_ATTRIBUTION,
              rows: baseline.rows.map((r) => {
                const taxon = GBIF_TAXA.find((t) => t.scientificName === r.scientificName);
                return {
                  indicatorId: taxon?.indicatorId || '—',
                  label: taxon?.label || r.scientificName,
                  scientificName: r.scientificName,
                  status: r.status,
                  ...(typeof r.count === 'number' ? { count: r.count } : {}),
                };
              }),
            },
          }
        : {}),
    };
  } catch {
    return null;
  }
}

export function buildShareUrl(origin: string, payload: string): string {
  return `${origin.replace(/\/$/, '')}/sync#${payload}`;
}
