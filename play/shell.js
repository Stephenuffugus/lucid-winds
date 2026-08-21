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
    // merge (2048) fires _e('reached_'+target) when you hit a milestone tile;
    // the resolver strips the _NNNN suffix to 'reached'. Without this key it
    // paid 0 (Jun-29 portal audit). 2 = a small milestone reward per target.
    reached:       2,
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
    // lo-mode: lower-is-better scores (moves/time) keep a MIN in bl — feeding
    // them into the max-kept b recorded the WORST win (2026-07-03 fleet audit)
    if (r && r.lo) { if (r.w && typeof r.s === 'number' && r.s >= 0 && (c[g].bl == null || r.s < c[g].bl)) c[g].bl = r.s; }
    else if (r && r.s > c[g].b) c[g].b = r.s;
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
        // r.ok === false means the SDK's anon rate caps zeroed the credit.
        // That used to be INVISIBLE (Stephen: "won euchre, got nothing") —
        // if we pay 0, say why.
        if (r && r.ok === false) { showToast('☀ sunbeam cap reached, resets soon'); return; }
        if (r && typeof r.balance === 'number') state.bal = r.balance;
        if (r && typeof r.pending === 'number') state.pending = r.pending;
        renderWallet();
        showToast('+' + amt + ' ☀');
      }).catch(function(err){
        // Silent-swallow was hiding real failures (server reject, SDK not
        // initialized, offline). Tell the player their win didn't save.
        try { console.warn('[shell] earn failed', err && err.code, err && err.message); } catch(e){}
        showToast('☀ +' + amt + ' didn\'t save (' + ((err && err.code) || 'offline') + ')');
      });
    } else {
      // SDK script missing entirely (blocked / stale cache) — surface it
      // once instead of a completely silent zero.
      if (!state._sdkMissingToasted) {
        state._sdkMissingToasted = true;
        showToast('☀ sunbeams unavailable this session');
      }
    }
    // Local "_h" badge (the gu-bar progress counter) bumps too if present.
    var hEl = document.getElementById('_h');
    if (hEl) hEl.textContent = (parseInt(hEl.textContent, 10) || 0) + amt;
  }

  // ── Win celebration (Stephen 2026-06-28). The shell's playWin used to be
  // a sound only, so portal games "didn't celebrate" at the end (e.g. Vine
  // Puzzle). This adds a lightweight, non-blocking petal burst + flourish on
  // every game win, in both standalone and embedded play. Pure DOM/CSS.
  function _winCelebrate(){
    try {
      if (!document.getElementById('sws-win-style')) {
        var stl = document.createElement('style'); stl.id = 'sws-win-style';
        stl.textContent = '@keyframes swsPetalFall{0%{transform:translateY(-14vh) rotate(0);opacity:0}10%{opacity:1}100%{transform:translateY(104vh) rotate(540deg);opacity:0}}@keyframes swsWinPop{0%{transform:scale(0.4);opacity:0}35%{transform:scale(1.15);opacity:1}65%{transform:scale(1)}100%{transform:scale(1);opacity:0}}';
        document.head.appendChild(stl);
      }
      var ov = document.createElement('div');
      ov.style.cssText = 'position:fixed;inset:0;z-index:90000;pointer-events:none;overflow:hidden;';
      var glyphs = ['🌸','🌿','✿','🍃','🌼','✦'];
      var colors = ['#7ab356','#c8a84b','#e8dcc8','#e8a0bf'];
      for (var i=0;i<26;i++){
        var p = document.createElement('div');
        var left = (i*37+13) % 100;            // deterministic spread across the width
        var dur = 1.8 + (i%5)*0.35;
        var delay = (i%7)*0.11;
        var sz = 14 + (i%4)*6;
        p.textContent = glyphs[i%glyphs.length];
        p.style.cssText = 'position:absolute;top:-14vh;left:'+left+'vw;font-size:'+sz+'px;color:'+colors[i%colors.length]+';animation:swsPetalFall '+dur+'s linear '+delay+'s 1 forwards;';
        ov.appendChild(p);
      }
      /* ⛔ A game that paints its OWN win screen opts out of this generic
         flourish with LW_PLAY.ownWin — otherwise two celebrations fire at once
         and print through each other. Petal Match hit exactly that: its painted
         LEVEL/stars plaque sits mid-board and this "NICE!" is at 38% of the
         viewport, so they overlapped into an unreadable mess. The falling
         petals above are harmless and still play for everyone. */
      if (!(typeof LW_PLAY !== 'undefined' && LW_PLAY && LW_PLAY.ownWin)) {
        var burst = document.createElement('div');
        burst.style.cssText = "position:absolute;top:38%;left:0;right:0;text-align:center;font-family:'Bebas Neue',sans-serif;letter-spacing:0.18em;font-size:2.3rem;color:#c8a84b;text-shadow:0 2px 16px rgba(0,0,0,0.85);animation:swsWinPop 2.2s ease 1 forwards;";
        burst.textContent = '✿ NICE! ✿';
        ov.appendChild(burst);
      }
      document.body.appendChild(ov);
      setTimeout(function(){ if (ov.parentNode) ov.parentNode.removeChild(ov); }, 2800);
    } catch (e) {}
  }

  // ── _G — the shared API every modular game destructures.
  global._G = {
    e:           _earn,
    play:        _playSfx,
    playWin:     function(){ _playSfx('win'); _winCelebrate(); },
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
        // Leaf + label; narrow phones collapse to just the leaf (see media query).
        btn.innerHTML = '🌿<span class="sb-visit-txt"> Lucid Winds</span>';
        btn.title = 'Visit Lucid Winds to grow plants from your sunbeams';
        btn.classList.add('shell-cta-visit');
      } else {
        btn.textContent = 'Sign in';
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
    document.title = (LW_PLAY.name || 'Play') + ' · Sky Wolf Studio';
  }

  // ── Mount the game once everything is ready ──
  function tryMount() {
    // Check the module is registered BEFORE touching the DOM, so the
    // cold-load placeholder (#shell-loading) stays up until the game is
    // actually ready to draw — previously #fg-ag was created empty on the
    // first poll, which would have hidden the placeholder behind a blank box.
    var fn = global._gameFns[LW_PLAY.id];
    if (typeof fn !== 'function') return false;
    var mountEl = document.getElementById('fg-ag');
    if (!mountEl) {
      var host = document.getElementById('shell-mount');
      if (!host) return false;
      host.innerHTML = '';   // drop the loading placeholder, if present
      mountEl = document.createElement('div');
      mountEl.id = 'fg-ag';
      mountEl.className = 'on';
      mountEl.setAttribute('data-game', LW_PLAY.id);
      host.appendChild(mountEl);
    }
    try {
      mountEl.innerHTML = '';
      fn(mountEl);
      maybeShowDirections();   // first visit: full-screen directions cover the game until dismissed
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
  // ── Per-game DIRECTIONS (Jessie 7/16 + 7/18: every game needs a real
  // directions page — a clear objective, how to play, and what every button
  // does, written big enough to read and filling the screen). Shown as a
  // full-screen page before the FIRST play of each game and any time via
  // the ? button. g = goal, h = how it plays, c = controls list. ──
  var DIRECTIONS = {
    song:{g:"Make your own music.",h:"Build a song by layering drums, bass, keys, and leads. Turn notes on and off in each instrument's pattern, then press play to hear them all together.",c:["Tap an instrument to open its pattern","Tap the squares to turn notes on and off","Press PLAY to hear your song","SAVE keeps your song on this device"]},
    bloomwheel:{g:"Draw a spinning flower mandala.",h:"The canvas spins while you draw, and every stroke repeats around the wheel like a kaleidoscope. There is no timer and no way to lose.",c:["Draw on the wheel with your finger","Pick colors and brush sizes from the toolbar","Change the spin speed with the beat controls"]},
    breathing:{g:"Relax with guided breathing.",h:"Choose a breathing pattern and follow the glowing bloom. Breathe in as it opens and out as it closes. A few quiet minutes is a win.",c:["Tap a pattern to choose it","Press START to begin","The bell button turns the audio guide on and off"]},
    colorgarden:{g:"Color a garden picture.",h:"Pick a paint color, then tap any part of the picture to fill it in. No timer, no mistakes, just coloring.",c:["Tap a color to select it","Tap a part of the picture to fill it","PREV and NEXT change pictures","CLEAR starts the picture over"]},
    pixelgarden:{g:"Paint your own pixel art.",h:"Paint tiny squares one at a time to build a picture. When you love it, save it as a real image.",c:["Tap a color, then tap squares to paint them","Use the eraser to blank a square","SAVE downloads your art as a PNG picture"]},
    seedtoss2:{g:"Flick every seed into the pot.",h:"Drag a seed back like a slingshot and let go to send it flying. Higher levels add wind, so watch the flag and aim a little ahead of it.",c:["Touch a seed and drag back to aim","Let go to toss","The New Game button restarts"]},
    storyseeds:{g:"Write a little story every day.",h:"Read today's prompt and write whatever it sparks. A sentence counts. Everything you write is saved on your device.",c:["Tap the page and start typing","SAVE keeps your entry","JOURNAL shows everything you have written"]},
    stonegarden:{g:"Stack stones to the target height without a tumble.",h:"A stone swings across the top of the screen. Tap to drop it onto your tower. Odd shapes balance in odd ways, so watch how each one lands before you drop the next.",c:["Tap anywhere to drop the stone","ROTATE turns the next stone","UNDO takes back a drop in Zen","Pick ZEN or CHALLENGE to start"]},
    rhythmvine:{g:"Tap in time with the music.",h:"Notes ride the vine toward the marker. Tap the moment each note reaches it. Perfect beats Great, and Great beats Good.",c:["Tap anywhere on the beat","CALIBRATE fixes the timing if your phone plays sound late"]},
    klondike:{g:"Move every card to the four top piles, Ace to King by suit.",h:"On the board, stack cards downward and alternate red and black. Turn over face-down cards as they free up, and dig through the deck for what you need.",c:["Tap a card to send it home, or drag it where you want","Tap the deck to draw","UNDO takes back a move"]},
    spider:{g:"Build runs from King down to Ace in one suit.",h:"Stack cards downward on the board. When a full King-to-Ace run of one suit comes together it clears away. Clear everything to win.",c:["Drag a card or a run onto a card one higher","Tap the deck to deal a new row (no empty columns allowed)","UNDO takes back a move"]},
    freecell:{g:"Move every card to the four top piles, Ace to King by suit.",h:"Every card is face up from the start. The four free cells each hold one card, and the emptier they are, the more cards you can move at once. Almost every deal can be won.",c:["Tap a card to send it home, or drag it","Park a card in a free cell to dig deeper","UNDO takes back a move"]},
    pyramid:{g:"Clear the pyramid by pairing cards that add to 13.",h:"Only uncovered cards can be used. Jacks are 11, Queens are 12, and Kings are 13 all by themselves.",c:["Tap two cards that add to 13","Tap a King to remove it alone","Tap the deck to deal a new card"]},
    tripeaks:{g:"Clear all three peaks.",h:"Play any uncovered card that is one higher or one lower than the card on the waste pile. Long chains score big.",c:["Tap a card one up or one down from the waste card","Tap the deck when nothing can play"]},
    golf:{g:"Clear the whole board.",h:"Play any open card that is one higher or one lower than the top of the waste pile. Chain as far as you can before drawing.",c:["Tap a card one up or one down","Tap the deck for a new card"]},
    cribbage:{g:"Be first to 121 points around the board.",h:"Keep two cards and toss two to the crib. Play to 31 counting fifteens, pairs, and runs, then count your hand. The game does the math for you.",c:["Tap two cards to send to the crib","Tap a card to play it","Follow the prompts, the pegging is automatic"]},
    bowergarden:{g:"Take your team to 10 points.",h:"Euchre. Choose whether the flipped suit becomes trump, then take at least three of the five tricks with your computer partner. The Jack of trump is the top card, and the other Jack of the same color is second.",c:["Tap ORDER UP or PASS when trump is offered","Tap a card to play it","Your partner sits across from you"]},
    bleedinghearts:{g:"Finish with the LOWEST score.",h:"Hearts. Every heart you take is 1 point and the Queen of Spades is 13, so avoid winning tricks with points in them. Take every single point in a round to Shoot the Moon and give everyone else 26 instead.",c:["Tap three cards to pass at the start of each round","Tap a card to play, following suit when you can"]},
    gardenspades:{g:"Take your team to 500 points.",h:"Spades. Bid how many tricks you will win, then hit your bid. Spades beat every other suit. Falling short hurts, and winning too many extra tricks adds up against you too.",c:["Tap a number to bid","Tap a card to play, following suit when you can"]},
    juniper:{g:"Build sets and runs, then go out first.",h:"Rummy. Draw one card, then discard one. Collect three or more of a kind, or runs in one suit. Knock when your leftover cards are low, or go Gin with none.",c:["Tap the deck or the discard pile to draw","Tap a card to discard","Tap KNOCK or GIN when your hand is ready"]},
    merge:{g:"Grow a 2048 bloom.",h:"Swiping slides every tile at once. When two matching tiles collide they merge into the next plant up the ladder. Keep your biggest tiles in a corner and build toward them.",c:["Swipe up, down, left, or right (arrow keys work too)","Themes changes the garden look","New Game restarts"]},
    lights:{g:"Turn every light off.",h:"Tapping a light flips it AND its four neighbors. The order of your taps never matters, only which lights you tap, so plan the pattern.",c:["Tap a light to toggle it and its neighbors"]},
    mines:{g:"Uncover every safe square without hitting a mine.",h:"Each number tells you how many mines touch that square, corners included. Start from the numbers you are sure about and flag the mines as you find them.",c:["Tap a square to dig","Hold a square to plant or remove a flag"]},
    sudoku:{g:"Fill the grid so 1 through 9 appears once in every row, column, and box.",h:"Look for cells where only one number can fit. Notes help you keep track of what is still possible.",c:["Tap a cell, then tap a number","Use the pencil button to write small notes","Erase clears a cell"]},
    wordsearch:{g:"Find every word on the list.",h:"Words hide across, down, and diagonally, forward and backward. Found words stay highlighted.",c:["Drag across the letters in a straight line","Found words check themselves off the list"]},
    rootrush:{g:"Slide the roots out of the way so the seed can escape.",h:"Each root only slides along its own length, like cars in a crowded lot. Clear a straight path to the exit.",c:["Drag a root to slide it","HINT shows a helpful move","NEXT goes to the next level after you solve one"]},
    hanoi:{g:"Rebuild the whole tower on the far peg.",h:"Move one disc at a time, and never set a bigger disc on a smaller one. It is always solvable, and the fewest moves earns the best score.",c:["Tap a peg to lift its top disc","Tap another peg to place it"]},
    slider:{g:"Slide the tiles into number order.",h:"Only tiles beside the empty space can move. Work the top row into place first, then the left column, and repeat.",c:["Tap a tile next to the gap to slide it","Pick 3×3, 4×4, or 5×5 board sizes"]},
    picross:{g:"Reveal the hidden picture.",h:"The numbers on each row and column tell you the runs of filled squares, in order, with at least one gap between runs. Fill what must be filled and X out what cannot be.",c:["Tap a square to fill it","Switch to ✕ mode to mark squares that stay empty","Clues gray out when satisfied"]},
    colorsort:{g:"Sort every pollen color into its own vial.",h:"You can only pour onto a matching color or into an empty vial, and vials hold four. Think a pour or two ahead so you do not bury what you need.",c:["Tap a vial to lift its top pollen","Tap another vial to pour","NEXT after you solve a level"]},
    flood:{g:"Make the whole board one color before moves run out.",h:"Your patch starts at the top-left corner. Picking a color floods every connected square of that color into your patch, growing it outward.",c:["Tap a color button to flood"]},
    pipe:{g:"Connect the root to the bloom.",h:"Rotate the vine tiles so an unbroken line runs from the root to the flower. Every turn of a tile counts, so fewer is better.",c:["Tap a tile to rotate it"]},
    sokoban:{g:"Push every crate onto a target.",h:"You can only PUSH crates, never pull, and only one at a time. A crate shoved into a corner is stuck forever, so think before you push.",c:["Swipe (or use arrow keys) to move","UNDO takes back a step","RESTART resets the level"]},
    petalfall:{g:"Clear rows before the blocks pile to the top.",h:"Falling pieces stack where they land. Fill a whole row across and it clears. Keep the stack low and leave room for the long piece.",c:["Swipe left or right to move the piece","Tap to rotate","Swipe down to drop fast"]},
    gardenlines:{g:"Score points by building matching lines.",h:"Place tiles from your hand into rows and columns where every tile shares a color or a symbol with the line. A line can never repeat the same tile twice.",c:["Tap a tile in your hand, then tap a square on the board","Finish your turn to draw new tiles","UNDO takes back placements before you finish"]},
    kakuro:{g:"Fill every run so it adds up to its clue.",h:"Like a crossword with numbers. Use digits 1 through 9, and never repeat a digit inside one run. Small clues over short runs are the easiest openings.",c:["Tap a cell, then tap a number","Notes help track the possibilities"]},
    mosaic:{g:"Score the most points by tiling your mosaic.",h:"Draft same-colored tiles and load them into a row. A row holds only one color, and when it fills, one tile moves onto your wall for points. Extra tiles fall to the floor and cost you. The Mirror plays against you.",c:["Tap tiles to draft them","Tap one of your rows to place them","Watch the floor line, it subtracts points"]},
    rootflow:{g:"Connect every pair of matching roots.",h:"Draw a path from each root to its twin without crossing any other path, and fill every square of the garden.",c:["Drag from a root to its matching root","Redraw a path any time","HINT reveals one path"]},
    rootmaze:{g:"Reach the exit before the computer does.",h:"You and the computer race through the same maze, and the walls shift as you go. Keep moving and adapt when a path closes.",c:["Swipe to move through the maze"]},
    /* `cards` is OPTIONAL and additive — a game with painted rules art can show
       it instead of describing the mechanics in words. Every other game in this
       table omits it and renders exactly as before. */
    petalmatch:{g:"Clear each level's objective before the moves run out.",h:"Swap two neighbours to line up three or more of the same flower. Every level asks for something different: reach a score, clear the dew tiles, break the thorns, or gather set colours. Match more than three and you make a special piece. Five in an S or a zigzag makes the SERPENTINE, a snake that travels the board clearing everything on its winding path. Six in a line makes the CRYSTAL CROSS and seven makes the PETALQUAKE, the rarest bloom in the garden. A full block of six makes the BOX OF SIX, whose burst enchants the ground for three moves: matches made there bloom one rank higher. Set two specials off together for the big ones.",h2:"Clearing a level pays PETALS, and Petals buy help. DIG lifts out one flower, CUT takes a whole row and column, WASH removes a thorn or a dew tile outright. BOOST is chosen before your first move. Run out of moves and you can buy five more.",c:["Drag a flower onto a neighbour to swap","Petals are earned by clearing levels","DIG, CUT and WASH need a target, so tap one then tap the board","BOOST only works before your first move","HINT shows a move when you are stuck","The mode button cycles JOURNEY, TIMED, and ENDLESS","RETRY LV replays the level you are on"],
      cards:[
        {src:'/assets/games/petalmatch/runtime/tut-swap.png',   cap:'Swap two neighbours'},
        {src:'/assets/games/petalmatch/runtime/tut-match3.png', cap:'Three in a row clears'},
        {src:'/assets/games/petalmatch/runtime/tut-line.png',   cap:'Four makes a line piece'},
        {src:'/assets/games/petalmatch/runtime/tut-wild.png',   cap:'Five makes a wild'},
        {src:'/assets/games/petalmatch/runtime/spec-serpent.png', cap:'Five in an S makes the Serpentine'},
        {src:'/assets/games/petalmatch/runtime/tut-combo.png',  cap:'Two specials together'}
      ]},
    sprout:{g:"Find the hidden five-letter word in six guesses.",h:"After each guess the letters change color. Green means right letter, right spot. Gold means the letter is in the word but somewhere else. Gray means it is not in the word.",c:["Type a five-letter word","Press ENTER to guess"]},
    vinewords:{g:"Find as many words as you can in two minutes.",h:"Connect neighboring letters, diagonals included, to spell words of three or more letters. Longer words score much more.",c:["Drag through neighboring letters","Lift your finger to submit the word"]},
    chess:{g:"Checkmate the computer's king.",h:"Full classic chess, including castling, en passant, and pawn promotion. Tap a piece to see everywhere it can go.",c:["Tap a piece, then tap a highlighted square","♜ Court changes the piece set","Undo takes back your last move","The dropdown changes difficulty"]},
    c4:{g:"Connect four of your pieces in a row.",h:"Pieces drop to the lowest open spot in a column. Line up four across, down, or diagonally before the computer does, and block their threats.",c:["Tap a column to drop a piece","HINT glows the computer's favorite column"]},
    battleship:{g:"Sink the enemy fleet before yours goes down.",h:"Place your ships, then trade shots. A hit lets you keep firing in classic mode. Numbers and sunk ships narrow down where the rest hide.",c:["Drag your ships into place, tap to rotate","Tap a square on the enemy grid to fire"]},
    mastermind:{g:"Crack the hidden four-color code.",h:"After each guess you get pegs. A filled peg means right color in the right spot. An open peg means right color, wrong spot. Use logic to close in.",c:["Tap colors to build your guess","Submit to see your pegs"]},
    checkers:{g:"Capture every enemy piece or block them all.",h:"Pieces slide diagonally forward. Jump an enemy piece to capture it, and chain jumps when they line up. Reach the far row to crown a King that moves both ways.",c:["Tap a piece, then tap a highlighted square","Chained jumps continue automatically"]},
    reversi:{g:"Finish with the most discs.",h:"Every move must trap enemy discs between your new disc and one you already own. Trapped discs flip to your color. Corners are gold, grab them when you can.",c:["Tap a highlighted square to play"]},
    backgammon:{g:"Bear all fifteen checkers off first.",h:"Roll and move by the pips, splitting the dice between checkers if you like. A lone enemy checker can be hit and sent to the bar. Get everything home before bearing off.",c:["Tap to roll the dice","Tap a checker, then tap its landing point"]},
    seedsow:{g:"Bank the most seeds in your store.",h:"Mancala. Scoop a pit and sow its seeds counterclockwise, one per pit. Land the last seed in your store for a free turn, or in an empty pit on your side to capture everything opposite.",c:["Tap one of your six pits to sow it"]},
    vinecross:{g:"Get five in a row before the computer.",h:"Take turns placing stones. Five of yours in any straight line wins, so build open runs of three and four that threaten in two directions at once.",c:["Tap a square to place your stone"]},
    livingstones:{g:"Surround more territory than your opponent.",h:"Go. Stones with no breathing room are captured. Wall off space, keep your groups alive with two eyes, and count territory at the end. Start with the puzzles if you are new.",c:["Tap an intersection to place a stone","PASS when there is nothing left to gain","Choose puzzles or a full game from the menu"]},
    trellis:{g:"Outscore the computer with words on the board.",h:"Build crossword-style words with your seven tiles. Bonus squares multiply letters and words, and using all seven tiles at once earns a 50-point bloom.",c:["Drag tiles onto the board","SUBMIT plays your word","SWAP trades tiles and skips your turn"]},
    pollen:{g:"Be first to 15 Growth.",h:"An engine-builder. Collect pollen, spend it on upgrades that make every later turn stronger, and race the other players to full bloom. Playable solo against the computer or pass-and-play.",c:["Tap the actions and cards as the game offers them","Set any seat to CPU on the setup screen"]},
    set:{g:"Spot the Phenos.",h:"A Pheno is three cards where every trait (color, shape, count, and shading) is either all the same or all different across the three. If two cards share something the third must too, or it is not a Pheno.",c:["Tap three cards to call a Pheno","More cards are dealt when none exist"]},
    stopten:{g:"Stop the clock at exactly 10.00 seconds.",h:"The clock hides partway through, so you count the rest in your head. Closest to perfect wins the round.",c:["Tap to start the clock","Tap again to stop it"]},
    memory:{g:"Match every pair.",h:"Flip two cards a turn. Matches stay face up. Remember what you have seen and clear the whole board in as few turns as you can.",c:["Tap a card to flip it"]},
    simon:{g:"Repeat the pattern as it grows.",h:"Watch the lights flash in order, then tap them back in the same order. Each round adds one more step.",c:["Watch first, then tap the lights in order"]},
    dailybloom:{g:"Finish today's brain workout.",h:"Eight quick exercises across memory, attention, and speed, about four minutes total. Come back tomorrow to grow your streak.",c:["Follow each exercise's on-screen prompt","Answers are a tap each"]},
    numbergarden:{g:"Solve as many problems as you can in 60 seconds.",h:"Quick-fire adding, subtracting, and multiplying. Right answers build your streak, and streaks build your score.",c:["Tap the number keys to answer","START begins the round","RULES explains the scoring"]},
    recall:{g:"Remember exactly which symbols you saw.",h:"A few symbols appear, then vanish, then a distraction tries to shake them loose. Pick only the symbols you actually saw.",c:["Watch the symbols carefully","Tap the ones you saw","NEW ROUND deals again"]},
    pottingbench:{g:"Sort the cards before time runs out.",h:"Play each card onto a pile that shares ANY attribute with it. Fast, clean sorting stretches your timer, and hesitating drains it.",c:["Tap the pile that matches your card","DRAW +2s trades cards for time"]},
    yahtzee:{g:"Score the best total across 13 categories.",h:"Roll up to three times, holding the dice you like between rolls. Every category can be scored only once, and 63+ in the upper section earns a bonus.",c:["Tap dice to hold them","Tap ROLL to reroll the rest","Tap a category to bank your score"]},
    farkle:{g:"Be first to 10,000 points.",h:"Ones and fives always score, and triples score big. After every roll set aside something that scores, then push your luck or bank. Roll nothing that scores and you Farkle, losing the turn's points.",c:["Tap dice to set them aside","ROLL pushes your luck","BANK keeps the turn's points"]},
    doubleshutter:{g:"Shut every tile, the box has two rows.",h:"Roll two dice and shut tiles that add up to the roll, using the front row before the back. Shut everything for the perfect game.",c:["Tap tiles that sum to your roll","Confirm to lock them down","Roll again until nothing fits"]},
    dewtrail:{g:"Draw one unbroken trail through every cell.",h:"Start at 1 and pass through every numbered cell IN ORDER, visiting every cell exactly once and never crossing your own trail.",c:["Drag from 1 through neighboring cells","Lift your finger to pause, keep dragging to continue","UNDO backs the trail up"]}
  };

  function injectHowToButton() {
    var hdr = document.querySelector('.shell-hdr');
    if (!hdr) return;
    if (document.getElementById('shell-howto')) return;  // idempotent

    // Insert right after the back link so it's near the top-left chrome
    // — out of the way of the title + wallet.
    var btn = document.createElement('button');
    btn.id = 'shell-howto';
    btn.className = 'shell-howto';
    btn.setAttribute('aria-label', 'How to play');
    btn.title = 'How to play';
    btn.textContent = '?';
    btn.addEventListener('click', function(){ showDirections(false); });
    var back = hdr.querySelector('.shell-back');
    if (back && back.nextSibling) hdr.insertBefore(btn, back.nextSibling);
    else hdr.appendChild(btn);

    // Wrap the back-link label (e.g. "All games") in a span so the narrow-phone
    // media query can collapse it to just the ← arrow and free up header width.
    if (back && !back.querySelector('.sb-back-txt')) {
      var bt = (back.textContent || '').replace(/[<>&]/g, '');
      var am = bt.match(/^\s*([^\w\s]*)\s*(.*)$/);
      var arrow = (am && am[1]) ? am[1] : '←';
      var label = (am && am[2]) ? am[2] : bt;
      back.innerHTML = arrow + '<span class="sb-back-txt"> ' + label + '</span>';
    }
  }

  // Feedback button — "found a bug or have an idea?". Lazily loads the shared
  // /feedback.js on first tap so standalone shells pay no upfront cost. Only
  // injected on standalone /play/<game>.html visits; when embedded in the
  // portal jukebox, the portal's floating button covers it.
  function openFeedback() {
    function go() {
      if (window.LW_Feedback) {
        window.LW_Feedback.open({ game: (LW_PLAY.name || LW_PLAY.id || ''), surface: 'game' });
      }
    }
    if (window.LW_Feedback) { go(); return; }
    var s = document.createElement('script');
    s.src = '/feedback.js?v=4';
    s.onload = go;
    s.onerror = function () { try { alert('Feedback is unavailable right now.'); } catch (e) {} };
    document.head.appendChild(s);
  }
  function injectFeedbackButton() {
    var hdr = document.querySelector('.shell-hdr');
    if (!hdr) return;
    if (document.getElementById('shell-feedback')) return;  // idempotent
    var btn = document.createElement('button');
    btn.id = 'shell-feedback';
    btn.className = 'shell-howto';                 // reuse the round chrome-button style
    btn.setAttribute('aria-label', 'Found a bug or have an idea?');
    btn.title = 'Found a bug or have an idea?';
    btn.textContent = '🐞';
    btn.addEventListener('click', openFeedback);
    var howto = document.getElementById('shell-howto');
    if (howto && howto.nextSibling) hdr.insertBefore(btn, howto.nextSibling);
    else if (howto) hdr.appendChild(btn);
    else {
      var back = hdr.querySelector('.shell-back');
      if (back && back.nextSibling) hdr.insertBefore(btn, back.nextSibling);
      else hdr.appendChild(btn);
    }
  }

  // ── Full-screen directions page (Jessie 7/16 + 7/18: big readable text
  // that fills the screen, shown BEFORE the game, with the goal, how to
  // play, and what every button does). Auto-opens before the first play of
  // each game; the ? button reopens it any time. ──
  function esc(x){ return String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function showDirections(auto) {
    if (document.getElementById('shell-dir')) return;
    var d = DIRECTIONS[LW_PLAY.id] || null;
    // legacy per-page override: LW_PLAY.howto becomes the how-to paragraph
    if (!d && LW_PLAY && LW_PLAY.howto) d = { g:'', h: LW_PLAY.howto, c: [] };
    if (!d) d = { g:'', h:'Jump in and explore, this one is best learned by playing.', c: [] };
    var ov = document.createElement('div');
    ov.id = 'shell-dir';
    ov.className = 'shell-dir';
    var h = '<div class="shell-dir-inner">';
    h += '<div class="shell-dir-kicker">HOW TO PLAY</div>';
    h += '<h2>' + esc(LW_PLAY.name || LW_PLAY.id) + '</h2>';
    if (d.g) h += '<div class="shell-dir-sec"><div class="shell-dir-h">The goal</div><p>' + esc(d.g) + '</p></div>';
    if (d.h) h += '<div class="shell-dir-sec"><div class="shell-dir-h">How it plays</div><p>' + esc(d.h) + '</p></div>';
    /* Optional second section, for a game with an economy or a second system to
       explain. Purely additive — every game without `h2` renders exactly as it
       always did. ⛔ Added because the copy was written into the table first and
       silently dropped: only `h` was ever read, so the whole paragraph existed
       in the data and appeared nowhere on screen. */
    if (d.h2) h += '<div class="shell-dir-sec"><div class="shell-dir-h">' + esc(d.h2h || 'Petals and powerups') + '</div><p>' + esc(d.h2) + '</p></div>';
    /* Painted rules cards, when a game has them. Purely additive: a game
       without `cards` renders exactly as it always did. Images are lazy and
       carry onerror, so a missing file costs a gap, never a broken card. */
    if (d.cards && d.cards.length) {
      h += '<div class="shell-dir-sec"><div class="shell-dir-h">How it works</div>';
      h += '<div style="display:flex;gap:8px;overflow-x:auto;padding:2px 0 6px;-webkit-overflow-scrolling:touch">';
      for (var ci = 0; ci < d.cards.length; ci++) {
        var cd = d.cards[ci];
        h += '<figure style="margin:0;flex:0 0 auto;width:112px;text-align:center">'
          +  '<img src="' + esc(cd.src) + '" alt="" loading="lazy" '
          +  'onerror="this.style.display=\'none\'" '
          +  'style="width:112px;height:112px;object-fit:contain;display:block">'
          +  '<figcaption style="font-size:.68rem;line-height:1.25;opacity:.85;margin-top:3px">'
          +  esc(cd.cap) + '</figcaption></figure>';
      }
      h += '</div></div>';
    }
    if (d.c && d.c.length) {
      h += '<div class="shell-dir-sec"><div class="shell-dir-h">The controls</div><ul>';
      for (var i = 0; i < d.c.length; i++) h += '<li>' + esc(d.c[i]) + '</li>';
      h += '</ul></div>';
    }
    h += '<div class="shell-dir-tip">Tap the <b>?</b> up top to read this again any time.</div>';
    h += '</div>';
    h += '<div class="shell-dir-foot"><button class="shell-dir-play" id="shell-dir-play">' + (auto ? "▶  LET'S PLAY" : 'GOT IT') + '</button></div>';
    ov.innerHTML = h;
    document.body.appendChild(ov);
    document.getElementById('shell-dir-play').onclick = function () {
      try { localStorage.setItem('sws_dir_' + LW_PLAY.id, '1'); } catch (e) {}
      if (ov.parentNode) ov.parentNode.removeChild(ov);
    };
  }
  function maybeShowDirections() {
    var seen = null;
    try { seen = localStorage.getItem('sws_dir_' + LW_PLAY.id); } catch (e) {}
    if (!seen) showDirections(true);
  }

  // ════════════════════════════════════════════════════════════════════
  // ════════════════════════════════════════════════════════════════════
  // SOUNDTRACK — every game shell (this file loads in all 68 /play/*.html)
  // gets the music control. The actual player (audio + drawer + playlists +
  // continuity) is the SHARED /music-player.js; this just injects the header
  // button + its style and hands it to SWSPlayer.init(). When this shell is
  // EMBEDDED in the portal's jukebox iframe the portal owns the audio, so we
  // skip the player entirely and only re-route the "back" link.
  // ════════════════════════════════════════════════════════════════════
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

  function musButtonStyle(){
    if(document.getElementById('shell-music-btn-style')) return;
    var s = document.createElement('style'); s.id='shell-music-btn-style';
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
    + '@keyframes swsm-eq{0%,100%{transform:scaleY(.4)}50%{transform:scaleY(1)}}';
    document.head.appendChild(s);
  }
  function musMakeButton(){
    var existing = document.getElementById('shell-music-btn');
    if(existing) return existing;
    var wallet = document.getElementById('shell-wallet') || document.querySelector('.shell-hdr');
    if(!wallet) return null;
    var b = document.createElement('button');
    b.id='shell-music-btn'; b.type='button'; b.title='Soundtrack'; b.setAttribute('aria-label','Open soundtrack');
    b.innerHTML = '<img src="/portal-assets/music-thumb.png" alt="" onerror="this.remove()"><span class="glyph">&#9835;</span><span class="eq"><i></i><i></i><i></i></span>';
    wallet.insertBefore(b, wallet.firstChild);
    return b;
  }
  function musLoadScript(src, cb){ var s=document.createElement('script'); s.src=src; s.onload=cb; s.onerror=cb; document.head.appendChild(s); }

  function initMusic(){
    if (musEmbedded()) return;   // portal jukebox owns the audio when embedded
    musButtonStyle();
    var button = musMakeButton();
    if(!button) return;
    function go(){ if(global.SWSPlayer) global.SWSPlayer.init({ button: button }); }
    function withPlayer(){ if(global.SWSPlayer) go(); else musLoadScript('/music-player.js', go); }
    if(global.LW_TRACKS) withPlayer();
    else musLoadScript('/music-tracks.js?v=2026.07.24.02', withPlayer);
  }

  // ════════════════════════════════════════════════════════════════════
  // ADD TO HOME SCREEN — only for games whose page ships a
  // <link rel="manifest"> (Three Sisters first; give a game a manifest and
  // it gets the button for free). Dewball pattern: the button stays visible
  // even when beforeinstallprompt never fires — tapping it then shows
  // instructions instead of doing nothing. Skipped when embedded in the
  // portal or already running standalone.
  // ════════════════════════════════════════════════════════════════════
  function initInstall(){
    if (musEmbedded()) return;
    if (!document.querySelector('link[rel="manifest"]')) return;
    var isStandalone =
      !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
      || !!window.navigator.standalone;
    /* ⛔ Versioned registration (2026-07-27): bare SW URLs get edge-pinned for
       7 days, stranding installs on old workers. Bump ?v= with play/sw.js CACHE. */
    if ('serviceWorker' in navigator) { try { navigator.serviceWorker.register('/play/sw.js?v=3'); } catch (e) {} }
    if (isStandalone) return;
    // Labeled button above the footer — the header is already full (back,
    // how-to, feedback, title, music, wallet) and an extra icon there
    // squeezes the game title out entirely on phones.
    var foot = document.querySelector('.shell-footer') || document.body;
    if (!foot) return;
    if (!document.getElementById('shell-install-btn-style')) {
      var s = document.createElement('style'); s.id = 'shell-install-btn-style';
      s.textContent =
        '#shell-install-btn{display:flex;align-items:center;justify-content:center;gap:8px;min-height:48px;margin:6px auto 12px;padding:10px 22px;border-radius:12px;border:1px solid var(--shell-line);background:var(--shell-panel);color:var(--shell-leaf);cursor:pointer;font-size:15px;font-weight:700}'
      + '#shell-install-btn:hover{border-color:var(--shell-leaf)}';
      document.head.appendChild(s);
    }
    var b = document.createElement('button');
    b.id = 'shell-install-btn'; b.type = 'button';
    b.title = 'Add to Home Screen'; b.setAttribute('aria-label', 'Add to Home Screen');
    b.innerHTML = '<span aria-hidden="true">⤓</span> Add to Home Screen';
    foot.parentNode.insertBefore(b, foot);
    var deferred = null;
    window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; });
    b.addEventListener('click', function () {
      if (deferred) { deferred.prompt(); deferred = null; return; }
      var nm = (global.LW_PLAY && LW_PLAY.name) || 'this game';
      var ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
      alert(ios
        ? 'To add ' + nm + ' to your Home Screen:\n\nTap the Share button, then Add to Home Screen.\n\nIt opens fullscreen like an app.'
        : 'To add ' + nm + ' to your Home Screen:\n\nOpen the browser menu, then Add to Home Screen or Install.');
    });
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
    if (!musEmbedded()) { try { injectFeedbackButton(); } catch (e) {} }
    try { initMusic(); } catch (e) {}
    try { initInstall(); } catch (e) {}
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


// ── Shared game-end overlay (2026-07-04 campaign): one consistent end moment
//    for games whose endings were a status-bar line. o = {won, title, line,
//    sub, retry (function), retryLabel, viewLabel}
window._lwGameEnd=function(o){
  if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(function(){window._lwGameEndDead=true;var x=document.getElementById('LWGE');if(x)x.remove();});
  window._lwGameEndDead=false;
  setTimeout(function(){
    if(window._lwGameEndDead)return; // player left the game inside the delay window
    var old=document.getElementById('LWGE');if(old)old.remove();
    var ov=document.createElement('div');ov.id='LWGE';
    ov.style.cssText='position:fixed;inset:0;z-index:9999;background:radial-gradient(ellipse at 50% 40%,'+(o.won?'rgba(122,179,86,0.3)':'rgba(199,138,80,0.16)')+' 0%,rgba(13,16,12,0.92) 70%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;font-family:Georgia,serif;';
    ov.innerHTML='<div style="font-size:3rem;line-height:1;">'+(o.won?'\ud83c\udfc6':'\ud83c\udf42')+'</div>'
      +'<div style="font-size:1.7rem;font-weight:700;color:'+(o.won?'#7ab356':'#c78a50')+';letter-spacing:0.08em;margin-top:12px;text-align:center;">'+o.title+'</div>'
      +(o.line?'<div style="font-size:0.98rem;color:#e8dcc8;margin-top:10px;text-align:center;">'+o.line+'</div>':'')
      +(o.sub?'<div style="font-style:italic;font-size:0.8rem;color:#8a9178;margin-top:6px;text-align:center;">'+o.sub+'</div>':'')
      +'<button id="LWGE-again" style="margin-top:22px;min-height:48px;padding:12px 28px;font-family:Georgia,serif;font-weight:700;font-size:0.9rem;background:linear-gradient(180deg,rgba(122,179,86,0.35),rgba(74,124,53,0.45));border:2px solid #7ab356;color:#f5ebd0;border-radius:10px;cursor:pointer;">'+(o.retryLabel||'\u21bb PLAY AGAIN')+'</button>'
      +'<button id="LWGE-view" style="margin-top:10px;min-height:44px;padding:8px 20px;background:transparent;border:1px solid rgba(138,145,120,0.4);color:#8a9178;border-radius:10px;font-size:0.75rem;cursor:pointer;">'+(o.viewLabel||'view the board')+'</button>';
    ov.querySelector('#LWGE-again').onclick=function(){ov.remove();if(o.retry)o.retry();};
    ov.querySelector('#LWGE-view').onclick=function(){ov.remove();};
    ov.onclick=function(ev){if(ev.target===ov)ov.remove();};
    document.body.appendChild(ov);
  }, o.delay==null?420:o.delay);
};
