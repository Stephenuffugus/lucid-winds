/*
 * Sky Wolf Studio — _G contract test
 *
 * The window._G object is the utility API every modular game module
 * destructures at parse time. It exists in TWO places today:
 *
 *   1. Lucid Winds main app   — defined in index.html (the IIFE around
 *                                line 63129 sets window._G = { ... }).
 *   2. /play/ shell runtime   — defined in play/shell.js at module scope.
 *
 * If those two definitions drift — different keys, different arities,
 * different runtime behavior — a game will work in one surface and break
 * silently in the other. This harness loads BOTH in jsdom, snapshots
 * each _G, and compares them.
 *
 * It is READ-ONLY against index.html. It also smoke-calls each function
 * with a sample input to confirm none throws synchronously.
 *
 * Run: node scripts/test_g_contract.js
 * Exits non-zero on any drift or unexpected throw.
 *
 * Last verified contract:
 *   18 keys — e, play, playWin, st, xt, sm, ms, mm, mc, sh, sr, gr,
 *   setDiff, solEnterFS, solClearFS, solExitFS, getM, setM
 */
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var { JSDOM, VirtualConsole } = require('jsdom');

var ROOT = path.join(__dirname, '..');

// ─── Stubs used by both loaders (mirrors scripts/smoke.js) ────────────────
function installStubs(window){
  try { window.crypto = crypto.webcrypto; } catch(e) {}
  var noopFn = function(){ return Promise.resolve({ data: { ok: false } }); };
  var unsubFn = function(){};
  window.firebase = {
    initializeApp: function(){ return {}; },
    auth: function(){
      return {
        currentUser: null,
        onAuthStateChanged: function(cb){ if (cb) setTimeout(function(){ cb(null); }, 0); return unsubFn; },
        signOut: function(){ return Promise.resolve(); },
        createUserWithEmailAndPassword: noopFn,
        signInWithEmailAndPassword:    noopFn,
        signInWithPopup:               noopFn,
        GoogleAuthProvider:   function(){},
        FacebookAuthProvider: function(){}
      };
    },
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
  window.gtag = function(){}; window.ga = function(){}; window.dataLayer = [];
  window.LW_ACH = { bump:function(){}, set:function(){}, add:function(){}, progress:function(){return {};}, claim:function(){return null;}, catalog: [] };
  if (!window.navigator.serviceWorker) {
    Object.defineProperty(window.navigator, 'serviceWorker', { value: { register: function(){ return Promise.resolve({}); }, getRegistration: function(){ return Promise.resolve(null); } } });
  }
  window.navigator.vibrate = function(){};
  window.navigator.share = undefined;
  window.navigator.geolocation = { getCurrentPosition:function(){}, watchPosition:function(){}, clearWatch:function(){} };
}

function wait(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }

// ─── Load LW's _G by booting index.html in jsdom ─────────────────────────
async function loadLwG(){
  var html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  var stripped = html.replace(/<script\s+src=["'][^"']+["']\s*><\/script>/gi, '');
  var vConsole = new VirtualConsole();
  vConsole.on('jsdomError', function(){});
  var dom = new JSDOM(stripped, {
    url: 'https://lucidwinds.com/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole: vConsole,
    beforeParse: installStubs
  });
  // Wait for load + small settle so the IIFE that defines _G has run.
  await new Promise(function(resolve){ dom.window.addEventListener('load', resolve); });
  await wait(60);
  var _G = dom.window._G;
  return { _G: _G, win: dom.window };
}

// ─── Load shell's _G by evaluating shell.js in a clean jsdom window ──────
async function loadShellG(){
  var SHELL_JS = fs.readFileSync(path.join(ROOT, 'play', 'shell.js'), 'utf8');
  var vConsole = new VirtualConsole();
  vConsole.on('jsdomError', function(){});
  var dom = new JSDOM(
    '<!DOCTYPE html><html><head></head><body>'
    + '<header class="shell-hdr"><div id="shell-title"></div>'
    + '<div class="shell-wallet"><strong id="shell-bal"></strong>'
    + '<span id="shell-pend"></span><button id="shell-signin"></button></div></header>'
    + '<main id="shell-mount" class="shell-mount"></main>'
    + '</body></html>',
    {
      url: 'https://lucidwinds.com/play/contract-test.html',
      runScripts: 'outside-only',
      pretendToBeVisual: true,
      virtualConsole: vConsole
    }
  );
  var win = dom.window;
  win.LW_PLAY = { id: 'contract-test', name: 'Contract Test' };
  win.Sunbeam = {
    init:        function(){ return Promise.resolve({ ready: true, signedIn: false, uid: null, anonId: 'test' }); },
    earn:        function(amt){ return Promise.resolve({ ok: true, balance: 0, earned: amt, pending: amt }); },
    balance:     function(){ return Promise.resolve({ confirmed: 0, pending: 0 }); },
    claim:       function(){ return Promise.resolve({ ok: true }); },
    mintPlant:   function(){ return Promise.resolve({ ok: false, needSignIn: true }); },
    onChange:    function(){ return function(){}; },
    signInWithGoogle: function(){ return Promise.resolve(null); }
  };
  win.AudioContext = function(){ return { createOscillator: function(){ return { type:'sine', frequency:{ setValueAtTime: function(){} }, connect: function(){}, start: function(){}, stop: function(){} }; }, createGain: function(){ return { gain:{ setValueAtTime: function(){}, exponentialRampToValueAtTime: function(){} }, connect: function(){} }; }, currentTime: 0, destination: {} }; };
  win.eval(SHELL_JS);
  return { _G: win._G, win: win };
}

// ─── Smoke-call each function with a representative input. ───────────────
// Calls must NOT throw synchronously. Return values aren't compared (they
// vary by implementation), but we DO assert no exception.
function smokeCallEach(_G, win){
  var results = {};
  var doc = win.document;

  function mkDiv(){ return doc.createElement('div'); }
  function call(key, fn){
    try { fn(); results[key] = { ok: true }; }
    catch (e) { results[key] = { ok: false, err: (e && e.message) || String(e) }; }
  }

  call('e',          function(){ _G.e('progress'); });
  call('play',       function(){ _G.play('match'); });
  call('playWin',    function(){ _G.playWin(); });
  call('st',         function(){ _G.st(); });
  call('xt',         function(){ _G.xt(); });
  call('ms',         function(){ var d = mkDiv(); _G.ms(d, 'sample status'); });
  call('mm',         function(){ var d = mkDiv(); _G.mm(d, 'sample text'); });
  call('mc',         function(){ var d = mkDiv(); var r = _G.mc(d); if (!r) throw new Error('mc returned ' + r); });
  call('sm',         function(){ var d = mkDiv(); d.id = '_gm'; doc.body.appendChild(d); _G.sm('hello'); d.remove(); });
  call('sh',         function(){ var r = _G.sh([1,2,3,4,5]); if (!Array.isArray(r) || r.length !== 5) throw new Error('sh returned ' + JSON.stringify(r)); });
  call('sr',         function(){ _G.sr('contract-test', { w: true, s: 7 }); });
  call('gr',         function(){ var r = _G.gr(); if (typeof r !== 'object') throw new Error('gr returned ' + r); });
  call('setDiff',    function(){ _G.setDiff('medium'); });
  call('solEnterFS', function(){ _G.solEnterFS(); });
  call('solClearFS', function(){ _G.solClearFS(); });
  call('solExitFS',  function(){ _G.solExitFS(); });
  call('getM',       function(){ var r = _G.getM(); if (typeof r !== 'number') throw new Error('getM returned ' + r); });
  call('setM',       function(){ _G.setM(1.5); });
  return results;
}

// ─── Compare two _G snapshots ─────────────────────────────────────────────
function compare(lwG, shG){
  var lwKeys = Object.keys(lwG).sort();
  var shKeys = Object.keys(shG).sort();

  var report = {
    lwKeys: lwKeys,
    shKeys: shKeys,
    onlyLw: lwKeys.filter(function(k){ return shKeys.indexOf(k) < 0; }),
    onlySh: shKeys.filter(function(k){ return lwKeys.indexOf(k) < 0; }),
    shared: lwKeys.filter(function(k){ return shKeys.indexOf(k) >= 0; }),
    typeMismatches: [],
    arityDiffs: []
  };

  report.shared.forEach(function(k){
    var lwType = typeof lwG[k];
    var shType = typeof shG[k];
    if (lwType !== shType) report.typeMismatches.push({ key: k, lw: lwType, sh: shType });
    if (lwType === 'function' && shType === 'function') {
      // function.length is the count of arguments BEFORE the first default
      // or rest parameter. Use as a soft compatibility hint; small diffs
      // (e.g. mm's optional `text`) are tolerated, larger gaps surfaced.
      if (Math.abs(lwG[k].length - shG[k].length) > 1) {
        report.arityDiffs.push({ key: k, lw: lwG[k].length, sh: shG[k].length });
      }
    }
  });

  return report;
}

(async function(){
  console.log('\n=== _G contract test ===');

  var lw, sh;
  try { lw = await loadLwG(); }
  catch (e) { console.log('  ✗ FAILED to boot LW: ' + (e && e.message || e)); process.exit(1); }
  try { sh = await loadShellG(); }
  catch (e) { console.log('  ✗ FAILED to load shell.js: ' + (e && e.message || e)); process.exit(1); }

  if (!lw._G) { console.log('  ✗ LW did not expose window._G'); process.exit(1); }
  if (!sh._G) { console.log('  ✗ Shell did not expose window._G'); process.exit(1); }

  var cmp = compare(lw._G, sh._G);

  console.log('  LW _G keys:    ' + cmp.lwKeys.join(', '));
  console.log('  Shell _G keys: ' + cmp.shKeys.join(', '));

  var failed = 0;

  // Key-set parity
  if (cmp.onlyLw.length > 0) {
    console.log('  ✗ Keys present in LW but missing from shell: ' + cmp.onlyLw.join(', '));
    failed++;
  } else {
    console.log('  ✓ Every LW key is present in shell');
  }
  if (cmp.onlySh.length > 0) {
    console.log('  ✗ Keys present in shell but missing from LW: ' + cmp.onlySh.join(', '));
    failed++;
  } else {
    console.log('  ✓ Every shell key is present in LW');
  }

  // Type parity
  if (cmp.typeMismatches.length > 0) {
    cmp.typeMismatches.forEach(function(m){
      console.log('  ✗ Type drift on ' + m.key + ': LW=' + m.lw + ', shell=' + m.sh);
    });
    failed++;
  } else {
    console.log('  ✓ Every shared key has the same typeof in both');
  }

  // Arity parity (soft — only flag drift > 1)
  if (cmp.arityDiffs.length > 0) {
    cmp.arityDiffs.forEach(function(a){
      console.log('  ⚠ Arity drift on ' + a.key + ': LW.length=' + a.lw + ', shell.length=' + a.sh + '  (soft warn)');
    });
  } else {
    console.log('  ✓ Function arities are within 1 (soft check)');
  }

  // Smoke-call each function under each implementation
  var lwCalls = smokeCallEach(lw._G, lw.win);
  var shCalls = smokeCallEach(sh._G, sh.win);

  var smokeFailures = 0;
  Object.keys(lwCalls).forEach(function(k){
    var lwR = lwCalls[k] || { ok: false, err: 'not-tested' };
    var shR = shCalls[k] || { ok: false, err: 'not-tested' };
    if (!lwR.ok) { console.log('  ✗ LW _G.' + k + '() threw: ' + lwR.err); smokeFailures++; }
    if (!shR.ok) { console.log('  ✗ Shell _G.' + k + '() threw: ' + shR.err); smokeFailures++; }
  });
  if (smokeFailures === 0) {
    console.log('  ✓ Every _G function smoke-called without throwing on either surface');
  } else {
    failed += smokeFailures;
  }

  try { lw.win.close(); } catch (e) {}
  try { sh.win.close(); } catch (e) {}

  if (failed === 0) {
    console.log('\nCONTRACT GREEN — LW and shell _G are in agreement.');
    process.exit(0);
  } else {
    console.log('\nCONTRACT FAILED — ' + failed + ' divergence point(s) above.');
    process.exit(1);
  }
})();
