/*
 * smoke_name.js — verifies the standalone "Grow Your Name" bundle.
 *
 * Loads ONLY name/word-banks.js + name/render-bundle.js in jsdom (NOT
 * index.html), then proves the extracted bundle is self-contained:
 *   - the four window fns exist (hashToTraits, _generatePlantSVG, getHaiku,
 *     getPlantName, _sha256hex)
 *   - _sha256hex('maria') hashes to 64 hex and the same input is deterministic
 *   - a name -> hash -> plant SVG + haiku + name pipeline works end to end
 *   - a 60-hash sweep (real sha256 of '0'..'59' + edge hashes) renders every
 *     branch (companion / aura / mutation / bloom / mythic) with NO throw and
 *     valid <svg>. This is what catches a dependency the slice left behind.
 *
 * Run: node scripts/smoke_name.js   (exits non-zero on any failure)
 */
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var { JSDOM, VirtualConsole } = require('jsdom');

var DIR = path.join(__dirname, '..', 'name');
var wordBanks = fs.readFileSync(path.join(DIR, 'word-banks.js'), 'utf8');
var bundle = fs.readFileSync(path.join(DIR, 'render-bundle.js'), 'utf8');

// Deterministic hash set: real sha256 of "0".."59" gives a realistic byte
// spread that hits companions, auras, mutations, blooms across the set.
function sha256hex(s) { return crypto.createHash('sha256').update(s).digest('hex'); }
var sweep = [];
for (var i = 0; i < 60; i++) sweep.push(sha256hex(String(i)));
// Edge hashes that force specific branches:
sweep.push('f'.repeat(64));                 // everything maxed
sweep.push('0'.repeat(64));                 // everything min
// Beholder: hb(18)===0xFF -> chars 36-37 = 'ff'
var beholder = '0'.repeat(36) + 'ff' + '0'.repeat(26);
sweep.push(beholder.slice(0, 64));

var pageErrors = [];
var vConsole = new VirtualConsole();
vConsole.on('jsdomError', function(err) {
  pageErrors.push(err && (err.detail ? err.detail.message : err.message) || String(err));
});

var doc = '<!doctype html><html><head></head><body>'
  + '<script>' + wordBanks + '</' + 'script>'
  + '<script>' + bundle + '</' + 'script>'
  + '</body></html>';

var dom = new JSDOM(doc, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole: vConsole,
  beforeParse: function(window) {
    // jsdom's window.crypto lacks .subtle (and is often a read-only getter),
    // so force Node's WebCrypto in. _sha256hex uses crypto.subtle.digest.
    try {
      Object.defineProperty(window, 'crypto', { value: crypto.webcrypto, configurable: true, writable: true });
    } catch (e) {
      try { if (window.crypto && !window.crypto.subtle) window.crypto.subtle = crypto.webcrypto.subtle; } catch (e2) {}
    }
    window.TextEncoder = TextEncoder;
  }
});

var window = dom.window;
window.addEventListener('load', function() { setTimeout(runChecks, 30); });
setTimeout(function() {
  console.error('SMOKE_NAME TIMEOUT: bundle never finished loading in 12s.');
  pageErrors.slice(0, 8).forEach(function(e) { console.error('  - ' + e); });
  process.exit(2);
}, 12000);

