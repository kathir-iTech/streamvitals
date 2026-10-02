import type { GbifBaseline } from './gbif';

const DB_NAME = 'streamvitals-field';
const DB_VERSION = 1;

// Legacy photo rows: older records hold a Blob in `data`, newer ones a dataURL.
interface StoredPhotoRecord {
  photoId: string;
  indicatorId: string;
  timestamp: string;
  data: string | Blob | ArrayBuffer;
}
let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      // MDN documents IDBOpenDBRequest.abort(); TypeScript's lib.dom omits it.
      const timeout = setTimeout(() => { (request as IDBOpenDBRequest & { abort(): void }).abort(); reject(new Error('IndexedDB timeout')); }, 3000);
      request.onupgradeneeded = (event) => {
        clearTimeout(timeout);
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'sessionId' });
          sessionStore.createIndex('by-date', 'date', { unique: false });
        }
        if (!db.objectStoreNames.contains('photos')) {
          const photoStore = db.createObjectStore('photos', { keyPath: 'photoId' });
          photoStore.createIndex('by-session', 'sessionId', { unique: false });
        }
      };
      request.onsuccess = (event) => {
        clearTimeout(timeout);
        dbInstance = (event.target as IDBOpenDBRequest).result;
        resolve(dbInstance);
      };
      request.onerror = () => { clearTimeout(timeout); reject(request.error); };
    } catch (err) {
      reject(err);
    }
  });
}

function txError(err: DOMException | null): string {
  if (!err) return 'Unknown IndexedDB error';
  if (err.name === 'QuotaExceededError') return 'Storage quota exceeded — cannot save data';
  if (err.name === 'NotFoundError') return 'Database record not found';
  if (err.name === 'ReadOnlyError') return 'Database is read-only';
  return err.message || 'IndexedDB operation failed';
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export interface FieldIndicatorRecord {
  indicatorId: string;
  indicatorName: string;
  type: 'citizen_observable' | 'lab_only';
  state?: string;
  photos: string[];
  notes: string;
  note_flag?: string;
  timestamp: string;
  sampleLabel?: string;
  labProtocolGuidance?: string;
  status: 'complete' | 'pending_lab_analysis';
}

export interface SessionLocation {
  lat: number;
  lng: number;
  accuracyM: number | null;
  capturedAt: string;
}

export interface FieldSession {
  sessionId: string;
  streamName: string;
  volunteer: string;
  date: string;
  indicators: FieldIndicatorRecord[];
  startedAt: string;
  completedAt?: string;
  location?: SessionLocation;
  gbifBaseline?: GbifBaseline;
  /** Built-in demonstration data — labeled synthetic everywhere it renders. */
  isSample?: boolean;
}

export async function createSession(session: FieldSession): Promise<{ success: boolean; error?: string }> {
  if (!session.sessionId || !session.sessionId.trim()) {
    return { success: false, error: 'sessionId is required' };
  }
  if (!session.streamName || !session.streamName.trim()) {
    return { success: false, error: 'streamName is required' };
  }
  if (!session.startedAt) {
    return { success: false, error: 'startedAt is required' };
  }
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('sessions', 'readwrite');
      const store = tx.objectStore('sessions');
      store.put(session);
      tx.oncomplete = () => resolve({ success: true });
      tx.onerror = () => resolve({ success: false, error: txError(tx.error) });
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[IndexedDB] Failed to create session:', message);
    return { success: false, error: message };
  }
}

export async function getSession(sessionId: string): Promise<FieldSession | undefined> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('sessions', 'readonly');
      const store = tx.objectStore('sessions');
      const request = store.get(sessionId);
      request.onsuccess = () => resolve(request.result || undefined);
      request.onerror = () => { console.error('[IndexedDB] Session read error:', txError(request.error)); resolve(undefined); };
    });
  } catch {
    return undefined;
  }
}

export async function getAllSessions(): Promise<FieldSession[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('sessions', 'readonly');
      const store = tx.objectStore('sessions');
      const request = store.getAll();
      request.onsuccess = () => resolve((request.result as FieldSession[]) || []);
      request.onerror = () => { console.error('[IndexedDB] Sessions read error:', txError(request.error)); resolve([]); };
    });
  } catch {
    return [];
  }
}

