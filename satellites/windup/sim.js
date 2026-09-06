#!/usr/bin/env node
/* WINDUP headless runner. Zero dependencies.
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
var HTML_PATH = process.env.WINDUP_HTML || path.join(__dirname, 'index.html');
var HTML = fs.readFileSync(HTML_PATH, 'utf8');
var SIM_SRC = extract(HTML, '// ---- SIM_EXPORT_START ----', '// ---- SIM_EXPORT_END ----');
var TEST_SRC = extract(HTML, '// ---- TEST_EXPORT_START ----', '// ---- TEST_EXPORT_END ----');

var EXPORTS = ['CONFIG', 'makeRNG', 'seedFromString', 'mixSeed', 'clamp',
  'newStrip', 'canPunch', 'punch', 'unpunch', 'stripLength', 'holesAt', 'sortHoles',
  'packStrip', 'unpackStrip', 'seedMelody', 'STARTERS', 'noteHz', 'decayFor',
  'jitterFor', 'stepSeconds', 'stepAt', 'mmForSteps', 'dbToGain', 'envSeconds', 'TEST'];

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
  console.log('WINDUP TEST OK');
}

/* the note events a strip makes at a steady crank, printed for a person */
function runPlay(name) {
  var strip = S.STARTERS[name] ? S.newStrip(S.STARTERS[name]) : null;
  if (!strip) {
    console.log('no such starter: ' + name + ' (have ' + Object.keys(S.STARTERS).join(', ') + ')');
    process.exit(2);
  }
  console.log(strip.name + ', ' + strip.holes.length + ' holes, '
    + S.stripLength(strip) + ' steps');
  console.log('');
  console.log('   step  row  note      at (s)');
  var perStep = S.stepSeconds(), i;
  for (i = 0; i < strip.holes.length; i++) {
    var h = strip.holes[i];
    console.log('  ' + String(h[0]).padStart(5) + String(h[1]).padStart(5)
      + '  ' + String(S.CONFIG.ROW_MIDI[h[1]]).padStart(4)
      + '  ' + S.noteHz(h[1]).toFixed(1).padStart(7)
      + '  ' + (h[0] * perStep).toFixed(2).padStart(6));
  }
  console.log('');
  console.log('WINDUP PLAY OK');
}

var a = process.argv.slice(2);
if (a.indexOf('--test') >= 0) runTests();
else if (argOf('play')) runPlay(argOf('play'));
else {
  console.log('usage: --test | --play=<starter> [--over=KEY=VAL]');
  process.exit(2);
}
