/*
 * smoke_name_page.js — verifies name/index.html wires the bundle correctly.
 * Loads the real page (with word-banks.js + render-bundle.js inlined the way
 * the browser would), navigates with ?n=Maria, and asserts the card fills in:
 * a plant SVG, the possessive title, the procedural name, and a 3-line haiku.
 *
 * Run: node scripts/smoke_name_page.js
 */
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var { JSDOM, VirtualConsole } = require('jsdom');

var DIR = path.join(__dirname, '..', 'name');
var html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
var wordBanks = fs.readFileSync(path.join(DIR, 'word-banks.js'), 'utf8');
var bundle = fs.readFileSync(path.join(DIR, 'render-bundle.js'), 'utf8');

// Inline the two local <script src> tags (jsdom won't fetch them).
html = html.replace('<script src="word-banks.js"></script>', '<script>' + wordBanks + '</' + 'script>');
html = html.replace('<script src="render-bundle.js"></script>', '<script>' + bundle + '</' + 'script>');
// Drop the remote Google Fonts stylesheet (no network in the harness).
html = html.replace(/<link href="https:\/\/fonts\.googleapis[^>]*>/g, '');

var pageErrors = [];
var vConsole = new VirtualConsole();
vConsole.on('jsdomError', function(err) {
  pageErrors.push(err && (err.detail ? err.detail.message : err.message) || String(err));
});

var dom = new JSDOM(html, {
  url: 'https://lucidwinds.com/name/?n=Maria&ref=ABCD-1234',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole: vConsole,
  beforeParse: function(window) {
    try {
      Object.defineProperty(window, 'crypto', { value: crypto.webcrypto, configurable: true, writable: true });
    } catch (e) {}
    window.TextEncoder = TextEncoder;
  }
});

var window = dom.window;
var deadline = Date.now() + 6000;

function done(fail, lines) {
  console.log('');
  console.log('=== Grow Your Name page smoke ===');
  lines.forEach(function(l) { console.log(l); });
  if (pageErrors.length) {
    console.log('Page errors (' + pageErrors.length + '): ');
    pageErrors.slice(0, 5).forEach(function(e) { console.log('  - ' + e); });
  }
  process.exit(fail ? 1 : 0);
}

function poll() {
  var doc = window.document;
  var holder = doc.getElementById('plantHolder');
  var whose = doc.getElementById('whose');
  var pname = doc.getElementById('pname');
  var haiku = doc.getElementById('haiku');
  var card = doc.getElementById('card');
  var portal = doc.getElementById('portalLink');
  var ready = holder && holder.querySelector('svg') && haiku && haiku.textContent.trim().length > 5;

  if (ready) {
    var lines = [];
    var pass = 0, fail = 0;
    function ck(name, ok, detail) { lines.push((ok ? '  ✓ ' : '  ✗ ') + name + (detail ? '   → ' + detail : '')); if (ok) pass++; else fail++; }
    ck('plant SVG rendered into card', !!holder.querySelector('svg'), 'svgLen=' + (holder.innerHTML.length));
    ck('card is shown', card && card.className.indexOf('show') >= 0);
    ck('possessive title set', whose.textContent.indexOf("Maria's plant") >= 0, '"' + whose.textContent + '"');
    ck('procedural name set', pname.textContent.trim().length > 2, '"' + pname.textContent + '"');
    ck('3-line haiku set', (haiku.innerHTML.match(/<br>/g) || []).length === 2, '"' + haiku.textContent.slice(0, 40) + '..."');
    ck('referral carried into portal CTA', portal.href.indexOf('ref=ABCD-1234') >= 0, portal.href);
    ck('no page errors', pageErrors.length === 0);
    lines.push('');
    lines.push(pass + ' pass, ' + fail + ' fail');
    done(fail, lines);
    return;
  }
  if (Date.now() > deadline) {
    done(true, ['  ✗ TIMEOUT: card never filled in', '  haiku="' + (haiku && haiku.textContent) + '"']);
    return;
  }
  setTimeout(poll, 80);
}

window.addEventListener('load', function() { setTimeout(poll, 60); });
setTimeout(function() { if (Date.now() > deadline) done(true, ['  ✗ never reached load']); }, 6500);
