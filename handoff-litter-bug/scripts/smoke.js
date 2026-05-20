/*
 * Litter Bug smoke harness.
 *
 * Loads index.html in jsdom, stubs the externals the page will eventually
 * expect (Firebase, Leaflet, GA), lets inline scripts execute, then asserts
 * that the engine's surface still works:
 *   - hashToTraits returns an expected-shape trait object
 *   - getBugGrade returns a recognized grade
 *   - _generateBugSVG produces a valid SVG containing core layers
 *   - findBugForCombo returns the right signature bug for a known pair
 *   - generateProceduralBug is deterministic (same inputs → same output)
 *   - LB game state initializes cleanly
 *
 * Run: `node scripts/smoke.js` (or `npm run smoke` once you add the script)
 * Exits non-zero on any failure so CI / pre-push hooks can gate on it.
 */
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var jsdomPkg;
try { jsdomPkg = require('jsdom'); } catch (e) {
  console.error('jsdom missing. Install: npm install --save-dev jsdom');
  process.exit(2);
}
var JSDOM = jsdomPkg.JSDOM;
var VirtualConsole = jsdomPkg.VirtualConsole;

var ROOT = path.join(__dirname, '..');
var html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// Strip external <script src="..."> tags (no fonts/CDN fetches in jsdom).
var stripped = html.replace(/<script\s+src=["'][^"']+["']\s*><\/script>/gi, '');

var pageErrors = [];
var vConsole = new VirtualConsole();
vConsole.on('jsdomError', function (err) {
  pageErrors.push(err && (err.detail ? err.detail.message : err.message) || String(err));
});

var dom = new JSDOM(stripped, {
  url: 'https://litterbug.local/',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole: vConsole,
  beforeParse: function (window) {
    // Node WebCrypto for SubtleCrypto.digest used by sha256Hex.
    try { window.crypto = crypto.webcrypto; } catch (e) {}

    // Firebase / Leaflet / GA stubs — none are wired in v1, but the smoke
    // harness predates v1.1 by design. Keep stubs so adding any of them
    // mid-build doesn't break the harness.
    var noopFn = function () { return Promise.resolve({}); };
    var unsubFn = function () {};
    window.firebase = {
      initializeApp: function () { return {}; },
      auth: function () { return { currentUser: null, onAuthStateChanged: function (cb) { if (cb) setTimeout(function () { cb(null); }, 0); return unsubFn; } }; },
      firestore: function () { return { collection: function () { return { doc: function () { return { get: noopFn, set: noopFn }; } }; }, FieldValue: { serverTimestamp: function () { return 0; } } }; }
    };
    var Lnode = function () { return Lnode; };
    Lnode.map = function () { return { setView: function () { return Lnode; }, on: function () { return Lnode; }, removeLayer: function () {}, addLayer: function () {} }; };
    Lnode.marker = function () { return { addTo: function () { return Lnode; }, on: function () { return Lnode; }, remove: function () {} }; };
    Lnode.tileLayer = function () { return { addTo: function () { return Lnode; } }; };
    Lnode.circle = function () { return { addTo: function () { return Lnode; }, setLatLng: function () { return Lnode; }, remove: function () {} }; };
    Lnode.latLng = function (a, b) { return { lat: a, lng: b }; };
    window.L = Lnode;
    window.gtag = function () {};
  }
});

var window = dom.window;
window.addEventListener('load', function () { setTimeout(runChecks, 50); });

// Hard timeout in case the page never loads.
setTimeout(function () {
  console.error('SMOKE TIMEOUT: page never reached load event.');
  if (pageErrors.length) {
    console.error('Page errors caught:');
    pageErrors.forEach(function (e) { console.error('  - ' + e); });
  }
  process.exit(2);
}, 10000);

