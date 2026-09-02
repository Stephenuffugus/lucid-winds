/* SKY WOLF STUDIO — shared soundtrack unlocks (Tier 0), 2026-09-02
 * ------------------------------------------------------------------
 * One script, included by every game. It works out which game it is in,
 * quietly counts how long you have been here and how many days you have
 * come back, and hands you songs from that game's shelf on a short, generous
 * ladder. Every song lands in the studio player under a shelf named after the
 * game. It never plays audio itself, never touches the game, and adds one
 * inert toast to the page for three seconds.
 *
 * Contract, gates and laws: HANDOFF-MUSIC.md section 6. The gate that holds
 * every promise below is test/music/unlocks.mjs; the mutants that prove the
 * gate has teeth are test/music/mutants.mjs.
 *
 *   identity   boot({id}) from play/shell.js wins; else the URL /satellites/<slug>/; else nothing.
 *   progress   localStorage sws_music_progress[slug] = {first, days[], sessions, secs}. Source of truth.
 *   ledger     localStorage sws_game_unlocks = [{id,title,artist,src,game}]. A projection of
 *              progress + catalog, rebuilt on every boot, merged by id, never shrunk.
 *   catalog    window.LW_MUSIC_CATALOG (music-catalog.js, generated). Nothing happens unless live:true.
 *   ladder     track 0 on open; 1 at 120s; 2 on a second day; 3 at 5 sessions; then every 3 sessions.
 *   off        ?nomusic=1 in the URL, or no catalog, or no identity, or a shelf-less game: no timers.
 *
 * ES5 on purpose: this runs inside a hundred pages of varying age. No const,
 * no let, no arrows, no template strings. Everything is wrapped; nothing throws.
 */
