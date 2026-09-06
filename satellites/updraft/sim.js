#!/usr/bin/env node
/* UPDRAFT headless runner. Zero dependencies.
   Reads the SIM and TEST layers straight out of index.html through the marker
   comments, so there is exactly ONE implementation of the flight and the
   scripted thumb flies the same kite the real one does.

     node sim.js --test                    the assertion harness, nonzero on a failure
     node sim.js --fly=fresh,launch        a scripted flight, altitude and heading per 0.25 s
     node sim.js --fly=blustery,loop       scripts: launch, hold, loop, eight, dive, park, glide
     node sim.js --test --over=LEAN_TURN_RATE=0
                                           any run against an overridden CONFIG number,
                                           so a tuning pass never edits the shipped file

   Shape copied from satellites/fathom/sim.js.
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
var SIM_SRC = extract(HTML, '// ---- SIM_EXPORT_START ----', '// ---- SIM_EXPORT_END ----');
var TEST_SRC = extract(HTML, '// ---- TEST_EXPORT_START ----', '// ---- TEST_EXPORT_END ----');

var EXPORTS = ['CONFIG', 'makeRNG', 'seedFromString', 'mixSeed', 'KITES', 'kiteById',
  'makeWind', 'gustAt', 'windAt', 'newFlight', 'kitePos', 'altitude', 'setInput', 'step',
  'newTail', 'stepTail', 'tailLengths', 'stamp', 'tricksSample', 'runScript', 'rhythm', 'snapshot', 'TEST'];

/* A SIM built against an overridden CONFIG: a SOURCE level substitution of the
   numeric literal, never a mutation, because CONFIG is frozen on purpose.
   Throws on a key it did not find. */
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
  if (!s) return null;
  var out = {}, parts = String(s).split(','), i, kv;
  for (i = 0; i < parts.length; i++) { kv = parts[i].split('='); if (kv.length === 2) out[kv[0].trim()] = parseFloat(kv[1]); }
  return out;
}
var argOf = function (name) {
  var a = process.argv.find(function (x) { return x.indexOf('--' + name + '=') === 0; });
  return a ? a.split('=').slice(1).join('=') : null;
};
var S = build(parseOver(argOf('over')));
var ASSERTION_FLOOR = 60;

function runTests() {
  var rep = S.TEST.run({ simSrc: SIM_SRC }), i;
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
  console.log('UPDRAFT TEST OK');
}

/* the scripted thumb */
var SCRIPTS = {
  launch: { start: {}, T: 20, sc: S.rhythm(0.6, 0.6, 20) },
  hold: { start: {}, T: 15, sc: [{ t: 0, hold: true, lean: 0 }] },
  loop: { start: { L: 40, el: 0.68, launched: true }, T: 8, sc: [{ t: 0, hold: true, lean: 0.8 }, { t: 3, hold: false, lean: 0 }] },
  eight: { start: { L: 40, el: 0.68, launched: true }, T: 10, sc: [{ t: 0, hold: true, lean: 0.8 }, { t: 3, hold: true, lean: -0.8 }, { t: 6, hold: true, lean: 0.8 }] },
  dive: { start: { L: 20, el: 1.0, launched: true }, T: 6, sc: [{ t: 0, hold: true, lean: 0.8 }, { t: 1.4, hold: true, lean: 0 }, { t: 1.9, hold: true, lean: 1 }, { t: 3.1, hold: true, lean: 0 }, { t: 4.5, hold: false, lean: 0 }] },
  park: { start: { L: 40, el: 0.85, launched: true }, T: 70, sc: [{ t: 0, hold: false, lean: 0 }] },
  glide: { start: { L: 50, el: 0.9273, launched: true }, T: 60, sc: [{ t: 0, hold: false, lean: 0 }] }
};
function runFly(spec) {
  var parts = spec.split(','), mood = parts[0] || 'fresh', name = parts[1] || 'launch';
  var sc = SCRIPTS[name];
  if (!sc) { console.log('no script ' + name + '; have ' + Object.keys(SCRIPTS).join(', ')); process.exit(2); }
  var o = { mood: mood, seed: 1, wind: { gusts: false, thermal: false, turb: true } }, k;
  for (k in sc.start) o[k] = sc.start[k];
  var st = S.newFlight(o);
  console.log('UPDRAFT fly  mood ' + mood + '  script ' + name + '  kite ' + st.kite.name);
  console.log('    t   alt(m)   L(m)     el    az   head    Va   tens  hold  state');
  S.runScript(st, sc.sc, sc.T, function (s) {
    console.log(String(s.t.toFixed(2)).padStart(6) + String(S.altitude(s).toFixed(1)).padStart(8) + String(s.L.toFixed(1)).padStart(7)
      + String(s.el.toFixed(2)).padStart(7) + String(s.az.toFixed(2)).padStart(6) + String(s.heading.toFixed(2)).padStart(7)
      + String(s.Va.toFixed(1)).padStart(6) + String(s.tension.toFixed(1)).padStart(7) + (s.hold ? '  hold' : '      ')
      + '  ' + (s.onGround ? 'grass' : s.snagged ? 'SNAGGED' : s.stalled ? 'stall' : 'flying'));
  }, 0.25);
  console.log('ended ' + (st.ended || 'still flying') + '  max altitude ' + st.maxAlt.toFixed(1) + ' m  stamps ' + JSON.stringify(st.tricks.list.map(function (x) { return x.name + '@' + x.t.toFixed(1); })));
  console.log('events ' + JSON.stringify(st.events.map(function (e) { return e.e + '@' + e.t.toFixed(2); })));
}

if (process.argv.indexOf('--test') >= 0) runTests();
else if (argOf('fly')) runFly(argOf('fly'));
else { console.log('usage: sim.js --test | --fly=<mood>,<script> [--over=KEY=val,...]'); process.exit(2); }
