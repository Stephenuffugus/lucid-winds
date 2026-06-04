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
  function init() {
    setTitle();
    renderWallet();
    wireWalletButton();

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
