/* ════════════════════════════════════════════════════════════════════
 * Sky Wolf Studios — /play/ shell runtime
 *
 *   Hosted at: https://lucidwinds.com/play/shell.js
 *   Version:   1.0.0
 *
 * Provides everything a single Lucid Winds modular game needs to run
 * standalone, OUTSIDE the LW IIFE chain:
 *
 *   1. window._G — the shared utility API every game destructures.
 *      Same surface as LW's _G but backed by shell-local state +
 *      Sunbeam SDK (for earn). Most utilities mirror the LW reference
 *      implementations 1:1 (sh, _gr, _sr) so games behave identically.
 *
 *   2. window._gameFns — the registration map games append to.
 *      The shell reads this after the game module has loaded and
 *      mounts the game into #fg-ag.
 *
 *   3. window._lwRegisterGameCleanup — no-op for the shell; pages
 *      tear down via tab close instead of in-app navigation.
 *
 *   4. window.LW_PLAY — set by each /play/<id>.html before loading
 *      this script. Shape: { id: 'memory', name: 'Memory' }.
 *
 *   5. Page lifecycle: waits for Sunbeam SDK + DOM ready + the game
 *      module's _gameFns[id] registration, then mounts.
 *
 *   6. Wallet widget in shell header — refreshes on every earn /
 *      claim / auth change.
 *
 * Design rules (do not break):
 *   - Never write to LW's `sws_hash_ledger` localStorage key. Sunbeams
 *     here flow through the Sunbeam SDK only (which uses
 *     `sws_pending_sunbeams` for anon, server `hashLedger` for authed).
 *   - Plant minting lives only in Lucid Winds. Shells never call
 *     Sunbeam.mintPlant — signed-in players who want to grow plants
 *     visit lucidwinds.com directly. The SDK keeps the method
 *     available so LW itself can use it; shells just don't surface it.
 *   - All utility implementations are TRANSPARENT mirrors of LW's
 *     internals — copying behavior, not pretending to be smarter.
 *
 * ════════════════════════════════════════════════════════════════════ */

/* perf-lite detection — 2026-06-15. The main app (index.html) auto-throttles
 * low-end devices, but the public portal/shells had NO governor. This mirrors
 * index.html's detector (cores/mem/old-iOS/Android + the lw_perf_lite override
 * Stephen's "Reduce Effects" toggle writes) and tags <html> before first paint
 * so shell.css can drop expensive effects (e.g. the blurred sticky header) on
 * weak library tablets. Runs first so the class is set before the body renders. */
(function(){
  var o = null;
  try { o = localStorage.getItem('lw_perf_lite'); } catch(e){}
  var lite = false;
  if (o === '1') lite = true;
  else if (o === '0') lite = false;
  else {
    var c = navigator.hardwareConcurrency || 2;
    var m = navigator.deviceMemory || 0;
    var ua = navigator.userAgent || '';
    if (c <= 4) lite = true;
    if (m > 0 && m <= 4) lite = true;
    if (/iPhone|iPad|iPod/.test(ua)) {
      var x = ua.match(/OS (\d+)/);
      if (x && parseInt(x[1], 10) < 16) lite = true;
      if (c <= 2) lite = true;
    }
    if (/Android/.test(ua) && c <= 4) lite = true;
  }
  if (lite && document.documentElement) document.documentElement.classList.add('perf-lite');
  window._perfLite = lite;
})();

