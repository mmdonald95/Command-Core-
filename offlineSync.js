/**
 * Offline Sync Service
 * Queues entity operations in IndexedDB when offline,
 * then auto-syncs to Base44 when the network reconnects.
 */
import { base44 } from "@/api/base44Client";

const DB_NAME = "ppdms_offline";
const DB_VERSION = 1;
const STORE = "pending_records";

// ─── IndexedDB helpers ────────────────────────────────────────────────────────

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
        store.createIndex("entity", "entity", { unique: false });
        store.createIndex("queued_at", "queued_at", { unique: false });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

function dbAdd(db, record) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).add(record);
    req.onsuccess = () => resolve(req.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

function dbGetAll(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

function dbDelete(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e.target.error);
  });
}

function dbClear(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).clear();
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e.target.error);
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

let _db = null;
async function getDB() {
  if (!_db) _db = await openDB();
  return _db;
}

/**
 * Queue a record for later sync.
 * @param {string} entity  - Base44 entity name (e.g. "Expense")
 * @param {"create"|"update"|"delete"} operation
 * @param {object} data    - Entity payload (include `id` for update/delete)
 * @returns {Promise<number>} queued record id
 */
export async function queueRecord(entity, operation, data) {
  const db = await getDB();
  return dbAdd(db, {
    entity,
    operation,
    data,
    queued_at: new Date().toISOString(),
  });
}

/**
 * Returns all pending (unsynced) records.
 */
export async function getPendingRecords() {
  const db = await getDB();
  return dbGetAll(db);
}

/**
 * Returns pending count.
 */
export async function getPendingCount() {
  const records = await getPendingRecords();
  return records.length;
}

/**
 * Attempt to flush all queued records to Base44.
 * Calls onProgress(synced, total) after each record.
 * Returns { synced, failed, errors }.
 */
export async function syncPendingRecords(onProgress) {
  const db = await getDB();
  const records = await dbGetAll(db);
  if (records.length === 0) return { synced: 0, failed: 0, errors: [] };

  let synced = 0;
  let failed = 0;
  const errors = [];

  for (const record of records) {
    try {
      const entityApi = base44.entities[record.entity];
      if (!entityApi) throw new Error(`Unknown entity: ${record.entity}`);

      if (record.operation === "create") {
        await entityApi.create(record.data);
      } else if (record.operation === "update") {
        const { id, ...rest } = record.data;
        await entityApi.update(id, rest);
      } else if (record.operation === "delete") {
        await entityApi.delete(record.data.id);
      }

      await dbDelete(db, record.id);
      synced++;
    } catch (err) {
      console.error("[offlineSync] Failed to sync record:", record, err);
      errors.push({ record, error: err.message });
      failed++;
    }

    onProgress && onProgress(synced + failed, records.length);
  }

  return { synced, failed, errors };
}

/**
 * Clear all pending records (e.g. after a hard reset).
 */
export async function clearPendingRecords() {
  const db = await getDB();
  return dbClear(db);
}