/* ════════════════════════════════════════════════════════════════════════
 * Lucid Winds — Sunbeam SDK
 *
 * A drop-in JavaScript SDK for external games in the Sky Wolf Studios
 * constellation to earn, claim, and read the shared Sunbeam currency.
 *
 *   Hosted at: https://lucidwinds.com/sunbeam-sdk.js
 *   Version:   1.0.0
 *   License:   See lucidwinds.com (do not redistribute)
 *
 * QUICK INTEGRATION (host page already uses Firebase v8/v9-compat):
 *
 *   <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"></script>
 *   <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js"></script>
 *   <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-functions-compat.js"></script>
 *   <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js"></script>
 *   <script src="https://lucidwinds.com/sunbeam-sdk.js"></script>
 *   <script>
 *     firebase.initializeApp({
 *       apiKey:            'AIzaSyBAE_JvPixhHwt4ziu8LdZ7HAszd9T58zY',
 *       authDomain:        'focus-grove-fffa8.firebaseapp.com',
 *       projectId:         'focus-grove-fffa8',
 *       storageBucket:     'focus-grove-fffa8.firebasestorage.app',
 *       messagingSenderId: '739627513827',
 *       appId:             '1:739627513827:web:3d4088a90fd388730652d6'
 *     });
 *     LucidWindsSunbeams.init();        // auto-detects firebase global
 *
 *     LucidWindsSunbeams.onAuthChange(function(user){
 *       if (user) console.log('Signed in as', user.uid, '— begin gameplay');
 *       else      LucidWindsSunbeams.signInWithGoogle();
 *     });
 *
 *     // Inside your game, on a meaningful event:
 *     LucidWindsSunbeams.earn(3, 'glyphforge:level_complete')
 *       .then(function(r){ updateBalanceUI(r.balance); });
 *   </script>
 *
 * AUTH:
 *   This SDK does NOT bundle Firebase. The host page is responsible for
 *   loading the Firebase Compat SDK and calling initializeApp() with the
 *   Lucid Winds Firebase config above. The player signs in once (Google,
 *   Facebook, or Email/Password) and the same uid earns sunbeams across
 *   every constellation game on every authorized domain.
 *
 * DOMAIN AUTHORIZATION:
 *   Each constellation domain (e.g. glyphforge.lucidwinds.com,
 *   tarotrun.lucidwinds.com, custom domains) must be added to
 *   Firebase Console → Authentication → Settings → Authorized domains.
 *   Without this, signInWithPopup() will fail with auth/unauthorized-domain.
 *   The earnHashes / claimPending Cloud Functions themselves have no
 *   per-domain restriction — they only require a valid Firebase ID token.
 *
 * RATE LIMITS (per uid, enforced by the Cloud Function):
 *   earnHashes:  amount 1..200 per call; 300/min; 5000/day
 *   claimPending: ~2s cooldown between calls; up to 200 rewards per call
 *
 * ──────────────────────────────────────────────────────────────────────── */

