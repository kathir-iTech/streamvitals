const DB_NAME = 'streamvitals-field';
const DB_VERSION = 1;
let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
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
        dbInstance = (event.target as IDBOpenDBRequest).result;
        resolve(dbInstance);
      };
      request.onerror = () => reject(request.error);
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
    return { success: false, error: `Storage write failed: ${message}` };
  }
}

export async function getSession(sessionId: string): Promise<FieldSession | undefined> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('sessions', 'readonly');
      const store = tx.objectStore('sessions');
      const request = store.get(sessionId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => { console.error('[IndexedDB] Read error:', txError(request.error)); resolve(undefined); };
    });
  } catch (err) {
    console.error('[IndexedDB] Failed to read session:', err);
    return undefined;
  }
}

export async function updateSession(sessionId: string, updates: Partial<FieldSession>): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('sessions', 'readwrite');
      const store = tx.objectStore('sessions');
      const getReq = store.get(sessionId);
      getReq.onsuccess = () => {
        const existing = getReq.result;
        if (!existing) { resolve({ success: false, error: 'Session not found' }); return; }
        store.put({ ...existing, ...updates });
      };
      tx.oncomplete = () => resolve({ success: true });
      tx.onerror = () => resolve({ success: false, error: txError(tx.error) });
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[IndexedDB] Failed to update session:', message);
    return { success: false, error: `Storage write failed: ${message}` };
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
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('photos', 'readonly');
      const store = tx.objectStore('photos');
      const index = store.index('by-session');
      const request = index.getAll(sessionId);
      request.onsuccess = () => {
        const results = request.result || [];
        resolve(results.map((p: any) => ({ photoId: p.photoId, indicatorId: p.indicatorId, timestamp: p.timestamp })));
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

export async function getFullSession(sessionId: string): Promise<{ session?: FieldSession; photos: { photoId: string; indicatorId: string; timestamp: string }[] }> {
  try {
    const [session, photos] = await Promise.all([
      getSession(sessionId),
      getSessionPhotos(sessionId),
    ]);
    return { session, photos };
  } catch (err) {
    console.error('[IndexedDB] Failed to read full session:', err);
    return { session: undefined, photos: [] };
  }
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
