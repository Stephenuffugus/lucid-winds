#!/usr/bin/env node
/* AIRWORTHY headless runner. Zero dependencies.
   Reads the SIM and TEST layers straight out of index.html through the marker
   comments, so there is exactly ONE implementation of the rules and the bot
   plays the same game the thumb does.

     node sim.js --test            the assertion harness, nonzero on a failure
     node sim.js --fly=porpoise    one flight, printed so a person can read it
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
/* test/mutants.mjs points this at a scratch copy so a mutation can be run
   without touching the shipped file. Nothing else ever sets it. */
var HTML_PATH = process.env.AIRWORTHY_HTML || path.join(__dirname, 'index.html');
var HTML = fs.readFileSync(HTML_PATH, 'utf8');
var SIM_SRC = extract(HTML, '// ---- SIM_EXPORT_START ----', '// ---- SIM_EXPORT_END ----');
var TEST_SRC = extract(HTML, '// ---- TEST_EXPORT_START ----', '// ---- TEST_EXPORT_END ----');

var EXPORTS = ['CONFIG', 'CLIP_MASS', 'makeRNG', 'seedFromString', 'mixSeed', 'dailySeedFor',
  'clamp', 'DEG', 'newSpec', 'derive', 'stillAir', 'windAt', 'gustField',
  'flightState', 'flightStep', 'fly', 'ARCHETYPES', 'traceStats', 'classify', 'TEST'];

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
  console.log('AIRWORTHY TEST OK');
}

/* one flight, printed so a person can see the swoop in numbers */
var NAMED = {
  cruiser: { noseFolds: 3, nose: 'pointed', wing: 0.5, elev: 0 },
  porpoise: { noseFolds: 1, nose: 'blunt', wing: 0.6, elev: 6 },
  tumbler: { noseFolds: 1, nose: 'blunt', wing: 0.9, elev: 12, fins: 'none' },
  lawndart: { noseFolds: 3, nose: 'pointed', clip: 'nose' },
  floater: { wing: 1.0, noseFolds: 2 }
};
function specFromArg(word) {
  if (NAMED[word]) return S.newSpec(NAMED[word]);
  var parts = String(word).split('/'), over = {}, i;
  for (i = 0; i < parts.length; i++) {
    var kv = parts[i].split(':');
    if (kv.length !== 2) continue;
    var n = parseFloat(kv[1]);
    over[kv[0]] = isNaN(n) ? kv[1] : n;
  }
  return S.newSpec(over);
}
function runFly(arg) {
  var bits = String(arg).split(',');
  var spec = specFromArg(bits[0] || 'porpoise');
  var angle = bits[2] === undefined ? 5 : parseFloat(bits[2]);
  var power = bits[3] === undefined ? 0.5 : parseFloat(bits[3]);
  var res = S.fly(spec, { angle: angle, power: power });
  var st = S.traceStats(res), name = S.classify(res);
  var D = res.derived;
  console.log('spec  ' + JSON.stringify(spec));
  console.log('mass ' + (D.mass * 1000).toFixed(2) + ' g   area ' + (D.S * 10000).toFixed(0)
    + ' cm2   AR ' + D.AR.toFixed(2) + '   margin ' + (D.margin * 100).toFixed(1)
    + ' percent chord   stall ' + (D.alphaStall / S.DEG).toFixed(1) + ' deg');
  console.log('launched at ' + angle + ' degrees, power ' + power);
  console.log('');
  console.log('     t       x       y   pitch       V   alpha');
  var i, next = 0;
  for (i = 0; i < res.trace.length; i++) {
    var p = res.trace[i];
    if (p.t + 1e-9 < next) continue;
    next += 0.25;
    console.log('  ' + p.t.toFixed(2).padStart(5) + '  ' + p.x.toFixed(2).padStart(6)
      + '  ' + p.y.toFixed(2).padStart(6) + '  ' + (p.theta / S.DEG).toFixed(1).padStart(6)
      + '  ' + p.V.toFixed(2).padStart(6) + '  ' + (p.alpha / S.DEG).toFixed(1).padStart(6));
  }
  console.log('');
  console.log('lands at ' + res.distance.toFixed(2) + ' m after ' + res.airtime.toFixed(2)
    + ' s, ' + res.stalls + ' stalls, veer ' + res.veer.toFixed(3));
  console.log('descent ' + st.descent.toFixed(1) + ' deg, pitch swing ' + st.amp.toFixed(1)
    + ' deg, period ' + st.period.toFixed(2) + ' s, speed at 3 s ' + st.vAt3.toFixed(2) + ' m/s');
  console.log('=> ' + name.name);
  console.log('');
  console.log('AIRWORTHY FLY OK');
}
var a = process.argv.slice(2);
if (a.indexOf('--test') >= 0) runTests();
else if (argOf('fly')) runFly(argOf('fly'));
else {
  console.log('usage: --test | --fly=SPEC[,course,angle,power] [--over=KEY=VAL]');
  console.log('  SPEC is a name (cruiser porpoise tumbler lawndart floater)');
  console.log('  or a list like wing:0.8/noseFolds:1/elev:6');
  process.exit(2);
}