(function () {
  'use strict';
  if (window.SWSMusic) return;

  var LS_PROG = 'sws_music_progress', LS_LEDGER = 'sws_game_unlocks', TOAST_ID = 'sws-music-toast';
  var TICK_MS = 5000, TOAST_MS = 3000, SESSION_SECS = 60, MAX_DAYS = 366;
  var S = { id: null, name: null, booted: false, timer: null, loadSecs: 0, sessionCounted: false, queue: [], showing: false, ticking: false };

  /* ---- storage, defensively ---------------------------------------------- */
  function lsGet(k) { try { var v = window.localStorage.getItem(k); return v == null ? null : String(v); } catch (e) { return null; } }
  function lsSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }
  function parse(s, d) { try { var v = JSON.parse(s); return v == null ? d : v; } catch (e) { return d; } }
  function today() { var d = new Date(), m = d.getMonth() + 1, y = d.getDate(); return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (y < 10 ? '0' : '') + y; }
  function log(m) { try { if (window.console && console.debug) console.debug('[music] ' + m); } catch (e) {} }

  /* ---- who am I, and is there anything to do ------------------------------ */
  function noMusic() { try { return /[?&]nomusic=1(&|$)/.test(window.location.search || ''); } catch (e) { return true; } }
  function identify(opts) {
    if (opts && opts.id) return { id: String(opts.id).slice(0, 64), name: opts.name ? String(opts.name) : null };
    try { var m = /^\/satellites\/([a-z0-9-]+)\//.exec(window.location.pathname || ''); if (m) return { id: m[1], name: null }; } catch (e) {}
    return null;
  }
  function catalog() { var c = window.LW_MUSIC_CATALOG; return (c && c.live === true && c.shelves && c.shelves.length) ? c : null; }
  function shelvesFor(id) {
    var c = catalog(), out = [], i; if (!c) return out;
    for (i = 0; i < c.shelves.length; i++) { var s = c.shelves[i]; if (s && s.games && s.games.indexOf(id) >= 0 && s.tracks && s.tracks.length) out.push(s); }
    return out;
  }
  function srcOf(c, s, t) { return c.base + s.slug + '/' + t.file; }
  function rungOpen(i, p) {
    if (i === 0) return true;
    if (i === 1) return (p.secs | 0) >= 120;
    if (i === 2) return (p.days || []).length >= 2;
    return (p.sessions | 0) >= 5 + 3 * (i - 3);
  }

  /* ---- progress: read, modify, write. Never wholesale. (LAW 1) ------------- */
  function readProgress() { var a = parse(lsGet(LS_PROG), {}); return (a && typeof a === 'object' && !a.length) ? a : {}; }
  function progressFor(all) { var p = all[S.id]; if (!p || typeof p !== 'object') p = {}; if (!p.first) p.first = Date.now(); if (!p.days || !p.days.length) p.days = p.days || []; p.sessions = p.sessions | 0; p.secs = p.secs | 0; if (!p.unlocked) p.unlocked = []; return p; }
  function writeProgress(mut) { var all = readProgress(), p = progressFor(all); mut(p); all[S.id] = p; lsSet(LS_PROG, JSON.stringify(all)); return p; }

  /* ---- ledger: progress + catalog. Merge by id, refresh known, keep unknown (LAW 2, 14) ---- */
  function readLedger() { var l = parse(lsGet(LS_LEDGER), []); return (l && typeof l.length === 'number') ? l : []; }
  function rebuild() {
    var c = catalog(); if (!c || !S.id) return [];
    var all = readProgress(), p = progressFor(all), shelves = shelvesFor(S.id);
    var byId = {}, i, j, s, e;
    for (i = 0; i < c.shelves.length; i++) { s = c.shelves[i]; if (!s || !s.tracks) continue; for (j = 0; j < s.tracks.length; j++) byId[s.tracks[j].id] = { s: s, t: s.tracks[j] }; }
    var ledger = readLedger(), have = {}, out = [], fresh = [];               /* READ */
    for (i = 0; i < ledger.length; i++) {
      e = ledger[i]; if (!e || !e.id || have[e.id]) continue; have[e.id] = 1;
      var hit = byId[e.id];
      out.push(hit ? { id: e.id, title: hit.t.title, artist: 'Stephen', src: srcOf(c, hit.s, hit.t), game: hit.s.name } : e);
    }
    function grant(sh, t) { if (have[t.id]) return; have[t.id] = 1; var n = { id: t.id, title: t.title, artist: 'Stephen', src: srcOf(c, sh, t), game: sh.name }; out.push(n); fresh.push(n); }
    for (i = 0; i < shelves.length; i++) for (j = 0; j < shelves[i].tracks.length; j++) if (rungOpen(j, p)) grant(shelves[i], shelves[i].tracks[j]);
    for (i = 0; i < p.unlocked.length; i++) if (byId[p.unlocked[i]]) grant(byId[p.unlocked[i]].s, byId[p.unlocked[i]].t);
    lsSet(LS_LEDGER, JSON.stringify(out));                                      /* WRITE */
    try { if (typeof window.LW_FOLD_GAME_UNLOCKS === 'function') window.LW_FOLD_GAME_UNLOCKS(); } catch (x) {}
    return fresh;
  }

  /* ---- the toast: one inert pill, three seconds, queued, never while hidden ---- */
  function reduced() { try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; } }
  function showNext() {
    if (S.showing || !S.queue.length) return;
    var d = window.document; if (!d || !d.body || d.hidden) return;
    var el = d.createElement('div'), st = el.style;
    el.id = TOAST_ID; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
    el.textContent = '♫ New song: ' + S.queue.shift();
    st.position = 'fixed'; st.top = '12px'; st.left = '50%'; st.transform = 'translateX(-50%)';
    st.pointerEvents = 'none'; st.zIndex = '2147483000'; st.maxWidth = '90vw'; st.maxHeight = '44px'; st.boxSizing = 'border-box';
    st.padding = '10px 18px'; st.lineHeight = '20px'; st.fontSize = '14px'; st.fontFamily = 'system-ui, sans-serif';
    st.whiteSpace = 'nowrap'; st.overflow = 'hidden'; st.textOverflow = 'ellipsis';
    st.background = 'rgba(13,16,12,0.92)'; st.color = '#e8dcc8'; st.border = '1px solid rgba(200,168,75,0.6)'; st.borderRadius = '22px';
    if (!reduced()) { st.transition = 'opacity 0.25s'; }
    d.body.appendChild(el); S.showing = true;
    window.setTimeout(function () { try { el.remove(); } catch (e) {} S.showing = false; showNext(); }, TOAST_MS);
  }
  function toast(title) { S.queue.push(String(title)); showNext(); }

  /* ---- the tick: 5s while visible, cleared when hidden. Never rAF. ----------- */
  function tick() {
    try {
      var d = window.document; if (d && d.hidden) return;
      S.loadSecs += TICK_MS / 1000;
      writeProgress(function (p) { p.secs += TICK_MS / 1000; if (!S.sessionCounted && S.loadSecs >= SESSION_SECS) { p.sessions += 1; S.sessionCounted = true; } });
      var fresh = rebuild(), i; for (i = 0; i < fresh.length; i++) toast(fresh[i].title);
    } catch (e) {}
  }
  function startTicks() { if (S.timer != null) return; S.timer = window.setInterval(tick, TICK_MS); }
  function stopTicks() { if (S.timer == null) return; window.clearInterval(S.timer); S.timer = null; }
  function onVisibility() { try { var d = window.document; if (d && d.hidden) stopTicks(); else { if (S.ticking) startTicks(); showNext(); } } catch (e) {} }

  /* ---- boot ------------------------------------------------------------------ */
  function ensureCatalog(cb) {
    if (window.LW_MUSIC_CATALOG) return cb();
    try {
      var d = window.document, s = d.createElement('script');
      s.src = '/music-catalog.js'; s.async = true; s.onload = cb; s.onerror = cb;
      (d.head || d.documentElement).appendChild(s);
    } catch (e) { cb(); }
  }
  function init() {
    try {
      if (!catalog()) { log('no live catalog, idle'); return; }
      writeProgress(function (p) { var t = today(); if (p.days.indexOf(t) < 0) { p.days.push(t); if (p.days.length > MAX_DAYS) p.days.splice(0, p.days.length - MAX_DAYS); } });
      var fresh = rebuild(), i; for (i = 0; i < fresh.length; i++) toast(fresh[i].title);
      if (!shelvesFor(S.id).length) { log('no shelf for ' + S.id + ', visit recorded, idle'); return; }
      S.ticking = true;
      try { window.document.addEventListener('visibilitychange', onVisibility); } catch (e) {}
      if (!(window.document && window.document.hidden)) startTicks();
    } catch (e) {}
  }
  function start(who) {
    if (S.booted) return; S.booted = true;
    if (noMusic()) { log('nomusic=1, idle'); return; }
    S.id = who.id; S.name = who.name;
    ensureCatalog(init);
  }
  function autoboot() { try { var who = identify(null); if (who) start(who); } catch (e) {} }

  var api = {
    _instance: 1,
    boot: function (opts) { try { var who = identify(opts); if (who) start(who); } catch (e) {} },
    rebuild: function () { try { return rebuild(); } catch (e) { return []; } },
    /* Tier 1 hook for a game that wants to grant a specific track on a real milestone. */
    unlock: function (shelfSlug, trackId) {
      try {
        var c = catalog(); if (!c || !S.id) return false;
        var i, j, found = null;
        for (i = 0; i < c.shelves.length && !found; i++) { var s = c.shelves[i]; if (shelfSlug && s.slug !== shelfSlug) continue; for (j = 0; j < s.tracks.length; j++) if (s.tracks[j].id === trackId) { found = s.tracks[j]; break; } }
        if (!found) return false;
        writeProgress(function (p) { if (p.unlocked.indexOf(trackId) < 0) p.unlocked.push(trackId); });
        var fresh = rebuild(); for (i = 0; i < fresh.length; i++) toast(fresh[i].title);
        return true;
      } catch (e) { return false; }
    },
    id: function () { return S.id; }
  };
  window.SWSMusic = api;

  try {
    if (window.document && window.document.readyState === 'loading') window.document.addEventListener('DOMContentLoaded', autoboot);
    else autoboot();
  } catch (e) {}
})();
