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
 *   ladder     track i opens when ANY holds: secs >= secsPer*i · days >= 1+daysPer*i · sessions >= sessionsBase+i
 *              · milestones >= milestonePer*i (a game reports them, see below)
 *              · on a FAMILY shelf, distinct games of the family opened >= 1+breadthPer*i (the more card games you
 *              try, the more you unlock). Numbers come from the catalog's `ladder` (music-ladder.json), defaults below.
 *   off        ?nomusic=1 in the URL, or no catalog, or no identity, or a shelf-less game: no timers.
 *   the moment (P11, Stephen after playing Rabbit Ronin: "i unlocked a song but there didnt seem to be any way to
 *              even play the damn thing"): at BOOT, a fresh or pending song gets a CARD: Congratulations, you unlocked
 *              <title>, <shelf>, art only if the track has any, Listen now / Later. Listen now loads the shared
 *              manifest + player on demand and plays that track. A song earned MID ROUND gets the small toast and
 *              its card at the next boot of any game, the only moment we can be sure nobody is mid play.
 *   milestone  (P12, Stephen after playing Conduit, Sep 02: "it should pause and open up the player and say hey you
 *              unlocked this song, do you want to play this now", and "once you make it to like level 3, you'll
 *              unlock the second song"). A game that knows its own breaks calls SWSMusic.milestone(n) when one
 *              arrives: a site cleared, a round finished. n = how far the player has got (the max is kept; no
 *              argument counts up by one). It is a rung on the ladder (milestonePer 3: level 3 opens track 2) AND
 *              the moment a pending card shows, so the reward lands at a break, never mid round. The card tells
 *              the page it opened and closed (document event swsmusic:card, detail.open) so a game that can hold
 *              its clock does. The time rung is 8 minutes (secsPer 480): the first song loops a couple of times
 *              before the second arrives, and two cards never land back to back.
 *   the chip   one uniform "Music" button, 48px, in a free corner (the exit button's own search, copied),
 *              never bottom right, in every game that lacks the native shell's button. Opens the shared player.
 *
 * ES5 on purpose: this runs inside a hundred pages of varying age. No const,
 * no let, no arrows, no template strings. Everything is wrapped; nothing throws.
 */
(function () {
  'use strict';
  if (window.SWSMusic) return;

  var LS_PROG = 'sws_music_progress', LS_LEDGER = 'sws_game_unlocks', TOAST_ID = 'sws-music-toast';
  var LS_PENDING = 'sws_music_pending_reveal', LS_REVEALED = 'sws_music_revealed', CARD_ID = 'sws-music-card', CHIP_ID = 'sws-music-chip';
  var TICK_MS = 5000, TOAST_MS = 3000, SESSION_SECS = 60, MAX_DAYS = 366;
  var S = { id: null, name: null, booted: false, timer: null, loadSecs: 0, sessionCounted: false, queue: [], showing: false, ticking: false, interacted: false, styled: false, card: null, chip: null, playerCbs: [] };

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
  var LADDER_DEFAULTS = { secsPer: 480, daysPer: 1, sessionsBase: 2, breadthPer: 1, milestonePer: 3 };
  function ladder() { var c = catalog(), L = (c && c.ladder) || {}, out = {}, k; for (k in LADDER_DEFAULTS) out[k] = (typeof L[k] === 'number' && L[k] >= 0) ? L[k] : LADDER_DEFAULTS[k]; return out; }
  /* distinct games of a family shelf this player has opened (every opened game has a progress entry) */
  function breadthOf(shelf, all) { var n = 0, i; if (!shelf || shelf.kind !== 'family' || !shelf.games) return 0; for (i = 0; i < shelf.games.length; i++) if (all[shelf.games[i]] && all[shelf.games[i]].first) n++; return n; }
  function rungOpen(i, p, shelf, all) {
    if (i === 0) return true;
    var L = ladder();
    if ((p.secs | 0) >= L.secsPer * i) return true;
    if ((p.days || []).length >= 1 + L.daysPer * i) return true;
    if ((p.sessions | 0) >= L.sessionsBase + i) return true;
    if (L.milestonePer > 0 && (p.milestones | 0) >= L.milestonePer * i) return true;
    if (shelf && shelf.kind === 'family' && breadthOf(shelf, all) >= 1 + L.breadthPer * i) return true;
    return false;
  }

  /* ---- progress: read, modify, write. Never wholesale. (LAW 1) ------------- */
  function readProgress() { var a = parse(lsGet(LS_PROG), {}); return (a && typeof a === 'object' && !a.length) ? a : {}; }
  function progressFor(all) { var p = all[S.id]; if (!p || typeof p !== 'object') p = {}; if (!p.first) p.first = Date.now(); if (!p.days || !p.days.length) p.days = p.days || []; p.sessions = p.sessions | 0; p.secs = p.secs | 0; p.milestones = p.milestones | 0; if (!p.unlocked) p.unlocked = []; return p; }
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
    for (i = 0; i < shelves.length; i++) for (j = 0; j < shelves[i].tracks.length; j++) if (rungOpen(j, p, shelves[i], all)) grant(shelves[i], shelves[i].tracks[j]);
    for (i = 0; i < p.unlocked.length; i++) if (byId[p.unlocked[i]]) grant(byId[p.unlocked[i]].s, byId[p.unlocked[i]].t);
    lsSet(LS_LEDGER, JSON.stringify(out));                                      /* WRITE */
    try { if (typeof window.LW_FOLD_GAME_UNLOCKS === 'function') window.LW_FOLD_GAME_UNLOCKS(); } catch (x) {}
    return fresh;
  }

  /* ---- pending reveals and revealed songs: small global lists, read-modify-write (LAW 1) ---- */
  function readList(k) { var l = parse(lsGet(k), []); return (l && typeof l.length === 'number') ? l : []; }
  function addPending(e) { var l = readList(LS_PENDING), i; for (i = 0; i < l.length; i++) if (l[i] && l[i].id === e.id) return; l.push({ id: e.id, title: e.title, game: e.game }); lsSet(LS_PENDING, JSON.stringify(l)); }
  function dropPending(id) { var l = readList(LS_PENDING), out = [], i; for (i = 0; i < l.length; i++) if (l[i] && l[i].id !== id) out.push(l[i]); lsSet(LS_PENDING, JSON.stringify(out)); }
  function isRevealed(id) { return readList(LS_REVEALED).indexOf(id) >= 0; }
  function markRevealed(id) { var l = readList(LS_REVEALED); if (l.indexOf(id) < 0) { l.push(id); if (l.length > 500) l.splice(0, l.length - 500); lsSet(LS_REVEALED, JSON.stringify(l)); } dropPending(id); }

  /* ---- the shared manifest + player, loaded on demand, once ---- */
  function loadScript(src, cb) { try { var d = window.document, el = d.createElement('script'); el.src = src; el.async = true; el.onload = cb; el.onerror = cb; (d.head || d.documentElement).appendChild(el); } catch (e) { cb(); } }
  function ensurePlayer(cb) {
    if (window.SWS_MUSIC) return cb(window.SWS_MUSIC);
    S.playerCbs.push(cb); if (S.playerCbs.length > 1) return;
    addChip();                                                        /* Listen now may come before the settle delay: place it now */
    function done() { var api = null; try { var d = window.document, btn = S.chip || d.getElementById('shell-music-btn') || null; if (window.SWSPlayer && window.SWSPlayer.init) api = window.SWSPlayer.init(btn ? { button: btn } : {}); } catch (e) {} api = api || window.SWS_MUSIC || null; var cbs = S.playerCbs; S.playerCbs = []; var i; for (i = 0; i < cbs.length; i++) { try { cbs[i](api); } catch (e) {} } }
    function withTracks() { try { if (typeof window.LW_FOLD_GAME_UNLOCKS === 'function') window.LW_FOLD_GAME_UNLOCKS(); } catch (e) {} if (window.SWSPlayer) done(); else loadScript('/music-player.js?v=20260905a', done); }
    if (window.LW_TRACKS) withTracks(); else loadScript('/music-tracks.js', withTracks);
  }
  function playById(id) { ensurePlayer(function (api) { try { if (!api || !api.play) return; var L = window.LW_TRACKS || [], i; for (i = 0; i < L.length; i++) if (L[i] && L[i].id === id) { api.play(i); return; } } catch (e) {} }); }

  /* ---- one style element for the card and the chip ---- */
  function ensureStyle() {
    if (S.styled) return; S.styled = true;
    try { var d = window.document; var st = d.createElement('style'); st.id = 'sws-music-style';
      st.textContent = '#' + CARD_ID + '{position:fixed;left:12px;right:12px;bottom:12px;max-width:420px;margin:0 auto;border-radius:18px;box-shadow:0 10px 30px rgba(0,0,0,.55);touch-action:none;z-index:2147482000;box-sizing:border-box;padding:18px 18px calc(18px + env(safe-area-inset-bottom,0px));background:#0d100c;color:#e8dcc8;border-top:1px solid rgba(200,168,75,0.7);border-radius:22px 22px 0 0;box-shadow:0 -10px 30px rgba(0,0,0,0.6);font-family:system-ui,sans-serif;max-height:60vh;overflow:auto}'
        + '#' + CARD_ID + ' .swsm-eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#c8a84b;padding-right:44px}'
        + '#' + CARD_ID + ' .swsm-bar{height:22px;margin:-10px 0 4px;display:flex;align-items:center;justify-content:center;cursor:grab}'
        + '#' + CARD_ID + ' .swsm-bar i{display:block;width:44px;height:5px;border-radius:3px;background:rgba(232,220,200,.35)}'
        + '#' + CARD_ID + ' .swsm-min{position:absolute;top:10px;right:10px;width:40px;height:40px;min-height:40px;flex:0 0 auto;padding:0;border-radius:12px;font-size:20px;line-height:1;border:1px solid rgba(232,220,200,.25)!important;background:transparent!important;color:#e8dcc8!important}'
        + '#sws-music-pill{position:fixed;left:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:2147482000;height:48px;padding:0 16px;border-radius:14px;border:1px solid rgba(200,168,75,0.7);background:rgba(13,16,12,0.92);color:#e8dcc8;font:600 14px system-ui,sans-serif;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.5);touch-action:none}'
        + '#' + CARD_ID + ' .swsm-row{display:flex;align-items:center;gap:14px;margin:10px 0 14px}'
        + '#' + CARD_ID + ' .swsm-tile{flex:0 0 64px;width:64px;height:64px;border-radius:14px;background:rgba(122,179,86,0.16);border:1px solid rgba(122,179,86,0.5);display:flex;align-items:center;justify-content:center;font-size:30px;color:#7ab356}'
        + '#' + CARD_ID + ' .swsm-tile img{width:100%;height:100%;object-fit:cover;border-radius:14px}'
        + '#' + CARD_ID + ' .swsm-title{font-size:20px;font-weight:700;line-height:1.2;color:#e8dcc8}'
        + '#' + CARD_ID + ' .swsm-sub{font-size:14px;color:#8a9178;margin-top:4px}'
        + '#' + CARD_ID + ' .swsm-btns{display:flex;gap:10px}'
        + '#' + CARD_ID + ' button{flex:1;min-height:48px;border-radius:14px;font-size:16px;font-weight:600;font-family:inherit;cursor:pointer;border:1px solid rgba(200,168,75,0.7);background:transparent;color:#e8dcc8}'
        + '#' + CARD_ID + ' button.swsm-primary{background:#c8a84b;color:#0d100c;border-color:#c8a84b}'
        + '#' + CHIP_ID + '{position:fixed;z-index:2147481000;height:48px;min-width:96px;padding:0 16px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);box-shadow:0 2px 10px rgba(0,0,0,.45);border-radius:14px;border:1px solid rgba(200,168,75,0.6);background:rgba(13,16,12,0.86);color:#e8dcc8;font:600 14px system-ui,sans-serif;white-space:nowrap;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,0.5)} #' + CHIP_ID + '.swsm-tight{min-width:48px;width:48px;padding:0;font-size:20px;text-align:center}';
      (d.head || d.documentElement).appendChild(st); } catch (e) {}
  }

  /* ---- the chip: the exit button's free-corner search, copied (arcade-exit.js does not export it) ---- */
  /* is there rendered text under (x, y)? Check the element's OWN text nodes' rectangles; a header bar whose title sits
     150px away must not make its blank stretch score as busy. */
  function textAt(el, x, y) {
    try {
      var d = window.document, n = el.childNodes, i, j, rects, range;
      for (i = 0; i < n.length; i++) {
        if (n[i].nodeType !== 3 || !(n[i].nodeValue || '').replace(/\s/g, '')) continue;
        range = d.createRange(); range.selectNodeContents(n[i]); rects = range.getClientRects();
        for (j = 0; j < rects.length; j++) if (x >= rects[j].left - 4 && x <= rects[j].right + 4 && y >= rects[j].top - 4 && y <= rects[j].bottom + 4) return true;
      }
    } catch (e) { return !!(el.textContent || '').replace(/\s/g, ''); }
    return false;
  }
  /* A 2d canvas can be read: a flat patch (a platformer's sky, the dark under a comic panel, an
     idle title canvas) is background, a drawn patch (a pad, a HUD, artwork) is content. WebGL
     and tainted canvases cannot be read and count as content. */
  function canvasScore(el, x, y) {
    try {
      var ctx = el.getContext && el.getContext('2d'); if (!ctx) return 2;
      var r = el.getBoundingClientRect(); if (!r.width || !r.height) return 2;
      var sx = el.width / r.width, sy = el.height / r.height;
      var cx = Math.round((x - r.left) * sx), cy = Math.round((y - r.top) * sy), half = Math.max(4, Math.round(20 * sx));
      var x0 = Math.max(0, cx - half), y0 = Math.max(0, cy - half);
      var w = Math.min(el.width - x0, half * 2), h = Math.min(el.height - y0, half * 2); if (w < 2 || h < 2) return 2;
      var d = ctx.getImageData(x0, y0, w, h).data, i, lo = [255, 255, 255], hi = [0, 0, 0], step = 16;
      for (i = 0; i < d.length; i += step) { for (var c = 0; c < 3; c++) { var v = d[i + c]; if (v < lo[c]) lo[c] = v; if (v > hi[c]) hi[c] = v; } }
      var range = Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]);
      /* a flat patch of canvas scores a hair above plain page background: Burr Blast's comic
         frame lost to the empty dark under its buttons only once these stopped tying */
      return range < 28 ? 1.2 : 2;
    } catch (e) { return 2; }
  }
  function occupancy(x, y) {
    try {
      var d = window.document, stack = d.elementsFromPoint ? d.elementsFromPoint(x, y) : [d.elementFromPoint(x, y)], area = window.innerWidth * window.innerHeight, i, wrappers = [];
      for (i = 0; i < stack.length; i++) {
        var el = stack[i]; if (!el || el.id === CHIP_ID || el.id === CARD_ID || (el.closest && el.closest('#' + CARD_ID))) continue;   /* look through our own card */
        if (el === d.body || el === d.documentElement) return 0;
        var r = el.getBoundingClientRect();
        /* a full screen CANVAS is the game, not a wrapper to look through: Rabbit Ronin draws its
           HUD, its pads and its rabbit on one canvas, and skipping it scored every corner free. It
           scores like text, not like a button: Aura Farm's idle canvas behind its menu modal must
           lose to the menu's buttons, and a canvas game still ties every corner and takes a side. */
        if (el.tagName === 'CANVAS') {
          /* a canvas the looked-through overlay does NOT contain is behind that overlay (Burr
             Blast's idle game canvas under its story screen, Aura Farm's under its menu): it is
             the overlay's ground, not a surface. A canvas inside the wrapper is the surface. */
          for (var k = 0; k < wrappers.length; k++) if (!wrappers[k].contains(el)) return 1;
          return canvasScore(el, x, y);
        }
        if (r.width * r.height >= area * 0.9) { wrappers.push(el); continue; }
        /* a header or HUD bar is never a free corner, whatever its pixel scores as: the shell's
           .shell-hdr (the chip sat on #shell-title in Klondike, Block Drop, Speed Sort), a game's
           own top bar (#hud in Rootbound, #pa-top in Petal Alchemy), anything pinned across the top */
        if (el.closest && el.closest('.shell-hdr,header,nav,[role="banner"],#hud,.hud,#pa-top')) return 3;
        if (r.top <= 8 && r.height <= 80 && r.width >= window.innerWidth * 0.5) return 3;
        if (el.closest && el.closest('button,a,[role="button"],input,select,canvas,[onclick]')) return 3;
        var cs = window.getComputedStyle(el);
        if (cs && cs.cursor === 'pointer') return 3;                     /* a div that acts as a button (Deepwell's close glyph) */
        if (textAt(el, x, y)) {
          /* text in the top band is a HUD or a title (Rabbit Ronin's level name, a score): worse than a
             canvas corner, so on a canvas game the chip takes the sky, not the readout */
          return y < 80 ? 3.2 : 2;                                         /* text AT THE POINT, not anywhere in the element */
        }
        /* a bordered or shadowed panel smaller than the screen is a card, a row, a tile: its
           empty half is not background (the chip sat inside Deepwell's LAMP shop row, scored 1) */
        if (r.width * r.height < area * 0.6 && ((parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none') || (cs.boxShadow && cs.boxShadow !== 'none') || parseFloat(cs.borderTopLeftRadius) > 0)) return 1.5;   /* worse than background, better than the row's own text */
        return ((cs.backgroundImage && cs.backgroundImage !== 'none') || (cs.backgroundColor && cs.backgroundColor !== 'transparent' && cs.backgroundColor.replace(/\s/g, '') !== 'rgba(0,0,0,0)')) ? 1 : 0;
      }
    } catch (e) {}
    return 0;
  }
  /* a GRID along the top edge (left to right), then the bottom edge (left to right, stopping short of the feedback fab's
     corner), then the side edges at mid height. Three corners were too coarse: on a busy hub every corner scores, and the
     least bad corner was still somebody's close button. The chip is 97x48; each candidate is its centre. */
  function freeCorner(prefer) {
    var W = window.innerWidth || 375, H = window.innerHeight || 667, spots = [], x, i, sc;
    var T = 'top:calc(10px + env(safe-area-inset-top,0px));', B = 'bottom:calc(10px + env(safe-area-inset-bottom,0px));';
    /* ⛔ order is the tie break, and the first version listed the top row first: on a title
       screen every slot scores "text", so the chip took spot 0, top left, which is where the
       game's own title lives (Petal Alchemy, Rootbound). Bottom row first, sides, top last. */
    /* sides first: on a canvas game every corner ties, and the middle of the sides is play area
       (sky in a platformer) while the bottom is pads and the top is the HUD. Then the bottom row,
       then the top row last. */
    spots.push({ css: 'left:10px;top:' + Math.round(H / 2 - 24) + 'px;', x: 58, y: H / 2 });
    spots.push({ css: 'right:10px;top:' + Math.round(H / 2 - 24) + 'px;', x: W - 58, y: H / 2 });
    for (x = 10; x + 97 <= W - 130; x += 48) spots.push({ css: 'left:' + x + 'px;' + B, x: x + 48, y: H - 34 });   /* never the bottom right: the feedback fab's */
    for (x = 10; x + 97 <= W - 10; x += 48) spots.push({ css: 'left:' + x + 'px;' + T, x: x + 48, y: 34 });
    /* the chip is 97px wide: score its whole footprint (left end, centre, right end), worst point wins */
    /* the chip is 97x48: score a 3x3 grid over its footprint, worst point wins (a centre line alone let it clip a title's top) */
    function footprint(sp) { var worst = 0, dx, dy, sc; for (dy = -16; dy <= 16; dy += 16) for (dx = -40; dx <= 40; dx += 40) { sc = occupancy(sp.x + dx, sp.y + dy); if (sc > worst) worst = sc; if (worst >= 3) return worst; } return worst; }
    var best = spots[0], bestScore = Infinity, cur = null, curScore = Infinity;
    for (i = 0; i < spots.length; i++) {
      sc = footprint(spots[i]);
      if (prefer && spots[i].css === prefer) { cur = spots[i]; curScore = sc; }
      if (sc < bestScore) { bestScore = sc; best = spots[i]; }
    }
    /* a reseat keeps a corner that is FREE (background at most): a chip sitting on something is
       moved to the first candidate of equal score, so a canvas game that scores every corner the
       same still ends up bottom left and not on its own HUD (Rabbit Ronin after Start Dojo) */
    if (cur && curScore <= bestScore && curScore <= 1) { best = cur; bestScore = curScore; }
    freeCorner.lastScore = bestScore;
    return best.css;
  }
  function applyCorner(b, css) {
    b.setAttribute('data-corner', css); b.setAttribute('style', css); b.style.height = '48px'; b.style.touchAction = 'none';
    /* when every corner is somebody's text or control (Deepwell's shop list under the unlock
       card fills the screen), the chip is a 48px glyph and covers half as much; a later reseat
       that finds a free corner gives it its word back */
    var tight = (freeCorner.lastScore || 0) >= 1.5;
    if (tight !== b._tight) {
      b._tight = tight;
      b.textContent = tight ? '\u266B' : '\u266B Music';
      if (tight) b.classList.add('swsm-tight'); else b.classList.remove('swsm-tight');
    }
  }
  /* The chip used to be placed ONCE, 900 ms after load, against the BOOT layout, and never
     again: 101 of the 186 audited games had it sitting on their own UI once the real screen
     drew (Sep 04 2026). It now re-checks its corner a few times over the first fifteen
     seconds and on resize, and never moves a chip the player has dragged. */
  function reseat() {
    try {
      var b = S.chip; if (!b || b._moved || !window.document.body.contains(b)) return;
      if (lsGet('sws_music_chip_pos')) return;                                   /* the player put it there */
      var css = freeCorner(b.getAttribute('data-corner'));
      if (css && css !== b.getAttribute('data-corner')) applyCorner(b, css);
    } catch (e) {}
  }
  /* for probes: every candidate corner with its score, and a reseat on demand (hung on the api
     object at the end, because the IIFE finishes with window.SWSMusic = api) */
  function cornersDebug() {
      var W = window.innerWidth || 375, H = window.innerHeight || 667, out = [], x;
      var T = 'top:calc(10px + env(safe-area-inset-top,0px));', B = 'bottom:calc(10px + env(safe-area-inset-bottom,0px));';
      var spots = [{ css: 'left:10px;top:' + Math.round(H / 2 - 24) + 'px;', x: 58, y: H / 2 }, { css: 'right:10px;top:' + Math.round(H / 2 - 24) + 'px;', x: W - 58, y: H / 2 }];
      for (x = 10; x + 97 <= W - 130; x += 48) spots.push({ css: 'left:' + x + 'px;' + B, x: x + 48, y: H - 34 });
      for (x = 10; x + 97 <= W - 10; x += 48) spots.push({ css: 'left:' + x + 'px;' + T, x: x + 48, y: 34 });
      for (var i = 0; i < spots.length; i++) { var worst = 0, dx, dy, sc; for (dy = -16; dy <= 16; dy += 16) for (dx = -40; dx <= 40; dx += 40) { sc = occupancy(spots[i].x + dx, spots[i].y + dy); if (sc > worst) worst = sc; } out.push({ css: spots[i].css, score: worst }); }
      return out;
  }
  function reseatDebug() { reseat(); return S.chip ? S.chip.getAttribute('data-corner') : null; }
  function scheduleReseat() {
    try {
      var i, at = [3000, 6000, 10000, 15000, 20000, 30000, 45000, 60000];
      for (i = 0; i < at.length; i++) window.setTimeout(reseat, at[i]);
      /* and a slow standing check after that: screens change at their own times (a drawer closes,
         a run starts), and one check is fourteen spots by nine points of elementsFromPoint, a
         millisecond. It never moves a corner that is already free, so it cannot wander. */
      window.setInterval(reseat, 20000);
      var t = null, c = null;
      window.addEventListener('resize', function () { if (t) window.clearTimeout(t); t = window.setTimeout(reseat, 250); });
      /* a screen change almost always follows a tap (Start Dojo, Free Alchemy, Play it now): re-check
         a moment after any click, so the chip settles on the real screen and not the one it booted on */
      window.document.addEventListener('click', function () { if (c) window.clearTimeout(c); c = window.setTimeout(reseat, 1500); }, true);
    } catch (e) {}
  }
  /* drag a fixed element anywhere; remembers where it was left. A move over 8px swallows the click. */
  function drag(el, key) {
    try {
      var sx = 0, sy = 0, ox = 0, oy = 0, on = false;
      try { var pos = parse(lsGet(key), null); if (pos && pos.x >= 0 && pos.y >= 0 && pos.x < window.innerWidth - 40 && pos.y < window.innerHeight - 40) { el.style.right = 'auto'; el.style.bottom = 'auto'; el.style.left = pos.x + 'px'; el.style.top = pos.y + 'px'; } } catch (x) {}
      el.addEventListener('pointerdown', function (ev) { on = true; el._moved = false; sx = ev.clientX; sy = ev.clientY; var r = el.getBoundingClientRect(); ox = r.left; oy = r.top; try { el.setPointerCapture(ev.pointerId); } catch (x) {} });
      el.addEventListener('pointermove', function (ev) { if (!on) return; var dx = ev.clientX - sx, dy = ev.clientY - sy; if (!el._moved && Math.abs(dx) < 8 && Math.abs(dy) < 8) return; el._moved = true; var W = window.innerWidth, H = window.innerHeight, r = el.getBoundingClientRect(); el.style.right = 'auto'; el.style.bottom = 'auto'; el.style.left = Math.max(0, Math.min(W - r.width, ox + dx)) + 'px'; el.style.top = Math.max(0, Math.min(H - r.height, oy + dy)) + 'px'; });
      function end() { if (!on) return; on = false; if (el._moved) { try { lsSet(key, JSON.stringify({ x: parseFloat(el.style.left), y: parseFloat(el.style.top) })); } catch (x) {} } }
      el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
    } catch (e) {}
  }
  function placeChipLater() {
    try {
      var d = window.document, CHIP_DELAY = 900;
      if (d.readyState === 'complete') window.setTimeout(addChip, CHIP_DELAY);
      else window.addEventListener('load', function () { window.setTimeout(addChip, CHIP_DELAY); });
    } catch (e) {}
  }
  function addChip() {
    try {
      var d = window.document; if (!d.body || S.chip) return;
      if (d.getElementById('shell-music-btn') || d.getElementById(CHIP_ID) || window.SWS_MUSIC || window.SWSPlayer) return;   /* the game already has the player's button */
      S.chipPlaced = true;
      ensureStyle();
      var b = d.createElement('button'); b.id = CHIP_ID; b.type = 'button'; b.textContent = '\u266B Music'; b.setAttribute('aria-label', 'Open the soundtrack');
      applyCorner(b, freeCorner(null));
      b.addEventListener('click', function () { if (b._moved) { b._moved = false; return; } ensurePlayer(function (api) { try { if (api && api.open) api.open(); } catch (e) {} }); });
      drag(b, 'sws_music_chip_pos');
      d.body.appendChild(b); S.chip = b;
      scheduleReseat();
    } catch (e) {}
  }

  /* ---- the card: Congratulations, you unlocked <title>. Play it now / Later. At boot, or at a milestone the game
     reports (a break in play); never mid round. Opening and closing it tells the page (swsmusic:card, detail.open) so a
     game that can hold its clock while the card is up does. ---- */
  function tellGame(open) {
    try {
      var d = window.document, ev = null;
      try { ev = new window.CustomEvent('swsmusic:card', { detail: { open: !!open } }); } catch (e1) { ev = null; }
      if (!ev && d.createEvent) { ev = d.createEvent('CustomEvent'); ev.initCustomEvent('swsmusic:card', false, false, { open: !!open }); }
      if (ev && d.dispatchEvent) d.dispatchEvent(ev);
    } catch (e) {}
  }
  function trackById(id) { var c = catalog(), i, j; if (!c) return null; for (i = 0; i < c.shelves.length; i++) for (j = 0; j < c.shelves[i].tracks.length; j++) if (c.shelves[i].tracks[j].id === id) return { s: c.shelves[i], t: c.shelves[i].tracks[j] }; return null; }
  function showCard(e, more) {
    try {
      var d = window.document; if (!d.body || S.card) return;
      ensureStyle();
      var hit = trackById(e.id), art = hit && hit.t.art ? (catalog().base + hit.s.slug + '/' + hit.t.art) : null;
      var card = d.createElement('div'); card.id = CARD_ID; card.setAttribute('role', 'dialog'); card.setAttribute('aria-label', 'New song unlocked');
      card.style.position = 'fixed'; card.style.pointerEvents = 'auto'; card.setAttribute('data-dock', 'bottom');   /* docked at the bottom until dragged */
      /* 2026-09-02 (Stephen: "the music menu needs to be movable and minimizable"): the card sat
         fixed over the bottom third of every game and ATE the scroll gesture of any menu under it
         (Ripcord's workshop could not be scrolled from the bottom half). It is now a floating panel:
         drag it by the handle, tap the dash or swipe it down to fold it into a pill, and it folds
         itself after twelve idle seconds so it never blocks a menu for long. */
      var bar = d.createElement('div'); bar.className = 'swsm-bar'; bar.innerHTML = '<i></i>'; card.appendChild(bar);
      var minb = d.createElement('button'); minb.type = 'button'; minb.className = 'swsm-min'; minb.id = 'sws-music-min'; minb.textContent = '\u25BE'; minb.setAttribute('aria-label', 'Minimise'); card.appendChild(minb);
      var idle = null, pill = null;
      function armIdle() { try { if (idle) window.clearTimeout(idle); idle = window.setTimeout(minimise, 12000); } catch (x) {} }
      function minimise() {
        try { if (idle) window.clearTimeout(idle); idle = null; card.style.display = 'none';
          if (!pill) { pill = d.createElement('button'); pill.type = 'button'; pill.id = 'sws-music-pill'; pill.textContent = '\u266B New song'; pill.setAttribute('aria-label', 'Show the new song');
            pill.addEventListener('click', function () { if (pill._moved) { pill._moved = false; return; } try { pill.remove(); } catch (x) {} pill = null; card.style.display = ''; armIdle(); });
            drag(pill, 'sws_music_pill_pos'); d.body.appendChild(pill); }
        } catch (x) {}
      }
      minb.addEventListener('click', minimise);
      card.addEventListener('pointerdown', armIdle, true);
      /* the player touched the GAME while the card was up: get out of the way. Found by Ripcord's
         playthrough gate, where the card sat over the Launch button. */
      function outside(ev) { try { if (card.style.display !== 'none' && ev.target && !card.contains(ev.target)) minimise(); } catch (x) {} }
      d.addEventListener('pointerdown', outside, true);
      try { window.SWSMusic = window.SWSMusic || {}; window.SWSMusic.fold = minimise; } catch (x) {}
      /* drag by the handle; a downward flick folds it */
      (function () { var sx = 0, sy = 0, ox = 0, oy = 0, on = false;
        bar.addEventListener('pointerdown', function (ev) { on = true; sx = ev.clientX; sy = ev.clientY; var r = card.getBoundingClientRect(); ox = r.left; oy = r.top; card.style.right = 'auto'; card.style.bottom = 'auto'; card.style.margin = '0'; card.style.left = ox + 'px'; card.style.top = oy + 'px'; try { bar.setPointerCapture(ev.pointerId); } catch (x) {} ev.preventDefault(); });
        bar.addEventListener('pointermove', function (ev) { if (!on) return; var W = window.innerWidth, H = window.innerHeight, r = card.getBoundingClientRect(); var nx = Math.max(0, Math.min(W - r.width, ox + ev.clientX - sx)), ny = Math.max(0, Math.min(H - r.height, oy + ev.clientY - sy)); card.style.left = nx + 'px'; card.style.top = ny + 'px'; });
        function end(ev) { if (!on) return; on = false; var dy = ev.clientY - sy, dx = ev.clientX - sx; if (dy > 60 && Math.abs(dx) < 50) { minimise(); return; } try { lsSet('sws_music_card_pos', JSON.stringify({ x: parseFloat(card.style.left), y: parseFloat(card.style.top) })); } catch (x) {} }
        bar.addEventListener('pointerup', end); bar.addEventListener('pointercancel', end);
      })();
      try { var pos = parse(lsGet('sws_music_card_pos'), null); if (pos && pos.x >= 0 && pos.y >= 0 && pos.x < window.innerWidth - 80 && pos.y < window.innerHeight - 80) { card.style.right = 'auto'; card.style.bottom = 'auto'; card.style.margin = '0'; card.style.left = pos.x + 'px'; card.style.top = pos.y + 'px'; } } catch (x) {}
      armIdle();
      var eyebrow = d.createElement('div'); eyebrow.className = 'swsm-eyebrow'; eyebrow.textContent = 'Congratulations, you unlocked a song' + (more > 0 ? ' and ' + more + ' more' : ''); card.appendChild(eyebrow);
      var row = d.createElement('div'); row.className = 'swsm-row';
      var tile = d.createElement('div'); tile.className = 'swsm-tile';
      if (art) { var img = d.createElement('img'); img.id = 'sws-music-art'; img.src = art; img.alt = ''; tile.appendChild(img); } else { tile.textContent = '\u266B'; }
      row.appendChild(tile);
      var txt = d.createElement('div'); var title = d.createElement('div'); title.className = 'swsm-title'; title.textContent = e.title; var sub = d.createElement('div'); sub.className = 'swsm-sub'; sub.textContent = e.game + ' \u00B7 Stephen'; txt.appendChild(title); txt.appendChild(sub); row.appendChild(txt);
      card.appendChild(row);
      var btns = d.createElement('div'); btns.className = 'swsm-btns';
      var listen = d.createElement('button'); listen.id = 'sws-music-listen'; listen.type = 'button'; listen.className = 'swsm-primary'; listen.textContent = 'Play it now';
      var later = d.createElement('button'); later.id = 'sws-music-later'; later.type = 'button'; later.textContent = 'Later';
      function close() { try { if (idle) window.clearTimeout(idle); d.removeEventListener('pointerdown', outside, true); card.remove(); if (pill) pill.remove(); } catch (x) {} pill = null; S.card = null; tellGame(false); markRevealed(e.id); S.interacted = true; showNext(); }
      listen.addEventListener('click', function () { close(); playById(e.id); });
      later.addEventListener('click', function () { close(); });
      btns.appendChild(listen); btns.appendChild(later); card.appendChild(btns);
      d.body.appendChild(card); S.card = card; tellGame(true);
    } catch (x) {}
  }
  /* at boot or at a milestone: the newest fresh grant, else the newest pending reveal from any game; never mid round */
  function revealPending(fresh) {
    var list = [], i, pend = readList(LS_PENDING);
    for (i = 0; i < fresh.length; i++) if (!isRevealed(fresh[i].id)) list.push(fresh[i]);
    for (i = 0; i < pend.length; i++) if (pend[i] && pend[i].id && !isRevealed(pend[i].id)) list.push(pend[i]);
    if (!list.length) return false;
    showCard(list[list.length - 1], list.length - 1);
    return true;
  }

  /* ---- the toast: one inert pill, three seconds, queued, never while hidden ---- */
  function reduced() { try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; } }
  function showNext() {
    if (S.showing || !S.queue.length || !S.interacted) return;
    var d = window.document; if (!d || !d.body || d.hidden) return;
    var el = d.createElement('div'), st = el.style;
    el.id = TOAST_ID; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
    el.textContent = '♫ New song: ' + S.queue.shift();
    st.position = 'fixed'; st.top = '12px'; st.left = '50%'; st.transform = 'translateX(-50%)';
    st.pointerEvents = 'none'; st.zIndex = '2147483000'; st.maxWidth = '90vw'; st.maxHeight = '44px'; st.boxSizing = 'border-box';
    st.padding = '10px 18px'; st.lineHeight = '20px'; st.fontSize = '14px'; st.fontFamily = 'system-ui, sans-serif';
    st.whiteSpace = 'nowrap'; st.overflow = 'hidden'; st.textOverflow = 'ellipsis';
    st.background = 'rgba(13,16,12,0.96)'; st.color = '#e8dcc8'; st.border = '1px solid rgba(200,168,75,0.7)'; st.borderRadius = '22px';
    st.boxShadow = '0 6px 18px rgba(0,0,0,0.55)';
    if (!reduced()) { st.transition = 'opacity 0.25s'; }
    d.body.appendChild(el); S.showing = true;
    window.setTimeout(function () { try { el.remove(); } catch (e) {} S.showing = false; showNext(); }, TOAST_MS);
  }
  function toast(title) { S.queue.push(String(title)); showNext(); }
  /* first interaction opens the toast gate; passive, no preventDefault, removed after one use */
  function onFirstInteraction() {
    S.interacted = true;
    try { var d = window.document, i; for (i = 0; i < INTERACT.length; i++) d.removeEventListener(INTERACT[i], onFirstInteraction, true); } catch (e) {}
    showNext();
  }
  var INTERACT = ['pointerdown', 'touchstart', 'keydown'];
  function armInteraction() { try { var d = window.document, i; for (i = 0; i < INTERACT.length; i++) d.addEventListener(INTERACT[i], onFirstInteraction, true); } catch (e) {} }

  /* ---- the tick: 5s while visible, cleared when hidden. Never rAF. ----------- */
  function tick() {
    try {
      var d = window.document; if (d && d.hidden) return;
      S.loadSecs += TICK_MS / 1000;
      writeProgress(function (p) { p.secs += TICK_MS / 1000; if (!S.sessionCounted && S.loadSecs >= SESSION_SECS) { p.sessions += 1; S.sessionCounted = true; } });
      var fresh = rebuild(), i; for (i = 0; i < fresh.length; i++) { addPending(fresh[i]); toast(fresh[i].title); }
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
      armInteraction();
      writeProgress(function (p) { var t = today(); if (p.days.indexOf(t) < 0) { p.days.push(t); if (p.days.length > MAX_DAYS) p.days.splice(0, p.days.length - MAX_DAYS); } });
      var fresh = rebuild();
      /* the chip waits for the page to SETTLE: at DOMContentLoaded most games have not drawn their HUD yet, and a corner
         that measures empty now gets painted under a moment later (Deepwell's close button, P11 LOOK). */
      placeChipLater();
      /* the moment: a card at boot for the fresh song, or one earned mid round in ANY game last time; no toast for it */
      if (!revealPending(fresh)) { var i; for (i = 0; i < fresh.length; i++) toast(fresh[i].title); }
      if (!shelvesFor(S.id).length) { log('no shelf for ' + S.id + ', visit recorded, no ticks'); return; }
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
        var fresh = rebuild(); for (i = 0; i < fresh.length; i++) { addPending(fresh[i]); toast(fresh[i].title); }
        return true;
      } catch (e) { return false; }
    },
    /* a break in play the game knows about: a site cleared, a round finished. n = how far the player has got (max kept);
       no argument counts up by one. A rung on the ladder, and the moment a pending card shows. */
    milestone: function (n) {
      try {
        if (!S.id || !catalog()) return false;
        var cur = (progressFor(readProgress()).milestones | 0);
        n = (n === undefined || n === null) ? cur + 1 : Number(n);
        if (!(n > 0)) return false;
        writeProgress(function (p) { if (n > (p.milestones | 0)) p.milestones = n; });
        var fresh = rebuild(), i; for (i = 0; i < fresh.length; i++) addPending(fresh[i]);
        if (!revealPending(fresh)) { for (i = 0; i < fresh.length; i++) toast(fresh[i].title); }
        return true;
      } catch (e) { return false; }
    },
    id: function () { return S.id; },
    /* a game may open the shared player itself (the uniform chip does the same) */
    openPlayer: function () { try { ensurePlayer(function (api) { try { if (api && api.open) api.open(); } catch (e) {} }); } catch (e) {} }
  };
  try { api.corners = cornersDebug; api.reseat = reseatDebug; } catch (e) {}
  window.SWSMusic = api;

  try {
    if (window.document && window.document.readyState === 'loading') window.document.addEventListener('DOMContentLoaded', autoboot);
    else autoboot();
  } catch (e) {}
})();
