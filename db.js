function openDatabase(storeName) {
  return new Promise((resolve, reject) => {
    const storeVersion = 2;
    const request = indexedDB.open(storeName, storeVersion);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('records')) {
        const store = db.createObjectStore('records', {
          keyPath: 'id',
          autoIncrement: true
        });
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

async function addRecord(db, record) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('records', 'readwrite');
    const store = transaction.objectStore('records');
    const request = store.add(record); // Fails if key exists
    request.onsuccess = () => resolve(request.result); // Returns the key
    request.onerror = () => reject(request.error);
  });
}

async function getRecord(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('records', 'readonly');
    const store = transaction.objectStore('records');
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAll(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('records', 'readonly');
    const store = transaction.objectStore('records');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function updateRecord(db, id, updates) {
  return new Promise(async (resolve, reject) => {
    const transaction = db.transaction('records', 'readwrite');
    const store = transaction.objectStore('records');
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const record = { ...getRequest.result, ...updates, updatedAt: Date.now() };
      const putRequest = store.put(record);
      putRequest.onsuccess = () => resolve(record);
      putRequest.onerror = () => reject(putRequest.error);
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

async function deleteRecord(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('records', 'readwrite');
    const store = transaction.objectStore('records');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