(function(global){
  'use strict';

  var VERSION = '1.0.0';

  // ── Internal state ──
  var _firebase = null;       // firebase compat global
  var _auth = null;
  var _functions = null;
  var _firestore = null;
  var _region = 'us-central1';
  var _initialized = false;
  var _earnFn = null;
  var _claimFn = null;

  function _err(code, msg){
    var e = new Error(msg);
    e.code = code;
    return e;
  }

  function _requireInit(){
    if (!_initialized) {
      throw _err('not-initialized',
        'LucidWindsSunbeams.init() must be called before any API method. ' +
        'Make sure firebase.initializeApp() has already run.');
    }
  }

  function _requireSignedIn(){
    _requireInit();
    if (!_auth || !_auth.currentUser) {
      throw _err('unauthenticated', 'No Firebase user is signed in.');
    }
  }

  // ── Public API ──

  /**
   * Initialize the SDK against a Firebase compat instance.
   * @param {object} [opts]
   * @param {object} [opts.firebase]   firebase compat global (defaults to window.firebase)
   * @param {string} [opts.region]     Cloud Functions region (default: 'us-central1')
   */
  function init(opts){
    opts = opts || {};
    _firebase = opts.firebase || global.firebase || null;
    if (!_firebase) {
      throw _err('no-firebase',
        'Firebase compat global not found. Load firebase-app-compat.js + ' +
        'firebase-auth-compat.js + firebase-functions-compat.js before sunbeam-sdk.js, ' +
        'or pass {firebase: yourFirebase} to init().');
    }
    if (typeof _firebase.auth !== 'function') {
      throw _err('no-firebase-auth',
        'firebase.auth() is unavailable. Include firebase-auth-compat.js.');
    }
    if (typeof _firebase.functions !== 'function') {
      throw _err('no-firebase-functions',
        'firebase.functions() is unavailable. Include firebase-functions-compat.js.');
    }
    _region = opts.region || _region;
    _auth = _firebase.auth();
    _functions = _firebase.functions(undefined, _region) || _firebase.functions();
    _firestore = (typeof _firebase.firestore === 'function') ? _firebase.firestore() : null;
    _earnFn = _functions.httpsCallable('earnHashes');
    _claimFn = _functions.httpsCallable('claimPending');
    _initialized = true;
    return { version: VERSION, region: _region };
  }

  /**
   * Award sunbeams to the signed-in player. Validated and rate-limited server-side.
   * @param {number} amount   integer, 1..200
   * @param {string} source   short label (<=32 chars), recommended "<gameId>:<event>"
   * @returns {Promise<{ok, balance, earned, source}>}
   */
  function earn(amount, source){
    try { _requireSignedIn(); } catch (e) { return Promise.reject(e); }
    if (typeof amount !== 'number' || !isFinite(amount) || amount !== Math.floor(amount) || amount < 1) {
      return Promise.reject(_err('invalid-argument', 'earn(amount) must be a positive integer.'));
    }
    if (amount > 200) {
      return Promise.reject(_err('invalid-argument', 'earn(amount) exceeds per-call cap of 200.'));
    }
    var src = (typeof source === 'string' && source) ? source.slice(0, 32) : 'sdk-unknown';
    return _earnFn({ amount: amount, source: src }).then(function(res){
      return res && res.data ? res.data : { ok: false };
    });
  }

  /**
   * Atomically claim every pending reward into the player's hashLedger / dewLedger.
   * Safe to call when there are zero rewards (returns { count: 0 }).
   * @returns {Promise<{ok, credited, count, items, balance}>}
   */
  function claimPending(){
    try { _requireSignedIn(); } catch (e) { return Promise.reject(e); }
    return _claimFn().then(function(res){
      return res && res.data ? res.data : { ok: false };
    });
  }

  /**
   * Read the player's current sunbeam balance directly from Firestore.
   * Returns { earned, spent, balance } where balance = earned - spent.
   * Requires Firestore SDK on the host page.
   * @returns {Promise<{earned:number, spent:number, balance:number}>}
   */
  function getBalance(){
    try { _requireSignedIn(); } catch (e) { return Promise.reject(e); }
    if (!_firestore) {
      return Promise.reject(_err('no-firestore',
        'firebase.firestore() unavailable. Include firebase-firestore-compat.js to use getBalance().'));
    }
    var uid = _auth.currentUser.uid;
    return _firestore.collection('vaults').doc(uid).get().then(function(doc){
      var data = doc.exists ? (doc.data() || {}) : {};
      var ledger = data.hashLedger || { earned: 0, spent: 0 };
      return {
        earned:  ledger.earned || 0,
        spent:   ledger.spent  || 0,
        balance: (ledger.earned || 0) - (ledger.spent || 0)
      };
    });
  }

  /**
   * Subscribe to auth state. Callback fires immediately with current state,
   * then on every sign-in / sign-out. Returns the unsubscribe function.
   * @param {function} cb fn(user|null)
   * @returns {function} unsubscribe
   */
  function onAuthChange(cb){
    _requireInit();
    if (typeof cb !== 'function') throw _err('invalid-argument', 'onAuthChange(cb) requires a function.');
    return _auth.onAuthStateChanged(function(user){
      cb(user ? {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      } : null);
    });
  }

  /** True if there's a currently-signed-in Firebase user. */
  function isSignedIn(){
    return !!(_initialized && _auth && _auth.currentUser);
  }

  /** Current uid, or null if not signed in. */
  function getCurrentUid(){
    return isSignedIn() ? _auth.currentUser.uid : null;
  }

  /**
   * Convenience: open the Google sign-in popup. Falls back to redirect
   * on popup-blocked (mobile Safari, in-app browsers).
   * @returns {Promise<{uid, email, displayName}>}
   */
  function signInWithGoogle(){
    _requireInit();
    var p = new _firebase.auth.GoogleAuthProvider();
    p.addScope('email');
    return _auth.signInWithPopup(p)
      .then(function(res){
        var u = res && res.user;
        return u ? { uid: u.uid, email: u.email, displayName: u.displayName } : null;
      })
      .catch(function(err){
        if (err && err.code === 'auth/popup-blocked') {
          return _auth.signInWithRedirect(p);
        }
        throw err;
      });
  }

  /** Sign the current player out. */
  function signOut(){
    _requireInit();
    return _auth.signOut();
  }

  // ── Export ──
  global.LucidWindsSunbeams = {
    VERSION: VERSION,
    init: init,
    earn: earn,
    claimPending: claimPending,
    getBalance: getBalance,
    onAuthChange: onAuthChange,
    isSignedIn: isSignedIn,
    getCurrentUid: getCurrentUid,
    signInWithGoogle: signInWithGoogle,
    signOut: signOut
  };

})(typeof window !== 'undefined' ? window : this);
