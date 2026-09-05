#!/usr/bin/env node
/* SWELL headless runner. Zero dependencies.
   Reads the SIM and TEST layers straight out of index.html through the marker
   comments, so there is exactly ONE implementation of the rules and the bot
   plays the same game the thumb does.

     node sim.js --test            the assertion harness, nonzero on a failure
     node sim.js --solve           the bot walks every campaign cave to its exit
     node sim.js --endless=200     200 deep caves checked for the things that
                                   make a cave playable at all
     node sim.js --watch=1234      an ascii dump of one deep cave, for a human
     node sim.js --test --over=RING_SPEED=0
                                   any run against an overridden CONFIG without
                                   editing the game, so a tuning pass is one
                                   command and the shipped numbers stay shipped

   Shape copied from satellites/deepwell/sim.js.
*/
'use strict';
var fs = require('fs');
var path = require('path');

function extract(src, a, b) {
  var i = src.indexOf(a), j = src.indexOf(b);
  if (i < 0 || j < 0) throw new Error('marker not found: ' + a + ' / ' + b);
  return src.slice(i + a.length, j);
}
var HTML = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
var SIM_SRC = extract(HTML, '// ---- THEORY_EXPORT_START ----', '// ---- THEORY_EXPORT_END ----');
var TEST_SRC = extract(HTML, '// ---- TEST_EXPORT_START ----', '// ---- TEST_EXPORT_END ----');

var EXPORTS = ['CONFIG', 'makeRNG', 'seedFromString', 'mixSeed', 'clamp', 'smoothstep',
  'MOODS', 'MOOD_ORDER', 'chordOf', 'distOf', 'chordPitches', 'walkNext', 'leadVoices',
  'gridStep', 'nextGrid', 'cadenceFor', 'layerGain', 'intensityAt', 'filterHz',
  'sectionForFinger', 'isHit', 'registerFor', 'panFor', 'pressureMul',
  'ambientPlan', 'sleepGain', 'TEST'];

/* A SIM built against an overridden CONFIG. The override is a SOURCE level
   substitution of the numeric literal, not a mutation, because CONFIG is frozen
   on purpose and a tuning pass must never be able to leak into a shipped run.
   Throws on a key it did not find, so a typo in a sweep can never silently
   measure the shipped numbers and call them tuned. */
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

/* ------------------------------------------------------------------ tests */
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
  console.log('SWELL TEST OK');
}

/* ------------------------------------------------------------------- walk */
/* Chord walks printed for a person to read. Stephen is a music producer; the
   numbers are for the gate and this is for him. */
function runWalk(spec) {
  var parts = String(spec).split(',');
  var moodKey = parts[0] || 'dawn';
  var seeds = parseInt(parts[1] || '4', 10);
  var m = S.MOODS[moodKey];
  if (!m) { console.log('no mood called ' + moodKey); process.exit(2); }
  console.log(m.name + ', ' + m.bpm + ' bpm, tonic ' + m.tonic);
  var s, i;
  for (s = 0; s < seeds; s++) {
    var seed = 1000 + s * 7919, cur = m.tonic, line = [cur], holds = [0];
    for (i = 1; i <= 12; i++) {
      var bar = i, holdS = i * (60 / m.bpm) * 4;
      var tension = S.clamp(holdS / S.CONFIG.TENSION_FULL_S, 0, 1);
      cur = S.walkNext(m, cur, tension, seed, bar);
      line.push(cur);
      holds.push(Math.round(tension * 100));
    }
    var cad = S.cadenceFor(m, cur, 12 * (60 / m.bpm) * 4);
    console.log('  seed ' + seed + '  ' + line.join(' ') + '   then ' + cad.join(' '));
    console.log('               tension ' + holds.join(' ') + ' percent');
  }
  /* and the voice leading of one of them, in semitones */
  var voices = S.chordPitches(m, m.tonic, 48).slice(0, 3), cur2 = m.tonic;
  console.log('\n  voice leading from ' + m.tonic + ' at MIDI ' + voices.join(', '));
  for (i = 1; i <= 8; i++) {
    cur2 = S.walkNext(m, cur2, 0.6, 1000, i);
    var next = S.leadVoices(voices, m, cur2, 48);
    var moves = next.map(function (p, j) { return (p - voices[j] >= 0 ? '+' : '') + (p - voices[j]); });
    console.log('    ' + (cur2 + '    ').slice(0, 5) + ' ' + next.join(', ') + '   moved ' + moves.join(', '));
    voices = next;
  }
  console.log('\nSWELL WALK OK');
}

var a = process.argv.slice(2);
if (a.indexOf('--test') >= 0) runTests();
else if (argOf('walk')) runWalk(argOf('walk'));
else {
  console.log('usage: --test | --walk=MOOD,SEEDS [--over=KEY=VAL]');
  process.exit(2);
}
