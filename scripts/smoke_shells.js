/*
 * Sky Wolf Studios — /play/ shell smoke harness.
 *
 * For each first-wave game, loads play/shell.js + games/<id>.js into a
 * single jsdom window and verifies:
 *
 *   1. shell.js initializes window._G with all the required keys.
 *   2. games/<id>.js registers a mount function at window._gameFns[<id>].
 *   3. Calling _gameFns[<id>](mountEl) does not throw a top-level error.
 *
 * Mount-time errors that happen inside requestAnimationFrame /
 * setTimeout callbacks won't be caught here — they don't surface
 * synchronously. Use real-browser verification for visual confirmation.
 *
 * Run: node scripts/smoke_shells.js
 * Exits non-zero on any failure.
 */

var fs = require('fs');
var path = require('path');
var { JSDOM, VirtualConsole } = require('jsdom');

var ROOT = path.join(__dirname, '..');
var SHELL_JS = fs.readFileSync(path.join(ROOT, 'play', 'shell.js'), 'utf8');

// Wave 1 (initial 10), Wave 2 (24), Wave 3 (10 cards), Wave 4 (3 words),
// Wave 5 (audio/canvas/worker), Wave 6 (inline games copied into shell
// files). Each entry: either a string (no extra deps) or [id, ...deps]
// where each dep is the path to a script file (relative to repo root)
// loaded BEFORE the game module.
var FIRST_WAVE = [
  // ── Wave 1 ──
  'simon', 'memory', 'merge', 'lights', 'flood',
  'sudoku', 'stopten', 'slider', 'mines', 'hanoi',
  // ── Wave 2 ──
  'battleship', 'c4', 'chess', 'colorsort', 'dailybloom',
  'gardenlines', 'jade', 'juniper', 'kakuro', 'mosaic',
  'numbergarden', 'petalfall', 'petalmatch', 'pipe', 'pollen',
  'pottingbench', 'recall', 'rootflow', 'rootmaze', 'rootrush',
  'seedsow', 'seedtoss2', 'sprout', 'vinecross',
  // ── Wave 3 — card games need _cards.js ──
  ['klondike',       'games/_cards.js'],
  ['spider',         'games/_cards.js'],
  ['freecell',       'games/_cards.js'],
  ['pyramid',        'games/_cards.js'],
  ['tripeaks',       'games/_cards.js'],
  ['golf',           'games/_cards.js'],
  ['cribbage',       'games/_cards.js'],
  ['bowergarden',    'games/_cards.js'],
  ['bleedinghearts', 'games/_cards.js'],
  ['gardenspades',   'games/_cards.js']
];

var REQUIRED_G_KEYS = [
  'e', 'play', 'playWin', 'st', 'xt', 'sm', 'ms', 'mm', 'mc',
  'sh', 'sr', 'gr', 'setDiff', 'solEnterFS', 'solClearFS', 'solExitFS',
  'getM', 'setM'
];

