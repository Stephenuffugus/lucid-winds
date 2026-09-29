// Saving in the browser (design 14 §7 T1, 03 §10, QUESTIONS Q17). IndexedDB database `tw`:
//   worlds  one small row per world: id, when made and saved, size, day, creatures, a thumbnail, the newest copy's seq
//   saves   two full copies per world, `<id>#0` and `<id>#1`: { id, seq, at, view, rec } (rec: sim/save.js)
//   meta    small values: `current`, the world open last
//   book    the Scrapbook (design 14 §7 T12), per device, not per world: `stickers` (the ids earned), `firsts`
//           (one row per first, with the picture taken at the time) and `friends` (creatures the child named)
// A write goes to the copy that is NOT the newest, together with the world's row, in one transaction: it lands
// whole or not at all, and the newest copy is never the one being overwritten (write-ahead). Loading tries the
// newest copy, then the older one (last-good), so a copy that fails to load costs one interval, not the world.
const DB = 'tw', VERSION = 2;

const req = (r) => new Promise((ok, no) => { r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); });
const done = (tx) => new Promise((ok, no) => { tx.oncomplete = () => ok(); tx.onerror = () => no(tx.error); tx.onabort = () => no(tx.error || new Error('save aborted')); });

// The store, or null where IndexedDB is missing or refused (some private windows): the game then runs unsaved.
export async function openStore() {
  if (typeof indexedDB === 'undefined') return null;
  const open = indexedDB.open(DB, VERSION);
  open.onupgradeneeded = () => {
    const db = open.result;
    if (!db.objectStoreNames.contains('worlds')) db.createObjectStore('worlds', { keyPath: 'id' });
    if (!db.objectStoreNames.contains('saves')) db.createObjectStore('saves', { keyPath: 'key' });
    if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta');
    if (!db.objectStoreNames.contains('book')) db.createObjectStore('book'); // v2 (14 §7 T12): the Scrapbook
  };
  let db;
  try { db = await req(open); } catch (e) { return null; }
  db.onversionchange = () => db.close(); // a newer game in another tab needs the database: step aside
  return {
    // Writes copy seq % 2 and the row, one transaction. Resolves when it is on disk as far as the browser says.
    put(row, copy) {
      const tx = db.transaction(['worlds', 'saves', 'meta'], 'readwrite');
      tx.objectStore('saves').put({ key: `${row.id}#${copy.seq % 2}`, ...copy });
      tx.objectStore('worlds').put(row);
      tx.objectStore('meta').put(row.id, 'current');
      return done(tx);
    },
    // The Scrapbook, per device: read a part, or write one. A part that was never written reads as undefined,
    // which the book takes as an empty page (an old world simply starts collecting from the next thing that happens).
    async book(key) {
      const tx = db.transaction('book', 'readonly');
      try { return await req(tx.objectStore('book').get(key)); } catch (e) { return undefined; }
    },
    putBook(key, value) {
      const tx = db.transaction('book', 'readwrite');
      tx.objectStore('book').put(value, key);
      return done(tx);
    },
    // Both copies of a world, newest first (missing ones left out).
    async copies(id) {
      const tx = db.transaction('saves', 'readonly'), s = tx.objectStore('saves');
      const got = await Promise.all([req(s.get(`${id}#0`)), req(s.get(`${id}#1`))]);
      return got.filter(Boolean).sort((a, b) => b.seq - a.seq);
    },
    row: (id) => req(db.transaction('worlds', 'readonly').objectStore('worlds').get(id)),
    // The world's one Snapshot (design 14 §3): { key: '<id>#snap', id, at, view, thumb, rec }, or undefined.
    snap: (id) => req(db.transaction('saves', 'readonly').objectStore('saves').get(`${id}#snap`)),
    putSnap(id, snap) { const tx = db.transaction('saves', 'readwrite'); tx.objectStore('saves').put({ key: `${id}#snap`, id, ...snap }); return done(tx); },
    // Every world's row, the one saved last first.
    async rows() { const all = await req(db.transaction('worlds', 'readonly').objectStore('worlds').getAll()); return all.sort((a, b) => b.savedAt - a.savedAt); },
    current: () => req(db.transaction('meta', 'readonly').objectStore('meta').get('current')),
    setCurrent(id) { const tx = db.transaction('meta', 'readwrite'); tx.objectStore('meta').put(id, 'current'); return done(tx); },
  };
}

// Asks the browser to keep this site's storage when the phone runs short of space (best-effort storage is evicted
// first). It never shields a world from the player clearing browsing data; the fleet-wide backup is Stephen's open
// item (QUESTIONS Q20). Not asked in Firefox, which shows a permission pop-up for it (Flow rule 2: no pop-ups).
export function askToKeep() {
  try {
    if (!navigator.storage || !navigator.storage.persist || /Firefox\//.test(navigator.userAgent)) return;
    navigator.storage.persisted().then((yes) => { if (!yes) navigator.storage.persist().catch(() => {}); }).catch(() => {});
  } catch (e) { /* storage API refused: nothing to do */ }
}

// A new world id: w_ and 8 hex digits, from the clock and a random draw (ids are never compared for order).
export const newWorldId = () => 'w_' + ((Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0).toString(16).padStart(8, '0');

// ---------- files (.tinyworld: gzip of the record's JSON text; plain text where the browser cannot gzip) ----------
export async function fileBlob(text) {
  if (typeof CompressionStream === 'undefined') return new Blob([text], { type: 'application/json' });
  const s = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));
  return new Blob([await new Response(s).arrayBuffer()], { type: 'application/gzip' });
}
// A file's text: gunzipped when it starts with gzip's two magic bytes. Throws { code: 'damaged' } when it cannot be read.
export async function fileText(file) {
  const buf = new Uint8Array(await file.arrayBuffer());
  const damaged = () => Object.assign(new Error('file damaged'), { code: 'damaged' });
  if (buf[0] === 0x1f && buf[1] === 0x8b) {
    if (typeof DecompressionStream === 'undefined') throw damaged();
    try { return await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).text(); } catch (e) { throw damaged(); }
  }
  try { return new TextDecoder('utf-8', { fatal: true }).decode(buf); } catch (e) { throw damaged(); }
}
