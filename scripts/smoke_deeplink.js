/*
 * Lucid Winds — Deep-link router smoke test.
 *
 * Verifies the additive deep-link <script> block at the bottom of
 * index.html behaves correctly across three URL forms (and a couple of
 * edge cases). Loads index.html in jsdom under each URL, spies on
 * window._sg / window.switchTab AFTER the engine has exposed them but
 * BEFORE the setInterval tick fires, then checks the spy calls.
 *
 * Run: node scripts/smoke_deeplink.js
 * Exits non-zero on any failure.
 */
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var { JSDOM, VirtualConsole } = require('jsdom');

var ROOT = path.join(__dirname, '..');
var html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
var stripped = html.replace(/<script\s+src=["'][^"']+["']\s*><\/script>/gi, '');

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
        signInWithEmailAndPassword: noopFn,
        signInWithPopup: noopFn,
        GoogleAuthProvider: function(){},
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
  window.gtag = function(){};
  window.ga = function(){};
  window.dataLayer = [];
  window.LW_ACH = { bump:function(){}, set:function(){}, add:function(){}, progress:function(){return {};}, claim:function(){return null;}, catalog: [] };
  if (!window.navigator.serviceWorker) {
    Object.defineProperty(window.navigator, 'serviceWorker', { value: { register: function(){ return Promise.resolve({}); }, getRegistration: function(){ return Promise.resolve(null); } } });
  }
  window.navigator.vibrate = function(){};
  window.navigator.share = undefined;
  window.navigator.geolocation = { getCurrentPosition:function(){}, watchPosition:function(){}, clearWatch:function(){} };
}

function wait(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }

function loadPage(url){
  var vConsole = new VirtualConsole();
  vConsole.on('jsdomError', function(){});  // suppress
  var dom = new JSDOM(stripped, {
    url: url,
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole: vConsole,
    beforeParse: installStubs
  });
  return dom;
}

async function runCase(url, label, expectedGid){
  var dom = loadPage(url);
  var window = dom.window;

  // Confirm engine exposed the entry points before we patch them.
  if (typeof window._sg !== 'function') return { ok: false, label: label, err: 'window._sg not exposed by engine' };
  if (typeof window.switchTab !== 'function') return { ok: false, label: label, err: 'window.switchTab not exposed by engine' };
  if (!Array.isArray(window.G) && !(window.G && window.G.length)) return { ok: false, label: label, err: 'window.G not exposed by engine' };

  // Patch the targets BEFORE the setInterval has had a chance to tick
  // (JSDOM construction is sync; timers haven't yielded yet).
  var sgCalls = [];
  var stCalls = [];
  window._sg = function(id){ sgCalls.push(id); };
  window.switchTab = function(tab){ stCalls.push(tab); };

  // Yield to jsdom so the deep-link router's setInterval (250ms) fires.
  // ~600ms gives two tick chances; the first tick will both find the
  // (already-patched) globals and act + clearInterval.
  await wait(600);

  try { dom.window.close(); } catch(e) {}

  var result = { ok: true, label: label, sg: sgCalls.slice(), st: stCalls.slice(), expectedGid: expectedGid };

  if (expectedGid === null) {
    if (sgCalls.length !== 0 || stCalls.length !== 0) {
      result.ok = false;
      result.err = 'expected no-op; got sg=' + JSON.stringify(sgCalls) + ' st=' + JSON.stringify(stCalls);
    }
  } else {
    if (sgCalls.length !== 1 || sgCalls[0] !== expectedGid) {
      result.ok = false;
      result.err = 'expected _sg("' + expectedGid + '") once; got ' + JSON.stringify(sgCalls);
    } else if (stCalls.length !== 1 || stCalls[0] !== 'game') {
      result.ok = false;
      result.err = 'expected switchTab("game") once; got ' + JSON.stringify(stCalls);
    }
  }
  return result;
}

(async function(){
  console.log('\n=== Deep-link router smoke ===');

  var cases = [
    { url: 'https://lucidwinds.com/?game=chess',         label: '?game=chess',           expected: 'chess' },
    { url: 'https://lucidwinds.com/?game=merge',         label: '?game=merge',           expected: 'merge' },
    { url: 'https://lucidwinds.com/',                    label: 'no-param hub',          expected: null    },
    { url: 'https://lucidwinds.com/?game=notarealgame',  label: '?game=notarealgame',    expected: null    },
    { url: 'https://lucidwinds.com/#simon',              label: '#simon hash form',      expected: 'simon' },
    { url: 'https://lucidwinds.com/?game=set',           label: '?game=set (lower)',     expected: 'set'   },
    { url: 'https://lucidwinds.com/?game=CHESS',         label: '?game=CHESS (case)',    expected: 'chess' }
  ];

  var failed = 0;
  for (var i = 0; i < cases.length; i++) {
    var c = cases[i];
    try {
      var r = await runCase(c.url, c.label, c.expected);
      if (r.ok) {
        console.log('  ✓ ' + r.label + (r.expectedGid ? '  → switchTab("game") + _sg("' + r.expectedGid + '")' : '  → no action'));
      } else {
        console.log('  ✗ ' + r.label + '  — ' + r.err);
        failed++;
      }
    } catch (e) {
      console.log('  ✗ ' + c.label + '  — THREW ' + (e && e.message || e));
      failed++;
    }
  }

  console.log('\n' + (cases.length - failed) + ' pass, ' + failed + ' fail');
  process.exit(failed === 0 ? 0 : 1);
})();
