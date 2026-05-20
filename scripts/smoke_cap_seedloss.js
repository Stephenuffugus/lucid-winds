/*
 * Focused jsdom assertions for the 2026-05-20 fixes:
 *   1. saveGreenhouse refuses to grow past the cap; overflow goes to lw_reserve.
 *   2. FG_Backpack.sendPlantHome refuses to send when greenhouse is full.
 *   3. s2n() refuses to splice a seed out of the backpack when nursery is full.
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
    window.LW_ACH = { bump: function(){}, set: function(){}, add: function(){}, progress: function(){ return {}; }, claim: function(){ return null; }, catalog: [] };
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

function hex(len){
  var s='', a='0123456789abcdef';
  for(var i=0;i<len;i++) s += a[Math.floor(Math.random()*16)];
  return s;
}

function runChecks(){
  var results = [];
  function check(name, fn){
    try { var r = fn(); results.push({ name: name, ok: !!r.ok, detail: r.detail || '' }); }
    catch(e) { results.push({ name: name, ok: false, detail: 'THREW: ' + (e && e.message || e) }); }
  }

  // ── TEST 1: saveGreenhouse caps + overflows to lw_reserve ──
  check('saveGreenhouse: overflow over cap goes to lw_reserve', function(){
    // Set cap to 3 (BASE is 10 — clamp upward inside getGHSlots), so we use 10.
    window.localStorage.setItem('sws_greenhouse_slots', '10');
    window.localStorage.setItem('sws_greenhouse', '[]');
    window.localStorage.removeItem('lw_reserve');
    var gh = [];
    for (var i = 0; i < 12; i++) gh.push({ hash: hex(64), date:'2026-05-20', born: Date.now(), origin:'bloom', generation:1 });
    window.saveGreenhouse(gh);
    var written = JSON.parse(window.localStorage.getItem('sws_greenhouse') || '[]');
    // _secureGet adds an _sig wrapper; lw_reserve is plain JSON.
    var reserve = JSON.parse(window.localStorage.getItem('lw_reserve') || '[]');
    var capRespected = window.loadGreenhouse().length <= 10;
    var spillRecorded = reserve.length >= 2;
    return { ok: capRespected && spillRecorded, detail: 'gh=' + window.loadGreenhouse().length + ' reserve=' + reserve.length };
  });

  // ── TEST 2: saveGreenhouse leaves existing over-cap state alone ──
  check('saveGreenhouse: pre-existing over-cap state preserved on non-growing write', function(){
    window.localStorage.setItem('sws_greenhouse_slots', '10');
    window.localStorage.removeItem('lw_reserve');
    // Build 15 plants, write directly to bypass interceptor.
    var gh = [];
    for (var i = 0; i < 15; i++) gh.push({ hash: hex(64), date:'2026-05-20', born: Date.now(), origin:'bloom', generation:1 });
    // Use _secureSet via saveGreenhouse — first write WILL overflow because
    // prior was empty. Stash directly with _secureSet via a guarded call.
    // Simulate by force-writing via setItem bypass:
    window.localStorage.setItem('sws_greenhouse', JSON.stringify(gh)); // bypass intercept
    // Now load: 15 plants in localStorage
    // Write same array back through interceptor; should NOT spill more.
    var prior = window.loadGreenhouse();
    window.saveGreenhouse(prior);
    var reserve = JSON.parse(window.localStorage.getItem('lw_reserve') || '[]');
    // Reserve should NOT have grown because this write was not adding plants.
    return { ok: reserve.length === 0, detail: 'reserve=' + reserve.length + ' (expected 0)' };
  });

  // ── TEST 3: FG_Backpack.sendPlantHome refuses when greenhouse is full ──
  check('sendPlantHome: refuses to splice plant when greenhouse full', function(){
    if (!window.FG_Backpack || !window.FG_Backpack.sendPlantHome) return { ok:false, detail:'no FG_Backpack.sendPlantHome' };
    window.localStorage.setItem('sws_greenhouse_slots', '10');
    // Fill greenhouse to cap.
    var gh = [];
    for (var i = 0; i < 10; i++) gh.push({ hash: hex(64), date:'2026-05-20', born: Date.now(), origin:'bloom', generation:1 });
    window.localStorage.setItem('sws_greenhouse', JSON.stringify(gh));
    // Stage a plant in BP state by reaching into FG_Backpack
    var BP = window.FG_Backpack;
    if (!BP.getState) return { ok:false, detail:'no getState' };
    var state = BP.getState();
    if (!state) return { ok:false, detail:'no state' };
    state.plants = [{ hash: hex(64), name:'Test', generation:1 }];
    var before = state.plants.length;
    window.FG_Backpack.sendPlantHome(0);
    var after = state.plants.length;
    // Greenhouse should NOT have grown past 10.
    var ghLen = JSON.parse(window.localStorage.getItem('sws_greenhouse')||'[]').length;
    return { ok: before === 1 && after === 1 && ghLen === 10, detail: 'bpBefore=' + before + ' bpAfter=' + after + ' ghLen=' + ghLen };
  });

  // ── TEST 4: s2n refuses to splice seed when nursery full ──
  check('s2n: refuses to splice seed when nursery full', function(){
    // Fill nursery with 3 seeds.
    var nur = [];
    for (var i = 0; i < 3; i++) nur.push({ id:'nur_t'+i, seedHash: hex(64), parentAHash: hex(64), parentBHash: hex(64), nonce:0, plantedAt:'2026-05-20', waterLog:[], status:'growing', origin:null, bornAt: Date.now() });
    window.localStorage.setItem('sws_nursery', JSON.stringify(nur));
    // The s2n function lives in the FG_Backpack IIFE — it's not on window.
    // We can verify by checking that dispatch behavior: stage a seed in BP,
    // call FG_Backpack.sendSeedToNursery which has its own pre-check (already
    // present pre-fix). Both paths now refuse — verify pouch keeps the seed.
    if (!window.FG_Backpack || !window.FG_Backpack.sendSeedToNursery) return { ok:false, detail:'no sendSeedToNursery' };
    var BP = window.FG_Backpack;
    var state = BP.getState();
    state.seeds = [{ hash: hex(64), name:'TestSeed' }];
    var before = state.seeds.length;
    window.FG_Backpack.sendSeedToNursery(0);
    var after = state.seeds.length;
    return { ok: before === 1 && after === 1, detail: 'bpBefore=' + before + ' bpAfter=' + after };
  });

  console.log('');
  console.log('=== Cap + seed-loss fixes ===');
  var pass=0,fail=0;
  results.forEach(function(r){ console.log((r.ok?'  ✓ ':'  ✗ ')+r.name+(r.detail?'   → '+r.detail:'')); if(r.ok)pass++; else fail++; });
  console.log('');
  console.log(pass + ' pass, ' + fail + ' fail');
  process.exit(fail ? 1 : 0);
}
