const DB_NAME = 'streamvitals-field';
const DB_VERSION = 1;
let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      const timeout = setTimeout(() => { (request as any).abort(); reject(new Error('IndexedDB timeout')); }, 3000);
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

export interface FieldIndicatorRecord {
  indicatorId: string;
  indicatorName: string;
  type: 'citizen_observable' | 'lab_only';
  state?: string;
  photos: string[];
  notes: string;
  timestamp: string;
  sampleLabel?: string;
  labProtocolGuidance?: string;
  status: 'complete' | 'pending_lab_analysis';
}

export interface FieldSession {
  sessionId: string;
  streamName: string;
  volunteer: string;
  date: string;
  indicators: FieldIndicatorRecord[];
  startedAt: string;
  completedAt?: string;
}

export async function createSession(session: FieldSession): Promise<{ success: boolean; error?: string }> {
  try {
    const key = `session_${session.sessionId}`;
    sessionStorage.setItem(key, JSON.stringify(session));
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[sessionStorage] Failed to create session:', message);
    return { success: false, error: message };
  }
}

export async function getSession(sessionId: string): Promise<FieldSession | undefined> {
  try {
    const key = `session_${sessionId}`;
    const data = sessionStorage.getItem(key);
    if (data) return JSON.parse(data) as FieldSession;
    return undefined;
  } catch {
    return undefined;
  }
}

export async function updateSession(sessionId: string, updates: Partial<FieldSession>): Promise<{ success: boolean; error?: string }> {
  try {
    const key = `session_${sessionId}`;
    const existing = sessionStorage.getItem(key);
    if (existing) {
      const session = JSON.parse(existing) as FieldSession;
      const updated = { ...session, ...updates };
      sessionStorage.setItem(key, JSON.stringify(updated));
      return { success: true };
    }
    return { success: false, error: 'Session not found' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[sessionStorage] Failed to update session:', message);
    return { success: false, error: message };
  }
}

export async function savePhoto(photoId: string, sessionId: string, indicatorId: string, data: Blob, thumbnail?: Blob): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('photos', 'readwrite');
      const store = tx.objectStore('photos');
      store.put({ photoId, sessionId, indicatorId, data, thumbnail, timestamp: new Date().toISOString() });
      tx.oncomplete = () => resolve({ success: true });
      tx.onerror = () => resolve({ success: false, error: txError(tx.error) });
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[IndexedDB] Failed to save photo:', message);
    return { success: false, error: `Photo storage failed: ${message}` };
  }
}

export async function getSessionPhotos(sessionId: string): Promise<{ photoId: string; indicatorId: string; timestamp: string }[]> {
  return [];
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

export async function getFullSession(sessionId: string): Promise<{ session?: FieldSession; photos: { photoId: string; indicatorId: string; timestamp: string }[] }> {
  const session = await getSession(sessionId);
  return { session, photos: [] };
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
        (getAllReq.result || []).forEach((p: any) => photoStore.delete(p.photoId));
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
