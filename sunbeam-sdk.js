/* ════════════════════════════════════════════════════════════════════════
 * Sunbeam SDK — Sky Wolf Studios shared currency
 *
 *   Hosted at: https://lucidwinds.com/sunbeam-sdk.js
 *   Version:   2.0.0
 *
 * Drop-in module for constellation games (Sweet Spot, Glyph Forge, Tarot
 * Run, Bar Brawl, etc.) to participate in the shared Sunbeam economy.
 *
 *   <script src="https://lucidwinds.com/sunbeam-sdk.js?v=2"></script>
 *   <script>
 *     Sunbeam.init({ gameId: 'glyphforge' }).then(function(state){
 *       // state = { ready:true, signedIn:bool, uid:string|null }
 *     });
 *
 *     // On a meaningful in-game event:
 *     Sunbeam.earn(3, 'glyphforge:level_complete').then(function(r){
 *       // r = { ok, balance, earned, pending }
 *     });
 *
 *     Sunbeam.onChange(function(state){
 *       updateBalanceUI(state.confirmed, state.pending);
 *     });
 *   </script>
 *
 * IDENTITY MODEL — local-earn + claim-on-signup
 *   - Anonymous players accumulate sunbeams in localStorage under the key
 *     'sws_pending_sunbeams' (client-side, untrusted).
 *   - On Firebase sign-in, Sunbeam.claim() auto-fires and reconciles the
 *     local pending bucket into the player's vault via the server
 *     claimPending Cloud Function. Server enforces low-trust caps and
 *     discards excess.
 *   - Plant minting (Sunbeam.mintPlant) stays account+server gated. An
 *     anonymous call returns { needSignIn:true } instead of an error.
 *
 * BUNDLED CONFIG
 *   The Firebase web config for the focus-grove-fffa8 project is bundled
 *   into this file so host games never see it. Host pages do NOT call
 *   firebase.initializeApp themselves; Sunbeam.init does that.
 *
 * AUTO-LOADING
 *   If window.firebase is not present, the SDK lazy-loads the Firebase
 *   compat scripts (app + auth + functions + firestore) from gstatic.com
 *   on first use. Total cold-start cost: ~250 KB gzipped, served from
 *   Google's CDN with long-tail caching.
 *
 * RATE LIMITS (client-side guards on the anon path; server enforces too)
 *   per-call:     1..200
 *   per-minute:   100 sunbeams (anon)
 *   per-day:      500 sunbeams (anon)
 *   The signed-in path goes straight to the earnHashes Cloud Function
 *   which enforces its own server limits (300/min, 5000/day per uid).
 *
 * ──────────────────────────────────────────────────────────────────────── */

