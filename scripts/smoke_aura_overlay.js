/*
 * Focused jsdom assertions for the 2026-05-20 aura-overlay fix.
 *
 * Verifies:
 *   1. _generatePlantSVG with NO opts → aura SVG present in output
 *   2. _generatePlantSVG with {skipAura:true} → aura SVG absent
 *   3. Default behavior unchanged for every other code path
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

  // Build a hash that yields an aura idx >= 5 (so an aura actually renders).
  // hashToTraits sets aura = hb(15) % 36. Want hb(15) % 36 to be 5-35.
  // Easiest: byte index 15 is hex chars 30-31. Set 'ff' → 255 % 36 = 3 (no aura).
  // Set '40' → 64 % 36 = 28 (Stained Glass) — good. Try a few until aura >= 5.
  // We pick chars 0..29 controlled, char 30..31 = '40' → aura idx 28.
  function makeHashWithAura(){
    return '0123456789abcdef0123456789abcd' + '40' +
           '0123456789abcdef0123456789abcdef';  // pad to 64 chars total
  }
  var aHash = makeHashWithAura();
  // Verify our aura math is right via window.hashToTraits.
  var t = window.hashToTraits(aHash);
  check('Test hash yields an aura idx >= 5', function(){
    return { ok: t && typeof t.aura === 'number' && t.aura >= 5, detail: 'aura=' + (t && t.aura) };
  });

  // The aura code adds <animate> and <animateTransform> elements with
  // specific gradient ids like auraPillar* / auraGold* depending on aura idx.
  // We can detect aura presence by the existence of <animate elements OR
  // known aura gradient ids.
  var defaultSvg = window._generatePlantSVG(aHash, 200, 1);
  var auralessSvg = window._generatePlantSVG(aHash, 200, 1, { skipAura: true });

  check('Default render contains <animate (aura)', function(){
    return { ok: defaultSvg.indexOf('<animate') >= 0, detail: 'len=' + defaultSvg.length };
  });

  check('skipAura render does NOT contain <animate', function(){
    return { ok: auralessSvg.indexOf('<animate') < 0, detail: 'len=' + auralessSvg.length };
  });

  check('skipAura SVG shorter than default (aura content stripped)', function(){
    return { ok: auralessSvg.length < defaultSvg.length, detail: 'default=' + defaultSvg.length + ' auraless=' + auralessSvg.length };
  });

  check('Existing callers (no opts) STILL get aura — non-regression', function(){
    var svg2 = window._generatePlantSVG(aHash, 200);
    var svg3 = window._generatePlantSVG(aHash, 95, 1);
    return { ok: svg2.indexOf('<animate') >= 0 && svg3.indexOf('<animate') >= 0, detail: 'both contain <animate' };
  });

  console.log('');
  console.log('=== Aura overlay fix ===');
  var pass=0,fail=0;
  results.forEach(function(r){ console.log((r.ok?'  ✓ ':'  ✗ ')+r.name+(r.detail?'   → '+r.detail:'')); if(r.ok)pass++; else fail++; });
  console.log('');
  console.log(pass + ' pass, ' + fail + ' fail');
  process.exit(fail ? 1 : 0);
}