async function runChecks() {
  var results = [];
  function check(name, ok, detail) { results.push({ name: name, ok: !!ok, detail: detail || '' }); }

  // Boot-time errors first (an undefined identifier in the slice shows here).
  if (pageErrors.length) {
    check('bundle loads with no page errors', false, 'THREW: ' + pageErrors[0]);
  } else {
    check('bundle loads with no page errors', true);
  }

  check('window._LW_BANKS present (word-banks loaded)',
    window._LW_BANKS && Array.isArray(window._LW_BANKS.HAIKU_A) && window._LW_BANKS.HAIKU_A.length > 100,
    window._LW_BANKS ? 'HAIKU_A=' + (window._LW_BANKS.HAIKU_A || []).length : 'missing');
  check('window.hashToTraits is a function', typeof window.hashToTraits === 'function');
  check('window._generatePlantSVG is a function', typeof window._generatePlantSVG === 'function');
  check('window.getHaiku is a function', typeof window.getHaiku === 'function');
  check('window.getPlantName is a function', typeof window.getPlantName === 'function');
  check('window._sha256hex is a function', typeof window._sha256hex === 'function');

  // name -> hash (deterministic + 64 hex)
  var h1 = null, h2 = null;
  try {
    h1 = await window._sha256hex('maria');
    h2 = await window._sha256hex('maria');
  } catch (e) { check('_sha256hex works', false, 'THREW: ' + (e && e.message)); }
  check('_sha256hex returns 64 hex + deterministic',
    typeof h1 === 'string' && /^[0-9a-f]{64}$/.test(h1) && h1 === h2,
    h1 ? h1.slice(0, 12) + '...' : 'null');

  // Full pipeline from a name
  if (h1) {
    try {
      var t = window.hashToTraits(h1);
      var svg = window._generatePlantSVG(h1, 220, 1, null);
      var hk = window.getHaiku(h1);
      var nm = window.getPlantName(h1);
      var okT = t && typeof t.pot === 'number';
      var okSvg = typeof svg === 'string' && /<svg[\s>]/.test(svg) && /<\/svg>/.test(svg) && svg.length > 500;
      var okHk = hk && hk.line1 && hk.line2 && hk.line3;
      var okNm = typeof nm === 'string' && nm.length > 2;
      check('name pipeline: traits + SVG + haiku + name', okT && okSvg && okHk && okNm,
        'svg=' + (svg && svg.length) + ' name="' + nm + '" haiku="' + (hk && hk.line1) + '..."');
    } catch (e) {
      check('name pipeline: traits + SVG + haiku + name', false, 'THREW: ' + (e && e.message));
    }
  }

  // Sweep: every hash renders with valid SVG and getHaiku, no throw.
  var swept = 0, bad = null;
  for (var k = 0; k < sweep.length; k++) {
    try {
      var s = window._generatePlantSVG(sweep[k], 200, 1, null);
      var g = window.getHaiku(sweep[k]);
      var nnm = window.getPlantName(sweep[k]);
      if (!(typeof s === 'string' && /<svg[\s>]/.test(s) && /<\/svg>/.test(s) && s.length > 300)) {
        bad = 'hash#' + k + ' svgLen=' + (s && s.length); break;
      }
      if (!(g && g.line1 && g.line2 && g.line3)) { bad = 'hash#' + k + ' haiku incomplete'; break; }
      if (!(typeof nnm === 'string' && nnm.length > 2)) { bad = 'hash#' + k + ' name empty'; break; }
      swept++;
    } catch (e) { bad = 'hash#' + k + ' THREW: ' + (e && e.message); break; }
  }
  check('60+3 hash render sweep (all branches, no throw)', bad === null, bad || (swept + '/' + sweep.length + ' rendered'));

  // thumbnail mode
  try {
    var thumb = window._generatePlantSVG(sweep[0], 40, 1, null);
    check('thumbnail (size 40) renders', typeof thumb === 'string' && thumb.length > 100 && /<\/svg>/.test(thumb), 'len=' + (thumb && thumb.length));
  } catch (e) { check('thumbnail (size 40) renders', false, 'THREW: ' + (e && e.message)); }

  console.log('');
  console.log('=== Grow Your Name bundle smoke ===');
  var pass = 0, fail = 0;
  results.forEach(function(r) {
    console.log((r.ok ? '  ✓ ' : '  ✗ ') + r.name + (r.detail ? '   → ' + r.detail : ''));
    if (r.ok) pass++; else fail++;
  });
  console.log('');
  console.log(pass + ' pass, ' + fail + ' fail');
  if (pageErrors.length) {
    console.log('Page errors (' + pageErrors.length + ', first 5):');
    pageErrors.slice(0, 5).forEach(function(e) { console.log('  - ' + e); });
  }
  process.exit(fail ? 1 : 0);
}
