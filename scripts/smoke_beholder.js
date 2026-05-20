/*
 * Focused jsdom assertion for the 2026-05-20 Beholder leveling fix.
 *
 * Verifies:
 *   1. _checkBeholderOmnisight no longer early-returns when Beholder is
 *      EQUIPPED (idx 38) but not in greenhouse.
 *   2. The XP bump at the end of the function actually fires, persisting
 *      to lw_companion_xp[38].c.
 *   3. _LW_companionOwned(38) returns true for an equipped-only Beholder.
 */
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var { JSDOM, VirtualConsole } = require('jsdom');

var ROOT = path.join(__dirname, '..');
var html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
var stripped = html.replace(/<script\s+src=["'][^"']+["']\s*><\/script>/gi, '');

var vConsole = new VirtualConsole();

var dom = new JSDOM(stripped, {
  url: 'https://lucidwinds.com/',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole: vConsole,
  beforeParse: function(window) {
    try { window.crypto = crypto.webcrypto; } catch(e) {}
    var noopFn = function(){ return Promise.resolve({ data: { ok: false } }); };
    var unsubFn = function(){};
    window.firebase = {
      initializeApp: function(){ return {}; },
      auth: function(){ return { currentUser:null, onAuthStateChanged: function(cb){ if(cb)setTimeout(function(){cb(null);},0); return unsubFn; }, signOut: function(){ return Promise.resolve(); }, createUserWithEmailAndPassword: noopFn, signInWithEmailAndPassword: noopFn, signInWithPopup: noopFn, GoogleAuthProvider: function(){}, FacebookAuthProvider: function(){} }; },
      firestore: function(){
        var coll = function(){ return { doc: function(){ return { get: noopFn, set: noopFn, update: noopFn, onSnapshot: function(){ return unsubFn; } }; }, where: function(){ return { get: noopFn, limit: function(){ return { get: noopFn }; }, orderBy: function(){ return { get: noopFn, limit: function(){ return { get: noopFn }; } }; } }; }, get: noopFn, add: noopFn, onSnapshot: function(){ return unsubFn; } }; };
        return { collection: coll, doc: function(){ return { get: noopFn, set: noopFn, onSnapshot: function(){ return unsubFn; } }; }, FieldValue: { serverTimestamp: function(){ return 0; }, increment: function(){ return 0; }, delete: function(){ return null; } } };
      },
      functions: function(){ return { httpsCallable: function(){ return noopFn; } }; }
    };
    var Lnode = function(){ return Lnode; };
    Lnode.map = function(){ return { setView: function(){ return Lnode; }, on: function(){ return Lnode; }, off: function(){ return Lnode; }, removeLayer: function(){}, addLayer: function(){}, hasLayer: function(){ return false; }, invalidateSize: function(){} }; };
    Lnode.marker = function(){ return { addTo: function(){ return Lnode; }, on: function(){ return Lnode; }, bindPopup: function(){ return Lnode; }, remove: function(){} }; };
    Lnode.tileLayer = function(){ return { addTo: function(){ return Lnode; } }; };
    Lnode.divIcon = function(){ return {}; };
    Lnode.icon = function(){ return {}; };
    Lnode.polygon = function(){ return { addTo: function(){ return Lnode; }, on: function(){ return Lnode; }, remove: function(){} }; };
    Lnode.latLng = function(a,b){ return { lat:a, lng:b }; };
    Lnode.latLngBounds = function(){ return { extend: function(){} }; };
    Lnode.Control = { extend: function(){ return function(){ return { onAdd: function(){ return document.createElement('div'); }, addTo: function(){} }; }; } };
    window.L = Lnode;
    window.gtag = function(){};
    window.ga = function(){};
    window.dataLayer = [];
    window.LW_ACH = { bump: function(){}, set: function(){}, add: function(){}, get: function(){ return 0; }, progress: function(){ return {}; }, claim: function(){ return null; }, catalog: [] };
    if (!window.navigator.serviceWorker) {
      Object.defineProperty(window.navigator, 'serviceWorker', { value: { register: function(){ return Promise.resolve({}); }, getRegistration: function(){ return Promise.resolve(null); } } });
    }
    window.navigator.vibrate = function(){};
    window.navigator.share = undefined;
    window.navigator.geolocation = { getCurrentPosition: function(){}, watchPosition: function(){}, clearWatch: function(){} };
  }
});

