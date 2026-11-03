// Tiny IndexedDB key/value cache. Every call is best-effort: if IndexedDB is
// unavailable (private window, blocked storage) reads miss and writes no-op.

const DB_NAME = "bsf-cache";
const STORE = "kv";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
    if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, 1);
            req.onupgradeneeded = () => req.result.createObjectStore(STORE);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
        dbPromise.catch(() => (dbPromise = null));
    }
    return dbPromise;
}

export async function cacheGet<T>(key: string): Promise<T | undefined> {
    try {
        const db = await openDb();
        return await new Promise((resolve, reject) => {
            const req = db.transaction(STORE).objectStore(STORE).get(key);
            req.onsuccess = () => resolve(req.result as T | undefined);
            req.onerror = () => reject(req.error);
        });
    } catch {
        return undefined;
    }
}

export async function cacheSet(key: string, value: unknown): Promise<void> {
    try {
        const db = await openDb();
        await new Promise<void>((resolve, reject) => {
            const tx = db.transaction(STORE, "readwrite");
            tx.objectStore(STORE).put(value, key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch {
        // ignore: caching is an optimization only
    }
}

// Remove other versions of the same entry (keys look like `${prefix}${version}`).
export async function cachePrune(prefix: string, keepKey: string): Promise<void> {
    try {
        const db = await openDb();
        const tx = db.transaction(STORE, "readwrite");
        const store = tx.objectStore(STORE);
        const req = store.getAllKeys(IDBKeyRange.bound(prefix, prefix + "￿"));
        req.onsuccess = () => {
            for (const k of req.result) if (k !== keepKey) store.delete(k);
        };
    } catch {
        // ignore
    }
}