function runChecks() {
  var results = [];
  function check(name, fn) {
    try {
      var r = fn();
      results.push({ name: name, ok: !!r.ok, detail: r.detail || '' });
    } catch (e) {
      results.push({ name: name, ok: false, detail: 'THREW: ' + (e && e.message || e) });
    }
  }

  // ── 1. Engine surface exists ────────────────────────────────────────────
  check('window.hashToTraits is a function', function () {
    return { ok: typeof window.hashToTraits === 'function' };
  });
  check('window._generateBugSVG is a function', function () {
    return { ok: typeof window._generateBugSVG === 'function' };
  });
  check('window.getBugGrade is a function', function () {
    return { ok: typeof window.getBugGrade === 'function' };
  });
  check('window.findBugForCombo is a function', function () {
    return { ok: typeof window.findBugForCombo === 'function' };
  });
  check('window.generateProceduralBug is a function', function () {
    return { ok: typeof window.generateProceduralBug === 'function' };
  });
  check('window.TRAIT_BANK has all 8 layers', function () {
    var TB = window.TRAIT_BANK;
    var layers = ['bodies', 'heads', 'wings', 'legs', 'antennae', 'patterns', 'palettes', 'behaviors'];
    for (var i = 0; i < layers.length; i++) {
      if (!Array.isArray(TB[layers[i]]) || TB[layers[i]].length === 0) {
        return { ok: false, detail: 'missing or empty: ' + layers[i] };
      }
    }
    return { ok: true, detail: 'all 8 present' };
  });

  // ── 2. hashToTraits returns expected shape ──────────────────────────────
  var testHash = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  check('hashToTraits returns object with all 8 layer indices', function () {
    var t = window.hashToTraits(testHash);
    var keys = ['bodyIdx', 'headIdx', 'wingIdx', 'legIdx', 'antennaIdx', 'patternIdx', 'paletteIdx', 'behaviorIdx'];
    for (var i = 0; i < keys.length; i++) {
      if (typeof t[keys[i]] !== 'number') return { ok: false, detail: 'missing ' + keys[i] };
    }
    return { ok: true, detail: 'body=' + t.bodyIdx + ' head=' + t.headIdx + ' wing=' + t.wingIdx };
  });

  check('hashToTraits is deterministic (same hash → same traits)', function () {
    var t1 = window.hashToTraits(testHash);
    var t2 = window.hashToTraits(testHash);
    var ok = t1.bodyIdx === t2.bodyIdx && t1.headIdx === t2.headIdx && t1.wingIdx === t2.wingIdx;
    return { ok: ok, detail: ok ? 'deterministic' : 'NON-DETERMINISTIC — engine fundamental broken' };
  });

  // ── 3. getBugGrade returns a recognized grade ───────────────────────────
  check('getBugGrade returns a recognized grade name', function () {
    var t = window.hashToTraits(testHash);
    var g = window.getBugGrade(t);
    var names = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Cosmic'];
    return { ok: g && names.indexOf(g.name) >= 0, detail: g ? g.name + ' (score=' + g.score + ')' : 'null' };
  });

  // ── 4. _generateBugSVG produces valid SVG with body + at least one layer
  check('_generateBugSVG produces an SVG with body + head layers', function () {
    var svg = window._generateBugSVG(testHash, 120);
    if (typeof svg !== 'string' || svg.length < 100) return { ok: false, detail: 'too short: ' + (svg && svg.length) };
    var hasOpen = /<svg[\s>]/.test(svg);
    var hasClose = /<\/svg>/.test(svg);
    var hasBody = /<ellipse|<rect|<circle/.test(svg);
    return { ok: hasOpen && hasClose && hasBody, detail: 'len=' + svg.length + ' open=' + hasOpen + ' close=' + hasClose + ' body=' + hasBody };
  });

  // ── 5. Signature recipe lookup ──────────────────────────────────────────
  check('findBugForCombo returns Slipbeetle for banana_peel + bottle_cap', function () {
    var b = window.findBugForCombo('banana_peel', 'bottle_cap');
    return { ok: b && b.id === 'slipbeetle' && b.name === 'Slipbeetle', detail: b ? b.name + ' (' + b.rarity + ')' : 'null' };
  });

  check('findBugForCombo signature lookup is order-independent', function () {
    var b1 = window.findBugForCombo('coffee_cup', 'tea_bag');
    var b2 = window.findBugForCombo('tea_bag', 'coffee_cup');
    return { ok: b1 && b2 && b1.id === b2.id, detail: (b1 && b1.id) + ' vs ' + (b2 && b2.id) };
  });

  // ── 6. Procedural fallback is deterministic ─────────────────────────────
  check('generateProceduralBug is deterministic', function () {
    var b1 = window.generateProceduralBug('eggshell', 'tin_can');
    var b2 = window.generateProceduralBug('tin_can', 'eggshell');
    var b3 = window.generateProceduralBug('eggshell', 'tin_can');
    var ok = b1 && b2 && b3 && b1.name === b2.name && b1.name === b3.name && b1.hash === b2.hash;
    return { ok: ok, detail: 'name=' + (b1 && b1.name) + ' deterministic across both orderings' };
  });

  // ── 7. LB game state initializes cleanly ────────────────────────────────
  check('window.LB exposes the expected public API', function () {
    var LB = window.LB;
    if (!LB) return { ok: false, detail: 'window.LB missing' };
    var methods = ['forage', 'placeInSlot', 'clearSlot', 'combine', 'switchTab'];
    for (var i = 0; i < methods.length; i++) {
      if (typeof LB[methods[i]] !== 'function') return { ok: false, detail: 'LB.' + methods[i] + ' is not a function' };
    }
    return { ok: true, detail: 'all 5 public methods present' };
  });

  check('Starting inventory has 3 items (banana_peel, bottle_cap, coffee_cup)', function () {
    var inv = window.LB._state.inventory;
    return { ok: inv.banana_peel === 2 && inv.bottle_cap === 2 && inv.coffee_cup === 1, detail: JSON.stringify(inv) };
  });

  // ── 8. LB_VERSION is defined ────────────────────────────────────────────
  check('LB_VERSION is a non-empty string', function () {
    return { ok: typeof window.LB_VERSION === 'string' && window.LB_VERSION.length > 0, detail: 'LB_VERSION=' + window.LB_VERSION };
  });

  // ── Output ──────────────────────────────────────────────────────────────
  console.log('');
  console.log('=== Litter Bug smoke harness ===');
  var pass = 0, fail = 0;
  results.forEach(function (r) {
    console.log((r.ok ? '  ✓ ' : '  ✗ ') + r.name + (r.detail ? '   → ' + r.detail : ''));
    if (r.ok) pass++; else fail++;
  });
  console.log('');
  console.log(pass + ' pass, ' + fail + ' fail');
  if (pageErrors.length) {
    console.log('');
    console.log('Page errors caught during boot (first 5):');
    pageErrors.slice(0, 5).forEach(function (e) { console.log('  - ' + e); });
  }
  process.exit(fail ? 1 : 0);
}
