#!/usr/bin/env node
/* INKSWING headless runner. Zero dependencies.
   Reads the SIM and TEST layers straight out of index.html through the marker
   comments, so there is exactly ONE implementation of the rules and the bot
   punches the same strip the thumb does.

     node sim.js --test            the assertion harness, nonzero on a failure
     node sim.js --play=twinkle    the note events of a strip at a fixed crank

   Shape copied from satellites/airworthy/sim.js.
*/
'use strict';
var fs = require('fs');
var path = require('path');

function extract(src, a, b) {
  var i = src.indexOf(a), j = src.indexOf(b);
  if (i < 0 || j < 0) throw new Error('marker not found: ' + a + ' / ' + b);
  return src.slice(i + a.length, j);
}
var HTML_PATH = process.env.INKSWING_HTML || path.join(__dirname, 'index.html');
var HTML = fs.readFileSync(HTML_PATH, 'utf8');
var SIM_SRC = extract(HTML, '// ---- SIM_EXPORT_START ----', '// ---- SIM_EXPORT_END ----');
var TEST_SRC = extract(HTML, '// ---- TEST_EXPORT_START ----', '// ---- TEST_EXPORT_END ----');

var EXPORTS = ['CONFIG', 'makeRNG', 'seedFromString', 'mixSeed', 'clamp', 'dailySeedFor',
  'RIGS', 'RIG_ORDER', 'NOTE_NAMES', 'semitoneHz', 'wForSemitone', 'noteName', 'intervalName',
  'newSheet', 'flingToThrow', 'axisTerms', 'posAt', 'traceOf', 'wEff', 'wDamped',
  'packSheet', 'unpackSheet', 'INKS', 'TEST'];

function build(over) {
  var src = SIM_SRC, k;
  if (over) for (k in over) {
    var re = new RegExp('(\\b' + k + '\\s*:\\s*)(-?[0-9]*\\.?[0-9]+)', 'g');
    if (!re.test(src)) throw new Error('override key not found in CONFIG: ' + k);
    re.lastIndex = 0;
    src = src.replace(re, '$1' + over[k]);
  }
  var f = new Function(src + '\n' + TEST_SRC + '\nreturn {' +
    EXPORTS.map(function (n) { return n + ':typeof ' + n + '!=="undefined"?' + n + ':undefined'; }).join(',') + '};');
  return f();
}
function parseOver(s) {
  if (!s || s === true) return null;
  var out = {}, parts = String(s).split(','), i, kv;
  for (i = 0; i < parts.length; i++) {
    kv = parts[i].split('=');
    if (kv.length === 2) out[kv[0].trim()] = parseFloat(kv[1]);
  }
  return out;
}
var argOf = function (name) {
  var a = process.argv.find(function (x) { return x.indexOf('--' + name + '=') === 0; });
  return a ? a.split('=').slice(1).join('=') : null;
};
var S = build(parseOver(argOf('over')));
var ASSERTION_FLOOR = 60;

function runTests() {
  var rep = S.TEST.run({ src: SIM_SRC });
  var i;
  for (i = 0; i < rep.failures.length; i++) {
    console.log('FAIL  ' + rep.failures[i].name + (rep.failures[i].detail ? '   [' + rep.failures[i].detail + ']' : ''));
  }
  console.log('');
  console.log('PASSED ' + rep.passed + ' / FAILED ' + rep.failed + '   (total ' + rep.total + ')');
  if (rep.total < ASSERTION_FLOOR) {
    console.log('ASSERTION FLOOR MISSED: ' + rep.total + ' assertions, the floor is ' + ASSERTION_FLOOR + '.');
    process.exit(3);
  }
  if (rep.failed) process.exit(1);
  console.log('INKSWING TEST OK');
}

/* one throw list, traced, printed so a person can read the shape */
function runTrace(spec) {
  var sheet = S.newSheet({ rig: spec || 'single' });
  var thr = S.flingToThrow(sheet, { x: 260, y: 90 }, { x: -420, y: 620 }, 0, 'irongall');
  sheet.throws.push(thr);
  var tr = S.traceOf(sheet, 40);
  console.log(sheet.rig + ', one throw, ' + tr.length + ' points over 40 seconds');
  console.log('');
  console.log('      t         x         y');
  var i;
  for (i = 0; i < tr.length; i += Math.max(1, Math.round(tr.length / 40))) {
    console.log('  ' + tr[i].t.toFixed(2).padStart(6) + '  ' + tr[i].x.toFixed(2).padStart(8)
      + '  ' + tr[i].y.toFixed(2).padStart(8));
  }
  console.log('');
  console.log('INKSWING TRACE OK');
}

var a = process.argv.slice(2);
if (a.indexOf('--test') >= 0) runTests();
else if (argOf('trace')) runTrace(argOf('trace'));
else {
  console.log('usage: --test | --trace=<rig> [--over=KEY=VAL]');
  process.exit(2);
}