(function(global){
  'use strict';

  var VERSION = '1.0.0';
  var LW_PLAY = global.LW_PLAY || { id: 'unknown', name: 'Game' };

  // ── Game registration map (mirror LW's pattern) ──
  global._gameFns = global._gameFns || {};
  // No-op cleanup registry (some games hook into this for audio teardown
  // before LW tears down the canvas; in the shell, the user closes the
  // tab so we don't need to call back. We still accept registrations.)
  var _cleanupFns = [];
  global._lwRegisterGameCleanup = function(fn){ if (typeof fn === 'function') _cleanupFns.push(fn); };

  // ── Shell state ──
  var state = {
    startedAt: 0,                // session timer for anti-farm guards
    multiplier: 1,                // _m mirror (difficulty multiplier output)
    bal: 0,                       // confirmed sunbeams (mirror of vault)
    pending: 0,                   // pending sunbeams (anon bucket)
    signedIn: false
  };

  // ── Per-event earn amounts ──
  // Calibrated to LW's per-game `_aw` table at index.html:62004-62073.
  // The shell pays a FLAT amount per event type (no per-game override —
  // a player gets the same `progress` value in chess and in memory),
  // but the constants below match LW's *majority* value for each event
  // so the cross-surface divergence is minimal. See EARN_AUDIT.md §5
  // Option B for context. When the cosmetics MVP starts, the long-term
  // answer is to move LW's _aw table into a shared file both surfaces
  // read (STUDIO_PLAN.md §5 phase 5) — until then, these flat defaults
  // are the closest parity available without touching index.html.
  //
  // Values derived from LW's _aw table:
  //   progress      → LW majority is 1 (every game using it)
  //   milestone     → LW majority is 1; a few games use 2
  //   cleared       → LW mines uses 1
  //   capture       → LW checkers uses 1
  //   flip          → LW reversi uses 1
  //   hit           → LW battleship uses 1
  //   sequence      → no LW entry; flatten to 1
  //   pheno         → LW set uses 1 (set is hub-only; this is theoretical)
  //   puzzle_solved → no LW entry; conservative 3
  //   game_win      → LW range 2-8 (avg 4.5, median bucket 4-5); pick 4
  //                   to land at the bottom of the median range so casual
  //                   shell players are slightly under-paid vs hub on the
  //                   highest-tuned games (chess, spider — LW pays 8) and
  //                   slightly over-paid on the cheapest (memory, lights,
  //                   flood, simon — LW pays 2). Net flat ~= LW median.
  //   game_loss     → LW majority is 1 (kept — losing all session and
  //                   earning zero would feel punishing on a casual surface)
  var EARN = {
    progress:      1,
    milestone:     1,   // was 2
    cleared:       1,   // was 2
    capture:       1,   // was 2
    flip:          1,
    hit:           1,
    sequence:      1,   // was 2
    pheno:         1,   // was 3
    puzzle_solved: 3,   // was 5
    game_win:      4,   // was 8
    game_loss:     1
  };

  // ── Sound effects via Web Audio (single shared context, created lazily
  // on first user gesture to satisfy iOS autoplay policy).
  var _ac = null;
  function _audioCtx() {
    if (_ac) return _ac;
    try { _ac = new (global.AudioContext || global.webkitAudioContext)(); }
    catch (e) { _ac = null; }
    return _ac;
  }
  function _beep(freq, durMs, type, gain) {
    var ctx = _audioCtx();
    if (!ctx) return;
    var t0 = ctx.currentTime;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.18, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + (durMs / 1000));
    osc.connect(g); g.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + (durMs / 1000));
  }
  function _playSfx(name) {
    if (!name) return;
    switch (name) {
      case 'match':    _beep(880, 160, 'sine');    _beep(1320, 160, 'sine'); break;
      case 'flip':     _beep(440, 90, 'square', 0.10); break;
      case 'hash':     _beep(990, 120, 'triangle', 0.14); break;
      case 'click':    _beep(660, 60, 'square', 0.08); break;
      case 'buzz':     _beep(160, 220, 'sawtooth', 0.13); break;
      case 'lose':     _beep(220, 320, 'sawtooth', 0.13); break;
      case 'win':      _beep(660, 160, 'sine'); setTimeout(function(){ _beep(990, 180, 'sine'); }, 110); setTimeout(function(){ _beep(1320, 280, 'sine'); }, 240); break;
      default:         _beep(660, 90, 'sine', 0.10);
    }
  }

  // ── LW-mirror utilities (sh, _gr, _sr — copied verbatim from LW) ──
  function sh(a){
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  var RK = 'sws_fg_gr3';   // same key LW uses, so records are shared
  function _gr() {
    try { return JSON.parse(localStorage.getItem(RK)) || {}; } catch (e) { return {}; }
  }
  function _sr(g, r) {
    var c = _gr();
    if (!c[g]) c[g] = { p: 0, w: 0, b: 0 };
    c[g].p++;
    if (r && r.w) c[g].w++;
    if (r && r.s > c[g].b) c[g].b = r.s;
    try { localStorage.setItem(RK, JSON.stringify(c)); } catch (e) {}
  }

  // ── DOM helpers used by ms / mm / mc / sm. The classnames here (.gu-bar,
  // .gh, .gm, .gcr) come from shared.css so the in-game styling matches LW.
  function ms(container, html) {
    var tb = document.createElement('div');
    tb.className = 'gu-bar';
    tb.innerHTML = '<div class="gu-left">' + (html || '') + '</div>'
      + '<div class="gu-right">'
      + '<span class="gh">⚡<strong id="_h">' + state.multiplier + '</strong></span>'
      + ' · ⏱<span id="_tt">0:00</span>'
      + '</div>';
    container.appendChild(tb);
  }
  function mm(container, text) {
    var d = document.createElement('div');
    d.className = 'gm';
    d.id = '_gm';
    d.textContent = text || '';
    container.appendChild(d);
  }
  function mc(container) {
    var d = document.createElement('div');
    d.className = 'gcr';
    container.appendChild(d);
    return d;
  }
  function sm(t) {
    var m = document.getElementById('_gm');
    if (m) m.textContent = t;
  }

  // ── Difficulty multiplier (mirrors LW's _setDiff) ──
  function setDiff(level) {
    switch (level) {
      case 'easy':   state.multiplier = 1.0; break;
      case 'medium': state.multiplier = 1.5; break;
      case 'hard':   state.multiplier = 2.0; break;
      case 'expert': state.multiplier = 2.5; break;
      default:       state.multiplier = 1.0;
    }
  }

  // ── Solitaire fullscreen no-ops (shell is full-page already) ──
  function solEnterFS(){ document.body.classList.add('shell-solitaire'); }
  function solClearFS(){}
  function solExitFS(){  document.body.classList.remove('shell-solitaire'); }

  // ── Session timer ──
  function st() { state.startedAt = Date.now(); }
  function xt() { state.startedAt = 0; }

  // ── The earn event handler (Sunbeam SDK bridge) ──
  function _earn(eventName) {
    var base = EARN[eventName] || EARN[eventName.replace(/_\d+$/, '')] || 0;
    // Anti-farm: completion events need at least 6 seconds of play time.
    if ((eventName === 'game_win' || eventName === 'game_loss') && state.startedAt > 0) {
      var elapsed = (Date.now() - state.startedAt) / 1000;
      if (elapsed < 6) base = 0;
    }
    var amt = Math.round(base * (state.multiplier || 1));
    if (amt <= 0) return;
    if (global.Sunbeam && typeof global.Sunbeam.earn === 'function') {
      var source = LW_PLAY.id + ':' + eventName;
      global.Sunbeam.earn(amt, source).then(function(r){
        if (r && typeof r.balance === 'number') state.bal = r.balance;
        if (r && typeof r.pending === 'number') state.pending = r.pending;
        renderWallet();
        showToast('+' + amt + ' ☀');
      }).catch(function(){ /* defensive; SDK degrades silently */ });
    }
    // Local "_h" badge (the gu-bar progress counter) bumps too if present.
    var hEl = document.getElementById('_h');
    if (hEl) hEl.textContent = (parseInt(hEl.textContent, 10) || 0) + amt;
  }

  // ── _G — the shared API every modular game destructures.
  global._G = {
    e:           _earn,
    play:        _playSfx,
    playWin:     function(){ _playSfx('win'); },
    st:          st,
    xt:          xt,
    sm:          sm,
    ms:          ms,
    mm:          mm,
    mc:          mc,
    sh:          sh,
    sr:          _sr,
    gr:          _gr,
    setDiff:     setDiff,
    solEnterFS:  solEnterFS,
    solClearFS:  solClearFS,
    solExitFS:   solExitFS,
    getM:        function(){ return state.multiplier; },
    setM:        function(v){ state.multiplier = v; }
  };

  // ── Stub onclick globals some game files reference inside ms()'s
  // toolbar. In the shell we hide that toolbar (.gu-bar { display:none })
  // but the symbols may still be looked up — provide harmless no-ops.
  global.triggerTutorialDemo = function(){};
  global._toggleCB           = function(){};
  global.openShop            = function(){};
  global._updateGP           = function(){};

  // ── LW plant renderer stub.
  // merge (2048) is the only modular game that reads
  // window._generatePlantSVG directly to render its numbered tiles as
  // plant art. _generatePlantSVG is defined inside LW's main IIFE in
  // index.html and isn't exposed for external loads. Without a stub
  // the tiles render as 🔥 emoji fallbacks (the inline-catch in merge.js
  // line 28).
  //
  // This stub generates a botanical-themed SVG keyed by the hash so
  // each tile value has a stable, visually distinct render. It is NOT
  // a faithful copy of LW's renderer — that one builds layered plant
  // art with companions, mutations, auras, etc. and depends on
  // hashToTraits + getTerraGrade + many trait banks. Here we just
  // produce a colored leaf-in-pot that's legible at 56×56.
  global._generatePlantSVG = function(hash, size){
    var s = size || 56;
    var h = String(hash || '');
    if (h.length < 12) h = (h + '0000000000000000').slice(0, 16);
    function byte(i){ return parseInt(h.substr(i * 2, 2), 16) || 0; }
    var leafHue   = Math.floor(byte(0) * 360 / 256);
    var leafLight = 30 + Math.floor(byte(1) * 30 / 256);
    var potHue    = Math.floor(byte(2) * 60 / 256) + 20;
    var stemBend  = (byte(3) - 128) / 256;
    var flowerOn  = byte(4) > 80;
    var flowerHue = Math.floor(byte(5) * 360 / 256);
    var leafColor   = 'hsl(' + leafHue + ',60%,' + leafLight + '%)';
    var leafColor2  = 'hsl(' + leafHue + ',70%,' + Math.max(20, leafLight - 10) + '%)';
    var potColor    = 'hsl(' + potHue + ',45%,40%)';
    var potRim      = 'hsl(' + potHue + ',45%,32%)';
    var flowerColor = 'hsl(' + flowerHue + ',75%,65%)';
    var stemX = 16 + stemBend * 4;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="' + s + '" height="' + s + '" style="display:block">';
    svg += '<defs><linearGradient id="lg' + h.substr(0,6) + '" x1="0" y1="0" x2="0" y2="1">';
    svg += '<stop offset="0%" stop-color="' + leafColor + '"/>';
    svg += '<stop offset="100%" stop-color="' + leafColor2 + '"/>';
    svg += '</linearGradient></defs>';
    // pot
    svg += '<path d="M9 24 L23 24 L21 30 L11 30 Z" fill="' + potColor + '" stroke="' + potRim + '" stroke-width="0.8" stroke-linejoin="round"/>';
    svg += '<path d="M8 22 L24 22 L23.5 24 L8.5 24 Z" fill="' + potRim + '"/>';
    // stem
    svg += '<path d="M16 23 Q' + stemX + ' 16 ' + (16 + stemBend * 2) + ' 11" stroke="' + leafColor2 + '" stroke-width="1.2" fill="none" stroke-linecap="round"/>';
    // left leaf
    svg += '<ellipse cx="' + (stemX - 3) + '" cy="17" rx="3.5" ry="2" fill="url(#lg' + h.substr(0,6) + ')" transform="rotate(-25 ' + (stemX - 3) + ' 17)"/>';
    // right leaf
    svg += '<ellipse cx="' + (stemX + 3) + '" cy="14" rx="3.5" ry="2" fill="url(#lg' + h.substr(0,6) + ')" transform="rotate(25 ' + (stemX + 3) + ' 14)"/>';
    // optional flower at top
    if (flowerOn) {
      svg += '<circle cx="' + (16 + stemBend * 2) + '" cy="10" r="2.2" fill="' + flowerColor + '" stroke="' + leafColor2 + '" stroke-width="0.5"/>';
      svg += '<circle cx="' + (16 + stemBend * 2) + '" cy="10" r="0.8" fill="hsl(' + flowerHue + ',70%,40%)"/>';
    }
    svg += '</svg>';
    return svg;
  };

  // ── LW context signals that game render loops guard on ──
  // Many games check `_a === '<their-id>'` on every render frame to
  // detect "is this game still mounted in LW's game tab?" — bloomwheel
  // (line 167), petalfall (line 782), sokoban (line 339). And eleven
  // others check `document.body.classList.contains('game-active')` for
  // the same purpose — colorsort, mastermind, petalmatch, pottingbench,
  // recall, rootrush, seedtoss2, sprout, stonegarden, stopten,
  // vinecross. Without these signals, the render loop early-returns
  // every frame and nothing draws.
  //
  // In a shell, the entire page IS the game. _a can be set immediately
  // (no DOM needed). The body class has to wait until <body> exists —
  // shell.js loads in <head>, so document.body is null at this point.
  // The class-add lives inside init() below, which runs at
  // DOMContentLoaded when body is guaranteed.
  global._a = LW_PLAY.id;

  // ════════════════════════════════════════════════════════════════════
  // ── Shell page chrome lifecycle ──
  // ════════════════════════════════════════════════════════════════════

  function showToast(msg) {
    var el = document.getElementById('shell-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'shell-toast';
      el.id = 'shell-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._hideT);
    el._hideT = setTimeout(function(){ el.classList.remove('show'); }, 1500);
  }

  function renderWallet() {
    var bal = document.getElementById('shell-bal');
    var pend = document.getElementById('shell-pend');
    var btn = document.getElementById('shell-signin');
    if (bal) bal.textContent = state.bal || 0;
    if (pend) pend.textContent = state.pending > 0 ? ('(+' + state.pending + ' pending)') : '';
    if (btn) {
      // Plant minting lives only inside Lucid Winds. Standalone shells
      // are the play surface — signed-in players use the link to visit
      // LW when they want to grow plants. Anonymous players see the
      // save-your-sunbeams prompt.
      if (state.signedIn) {
        btn.textContent = '🌿 Lucid Winds →';
        btn.title = 'Visit Lucid Winds to grow plants from your sunbeams';
        btn.classList.add('shell-cta-visit');
      } else {
        btn.textContent = 'Sign in to save';
        btn.title = 'Save your sunbeams across every game in the studio';
        btn.classList.remove('shell-cta-visit');
      }
    }
  }

  function showSignInModal() {
    if (document.getElementById('shell-modal-backdrop')) return;
    var bd = document.createElement('div');
    bd.id = 'shell-modal-backdrop';
    bd.className = 'shell-modal-backdrop';
    bd.innerHTML = '<div class="shell-modal">'
      + '<h3>💾 Save your sunbeams</h3>'
      + '<p>Sign in to keep your studio sunbeams across devices. You can spend them on plants in <b>Lucid Winds</b> or on cosmetics for your favorite games.</p>'
      + '<div class="shell-modal-actions">'
      + '  <button class="shell-secondary" id="shell-modal-cancel">Not now</button>'
      + '  <button class="shell-primary" id="shell-modal-signin">Sign in with Google</button>'
      + '</div></div>';
    document.body.appendChild(bd);
    document.getElementById('shell-modal-cancel').onclick = function(){ document.body.removeChild(bd); };
    document.getElementById('shell-modal-signin').onclick = function(){
      try {
        if (global.Sunbeam && global.Sunbeam.signInWithGoogle) {
          global.Sunbeam.signInWithGoogle().catch(function(){});
        }
      } catch (e) {}
      document.body.removeChild(bd);
    };
  }

  function wireWalletButton() {
    var btn = document.getElementById('shell-signin');
    if (!btn) return;
    btn.addEventListener('click', function(){
      if (state.signedIn) {
        // Signed-in players → visit Lucid Winds to spend sunbeams on plants.
        // (Cosmetic spend will live in each game's own UI once shipped.)
        try { global.location.href = 'https://lucidwinds.com/'; } catch (e) {}
      } else {
        showSignInModal();
      }
    });
  }

  function setTitle() {
    var t = document.getElementById('shell-title');
    if (t) t.textContent = LW_PLAY.name || 'Game';
    document.title = (LW_PLAY.name || 'Play') + ' — Sky Wolf Studios';
  }

  // ── Mount the game once everything is ready ──
  function tryMount() {
    var mountEl = document.getElementById('fg-ag');
    if (!mountEl) {
      var host = document.getElementById('shell-mount');
      if (!host) return false;
      mountEl = document.createElement('div');
      mountEl.id = 'fg-ag';
      mountEl.className = 'on';
      mountEl.setAttribute('data-game', LW_PLAY.id);
      host.appendChild(mountEl);
    }
    var fn = global._gameFns[LW_PLAY.id];
    if (typeof fn !== 'function') return false;
    try {
      mountEl.innerHTML = '';
      fn(mountEl);
      return true;
    } catch (err) {
      mountEl.innerHTML = '<div style="padding:30px;color:#c75050;text-align:center;font-size:14px">'
        + 'Could not start ' + (LW_PLAY.name || LW_PLAY.id) + ': ' + (err && err.message || err) + '</div>';
      try { if (global.console) console.error('[shell mount]', err); } catch (e) {}
      return true;  // mounted (with error) — stop polling
    }
  }

  // Init flow:
  //  1. DOM ready
  //  2. Sunbeam SDK reachable (or skip if offline)
  //  3. Game module loaded (_gameFns[id] defined)
  //  4. Mount + wire wallet + start refresh loop
  // ── Per-game "How to play" text. Sourced from portal/index.html's
  // GAMES array (the same text shown on the portal cards). Single
  // source: when LW_PLAY.howto is set in a per-game HTML it wins;
  // otherwise we look it up here. ──
  var HOWTO = {
    set:           "Tap 3 cards where each trait — color, shape, count, shading — is ALL same or ALL different. That's a Pheno.",
    stopten:       "Tap to start the clock. Tap again to stop it. Goal: stop at exactly 10.00 seconds. Closer = better.",
    memory:        "Flip two cards a turn. When they match, they stay flipped. Clear the board.",
    simon:         "Watch the lights flash a pattern, then repeat it by tapping the lights in order. The pattern grows.",
    dailybloom:    "Daily cognitive workout. 8 different exercises across memory, attention, speed, working memory. About 4 minutes total.",
    numbergarden:  "60-second arithmetic drill. Add, subtract, multiply. Build a streak for bonus points.",
    recall:        "Watch symbols flash, then count backward, then tap the symbols you saw. Working-memory recall.",
    pottingbench:  "Speed card sorting. Each card has multiple attributes; send it to whichever pile shares an attribute. Clear the deck fast.",
    merge:         "Swipe or tap arrows to merge same-number tiles. Reach 2048.",
    lights:        "Tap a light to toggle it AND its four neighbors. Turn every light off.",
    flood:         "Tap a color to flood-fill from the top-left corner. Fill the whole board in the fewest moves.",
    sudoku:        "Fill every row, every column, and every 3×3 box with the digits 1-9. No repeats.",
    slider:        "Slide tiles into the empty space. Arrange them in numerical order.",
    mines:         "Tap to dig. Numbers tell you how many mines are adjacent. Long-press to flag a mine. Dig every safe square.",
    hanoi:         "Move all the discs onto the far peg. Only one disc at a time; a larger disc can never sit on a smaller one.",
    picross:       "Numbers above each column and beside each row tell you which squares to fill in. Reveal the picture.",
    sokoban:       "Push crates onto the targets. You can only push — never pull. Plan ahead.",
    colorsort:     "Pour pollen between vials. Same colors stack. Each vial sorted to one color wins.",
    rootrush:      "Slide each root tile along its grain to clear a path. Free the sprouting seed through the gap on the right.",
    rootflow:      "Connect every pair of matching roots. Paths can't cross. Every cell must be filled.",
    rootmaze:      "Navigate the shifting maze. Reach the treasure before the AI does.",
    pipe:          "Rotate vine tiles to connect the flow from source to end.",
    gardenlines:   "Place tiles to build matching lines — same shape OR same color. Score points for longer lines.",
    kakuro:        "Like a crossword with numbers. Fill cells 1-9 so each run adds to its clue. No repeats within a run.",
    mosaic:        "Pull colored tiles to fill mosaic rows. Complete rows for points.",
    petalfall:     "Falling blocks. Arrange them to clear horizontal lines. Speed ramps up.",
    petalmatch:    "Swap adjacent gems to make a line of 3 or more. Chain cascades for combos.",
    jade:          "Mahjong-style. Match pairs of free tiles (no tile blocking it on the side) to clear the turtle.",
    sprout:        "Find the hidden 5-letter word in 6 guesses. Green = right letter, right spot. Gold = right letter, wrong spot.",
    vinewords:     "Connect adjacent letters (including diagonal) to spell words. 2-minute timer. Longer words score more.",
    wordsearch:    "Swipe across letters in any direction — forward, backward, diagonal — to find each themed word.",
    chess:         "Classic chess against the AI. Tap a piece, tap where to move. Check the king, mate it.",
    checkers:      "Jump opponent pieces to capture. Reach the far side to crown a King — Kings move backward too.",
    reversi:       "Place a piece to flank opponent pieces between yours; flanked pieces flip to your color. Most territory wins.",
    backgammon:    "Roll the dice, move your pieces around the board, bear all 15 off before your opponent.",
    mastermind:    "Crack the hidden 4-color code. Green peg = right color, right slot. Gold peg = right color, wrong slot.",
    c4:            "Drop pieces into columns. Connect four in a row — horizontal, vertical, or diagonal — to win.",
    battleship:    "Hunt your opponent's hidden vessels on a 10×10 grid. Sink them all in the fewest shots.",
    vinecross:     "Get five of your pieces in a row before the AI does. 9, 11, or 13 board sizes.",
    seedsow:       "Mancala. Sow seeds counter-clockwise around the board. Capture into your store. First to empty wins.",
    pollen:        "Engine-builder. Collect pollen, plant gardens that produce more pollen, attract pollinators. Race to 15 Growth.",
    livingstones:  "Go. Place stones on grid intersections to surround opponent stones and capture territory. 24 puzzles + full play vs MCTS AI.",
    trellis:       "Word-builder on a 15×15 grid. Premium squares double or triple letter/word scores. AI opponent.",
    klondike:      "Classic solitaire. Build four foundation piles Ace to King by suit. Alternating colors on the tableau.",
    spider:        "Build complete King-to-Ace runs by suit. 1 suit (easiest), 2 suits, or 4 suits (hardest).",
    freecell:      "All cards visible. Use the four free cells as temporary holding spots to rearrange runs.",
    pyramid:       "Remove pairs of cards that sum to 13. Kings (value 13) remove alone. Clear the pyramid.",
    tripeaks:      "Build up or down by one rank on the waste pile to clear the three peaks.",
    golf:          "Move cards one rank up or down to the waste pile. Clear the tableau.",
    cribbage:      "Pegging + counting card combinations. Reach 121 points first.",
    bowergarden:   "Euchre. 4-player trick-taking with bowers. You + AI partner vs 2 AI opponents. First to 10 points wins.",
    bleedinghearts:"Hearts. Avoid taking hearts (1 pt each) and the Queen of Spades (13 pts). Lowest score wins. Shoot the moon for the reverse.",
    gardenspades:  "Spades is always trump. Bid your tricks at the start of each hand; meet or exceed your bid to score.",
    juniper:       "Draw + discard. Build sets (three of a kind) and runs (three sequential same-suit). First to go out wins.",
    farkle:        "Roll 6 dice. Keep scoring dice (1s, 5s, three-of-a-kinds). Bank your score or risk another roll. Roll zero scorers = bust.",
    yahtzee:       "Five dice, three rolls per turn. Hold the dice you want, re-roll the rest. Fill 13 scoring categories.",
    doubleshutter: "Roll two dice; shut any open tiles that sum to your roll. Once 7/8/9 are down, roll one die. Shut both rows = perfect game.",
    song:          "Multi-track music studio. Layer drums, bass, keys, leads. Make beats. Earn sunbeams for sustained creation.",
    bloomwheel:    "Draw on a spinning canvas synced to a generative beat. Mandala mode mirrors your stroke around the wheel.",
    breathing:     "Guided breathing exercises across 4 patterns. Inhale as the bloom opens, exhale as it closes.",
    rhythmvine:    "Falling-note rhythm game. Tap each lane as the notes hit the line. Perfect / Great / Good timing windows.",
    colorgarden:   "Tap to fill botanical coloring pages. 23 colors. Sustained coloring earns sunbeams.",
    pixelgarden:   "Pixel-art painter. 24 botanical colors. Draw, erase, fill, pick, mirror. Save as PNG.",
    storyseeds:    "Daily creative-writing prompts. Save your entries; sunbeams reward sustained writing.",
    stonegarden:   "Stack stones in zen balance toward a target height. Real two-finger multi-touch physics — finger 1 lifts, finger 2 rotates.",
    seedtoss2:     "Flick the seed into the pot. Drag from the seed, release to throw — speed + angle determine the toss. Wind kicks in at higher levels."
  };

  function injectHowToButton() {
    var hdr = document.querySelector('.shell-hdr');
    if (!hdr) return;
    if (document.getElementById('shell-howto')) return;  // idempotent

    var howto = (LW_PLAY && LW_PLAY.howto) || HOWTO[LW_PLAY.id] || '';
    // Insert right after the back link so it's near the top-left chrome
    // — out of the way of the title + wallet.
    var btn = document.createElement('button');
    btn.id = 'shell-howto';
    btn.className = 'shell-howto';
    btn.setAttribute('aria-label', 'How to play');
    btn.title = 'How to play';
    btn.textContent = '?';
    btn.addEventListener('click', function(){ showHowToModal(howto); });
    var back = hdr.querySelector('.shell-back');
    if (back && back.nextSibling) hdr.insertBefore(btn, back.nextSibling);
    else hdr.appendChild(btn);
  }

  function showHowToModal(text) {
    if (document.getElementById('howto-bd')) return;
    var bd = document.createElement('div');
    bd.id = 'howto-bd';
    bd.className = 'shell-modal-backdrop';
    bd.innerHTML = '<div class="shell-modal">'
      + '<h3>How to play — ' + (LW_PLAY.name || LW_PLAY.id) + '</h3>'
      + '<p>' + (text ? text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : 'No rules description has been written for this game yet.') + '</p>'
      + '<div class="shell-modal-actions">'
      + '  <button class="shell-primary" id="howto-close">Got it</button>'
      + '</div></div>';
    document.body.appendChild(bd);
    document.getElementById('howto-close').onclick = function(){ document.body.removeChild(bd); };
    bd.addEventListener('click', function(e){ if (e.target === bd) document.body.removeChild(bd); });
  }

  // ════════════════════════════════════════════════════════════════════
  // SOUNDTRACK — shared player injected into EVERY game shell (this file is
  // loaded by all 68 /play/*.html shells, so the player lives here once).
  // Reads the shared manifest (/music-tracks.js → window.LW_TRACKS) and
  // CONTINUES the same track across page loads via a shared localStorage key,
  // so moving portal→game→game keeps the music going. Not gapless (each game
  // is a real page load), but it resumes the same track near where it left
  // off and re-kicks on the first interaction if the browser blocks autoplay.
  // Same key + behavior as the portal player, so handoff is continuous.
  // ════════════════════════════════════════════════════════════════════
  var MUS_KEY = 'sws_music_state';
  var mus = { tracks:null, cats:null, idx:-1, volume:0.5, playing:false, repeat:'all',
              open:false, errSkips:0, audio:null, bg:null, btn:null, saveT:0, _time:0 };

  function musLoadState(){
    try{ var s = JSON.parse(localStorage.getItem(MUS_KEY) || '{}');
      if(typeof s.idx==='number') mus.idx = s.idx;
      if(typeof s.volume==='number') mus.volume = s.volume;
      if(typeof s.playing==='boolean') mus.playing = s.playing;
      if(typeof s.repeat==='string') mus.repeat = s.repeat;
      mus._time = (typeof s.time==='number') ? s.time : 0;
    }catch(e){ mus._time = 0; }
  }
  function musSave(){
    try{
      var t = mus.audio ? mus.audio.currentTime : (mus._time || 0);
      localStorage.setItem(MUS_KEY, JSON.stringify({ idx:mus.idx, volume:mus.volume, playing:mus.playing, repeat:mus.repeat, time:t }));
    }catch(e){}
  }
  function musEsc(x){ return String(x==null?'':x).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  function musEnsure(){
    if(mus.audio) return mus.audio;
    var a = document.createElement('audio');
    a.preload = 'none'; a.volume = mus.volume;
    a.addEventListener('ended', function(){
      if(mus.repeat==='one'){ a.currentTime = 0; var p=a.play(); if(p&&p['catch'])p['catch'](function(){}); return; }
      var n = mus.idx + 1;
      if(n >= mus.tracks.length){ if(mus.repeat==='all'){ musPlay(0); } else { mus.playing=false; musBtnState(); musSave(); } }
      else musPlay(n);
    });
    a.addEventListener('error', function(){ if(mus.errSkips>=mus.tracks.length){ mus.errSkips=0; return; } mus.errSkips++; musNext(); });
    a.addEventListener('play',  function(){ mus.errSkips=0; mus.playing=true;  musBtnState(); musRender(); musSave(); });
    a.addEventListener('pause', function(){ mus.playing=false; musBtnState(); musRender(); musSave(); });
    a.addEventListener('timeupdate', function(){ var now=Date.now(); if(now-mus.saveT>2000){ mus.saveT=now; musSave(); } });
    document.body.appendChild(a);
    mus.audio = a; return a;
  }
  function musPlay(i){
    if(typeof i!=='number') i = mus.idx>=0 ? mus.idx : 0;
    if(i<0 || i>=mus.tracks.length) i = 0;
    var a = musEnsure(), t = mus.tracks[i];
    if(mus.idx!==i || (a.src||'').indexOf(t.src)<0){ a.src = t.src; mus.idx = i; mus._time = 0; musSave(); }
    var p = a.play(); if(p&&p['catch']) p['catch'](function(){});
    musRender();
  }
  function musPause(){ if(mus.audio) mus.audio.pause(); }
  function musResume(){ var a=musEnsure(); if(a.src){ var p=a.play(); if(p&&p['catch'])p['catch'](function(){}); } else musPlay(); }
  function musNext(){ musPlay(((mus.idx<0?0:mus.idx)+1)%mus.tracks.length); }
  function musPrev(){ musPlay(((mus.idx<0?0:mus.idx)-1+mus.tracks.length)%mus.tracks.length); }
  function musVol(v){ v=Number(v); if(isNaN(v))return; mus.volume=Math.max(0,Math.min(1,v)); if(mus.audio)mus.audio.volume=mus.volume; musSave(); }
  function musCycleRepeat(){ mus.repeat = mus.repeat==='all' ? 'one' : (mus.repeat==='one' ? 'off' : 'all'); musSave(); musRender(); }

  // Resume the saved track at its saved position — ONLY if music was playing
  // when the player left the previous page (no surprise audio otherwise).
  function musTryResume(){
    if(!mus.playing || mus.idx<0 || !mus.tracks[mus.idx]) return;
    var a = musEnsure();
    a.src = mus.tracks[mus.idx].src;
    a.addEventListener('loadedmetadata', function(){ if(mus._time>0){ try{ a.currentTime = mus._time; }catch(e){} } }, { once:true });
    var p = a.play();
    if(p && p['catch']) p['catch'](function(){
      // Autoplay blocked on this fresh page — resume the moment the user
      // touches anything (most games need a tap to start anyway).
      var onInt = function(){
        document.removeEventListener('pointerdown', onInt, true);
        document.removeEventListener('keydown', onInt, true);
        var pp = a.play(); if(pp&&pp['catch']) pp['catch'](function(){});
      };
      document.addEventListener('pointerdown', onInt, true);
      document.addEventListener('keydown', onInt, true);
    });
    musRender();
  }

  function musGroups(){
    var map={}, order=[];
    for(var i=0;i<mus.tracks.length;i++){ var c=mus.tracks[i].cat||'Originals'; if(!map[c]){map[c]=[];order.push(c);} map[c].push({t:mus.tracks[i],i:i}); }
    var fs={}; for(var j=0;j<order.length;j++) fs[order[j]]=j;
    var CATS = mus.cats || ['Originals'];
    order.sort(function(a,b){ var ia=CATS.indexOf(a); if(ia<0)ia=100+fs[a]; var ib=CATS.indexOf(b); if(ib<0)ib=100+fs[b]; return ia-ib; });
    return order.map(function(c){ return {cat:c, items:map[c]}; });
  }

  function musBtnState(){ if(mus.btn){ if(mus.playing) mus.btn.classList.add('playing'); else mus.btn.classList.remove('playing'); } }

  function musRender(){
    if(!mus.open || !mus.bg) return;
    var cur = (mus.idx>=0 && mus.tracks[mus.idx]) ? mus.tracks[mus.idx] : null;
    var repLbl = mus.repeat==='one' ? '&#128258; One' : (mus.repeat==='all' ? '&#128257; All' : '&#128257; Off');
    var h = '<div class="swsm" onclick="event.stopPropagation()">';
    h += '<div class="hd"><h3>&#9835; Soundtrack</h3><button class="x" aria-label="Close" onclick="SWS_MUSIC.close()">&times;</button></div>';
    h += '<div class="swsm-now"><div class="meta"><div class="t">' + (cur?musEsc(cur.title):'Pick a track to start') + '</div><div class="a">' + (cur?(musEsc(cur.artist||'Stephen')+(cur.mood?' &middot; '+musEsc(cur.mood):'')):'Public-domain library + studio originals') + '</div></div><div class="ctrls">';
    h += '<button onclick="SWS_MUSIC.prev()" aria-label="Previous">&#9198;</button>';
    h += mus.playing ? '<button class="pp" onclick="SWS_MUSIC.pause()" aria-label="Pause">&#9208;</button>' : '<button class="pp" onclick="SWS_MUSIC.resume()" aria-label="Play">&#9654;</button>';
    h += '<button onclick="SWS_MUSIC.next()" aria-label="Next">&#9197;</button></div></div>';
    h += '<div class="swsm-row"><span class="lbl">VOL</span><input type="range" min="0" max="100" value="' + Math.round(mus.volume*100) + '" oninput="SWS_MUSIC.vol(this.value/100)"><button class="swsm-rep' + (mus.repeat!=='off'?' act':'') + '" onclick="SWS_MUSIC.repeat()">' + repLbl + '</button></div>';
    h += '<div class="swsm-list">';
    var gs = musGroups();
    for(var g=0;g<gs.length;g++){
      h += '<div class="swsm-cat">' + musEsc(gs[g].cat) + '<span class="ln"></span><span class="ct">' + gs[g].items.length + '</span></div>';
      for(var m=0;m<gs[g].items.length;m++){
        var t=gs[g].items[m].t, i=gs[g].items[m].i, on=(i===mus.idx);
        h += '<button class="swsm-trk'+(on?' on':'')+'" onclick="SWS_MUSIC.play('+i+')"><div class="tt">'+musEsc(t.title)+(on&&mus.playing?' &nbsp;<span style="font-size:10px">&#9654; PLAYING</span>':'')+'</div><div class="aa">'+musEsc(t.artist||'Stephen')+(t.mood?' &middot; '+musEsc(t.mood):'')+'</div></button>';
      }
    }
    h += '</div><div class="swsm-foot">Music follows you from game to game. Public-domain classical via the Internet Archive.</div></div>';
    mus.bg.innerHTML = h;
  }
  function musOpenDrawer(){
    if(!mus.bg){ mus.bg=document.createElement('div'); mus.bg.className='swsm-bg';
      mus.bg.addEventListener('click', function(e){ if(e.target===mus.bg) musCloseDrawer(); });
      document.body.appendChild(mus.bg); }
    mus.open=true; mus.bg.classList.add('on'); musRender();
  }
  function musCloseDrawer(){ mus.open=false; if(mus.bg) mus.bg.classList.remove('on'); }

  function musInjectButton(){
    var wallet = document.getElementById('shell-wallet') || document.querySelector('.shell-hdr');
    if(!wallet || document.getElementById('shell-music-btn')) return;
    var b = document.createElement('button');
    b.id='shell-music-btn'; b.type='button'; b.title='Soundtrack'; b.setAttribute('aria-label','Open soundtrack');
    b.innerHTML = '<img src="/portal-assets/music-thumb.png" alt="" onerror="this.remove()"><span class="glyph">&#9835;</span><span class="eq"><i></i><i></i><i></i></span>';
    b.addEventListener('click', musOpenDrawer);
    wallet.insertBefore(b, wallet.firstChild);
    mus.btn = b; musBtnState();
  }
  function musInjectStyle(){
    if(document.getElementById('swsm-style')) return;
    var s = document.createElement('style'); s.id='swsm-style';
    s.textContent =
      '#shell-music-btn{position:relative;width:46px;height:46px;padding:0;border-radius:11px;border:1px solid var(--shell-line);background:var(--shell-panel);color:var(--shell-leaf);cursor:pointer;overflow:hidden;display:grid;place-items:center;flex-shrink:0;margin-right:8px}'
    + '#shell-music-btn:hover{border-color:var(--shell-leaf)}'
    + '#shell-music-btn.playing{border-color:var(--shell-leaf);box-shadow:0 0 0 2px rgba(95,192,138,.35),0 0 14px rgba(95,192,138,.45)}'
    + '#shell-music-btn img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}'
    + '#shell-music-btn .glyph{font-size:20px;line-height:1}'
    + '#shell-music-btn .eq{position:absolute;bottom:3px;right:3px;display:none;gap:1.5px;align-items:flex-end;height:9px}'
    + '#shell-music-btn.playing .eq{display:flex}'
    + '#shell-music-btn .eq i{width:2px;background:var(--shell-leaf);border-radius:1px;animation:swsm-eq .9s ease-in-out infinite}'
    + '#shell-music-btn .eq i:nth-child(1){height:4px;animation-delay:0s}#shell-music-btn .eq i:nth-child(2){height:9px;animation-delay:.15s}#shell-music-btn .eq i:nth-child(3){height:6px;animation-delay:.3s}'
    + '@keyframes swsm-eq{0%,100%{transform:scaleY(.4)}50%{transform:scaleY(1)}}'
    + '.swsm-bg{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:9000;display:none;align-items:flex-end;justify-content:center}'
    + '.swsm-bg.on{display:flex}@media(min-width:560px){.swsm-bg{align-items:center;padding:18px}}'
    + '.swsm{background:linear-gradient(180deg,var(--shell-panel),#10180f);border:1px solid var(--shell-line);border-radius:16px 16px 0 0;width:100%;max-width:460px;max-height:86vh;display:flex;flex-direction:column;box-shadow:0 -10px 50px rgba(0,0,0,.6)}'
    + '@media(min-width:560px){.swsm{border-radius:16px}}'
    + '.swsm .hd{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 10px;border-bottom:1px solid var(--shell-line)}'
    + '.swsm .hd h3{margin:0;font-size:14px;letter-spacing:1.4px;text-transform:uppercase;color:var(--shell-leaf)}'
    + '.swsm .x{background:transparent;border:0;color:var(--shell-muted);font-size:24px;line-height:1;cursor:pointer;padding:2px 6px}'
    + '.swsm-now{padding:12px 16px;border-bottom:1px solid var(--shell-line);display:flex;align-items:center;gap:12px}'
    + '.swsm-now .meta{flex:1;min-width:0}.swsm-now .t{font-weight:700;font-size:14px;color:var(--shell-ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
    + '.swsm-now .a{font-size:11.5px;color:var(--shell-muted);margin-top:2px}.swsm-now .ctrls{display:flex;gap:6px;flex-shrink:0}'
    + '.swsm-now .ctrls button{width:40px;height:40px;border-radius:50%;border:1px solid var(--shell-line);background:var(--shell-bg);color:var(--shell-ink);cursor:pointer;font-size:14px;display:grid;place-items:center}'
    + '.swsm-now .ctrls button.pp{border-color:var(--shell-leaf);color:var(--shell-leaf)}'
    + '.swsm-row{display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid var(--shell-line)}'
    + '.swsm-row span.lbl{font-size:10px;letter-spacing:1px;color:var(--shell-muted);width:26px}.swsm-row input{flex:1;accent-color:var(--shell-leaf)}'
    + '.swsm-rep{background:var(--shell-bg);border:1px solid var(--shell-line);color:var(--shell-muted);border-radius:8px;padding:7px 10px;font-size:11px;cursor:pointer;white-space:nowrap}'
    + '.swsm-rep.act{color:var(--shell-leaf);border-color:var(--shell-leaf)}'
    + '.swsm-list{overflow-y:auto;-webkit-overflow-scrolling:touch;padding:8px 10px 16px;flex:1}'
    + '.swsm-cat{display:flex;align-items:center;gap:8px;margin:12px 4px 6px;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:var(--shell-leaf)}'
    + '.swsm-cat:first-child{margin-top:2px}.swsm-cat .ln{flex:1;height:1px;background:var(--shell-line)}.swsm-cat .ct{color:var(--shell-muted);font-size:10px}'
    + '.swsm-trk{display:block;width:100%;text-align:left;padding:10px 11px;margin-bottom:5px;border-radius:9px;cursor:pointer;background:var(--shell-bg);border:1px solid transparent;color:var(--shell-ink)}'
    + '.swsm-trk:hover{border-color:var(--shell-line)}.swsm-trk.on{background:rgba(95,192,138,.12);border-color:rgba(95,192,138,.45)}'
    + '.swsm-trk .tt{font-weight:700;font-size:13px}.swsm-trk.on .tt{color:var(--shell-leaf)}.swsm-trk .aa{font-size:11px;color:var(--shell-muted);margin-top:2px}'
    + '.swsm-foot{padding:9px 16px 14px;font-size:11px;color:var(--shell-muted);text-align:center;line-height:1.5;border-top:1px solid var(--shell-line)}';
    document.head.appendChild(s);
  }

  // True when this shell is running inside the portal's gapless jukebox
  // iframe (loaded with ?embed=1, or simply not the top frame). In that case
  // the PORTAL owns the audio — this shell must NOT run its own player (no
  // double audio / double button) and its back link should close the overlay.
  function musEmbedded(){
    try { return /[?&]embed=1/.test(location.search) || (window.self !== window.top); }
    catch (e) { return true; }   // cross-origin top access throws => we're framed
  }
  function wireEmbedBack(){
    if(!musEmbedded()) return;
    // Tell the portal jukebox we loaded OK, so it can cancel its fallback
    // watchdog (which would otherwise navigate directly if framing was blocked).
    try { window.parent.postMessage({ sws:'ready' }, '*'); } catch(_){}
    var back = document.querySelector('.shell-back');
    if(back){ back.addEventListener('click', function(e){
      e.preventDefault();
      try { window.parent.postMessage({ sws:'close' }, '*'); } catch(_){}
    }); }
  }

  function initMusic(){
    if (musEmbedded()) return;   // portal jukebox owns the audio when embedded
    musLoadState();
    musInjectStyle();
    function go(){
      mus.tracks = (global.LW_TRACKS && global.LW_TRACKS.length) ? global.LW_TRACKS
                 : [{id:'the-waiting-dojo', title:'The Waiting Dojo', artist:'Stephen', cat:'Originals', src:'/assets/music/the-waiting-dojo.mp3'}];
      mus.cats = (global.LW_TRACK_CATS && global.LW_TRACK_CATS.length) ? global.LW_TRACK_CATS : ['Originals','Classical'];
      musInjectButton();
      musTryResume();
    }
    if(global.LW_TRACKS && global.LW_TRACKS.length){ go(); }
    else {
      var sc = document.createElement('script'); sc.src='/music-tracks.js'; sc.onload=go; sc.onerror=go; document.head.appendChild(sc);
    }
    window.addEventListener('pagehide', musSave);
    document.addEventListener('visibilitychange', function(){ if(document.visibilityState==='hidden') musSave(); });
    global.SWS_MUSIC = { play:musPlay, pause:musPause, resume:musResume, next:musNext, prev:musPrev, vol:musVol, close:musCloseDrawer, open:musOpenDrawer, repeat:musCycleRepeat };
  }

  function init() {
    // Body-class signal that 11 games guard their render loops on. Must
    // wait until body exists (shell.js loads in <head>, so it doesn't at
    // module-init time). This is THE fix for bloomwheel/seedtoss2/etc
    // appearing to mount but not animating.
    try { document.body.classList.add('game-active'); } catch (e) {}

    setTitle();
    renderWallet();
    wireWalletButton();
    injectHowToButton();
    try { initMusic(); } catch (e) {}
    try { wireEmbedBack(); } catch (e) {}

    // Initialize Sunbeam SDK (auto-loads Firebase compat from gstatic).
    if (global.Sunbeam && global.Sunbeam.init) {
      global.Sunbeam.init({ gameId: 'play:' + LW_PLAY.id }).then(function(s){
        state.signedIn = !!(s && s.signedIn);
        renderWallet();
      }).catch(function(){
        // SDK not reachable — anon-local-earn still works via _G.e fallback,
        // and the wallet just shows 0.
      });
      if (global.Sunbeam.onChange) {
        global.Sunbeam.onChange(function(snap){
          if (snap) {
            if (typeof snap.confirmed === 'number') state.bal = snap.confirmed;
            if (typeof snap.pending === 'number') state.pending = snap.pending;
            if (typeof snap.signedIn === 'boolean') state.signedIn = snap.signedIn;
            renderWallet();
          }
        });
      }
      if (global.Sunbeam.balance) {
        global.Sunbeam.balance().then(function(b){
          if (b) { state.bal = b.confirmed; state.pending = b.pending; renderWallet(); }
        }).catch(function(){});
      }
    }

    // Poll for the game module to finish loading + registering.
    var tries = 0;
    var iv = setInterval(function(){
      tries++;
      if (tryMount()) {
        clearInterval(iv);
      } else if (tries > 80) {  // ~20s
        clearInterval(iv);
        var host = document.getElementById('shell-mount');
        if (host) host.innerHTML = '<div style="padding:30px;color:#c75050;text-align:center;font-size:14px">'
          + 'Could not load ' + (LW_PLAY.name || LW_PLAY.id) + ' module. Reload the page or open the hub at <a href="https://lucidwinds.com/" style="color:#5fc08a">lucidwinds.com</a>.</div>';
      }
    }, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose minimal diagnostic
  global.SkyWolfShell = { VERSION: VERSION, state: state };

})(typeof window !== 'undefined' ? window : this);

// Art-save gate — same contract as index.html. Without it the portal
// shells had NO save cooldown (art saves spammable for 1 sunbeam each)
// and the firstWin game_win path never fired.
window._lwArtSaveGate=function(key,opts){
  var COOLDOWN=(opts&&opts.cooldown)||30000;
  window._lwArtSaveLast=window._lwArtSaveLast||{};
  window._lwArtWon=window._lwArtWon||{};
  var nowT=Date.now();
  var lastT=window._lwArtSaveLast[key]||0;
  if(nowT-lastT<COOLDOWN){
    return {allow:false,secs:Math.ceil((COOLDOWN-(nowT-lastT))/1000)};
  }
  window._lwArtSaveLast[key]=nowT;
  var firstWin=!window._lwArtWon[key];
  if(firstWin)window._lwArtWon[key]=true;
  return {allow:true,firstWin:firstWin};
};

// Silence the favicon 404 every shell logged on boot.
try{var _fl=document.createElement('link');_fl.rel='icon';_fl.href='data:,';document.head.appendChild(_fl);}catch(e){}
