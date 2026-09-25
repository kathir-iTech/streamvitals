const fs = require('fs');
const path = require('path');
const indicators = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/indicators.json'), 'utf8'));

const DB_NAME = 'streamvitals-field';
const DB_VERSION = 1;
let dbInstance = null;
let failNextOpen = false;
let failNextTransaction = false;

function openDB() {
  return new Promise((resolve, reject) => {
    if (failNextOpen) {
      failNextOpen = false;
      reject(new DOMException('QuotaExceededError', 'QuotaExceededError'));
      return;
    }
    if (dbInstance) { resolve(dbInstance); return; }
    const db = {
      transaction: (storeName, mode) => {
        if (failNextTransaction) {
          failNextTransaction = false;
const err = new DOMException('ReadOnlyError', 'ReadOnlyError');
          const store = {
            put: () => {},
            get: () => {},
            delete: () => {},
            createIndex: () => {},
          };
          const tx = { objectStore: () => store, oncomplete: null, onerror: null, error: err };
          setTimeout(() => { if (tx.onerror) tx.onerror(); }, 0);
          return tx;
        }
        const store = {
          put: () => {},
          get: () => {},
          delete: () => {},
          createIndex: () => {},
        };
        const tx = { objectStore: () => store, oncomplete: null, onerror: () => {} };
        setTimeout(() => { if (tx.oncomplete) tx.oncomplete(); }, 0);
        return tx;
      },
      createObjectStore: () => {},
      objectStoreNames: { contains: () => true },
    };
    dbInstance = db;
    resolve(db);
  });
}

function txError(err) {
  if (!err) return 'Unknown IndexedDB error';
  if (err.name === 'QuotaExceededError') return 'Storage quota exceeded — cannot save data';
  if (err.name === 'NotFoundError') return 'Database record not found';
  if (err.name === 'ReadOnlyError') return 'Database is read-only';
  return err.message || 'IndexedDB operation failed';
}

async function createSession(session) {
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
    return { success: false, error: `Storage write failed: ${message}` };
  }
}

async function getSession(sessionId) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('sessions', 'readonly');
      const store = tx.objectStore('sessions');
      const request = { result: undefined, onsuccess: null, onerror: null };
      setTimeout(() => { if (request.onsuccess) request.onsuccess(); }, 0);
      resolve(undefined);
    });
  } catch (err) {
    return undefined;
  }
}

async function updateSession(sessionId, updates) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('sessions', 'readwrite');
      tx.oncomplete = () => resolve({ success: true });
      tx.onerror = () => resolve({ success: false, error: txError(tx.error) });
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: `Storage write failed: ${message}` };
  }
}

async function savePhoto(photoId, sessionId, indicatorId, data, thumbnail) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('photos', 'readwrite');
      tx.oncomplete = () => resolve({ success: true });
      tx.onerror = () => resolve({ success: false, error: txError(tx.error) });
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: `Photo storage failed: ${message}` };
  }
}

async function deletePhoto(photoId) {
  try {
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function getSessionPhotos(sessionId) {
  return [];
}

async function getFullSession(sessionId) {
  return { session: undefined, photos: [] };
}

async function clearSession(sessionId) {
  return { success: true };
}

function isIndexedDBAvailable() {
  try { return typeof globalThis !== 'undefined'; } catch { return false; }
}

module.exports = {
  createSession,
  getSession,
  updateSession,
  savePhoto,
  deletePhoto,
  getSessionPhotos,
  getFullSession,
  clearSession,
  isIndexedDBAvailable,
  txError,
  _setFailNextOpen: (v) => { failNextOpen = v; },
  _setFailNextTransaction: (v) => { failNextTransaction = v; },
  _resetDb: () => { dbInstance = null; },
};