(function(global){
  'use strict';

  var VERSION = '2.0.0';

  // ── Bundled Firebase config (public; only identifies the project) ──
  var FIREBASE_CONFIG = {
    apiKey:            'AIzaSyBAE_JvPixhHwt4ziu8LdZ7HAszd9T58zY',
    authDomain:        'focus-grove-fffa8.firebaseapp.com',
    projectId:         'focus-grove-fffa8',
    storageBucket:     'focus-grove-fffa8.firebasestorage.app',
    messagingSenderId: '739627513827',
    appId:             '1:739627513827:web:3d4088a90fd388730652d6'
  };
  var FUNCTIONS_REGION = 'us-central1';
  var FIREBASE_COMPAT_VERSION = '10.7.0';
  var FIREBASE_COMPAT_BASE = 'https://www.gstatic.com/firebasejs/' + FIREBASE_COMPAT_VERSION + '/';
  var FIREBASE_COMPAT_MODULES = ['firebase-app-compat.js','firebase-auth-compat.js','firebase-functions-compat.js','firebase-firestore-compat.js'];

  // ── Client-side anon guards (server enforces final caps independently) ──
  var MAX_PER_CALL = 200;
  var MAX_PER_MINUTE_ANON = 100;
  var MAX_PER_DAY_ANON = 500;

  // ── localStorage keys ──
  var KEY_PENDING = 'sws_pending_sunbeams';
  var KEY_ANON_ID = 'sws_sunbeam_anon_id';
  var KEY_CONFIRMED_CACHE = 'sws_sunbeam_confirmed_cache';

  // ── Internal state ──
  var _gameId = null;
  var _initialized = false;
  var _initPromise = null;
  var _firebase = null;
  var _auth = null;
  var _functions = null;
  var _firestore = null;
  var _earnFn = null;
  var _claimFn = null;
  var _mintFn = null;
  var _listeners = [];
  var _autoClaimInFlight = false;

  function _now(){ return Date.now(); }
  function _dayBucket(ms){ return Math.floor(ms / 86400000); }
  function _minuteBucket(ms){ return Math.floor(ms / 60000); }

  function _err(code, msg){
    var e = new Error(msg); e.code = code; return e;
  }

  function _safeGet(key){
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
    catch(e) { return null; }
  }
  function _safeSet(key, val){
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch(e) { return false; }
  }
  function _safeRemove(key){
    try { localStorage.removeItem(key); } catch(e) {}
  }

  function _readPending(){
    var p = _safeGet(KEY_PENDING);
    if (!p || typeof p !== 'object') {
      p = { amount: 0, dailyBucket: { day: 0, earned: 0 }, minuteBucket: { minute: 0, earned: 0 }, lastEarnAt: 0, lastSource: '' };
    }
    if (typeof p.amount !== 'number' || !isFinite(p.amount) || p.amount < 0) p.amount = 0;
    return p;
  }
  function _writePending(p){
    _safeSet(KEY_PENDING, p);
  }

  function _getOrCreateAnonId(){
    var id = (_safeGet(KEY_ANON_ID) || {}).id;
    if (typeof id === 'string' && id.length > 6) return id;
    // RFC4122-ish v4 (good enough for an opaque correlation id; not security-sensitive)
    var rnd;
    try {
      rnd = new Uint8Array(16);
      (global.crypto || global.msCrypto).getRandomValues(rnd);
    } catch (e) {
      rnd = [];
      for (var i = 0; i < 16; i++) rnd.push(Math.floor(Math.random() * 256));
    }
    rnd[6] = (rnd[6] & 0x0f) | 0x40;
    rnd[8] = (rnd[8] & 0x3f) | 0x80;
    var hex = '';
    for (var j = 0; j < 16; j++) hex += ('0' + rnd[j].toString(16)).slice(-2);
    id = 'anon-' + hex.slice(0,8) + '-' + hex.slice(8,12) + '-' + hex.slice(12,16) + '-' + hex.slice(16,20) + '-' + hex.slice(20);
    _safeSet(KEY_ANON_ID, { id: id, createdAt: _now() });
    return id;
  }

  function _readConfirmedCache(){
    var c = _safeGet(KEY_CONFIRMED_CACHE);
    if (!c || typeof c !== 'object') return { earned: 0, spent: 0, balance: 0, at: 0 };
    return c;
  }
  function _writeConfirmedCache(c){ _safeSet(KEY_CONFIRMED_CACHE, c); }

  function _emit(reason){
    var snap;
    try { snap = _snapshotSync(); } catch (e) { return; }
    snap.lastChange = reason || 'unknown';
    for (var i = 0; i < _listeners.length; i++) {
      try { _listeners[i](snap); } catch (e) {}
    }
  }

  function _snapshotSync(){
    var pending = _readPending().amount;
    var conf = _readConfirmedCache();
    return {
      confirmed: conf.balance || 0,
      pending: pending,
      uid: (_auth && _auth.currentUser) ? _auth.currentUser.uid : null,
      signedIn: !!(_auth && _auth.currentUser),
      gameId: _gameId
    };
  }

  // ── Lazy-load Firebase compat from gstatic if not already loaded ──
  function _loadScript(src){
    return new Promise(function(resolve, reject){
      var s = document.createElement('script');
      s.src = src; s.async = false;   // preserve load order
      s.onload = function(){ resolve(src); };
      s.onerror = function(){ reject(_err('script-load', 'Failed to load ' + src)); };
      document.head.appendChild(s);
    });
  }

  function _ensureFirebaseCompat(){
    if (global.firebase && typeof global.firebase.initializeApp === 'function'
        && typeof global.firebase.auth === 'function'
        && typeof global.firebase.functions === 'function'
        && typeof global.firebase.firestore === 'function') {
      return Promise.resolve(global.firebase);
    }
    var chain = Promise.resolve();
    FIREBASE_COMPAT_MODULES.forEach(function(m){
      chain = chain.then(function(){ return _loadScript(FIREBASE_COMPAT_BASE + m); });
    });
    return chain.then(function(){
      if (!global.firebase) throw _err('no-firebase', 'firebase global missing after compat load');
      return global.firebase;
    });
  }

  // ── LW localStorage queue mirror ────────────────────────────────────
  // LW (lucidwinds.com/) computes its on-screen sunbeam total from
  // localStorage keys `pw_readyHashes` (queue of pre-minted plant hashes)
  // and `pw_hashFilled` (progress toward next 30). The SDK lives at the
  // same origin, so when a signed-in user earns sunbeams via the SDK we
  // can mirror those into the same keys to keep LW's display in sync.
  // We never SUBTRACT — only push state up to match the server. LW remains
  // the authority for mint consumption (which removes from the queue).
  function _genRandomHash(){
    var bytes;
    try {
      bytes = new Uint8Array(32);
      (global.crypto || global.msCrypto).getRandomValues(bytes);
    } catch (e) {
      bytes = new Array(32);
      for (var i = 0; i < 32; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    var hex = '';
    for (var k = 0; k < 32; k++) hex += ('0' + bytes[k].toString(16)).slice(-2);
    return hex;
  }
  function _readLwQueueState(){
    var ready = [], filled = 0;
    try {
      var rRaw = localStorage.getItem('pw_readyHashes');
      if (rRaw) { var r = JSON.parse(rRaw); if (Array.isArray(r)) ready = r; }
    } catch (e) {}
    try {
      var f = parseInt(localStorage.getItem('pw_hashFilled') || '0', 10);
      if (Number.isFinite(f) && f >= 0) filled = f;
    } catch (e) {}
    return { ready: ready, filled: filled };
  }
  function _writeLwQueueState(ready, filled){
    try { localStorage.setItem('pw_readyHashes', JSON.stringify(ready)); } catch (e) {}
    try { localStorage.setItem('pw_hashFilled', String(filled)); } catch (e) {}
  }
  // Reconcile LW queue UP to the server balance. Called on signed-in
  // refresh. Never reduces.
  function _reconcileLwQueueToServer(serverEarned, serverSpent){
    try {
      var serverBalance = (serverEarned || 0) - (serverSpent || 0);
      var st = _readLwQueueState();
      var localBalance = (st.ready.length * 30) + st.filled;
      if (serverBalance <= localBalance) return;
      var target = serverBalance;
      var targetReady = Math.floor(target / 30);
      var targetFilled = target - (targetReady * 30);
      while (st.ready.length < targetReady) st.ready.push(_genRandomHash());
      _writeLwQueueState(st.ready, targetFilled);
      // Also sync the legacy hashLedger localStorage key so LW's
      // getHashLedger() reads consistent values.
      try {
        localStorage.setItem('sws_hash_ledger', JSON.stringify({
          earned: serverEarned || 0,
          spent: serverSpent || 0
        }));
      } catch (e) {}
    } catch (e) {}
  }
  // Mirror a single SDK earn into the LW queue (signed-in only).
  function _mirrorEarnToLwQueue(amount){
    if (!amount || amount < 1) return;
    try {
      var st = _readLwQueueState();
      var filled = st.filled + amount;
      while (filled >= 30) {
        st.ready.push(_genRandomHash());
        filled -= 30;
      }
      _writeLwQueueState(st.ready, filled);
    } catch (e) {}
  }

  // ── Server-side ledger refresh (read-only) ──
  function _refreshConfirmed(){
    if (!_auth || !_auth.currentUser || !_firestore) return Promise.resolve(_readConfirmedCache());
    var uid = _auth.currentUser.uid;
    return _firestore.collection('vaults').doc(uid).get().then(function(doc){
      var data = doc.exists ? (doc.data() || {}) : {};
      var ledger = data.hashLedger || { earned: 0, spent: 0 };
      var snap = {
        earned: ledger.earned || 0,
        spent: ledger.spent || 0,
        balance: (ledger.earned || 0) - (ledger.spent || 0),
        at: _now()
      };
      _writeConfirmedCache(snap);
      // Reconcile LW's local queue UP to the server balance. One-way
      // (never reduces); LW remains authority for mint consumption.
      _reconcileLwQueueToServer(snap.earned, snap.spent);
      return snap;
    }).catch(function(){ return _readConfirmedCache(); });
  }

  // ── Auto-claim hook ──
  function _maybeAutoClaim(){
    if (_autoClaimInFlight) return Promise.resolve(null);
    var p = _readPending();
    if (!p.amount || p.amount <= 0) return Promise.resolve(null);
    if (!_auth || !_auth.currentUser) return Promise.resolve(null);
    _autoClaimInFlight = true;
    return claim().then(function(r){
      _autoClaimInFlight = false;
      return r;
    }).catch(function(e){
      _autoClaimInFlight = false;
      // Silent — manual Sunbeam.claim() still available
      return null;
    });
  }

  // ── Public: init ──
  function init(opts){
    opts = opts || {};
    if (_initialized) return _initPromise || Promise.resolve(_snapshotSync());
    if (typeof opts.gameId !== 'string' || !opts.gameId) {
      return Promise.reject(_err('invalid-argument', 'init({gameId}) requires a string gameId.'));
    }
    _gameId = opts.gameId.slice(0, 32);

    _initPromise = _ensureFirebaseCompat().then(function(fb){
      _firebase = fb;
      // initializeApp is idempotent only if the same name. Use a SDK-specific app name to avoid clobbering host pages that may also use Firebase.
      var appName = 'sunbeam-sdk';
      var app;
      try {
        app = _firebase.app(appName);
      } catch (e) {
        app = _firebase.initializeApp(FIREBASE_CONFIG, appName);
      }
      _auth = _firebase.auth(app);
      _functions = _firebase.functions(app);
      try { _functions = _firebase.app(appName).functions(FUNCTIONS_REGION) || _functions; } catch(e){}
      _firestore = _firebase.firestore(app);
      _earnFn = _functions.httpsCallable('earnHashes');
      _claimFn = _functions.httpsCallable('claimPending');
      _mintFn = _functions.httpsCallable('mintPlant');

      _auth.onAuthStateChanged(function(user){
        _emit('auth');
        if (user) {
          _refreshConfirmed().then(_maybeAutoClaim).then(function(r){
            if (r) _emit('claim');
          });
        }
      });

      _initialized = true;

      return new Promise(function(resolve){
        // Wait for first auth state resolve (signed-in or not) before reporting ready
        var unsub = _auth.onAuthStateChanged(function(user){
          try { unsub(); } catch(e){}
          var refresh = user ? _refreshConfirmed() : Promise.resolve(null);
          refresh.then(function(){
            resolve({
              ready: true,
              signedIn: !!user,
              uid: user ? user.uid : null,
              gameId: _gameId,
              version: VERSION,
              anonId: _getOrCreateAnonId()
            });
          });
        });
      });
    });
    return _initPromise;
  }

  // ── Public: earn ──
  function earn(amount, source){
    if (!_initialized) return Promise.reject(_err('not-initialized', 'Call Sunbeam.init({gameId}) first.'));

    // Argument validation
    if (typeof amount !== 'number' || !isFinite(amount) || amount !== Math.floor(amount) || amount < 1) {
      return Promise.reject(_err('invalid-argument', 'earn(amount) must be a positive integer.'));
    }
    if (amount > MAX_PER_CALL) {
      return Promise.reject(_err('invalid-argument', 'earn(amount) exceeds per-call cap of ' + MAX_PER_CALL + '.'));
    }
    var src = (typeof source === 'string' && source) ? source.slice(0, 32) : (_gameId || 'sdk-unknown');

    // ── Cross-origin host bridge ──────────────────────────────────────
    // When this game is embedded in an iframe by a host on another origin
    // (e.g. Lucid Winds' GAME tab loading a github.io / Vercel game), the
    // local credit paths below land in THIS origin's storage/auth, which
    // the host wallet can't read (per-origin localStorage). Post the earn
    // up to the host so it can credit the signed-in host player. Harmless
    // when not embedded (no parent) or when the host ignores it.
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ source: 'sunbeam-sdk', type: 'earn', amount: amount, src: src }, '*');
      }
    } catch (e) {}

    if (_auth && _auth.currentUser) {
      // ── Signed-in path: server is the source of truth ──
      return _earnFn({ amount: amount, source: src }).then(function(res){
        var data = res && res.data ? res.data : {};
        var conf = _readConfirmedCache();
        if (typeof data.balance === 'number') {
          conf.balance = data.balance;
          conf.earned = data.earned || conf.earned;
          conf.at = _now();
          _writeConfirmedCache(conf);
        }
        // Mirror this earn into LW's localStorage queue so LW's
        // keeper-bar display stays in sync without a vault reload.
        _mirrorEarnToLwQueue(amount);
        _emit('earn');
        return {
          ok: !!data.ok,
          balance: data.balance || conf.balance || 0,
          earned: data.earned || 0,
          pending: _readPending().amount
        };
      });
    }

    // ── Anonymous path: increment localStorage pending bucket with guards ──
    var p = _readPending();
    var now = _now();
    var minB = _minuteBucket(now);
    var dayB = _dayBucket(now);
    if (p.minuteBucket.minute !== minB) p.minuteBucket = { minute: minB, earned: 0 };
    if (p.dailyBucket.day !== dayB)     p.dailyBucket  = { day: dayB,  earned: 0 };

    var allowedByMinute = Math.max(0, MAX_PER_MINUTE_ANON - p.minuteBucket.earned);
    var allowedByDay    = Math.max(0, MAX_PER_DAY_ANON    - p.dailyBucket.earned);
    var credit = Math.min(amount, allowedByMinute, allowedByDay);

    if (credit > 0) {
      p.amount += credit;
      p.minuteBucket.earned += credit;
      p.dailyBucket.earned += credit;
      p.lastEarnAt = now;
      p.lastSource = src;
      _writePending(p);
    }
    _emit('earn');

    return Promise.resolve({
      ok: credit > 0,
      balance: _readConfirmedCache().balance || 0,
      earned: credit,
      pending: p.amount
    });
  }

  // ── Public: balance ──
  function balance(opts){
    if (!_initialized) return Promise.reject(_err('not-initialized', 'Call Sunbeam.init({gameId}) first.'));
    var pendingNow = _readPending().amount;
    if (!_auth || !_auth.currentUser) {
      return Promise.resolve({ confirmed: 0, pending: pendingNow });
    }
    var force = opts && opts.refresh;
    var cache = _readConfirmedCache();
    var cacheAge = _now() - (cache.at || 0);
    if (!force && cacheAge < 60000) {
      return Promise.resolve({ confirmed: cache.balance || 0, pending: pendingNow });
    }
    return _refreshConfirmed().then(function(snap){
      return { confirmed: snap.balance || 0, pending: _readPending().amount };
    });
  }

  // ── Public: claim ──
  function claim(){
    if (!_initialized) return Promise.reject(_err('not-initialized', 'Call Sunbeam.init({gameId}) first.'));
    if (!_auth || !_auth.currentUser) return Promise.reject(_err('unauthenticated', 'claim() requires a signed-in user.'));

    var p = _readPending();
    if (!p.amount || p.amount <= 0) {
      return Promise.resolve({ ok: true, credited: 0, discarded: 0, balance: _readConfirmedCache().balance || 0, pending: 0 });
    }
    var anonId = _getOrCreateAnonId();
    var pendingToSend = p.amount;
    return _claimFn({ pending: pendingToSend, anonId: anonId, gameId: _gameId }).then(function(res){
      var data = res && res.data ? res.data : {};
      // Drain only what the server actually credited. Anything refused by
      // the per-call/daily caps STAYS in the local bucket and rolls over
      // to a future claim — previously it was silently discarded, so a
      // 15-40-sunbeam session arriving past the 50/day cap simply
      // evaporated (Jun-10 audit HIGH). The server re-applies its caps on
      // every claim, so keeping the remainder client-side grants nothing
      // by itself.
      var remaining = _readPending();
      var raceDelta = remaining.amount > pendingToSend ? remaining.amount - pendingToSend : 0;
      var unCredited = pendingToSend - (typeof data.credited === 'number' ? data.credited : 0);
      if (unCredited < 0) unCredited = 0;
      remaining.amount = raceDelta + unCredited;
      _writePending(remaining);
      if (typeof data.balance === 'number') {
        var conf = _readConfirmedCache();
        conf.balance = data.balance;
        conf.earned = data.earned || conf.earned;
        conf.at = _now();
        _writeConfirmedCache(conf);
      }
      _emit('claim');
      return {
        ok: !!data.ok,
        credited: data.credited || 0,
        discarded: data.discarded || 0,
        balance: data.balance || 0,
        pending: _readPending().amount
      };
    });
  }

  // ── Public: mintPlant ──
  function mintPlant(opts){
    if (!_initialized) return Promise.reject(_err('not-initialized', 'Call Sunbeam.init({gameId}) first.'));
    if (!_auth || !_auth.currentUser) {
      return Promise.resolve({ ok: false, needSignIn: true, reason: 'sign-in-required' });
    }
    var src = (opts && typeof opts.source === 'string') ? opts.source.slice(0, 32) : (_gameId || 'sdk-mint');
    return _mintFn({ source: src }).then(function(res){
      var data = res && res.data ? res.data : {};
      // Server has spent 30; refresh local confirmed
      _refreshConfirmed().then(function(){ _emit('mint'); });
      return data;
    });
  }

  // ── Public: onChange ──
  function onChange(cb){
    if (typeof cb !== 'function') throw _err('invalid-argument', 'onChange(cb) requires a function.');
    _listeners.push(cb);
    // Fire one immediate snapshot so UIs render initial state
    try { cb(_snapshotSync()); } catch(e){}
    return function unsubscribe(){
      var i = _listeners.indexOf(cb);
      if (i >= 0) _listeners.splice(i, 1);
    };
  }

  // ── Auth helpers (optional but commonly needed by host pages) ──
  function signInWithGoogle(){
    if (!_initialized) return Promise.reject(_err('not-initialized', 'Call Sunbeam.init first.'));
    var p = new _firebase.auth.GoogleAuthProvider();
    p.addScope('email');
    return _auth.signInWithPopup(p).catch(function(err){
      if (err && err.code === 'auth/popup-blocked') return _auth.signInWithRedirect(p);
      throw err;
    });
  }
  function signInWithEmail(email, password){
    if (!_initialized) return Promise.reject(_err('not-initialized', 'Call Sunbeam.init first.'));
    return _auth.signInWithEmailAndPassword(email, password);
  }
  function createAccount(email, password){
    if (!_initialized) return Promise.reject(_err('not-initialized', 'Call Sunbeam.init first.'));
    return _auth.createUserWithEmailAndPassword(email, password);
  }
  function signOut(){
    if (!_initialized) return Promise.reject(_err('not-initialized', 'Call Sunbeam.init first.'));
    return _auth.signOut();
  }

  // ── Export ──
  global.Sunbeam = {
    VERSION: VERSION,
    init: init,
    earn: earn,
    balance: balance,
    claim: claim,
    mintPlant: mintPlant,
    onChange: onChange,
    // Optional helpers
    signInWithGoogle: signInWithGoogle,
    signInWithEmail: signInWithEmail,
    createAccount: createAccount,
    signOut: signOut,
    // Read-only diagnostic
    _snapshot: _snapshotSync,
    _getAnonId: _getOrCreateAnonId
  };

})(typeof window !== 'undefined' ? window : this);
