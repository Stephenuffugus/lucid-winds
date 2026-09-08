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
     node sim.js --fly=fresh,launch --doodad=ball
                                           the same flight with a doodad on the kite
     node sim.js --doodads                 THE TABLE: every doodad in every mood, a
                                           launch and a park, then a launch and a hold,
                                           at the wind the mood promised (gusts and the
                                           layer on, the envelope off). Every row of
                                           DOODADS is flown here before its line is
                                           written (docs/GEAR-DOODADS-SEP08.md).

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
  'DOODADS', 'doodadById', 'doodadOpen', 'doodadFeat', 'doodadFeatShort', 'kiteUnlocked', 'doodadTick',
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
  var o = { mood: mood, seed: 1, wind: { gusts: false, thermal: false, turb: true }, doodad: argOf('doodad') || 'none' }, k;
  for (k in sc.start) o[k] = sc.start[k];
  var st = S.newFlight(o);
  console.log('UPDRAFT fly  mood ' + mood + '  script ' + name + '  kite ' + st.kite.name + (st.doodad.id !== 'none' ? '  doodad ' + st.doodad.id : ''));
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

/* THE DOODADS TABLE. Two flights per doodad per mood, seed 1, gusts and the
   turbulent layer on, the envelope and the veer off (the wind the mood
   promised), the thermal off:
     park: the launch rhythm (hold 0.6, release 0.6) for 25 s, then released to 70 s
     hold: the rhythm for 20 s, then a continuous hold to 70 s
   Columns: when it lifted off; whether it launched (passed the layer); the
   highest it got; where it parked (elevation, radians) at the end of the park
   flight or how it ended; the heading wobble (rms rad) over the last 30 s of
   the park, which is what steadier means; the top tension as a share of the
   line's limit; bells rung; the messenger's highest climb and its trips to the
   kite; and how the hold flight ended. */
function runDoodads() {
  var moods = ['gentle', 'fresh', 'blustery'], WIND = { gusts: true, thermal: false, turb: true, env: false, veer: false };
  var pad = function (v, n) { return String(v).padStart(n); };
  console.log('doodad     mood      lift  launched   top     park    wobble   tN    bells  clip    hold');
  S.DOODADS.forEach(function (d) {
    moods.forEach(function (mood) {
      var st = S.newFlight({ mood: mood, seed: 1, wind: WIND, doodad: d.id }), lift = -1, hs = [], maxTN = 0, clipMax = 0, i;
      var sc = S.rhythm(0.6, 0.6, 25).concat([{ t: 25, hold: false, lean: 0 }]);
      S.runScript(st, sc, 70, function (x) {
        if (lift < 0 && !x.onGround) lift = x.t;
        if (x.t >= 40 && !x.onGround) hs.push(x.heading);
        if (x.tN > maxTN) maxTN = x.tN;
        if (x.clip && x.clip.pos > clipMax) clipMax = x.clip.pos;
      }, 0.05);
      var mean = 0, rms = 0;
      for (i = 0; i < hs.length; i++) mean += hs[i]; mean = hs.length ? mean / hs.length : 0;
      for (i = 0; i < hs.length; i++) rms += (hs[i] - mean) * (hs[i] - mean); rms = hs.length ? Math.sqrt(rms / hs.length) : 0;
      var st2 = S.newFlight({ mood: mood, seed: 1, wind: WIND, doodad: d.id }), maxTN2 = 0;
      S.runScript(st2, S.rhythm(0.6, 0.6, 20).concat([{ t: 20, hold: true, lean: 0 }]), 70, function (x) { if (x.tN > maxTN2) maxTN2 = x.tN; }, 0.05);
      var tops = st.clip ? st.clip.tops : 0;
      console.log(d.id.padEnd(10) + ' ' + mood.padEnd(9) + pad(lift < 0 ? 'never' : lift.toFixed(1) + ' s', 7) + pad(st.launched ? 'yes' : 'no', 7)
        + pad(st.maxAlt.toFixed(1) + ' m', 9) + pad(st.ended ? st.ended + '@' + st.endT.toFixed(0) : 'el ' + st.el.toFixed(2), 12)
        + pad(hs.length ? rms.toFixed(3) : '', 8) + pad(maxTN.toFixed(2), 6) + pad(st.bell ? st.bell.rings : '', 6)
        + pad(st.clip ? clipMax.toFixed(2) + '/' + tops : '', 8) + '  ' + (st2.ended ? st2.ended + '@' + st2.endT.toFixed(0) : 'flying') + ' tN ' + maxTN2.toFixed(2));
    });
  });
  /* the tail chain: its segment and how the tip hangs after a Fresh park */
  console.log('');
  console.log('tail       seg(m)   tip u     tip w   (Fresh park, 40 s)');
  ['none', 'ribbon', 'streamers', 'ball'].forEach(function (id) {
    var st = S.newFlight({ mood: 'fresh', seed: 1, wind: { gusts: false, thermal: false, turb: false, env: false, veer: false }, doodad: id, L: 40, el: 0.85, launched: true });
    S.runScript(st, [{ t: 0, hold: false, lean: 0 }], 40);
    var tip = st.tail.pts[st.tail.pts.length - 1];
    console.log(id.padEnd(10) + pad(st.tail.seg.toFixed(3), 7) + pad(tip.u.toFixed(2), 9) + pad(tip.w.toFixed(2), 9));
  });
}

if (process.argv.indexOf('--test') >= 0) runTests();
else if (process.argv.indexOf('--doodads') >= 0) runDoodads();
else if (argOf('fly')) runFly(argOf('fly'));
else { console.log('usage: sim.js --test | --doodads | --fly=<mood>,<script> [--doodad=<id>] [--over=KEY=val,...]'); process.exit(2); }