function runShellTest(entry) {
  var gameId, depPaths;
  if (Array.isArray(entry)) {
    gameId = entry[0];
    depPaths = entry.slice(1);
  } else {
    gameId = entry;
    depPaths = [];
  }
  var gameSrc = fs.readFileSync(path.join(ROOT, 'games', gameId + '.js'), 'utf8');
  var depSrcs = depPaths.map(function(p){
    return { path: p, src: fs.readFileSync(path.join(ROOT, p), 'utf8') };
  });

  var vConsole = new VirtualConsole();
  var errors = [];
  vConsole.on('jsdomError', function(err){
    errors.push(err && (err.detail ? err.detail.message : err.message) || String(err));
  });

  // Construct a barebones DOM that mimics the per-game shell page.
  // We omit Sunbeam SDK loading and stub the global to avoid network +
  // Firebase compat fetches (jsdom doesn't run those anyway).
  var dom = new JSDOM(
    '<!DOCTYPE html><html><head>'
    + '<title>Test</title>'
    + '</head><body>'
    + '<header class="shell-hdr"><div id="shell-title"></div>'
    + '<div class="shell-wallet"><strong id="shell-bal"></strong>'
    + '<span id="shell-pend"></span><button id="shell-signin"></button></div></header>'
    + '<main id="shell-mount" class="shell-mount"></main>'
    + '</body></html>',
    {
      url: 'https://lucidwinds.com/play/' + gameId + '.html',
      runScripts: 'outside-only',
      pretendToBeVisual: true,
      virtualConsole: vConsole
    }
  );
  var win = dom.window;

  // Canvas stub — jsdom returns null from getContext('2d') by default.
  // Some games (petalfall, petalmatch, vinecross) draw via canvas and
  // throw when the context is null. Provide a chainable no-op fake so
  // mount can proceed in the harness.
  if (win.HTMLCanvasElement && win.HTMLCanvasElement.prototype) {
    var noopCtx = new Proxy({}, {
      get: function(target, prop) {
        if (prop === 'canvas') return null;
        if (prop === 'createImageData') return function(w, h){ return { data: new Uint8ClampedArray((w||1) * (h||1) * 4), width: w||1, height: h||1 }; };
        if (prop === 'getImageData')    return function(x, y, w, h){ return { data: new Uint8ClampedArray((w||1) * (h||1) * 4), width: w||1, height: h||1 }; };
        if (prop === 'measureText')     return function(){ return { width: 0 }; };
        // Default: no-op chainable function returning the same proxy
        return function(){ return noopCtx; };
      }
    });
    win.HTMLCanvasElement.prototype.getContext = function(){ return noopCtx; };
  }

  // Stub LW_PLAY so the shell knows which game this page hosts.
  win.LW_PLAY = { id: gameId, name: gameId };

  // Stub the Sunbeam SDK (so shell.js init() resolves without network).
  win.Sunbeam = {
    VERSION: '2.0.0',
    init:        function(){ return Promise.resolve({ ready: true, signedIn: false, uid: null, anonId: 'test-anon' }); },
    earn:        function(amt, src){ return Promise.resolve({ ok: true, balance: 0, earned: amt, pending: amt }); },
    balance:     function(){ return Promise.resolve({ confirmed: 0, pending: 0 }); },
    claim:       function(){ return Promise.resolve({ ok: true, credited: 0, discarded: 0, balance: 0, pending: 0 }); },
    mintPlant:   function(){ return Promise.resolve({ ok: false, needSignIn: true }); },
    onChange:    function(){ return function(){}; },
    signInWithGoogle: function(){ return Promise.resolve(null); }
  };

  // Stub AudioContext (some games use it; jsdom doesn't have it).
  win.AudioContext = function(){ return { createOscillator: function(){ return { type:'sine', frequency:{ setValueAtTime: function(){} }, connect: function(){}, start: function(){}, stop: function(){} }; }, createGain: function(){ return { gain:{ setValueAtTime: function(){}, exponentialRampToValueAtTime: function(){} }, connect: function(){} }; }, currentTime: 0, destination: {} }; };

  // Run shell.js (script-eval inside the jsdom window).
  win.eval(SHELL_JS);

  // Sanity 1: _G has all required keys.
  var missingG = REQUIRED_G_KEYS.filter(function(k){ return typeof win._G[k] !== 'function'; });
  if (missingG.length > 0) {
    dom.window.close();
    return { ok: false, gameId: gameId, err: 'window._G missing keys: ' + missingG.join(',') };
  }

  // Run any dependency files first (e.g. _cards.js for card games,
  // vinewords-dict.js for word games).
  for (var di = 0; di < depSrcs.length; di++) {
    var dep = depSrcs[di];
    try { win.eval(dep.src); }
    catch (e) {
      dom.window.close();
      return { ok: false, gameId: gameId, err: 'dep ' + dep.path + ' threw at exec: ' + (e && e.message || e) };
    }
  }

  // Run the game module.
  try {
    win.eval(gameSrc);
  } catch (e) {
    dom.window.close();
    return { ok: false, gameId: gameId, err: 'game module threw at parse/exec: ' + (e && e.message || e) };
  }

  // Sanity 2: game registered its mount function.
  if (!win._gameFns || typeof win._gameFns[gameId] !== 'function') {
    dom.window.close();
    return { ok: false, gameId: gameId, err: 'window._gameFns["' + gameId + '"] not registered' };
  }

  // Sanity 3: mount the game into #fg-ag (created if not present).
  var host = win.document.getElementById('shell-mount');
  var mountEl = win.document.createElement('div');
  mountEl.id = 'fg-ag';
  host.appendChild(mountEl);

  try {
    win._gameFns[gameId](mountEl);
  } catch (e) {
    dom.window.close();
    return { ok: false, gameId: gameId, err: 'mount threw: ' + (e && e.message || e) };
  }

  // Mount succeeded. Inspect: container should now have some DOM.
  var childCount = mountEl.children.length;
  dom.window.close();

  if (childCount === 0) {
    return { ok: false, gameId: gameId, err: 'mount produced no DOM children' };
  }
  return { ok: true, gameId: gameId, children: childCount, jsdomErrors: errors.length };
}

console.log('\n=== Sky Wolf Studios — shell smoke ===');
var failed = 0;
FIRST_WAVE.forEach(function(entry){
  var label = Array.isArray(entry) ? entry[0] : entry;
  try {
    var r = runShellTest(entry);
    if (r.ok) {
      console.log('  ✓ ' + label + '  → mount produced ' + r.children + ' children (jsdom errs: ' + r.jsdomErrors + ')');
    } else {
      console.log('  ✗ ' + label + '  — ' + r.err);
      failed++;
    }
  } catch (e) {
    console.log('  ✗ ' + label + '  — harness threw: ' + (e && e.message || e));
    failed++;
  }
});
console.log('\n' + (FIRST_WAVE.length - failed) + ' pass, ' + failed + ' fail');
process.exit(failed === 0 ? 0 : 1);