export async function updateSession(sessionId: string, updates: Partial<FieldSession>): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('sessions', 'readwrite');
      const store = tx.objectStore('sessions');
      store.get(sessionId).onsuccess = (event) => {
        const existing = (event.target as IDBRequest).result;
        if (existing) {
          const updated = { ...existing, ...updates };
          store.put(updated);
        }
      };
      tx.oncomplete = () => resolve({ success: true });
      tx.onerror = () => resolve({ success: false, error: txError(tx.error) });
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[IndexedDB] Failed to update session:', message);
    return { success: false, error: message };
  }
}

export async function savePhoto(photoId: string, sessionId: string, indicatorId: string, data: Blob, thumbnail?: Blob): Promise<{ success: boolean; error?: string }> {
  try {
    // Store dataURLs (strings), not Blobs: Blob records fail to clone on some
    // WebKit builds (UnknownError), which breaks photo save on iPhones.
    const dataUrl = await blobToDataUrl(data);
    const thumbUrl = thumbnail ? await blobToDataUrl(thumbnail) : undefined;
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('photos', 'readwrite');
      const store = tx.objectStore('photos');
      store.put({ photoId, sessionId, indicatorId, data: dataUrl, thumbnail: thumbUrl, timestamp: new Date().toISOString() });
      tx.oncomplete = () => resolve({ success: true });
      tx.onerror = () => resolve({ success: false, error: txError(tx.error) });
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[IndexedDB] Failed to save photo:', message);
    return { success: false, error: `Photo storage failed: ${message}` };
  }
}

export async function getSessionPhotos(sessionId: string): Promise<{ photoId: string; indicatorId: string; timestamp: string; dataUrl: string }[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('photos', 'readonly');
      const store = tx.objectStore('photos');
      const index = store.index('by-session');
      const request = index.getAll(sessionId);
      request.onsuccess = async () => {
        const results = request.result || [];
        const photosWithData = await Promise.all(results.map(async (p: StoredPhotoRecord) => {
          try {
            // New records store dataURLs directly; old records hold Blobs.
            if (typeof p.data === 'string' && p.data.startsWith('data:')) {
              return { photoId: p.photoId, indicatorId: p.indicatorId, timestamp: p.timestamp, dataUrl: p.data };
            }
            const blob = p.data instanceof Blob ? p.data : new Blob([p.data]);
            const dataUrl = await blobToDataUrl(blob);
            return { photoId: p.photoId, indicatorId: p.indicatorId, timestamp: p.timestamp, dataUrl };
          } catch {
            return { photoId: p.photoId, indicatorId: p.indicatorId, timestamp: p.timestamp, dataUrl: '' };
          }
        }));
        resolve(photosWithData);
      };
      request.onerror = () => { console.error('[IndexedDB] Photo read error:', txError(request.error)); resolve([]); };
    });
  } catch (err) {
    console.error('[IndexedDB] Failed to read photos:', err);
    return [];
  }
}

export async function deletePhoto(photoId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('photos', 'readwrite');
      const store = tx.objectStore('photos');
      store.delete(photoId);
      tx.oncomplete = () => resolve({ success: true });
      tx.onerror = () => resolve({ success: false, error: txError(tx.error) });
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[IndexedDB] Failed to delete photo:', message);
    return { success: false, error: `Photo delete failed: ${message}` };
  }
}

export async function getFullSession(sessionId: string): Promise<{ session?: FieldSession; photos: { photoId: string; indicatorId: string; timestamp: string; dataUrl: string }[] }> {
  const session = await getSession(sessionId);
  const photos = await getSessionPhotos(sessionId);
  if (!session) return { photos };
  return { session, photos };
}

export async function clearSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(['sessions', 'photos'], 'readwrite');
      tx.objectStore('sessions').delete(sessionId);
      const photoStore = tx.objectStore('photos');
      const index = photoStore.index('by-session');
      const getAllReq = index.getAll(sessionId);
      getAllReq.onsuccess = () => {
        (getAllReq.result || []).forEach((p: { photoId: string }) => photoStore.delete(p.photoId));
      };
      tx.oncomplete = () => resolve({ success: true });
      tx.onerror = () => resolve({ success: false, error: txError(tx.error) });
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[IndexedDB] Failed to clear session:', message);
    return { success: false, error: `Clear failed: ${message}` };
  }
}

export function isIndexedDBAvailable(): boolean {
  try { return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined'; } catch { return false; }
}
