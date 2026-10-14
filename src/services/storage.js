// IndexedDB storage service for local audio and image files
const DB_NAME = 'aurasound_db';
const DB_VERSION = 1;
const BLOB_STORE = 'media_blobs';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(BLOB_STORE)) {
        db.createObjectStore(BLOB_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveMediaBlob(key, fileOrBlob) {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(BLOB_STORE, 'readwrite');
      const store = tx.objectStore(BLOB_STORE);
      const req = store.put(fileOrBlob, key);
      req.onsuccess = () => resolve(key);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Error saving media blob to IndexedDB:', err);
    throw err;
  }
}

export async function getMediaBlobUrl(key) {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(BLOB_STORE, 'readonly');
      const store = tx.objectStore(BLOB_STORE);
      const req = store.get(key);
      req.onsuccess = () => {
        if (req.result) {
          const url = URL.createObjectURL(req.result);
          resolve(url);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.error('Error getting media blob from IndexedDB:', err);
    return null;
  }
}

export async function deleteMediaBlob(key) {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(BLOB_STORE, 'readwrite');
      const store = tx.objectStore(BLOB_STORE);
      const req = store.delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch (err) {
    console.error('Error deleting media blob from IndexedDB:', err);
    return false;
  }
}
