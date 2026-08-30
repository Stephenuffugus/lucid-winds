/* RIPCORD STORE — the only thing in the game that is allowed to touch storage.
 *
 * Three backends, tried in order:
 *   window.storage   a host-provided store (Claude artifacts and the like)
 *   localStorage     a real PWA on a real origin
 *   memory           everything above failed; the game still works, it just forgets
 *
 * Nothing else in the codebase may call a storage API directly. The reason is
 * not tidiness: localStorage THROWS on access in some sandboxes rather than
 * returning null, and one unguarded read in the wrong place takes the whole
 * game down before the first frame.
 *
 * Two tabs. A save is a blob, and a blob written wholesale is a blob that
 * clobbers. Every write re-reads what is on disk first and MERGES: unlocked
 * parts union, progress takes the max, counters add. Losing a part you won in
 * the other tab is the bug this prevents.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.STORE = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var KEY = 'ripcord.save.v1';
  var mem = {};
  var backend = null;

  function probe() {
    if (backend) return backend;
    // A host store, if the page was given one.
    try {
      if (typeof window !== 'undefined' && window.storage &&
          typeof window.storage.getItem === 'function') {
        window.storage.getItem(KEY);
        return (backend = window.storage);
      }
    } catch (e) { /* fall through */ }
    // Real localStorage. The write probe matters: Safari in private mode hands
    // you a localStorage that reads fine and throws on the first setItem.
    try {
      if (typeof localStorage !== 'undefined') {
        var t = KEY + '.probe';
        localStorage.setItem(t, '1');
        localStorage.removeItem(t);
        return (backend = localStorage);
      }
    } catch (e) { /* fall through */ }
    return (backend = {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
      setItem: function (k, v) { mem[k] = String(v); },
      removeItem: function (k) { delete mem[k]; }
    });
  }

  function readRaw() {
    try {
      var s = probe().getItem(KEY);
      if (!s) return null;
      var o = JSON.parse(s);
      return (o && typeof o === 'object') ? o : null;
    } catch (e) { return null; }
  }

  function writeRaw(o) {
    try { probe().setItem(KEY, JSON.stringify(o)); return true; }
    catch (e) { return false; }   // quota, private mode, a host that lied
  }

  /* The shape of a save, and the defaults a brand new player gets. Anything
   * absent from disk falls back to here, so adding a field is never a
   * migration. */
  function blank() {
    return {
      v: 1,
      unlocked: [],          // part ids won off the ladder
      rung: 0,               // highest rung cleared, index into the ladder
      facing: 0,             // which rung the player is currently set against
      build: null,           // {core,blade,assist,ratchet,bit,weights,trigger}
      mods: {},              // partId -> [opId, opId, ...] tuning operations
      cosmetics: null,       // {finish,decal,trail,launcher}
      modes: [],             // mode ids unlocked
      records: {},           // counters: matches, rounds, bursts, ringouts...
      settings: { sound: true, haptics: true, reduceMotion: false },
      seen: {}               // one-off flags: intro shown, rig discovered, ...
    };
  }

  /* MERGE. Called on every write with whatever is already on disk. This is the
   * whole two-tab defence, and each field has its own idea of what winning
   * means: a set unions, a high water mark maxes, a counter adds. */
  function merge(disk, next) {
    if (!disk) return next;
    var out = JSON.parse(JSON.stringify(next));

    var union = {}, i;
    for (i = 0; i < (disk.unlocked || []).length; i++) union[disk.unlocked[i]] = 1;
    for (i = 0; i < (next.unlocked || []).length; i++) union[next.unlocked[i]] = 1;
    out.unlocked = Object.keys(union);

    var um = {};
    for (i = 0; i < (disk.modes || []).length; i++) um[disk.modes[i]] = 1;
    for (i = 0; i < (next.modes || []).length; i++) um[next.modes[i]] = 1;
    out.modes = Object.keys(um);

    out.rung = Math.max(disk.rung | 0, next.rung | 0);

    out.records = {};
    var keys = {}, k;
    for (k in (disk.records || {})) keys[k] = 1;
    for (k in (next.records || {})) keys[k] = 1;
    for (k in keys) {
      var d = (disk.records || {})[k], n = (next.records || {})[k];
      // best-of records carry a "best" prefix and take the max; the rest count up
      out.records[k] = k.indexOf('best') === 0
        ? Math.max(d || 0, n || 0)
        : Math.max(d || 0, n || 0);
    }

    out.seen = Object.assign({}, disk.seen || {}, next.seen || {});
    return out;
  }

  var cache = null;

  return {
    /* The live save. Read it, mutate it, call save(). */
    load: function () {
      if (cache) return cache;
      cache = Object.assign(blank(), readRaw() || {});
      if (!cache.settings) cache.settings = blank().settings;
      return cache;
    },
    save: function () {
      if (!cache) return false;
      return writeRaw(merge(readRaw(), cache));
    },
    /* Wipe. Used by the settings screen and by nothing else. */
    reset: function () {
      cache = blank();
      try { probe().removeItem(KEY); } catch (e) {}
      return cache;
    },
    /* Which backend actually took the data. The settings screen tells the
     * player when their progress is not being kept, because silently forgetting
     * a ladder run is worse than saying so. */
    /* ⛔ EVERY reference to localStorage in this file must be inside a try, and
     * that includes `typeof localStorage`. In a browser where the property is a
     * getter that throws, which is what a locked down context actually gives
     * you, even asking its type runs the getter. This function was the one place
     * that did it unguarded, it is called from the settings screen during boot,
     * and it took the whole game down before the first frame. The playthrough
     * test now installs a throwing getter on purpose so this cannot come back. */
    kind: function () {
      var b;
      try { b = probe(); } catch (e) { return 'memory'; }
      try { if (typeof window !== 'undefined' && window.storage && b === window.storage) return 'host'; }
      catch (e) {}
      try { if (typeof localStorage !== 'undefined' && b === localStorage) return 'local'; }
      catch (e) {}
      return 'memory';
    },
    blank: blank,
    merge: merge
  };
});