var window = dom.window;
window.addEventListener('load', function(){ setTimeout(runChecks, 100); });

setTimeout(function(){ console.error('TIMEOUT'); process.exit(2); }, 15000);

function runChecks(){
  var results = [];
  function check(name, fn){
    try { var r = fn(); results.push({ name: name, ok: !!r.ok, detail: r.detail || '' }); }
    catch(e) { results.push({ name: name, ok: false, detail: 'THREW: ' + (e && e.message || e) }); }
  }

  check('_LW_companionOwned exists and is callable', function(){
    return { ok: typeof window._LW_companionOwned === 'function' };
  });

  check('_LW_companionOwned(38) true when EQUIPPED in slot 1 (no greenhouse Beholder)', function(){
    if (!window._LW_companionOwned) return { ok:false, detail:'no fn' };
    window.localStorage.setItem('sws_greenhouse', '[]'); // no plants
    window.localStorage.setItem('fg_wild_plants', '[]');
    window.localStorage.setItem('lw_companion_active_idx', '38');
    window.localStorage.removeItem('lw_companion_active_idx_2');
    window.localStorage.removeItem('pw_active_companion');
    var owned = window._LW_companionOwned(38);
    return { ok: owned === true, detail: 'owned=' + owned };
  });

  check('_LW_companionOwned(38) false when nothing owns it', function(){
    if (!window._LW_companionOwned) return { ok:false, detail:'no fn' };
    window.localStorage.setItem('sws_greenhouse', '[]');
    window.localStorage.setItem('fg_wild_plants', '[]');
    window.localStorage.removeItem('lw_companion_active_idx');
    window.localStorage.removeItem('lw_companion_active_idx_2');
    window.localStorage.removeItem('pw_active_companion');
    var owned = window._LW_companionOwned(38);
    return { ok: owned === false, detail: 'owned=' + owned };
  });

  check('_checkBeholderOmnisight bumps Beholder XP when equipped only', function(){
    if (!window._checkBeholderOmnisight) return { ok:false, detail:'no fn' };
    window.localStorage.setItem('sws_greenhouse', '[]');
    window.localStorage.setItem('fg_wild_plants', '[]');
    window.localStorage.setItem('lw_companion_active_idx', '38'); // EQUIPPED Beholder only
    window.localStorage.removeItem('lw_companion_active_idx_2');
    window.localStorage.removeItem('pw_active_companion');
    window.localStorage.removeItem('lw_companion_xp');
    window.localStorage.removeItem('lw_witness_xp_last');
    window._checkBeholderOmnisight();
    var xp = {}; try { xp = JSON.parse(window.localStorage.getItem('lw_companion_xp') || '{}'); } catch(e){}
    var beholderC = (xp[38] && xp[38].c) || 0;
    return { ok: beholderC >= 1, detail: 'beholder xp count=' + beholderC };
  });

  check('_checkBeholderOmnisight respects the 1h rate limit', function(){
    if (!window._checkBeholderOmnisight) return { ok:false, detail:'no fn' };
    window.localStorage.setItem('lw_companion_active_idx', '38');
    window.localStorage.removeItem('lw_companion_xp');
    // Set last-bump to NOW so the rate limit blocks the next call.
    window.localStorage.setItem('lw_witness_xp_last', String(Date.now()));
    window._checkBeholderOmnisight();
    var xp = {}; try { xp = JSON.parse(window.localStorage.getItem('lw_companion_xp') || '{}'); } catch(e){}
    var beholderC = (xp[38] && xp[38].c) || 0;
    return { ok: beholderC === 0, detail: 'xp count after rate-limit block=' + beholderC + ' (want 0)' };
  });

  console.log('');
  console.log('=== Beholder leveling fix ===');
  var pass=0,fail=0;
  results.forEach(function(r){ console.log((r.ok?'  ✓ ':'  ✗ ')+r.name+(r.detail?'   → '+r.detail:'')); if(r.ok)pass++; else fail++; });
  console.log('');
  console.log(pass + ' pass, ' + fail + ' fail');
  process.exit(fail ? 1 : 0);
}
