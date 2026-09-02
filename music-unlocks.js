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
    function withTracks() { try { if (typeof window.LW_FOLD_GAME_UNLOCKS === 'function') window.LW_FOLD_GAME_UNLOCKS(); } catch (e) {} if (window.SWSPlayer) done(); else loadScript('/music-player.js', done); }
    if (window.LW_TRACKS) withTracks(); else loadScript('/music-tracks.js', withTracks);
  }
  function playById(id) { ensurePlayer(function (api) { try { if (!api || !api.play) return; var L = window.LW_TRACKS || [], i; for (i = 0; i < L.length; i++) if (L[i] && L[i].id === id) { api.play(i); return; } } catch (e) {} }); }

  /* ---- one style element for the card and the chip ---- */
  function ensureStyle() {
    if (S.styled) return; S.styled = true;
    try { var d = window.document; var st = d.createElement('style'); st.id = 'sws-music-style';
      st.textContent = '#' + CARD_ID + '{position:fixed;left:0;right:0;bottom:0;z-index:2147482000;box-sizing:border-box;padding:18px 18px calc(18px + env(safe-area-inset-bottom,0px));background:#0d100c;color:#e8dcc8;border-top:1px solid rgba(200,168,75,0.7);border-radius:22px 22px 0 0;box-shadow:0 -10px 30px rgba(0,0,0,0.6);font-family:system-ui,sans-serif;max-height:60vh;overflow:auto}'
        + '#' + CARD_ID + ' .swsm-eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#c8a84b}'
        + '#' + CARD_ID + ' .swsm-row{display:flex;align-items:center;gap:14px;margin:10px 0 14px}'
        + '#' + CARD_ID + ' .swsm-tile{flex:0 0 64px;width:64px;height:64px;border-radius:14px;background:rgba(122,179,86,0.16);border:1px solid rgba(122,179,86,0.5);display:flex;align-items:center;justify-content:center;font-size:30px;color:#7ab356}'
        + '#' + CARD_ID + ' .swsm-tile img{width:100%;height:100%;object-fit:cover;border-radius:14px}'
        + '#' + CARD_ID + ' .swsm-title{font-size:20px;font-weight:700;line-height:1.2;color:#e8dcc8}'
        + '#' + CARD_ID + ' .swsm-sub{font-size:14px;color:#8a9178;margin-top:4px}'
        + '#' + CARD_ID + ' .swsm-btns{display:flex;gap:10px}'
        + '#' + CARD_ID + ' button{flex:1;min-height:48px;border-radius:14px;font-size:16px;font-weight:600;font-family:inherit;cursor:pointer;border:1px solid rgba(200,168,75,0.7);background:transparent;color:#e8dcc8}'
        + '#' + CARD_ID + ' button.swsm-primary{background:#c8a84b;color:#0d100c;border-color:#c8a84b}'
        + '#' + CHIP_ID + '{position:fixed;z-index:2147481000;height:48px;min-width:96px;padding:0 16px;border-radius:14px;border:1px solid rgba(200,168,75,0.6);background:rgba(13,16,12,0.86);color:#e8dcc8;font:600 14px system-ui,sans-serif;white-space:nowrap;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,0.5)}';
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
  function occupancy(x, y) {
    try {
      var d = window.document, stack = d.elementsFromPoint ? d.elementsFromPoint(x, y) : [d.elementFromPoint(x, y)], area = window.innerWidth * window.innerHeight, i;
      for (i = 0; i < stack.length; i++) {
        var el = stack[i]; if (!el || el.id === CHIP_ID || el.id === CARD_ID || (el.closest && el.closest('#' + CARD_ID))) continue;   /* look through our own card */
        if (el === d.body || el === d.documentElement) return 0;
        var r = el.getBoundingClientRect(); if (r.width * r.height >= area * 0.9) continue;
        if (el.closest && el.closest('button,a,[role="button"],input,select,canvas,[onclick]')) return 3;
        var cs = window.getComputedStyle(el);
        if (cs && cs.cursor === 'pointer') return 3;                     /* a div that acts as a button (Deepwell's close glyph) */
        if (textAt(el, x, y)) return 2;                                   /* text AT THE POINT, not anywhere in the element */
        return ((cs.backgroundImage && cs.backgroundImage !== 'none') || (cs.backgroundColor && cs.backgroundColor !== 'transparent' && cs.backgroundColor.replace(/\s/g, '') !== 'rgba(0,0,0,0)')) ? 1 : 0;
      }
    } catch (e) {}
    return 0;
  }
  /* a GRID along the top edge (left to right), then the bottom edge (left to right, stopping short of the feedback fab's
     corner), then the side edges at mid height. Three corners were too coarse: on a busy hub every corner scores, and the
     least bad corner was still somebody's close button. The chip is 97x48; each candidate is its centre. */
  function freeCorner() {
    var W = window.innerWidth || 375, H = window.innerHeight || 667, spots = [], x, i, sc;
    var T = 'top:calc(10px + env(safe-area-inset-top,0px));', B = 'bottom:calc(10px + env(safe-area-inset-bottom,0px));';
    for (x = 10; x + 97 <= W - 10; x += 48) spots.push({ css: 'left:' + x + 'px;' + T, x: x + 48, y: 34 });
    for (x = 10; x + 97 <= W - 130; x += 48) spots.push({ css: 'left:' + x + 'px;' + B, x: x + 48, y: H - 34 });   /* never the bottom right: the feedback fab's */
    spots.push({ css: 'left:10px;top:' + Math.round(H / 2 - 24) + 'px;', x: 58, y: H / 2 });
    spots.push({ css: 'right:10px;top:' + Math.round(H / 2 - 24) + 'px;', x: W - 58, y: H / 2 });
    /* the chip is 97px wide: score its whole footprint (left end, centre, right end), worst point wins */
    /* the chip is 97x48: score a 3x3 grid over its footprint, worst point wins (a centre line alone let it clip a title's top) */
    function footprint(sp) { var worst = 0, dx, dy, sc; for (dy = -16; dy <= 16; dy += 16) for (dx = -40; dx <= 40; dx += 40) { sc = occupancy(sp.x + dx, sp.y + dy); if (sc > worst) worst = sc; if (worst >= 3) return worst; } return worst; }
    var best = spots[0], bestScore = Infinity;
    for (i = 0; i < spots.length; i++) { sc = footprint(spots[i]); if (sc === 0) return spots[i].css; if (sc < bestScore) { bestScore = sc; best = spots[i]; } }
    return best.css;
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
      var corner = freeCorner(); b.setAttribute('data-corner', corner); b.setAttribute('style', corner); b.style.height = '48px';
      b.addEventListener('click', function () { ensurePlayer(function (api) { try { if (api && api.open) api.open(); } catch (e) {} }); });
      d.body.appendChild(b); S.chip = b;
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
      card.style.position = 'fixed'; card.style.bottom = '0px'; card.style.pointerEvents = 'auto';
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
      function close() { try { card.remove(); } catch (x) {} S.card = null; tellGame(false); markRevealed(e.id); S.interacted = true; showNext(); }
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
  window.SWSMusic = api;

  try {
    if (window.document && window.document.readyState === 'loading') window.document.addEventListener('DOMContentLoaded', autoboot);
    else autoboot();
  } catch (e) {}
})();
