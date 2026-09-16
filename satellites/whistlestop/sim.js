#!/usr/bin/env node
/* WHISTLESTOP headless runner. Zero dependencies.
   Reads the SIM and TEST layers straight out of index.html through the marker
   comments, so there is exactly ONE implementation of the rules and the bot
   runs the same railway the thumb does.

     node sim.js --test            the assertion harness, nonzero on a failure
     node sim.js --solve           every puzzle's own solution has to win, and
                                   the empty one has to lose
     node sim.js --lap=N           a train round the eight curve ring N times,
                                   reporting how far it has drifted from where
                                   it started
     node sim.js --race            when each train reaches the crossing, which
                                   is how the second puzzle was tuned
     node sim.js --par[=NAME]      par SEARCHED, not assumed: the fewest flips that
                                   win with three stars, how many flip scripts reach
                                   that floor, and one of them written as a script
     node sim.js --test --over=SPEEDS=0
                                   any run against an overridden CONFIG without
                                   editing the game, so a tuning pass is one
                                   command and the shipped numbers stay shipped

   Shape copied from satellites/doohickey/sim.js.
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
var HTML_PATH = process.env.WHISTLESTOP_HTML || path.join(__dirname, 'index.html');
var HTML = fs.readFileSync(HTML_PATH, 'utf8');
var SIM_SRC = extract(HTML, '// ---- SIM_EXPORT_START ----', '// ---- SIM_EXPORT_END ----');
var TEST_SRC = extract(HTML, '// ---- TEST_EXPORT_START ----', '// ---- TEST_EXPORT_END ----');

var EXPORTS = ['CONFIG', 'makeRNG', 'seedFromString', 'mixSeed', 'clamp',
  'DEG', 'DPI', 'DHALF_PI', 'dsin', 'dcos', 'datan2', 'len2', 'angDiff',
  'U', 'CURVE_R_W', 'ARC_LEN', 'CX_OFF', 'CY_OFF', 'PIECES', 'PIECE_ORDER',
  'endWorld', 'poseForEnd', 'newLayout', 'buildGraph', 'components', 'cycleCount',
  'openEnds', 'snapPose', 'routeOut', 'isFacing', 'edgePoint', 'edgeHeading',
  'SPACING_W', 'newTrain', 'seedRoute', 'bodyPose', 'trainBodies', 'advanceTrain',
  'newState', 'stepSim', 'flipLever', 'setSpeed', 'stateHash', 'edgesRelated',
  'buildLayout', 'layoutBounds', 'packRug', 'unpackRug', 'relayout',
  'PUZZLES', 'makePuzzle', 'runPuzzle', 'starsFor', 'junctionNodeOf', 'COLOURS',
  'TEST', 'rig', 'trainOn', 'simFor', 'stateWith'];

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
  console.log('WHISTLESTOP TEST OK');
}

/* every puzzle's own solution, run to the end, and the empty script run beside
   it so a puzzle that wins itself cannot hide */
function runSolve() {
  var bad = 0, i;
  console.log('  puzzle                  trains  par  flips   home at   stars   nothing at all');
  for (i = 0; i < S.PUZZLES.length; i++) {
    var pz = S.PUZZLES[i];
    var res = S.runPuzzle(pz, pz.solution, S.CONFIG.RUN_MAX_S);
    var none = S.runPuzzle(pz, [], S.CONFIG.RUN_MAX_S);
    var stars = S.starsFor(pz, res);
    var line = '  ' + pz.name.padEnd(24) + String(pz.trains.length).padStart(4)
      + String(pz.par).padStart(6) + String(res.flips).padStart(6)
      + (res.won ? (res.at.toFixed(2) + ' s').padStart(11) : '      never')
      + String(stars).padStart(7) + '   ' + (none.won ? 'WINS ITSELF' : none.collided ? 'bumps' : 'never gets home');
    if (!res.won) { line += '   NO WIN'; bad++; }
    if (res.collided) { line += '   CRASHED'; bad++; }
    if (res.everStopped) { line += '   HAD TO STOP'; bad++; }
    if (res.flips !== pz.par) { line += '   PAR IS WRONG'; bad++; }
    if (none.won) bad++;
    if (stars !== 3) { line += '   NOT THREE STARS'; bad++; }
    console.log(line);
  }
  if (bad) { console.log('\n' + bad + ' PUZZLE PROBLEM(S)'); process.exit(1); }
  console.log('\nWHISTLESTOP SOLVE OK');
}

/* a train round the ring, N laps, reporting the drift. A follower that steps by
   the chord instead of the arc loses ground every lap and this is the table
   that shows it. */
function runLap(n) {
  var ops = [['at', 5, 4.5, 0], ['rep', 8, 'curveR']];
  var g = S.buildGraph(S.buildLayout(ops));
  var tr = S.trainOn(g, 0, 0, 0, 1, 0);
  var st = S.stateWith(g, [tr]);
  S.setSpeed(st, tr, 2);
  var start = S.bodyPose(g, tr, 0);
  var L = 8 * S.ARC_LEN, v = S.CONFIG.SPEEDS[2] * S.U;
  var steps = 480, dt = L / (steps * v), i, k, worst = 0;
  console.log('  lap   drift from the start');
  for (k = 0; k < n; k++) {
    for (i = 0; i < steps; i++) S.stepSim(st, dt);
    var now = S.bodyPose(g, tr, 0);
    var d = S.len2(now.x - start.x, now.y - start.y) / S.U;
    worst = Math.max(worst, d);
    if (k < 6 || k === n - 1) console.log('  ' + String(k + 1).padStart(3) + '   ' + d.toFixed(6) + ' U');
  }
  if (worst > 0.01) { console.log('\nTHE FOLLOWER DRIFTS: ' + worst.toFixed(5) + ' U after ' + n + ' laps'); process.exit(1); }
  console.log('\nWHISTLESTOP LAP OK');
}

/* when each train reaches the crossing. This is the tuning instrument for the
   second puzzle: if the two numbers are far apart there is no puzzle. */
function runRace() {
  var pz = S.PUZZLES[1];
  var scripts = [
    ['nothing at all', []],
    ['Red sent the right way only', [{ atS: 0.1, piece: 4, to: 0 }]],
    ['the whole solution', pz.solution]
  ];
  var i, k;
  for (i = 0; i < scripts.length; i++) {
    var st = S.makePuzzle(pz), dt = 1 / S.CONFIG.SIM_HZ, done = [];
    var cross = { x: 9.8 * S.U, y: 5.6 * S.U }, at = [];
    for (k = 0; k < st.trains.length; k++) S.setSpeed(st, st.trains[k], 2);
    for (var f = 0; f < S.CONFIG.RUN_MAX_S * S.CONFIG.SIM_HZ && !st.won; f++) {
      for (k = 0; k < scripts[i][1].length; k++) {
        if (done[k]) continue;
        if (st.t >= scripts[i][1][k].atS) {
          var nid = S.junctionNodeOf(st.g, scripts[i][1][k].piece);
          if (st.g.junctions[nid] && st.g.junctions[nid].lever !== scripts[i][1][k].to) S.flipLever(st, nid);
          done[k] = 1;
        }
      }
      S.stepSim(st, dt);
      for (k = 0; k < st.trains.length; k++) {
        if (at[k] !== undefined) continue;
        var b = S.bodyPose(st.g, st.trains[k], 0);
        if (S.len2(b.x - cross.x, b.y - cross.y) < 0.4 * S.U) at[k] = st.t;
      }
    }
    console.log('  ' + scripts[i][0].padEnd(30)
      + '  red at the crossing ' + (at[0] === undefined ? 'never' : at[0].toFixed(2) + ' s')
      + ',  blue ' + (at[1] === undefined ? 'never' : at[1].toFixed(2) + ' s')
      + ',  ' + (st.collided ? 'BUMP' : st.won ? 'home in ' + st.wonAt.toFixed(2) + ' s' : 'still out there'));
  }
  console.log('\nWHISTLESTOP RACE OK');
}

/* ---- par, searched (added 2026-09-16 for T2.3) ----
   A lever only matters at one moment: the last time the route ahead is checked
   before a train's LEADING body crosses a facing switch (validateAhead re-derives
   the switch every step until then, and never after). So the search runs the real
   sim and, whenever a leading body comes within three steps of a facing switch it
   has not been decided for, branches on the lever: leave it (free) or throw it
   (one flip). A bump or a stop kills the branch, because three stars forbid both.
   Iterative deepening on the flip count makes the first win found the floor.
   Every branch is the game's own stepSim from a cloned state, so what it proves is
   what the thumb gets. */
function parSearch(pz, opts) {
  opts = opts || {};
  var TMAX = opts.tmax || 60, MAXB = opts.maxb === undefined ? 5 : opts.maxb, CAP = opts.cap || 400;
  var dt = 1 / S.CONFIG.SIM_HZ;
  var base = S.makePuzzle(pz), k;
  for (k = 0; k < base.trains.length; k++) S.setSpeed(base, base.trains[k], 2);
  var stepLen = S.CONFIG.SPEEDS[2] * S.U * dt;
  var g = base.g;
  function exitN(seg) { var e = g.edges[seg.edge]; return seg.dir > 0 ? e.b : e.a; }
  function entryN(seg) { var e = g.edges[seg.edge]; return seg.dir > 0 ? e.a : e.b; }
  function snap(st, decided) {
    var lv = {}, j; for (j in g.junctions) lv[j] = g.junctions[j].lever;
    return { tr: JSON.stringify(st.trains), t: st.t, flips: st.flips, es: st.everStopped, co: st.collided,
      won: st.won, wonAt: st.wonAt, lv: lv, dec: JSON.stringify(decided), bumps: bumps.slice() };
  }
  function restore(st, sn) {
    st.trains = JSON.parse(sn.tr); st.t = sn.t; st.flips = sn.flips; st.everStopped = sn.es;
    st.collided = sn.co; st.won = sn.won; st.wonAt = sn.wonAt;
    var j; for (j in sn.lv) g.junctions[j].lever = sn.lv[j];
    bumps = sn.bumps.slice();
    return JSON.parse(sn.dec);
  }
  /* ⛔ a passage is (train, switch, place on the route, how many times that train has
     bumped). The route keeps one arc length coordinate, so a train that bumps, backs
     out and comes at the same switch again meets it at the SAME place on its route;
     keyed on the place alone, that second approach read as decided and The Crossing,
     whose answer is exactly that second approach, searched as unwinnable. */
  var bumps = [];
  for (k = 0; k < base.trains.length; k++) bumps.push(0);
  function pending(st, decided) {
    var out = [], i, t;
    for (t = 0; t < st.trains.length; t++) {
      var tr = st.trains[t];
      if (tr.arrived || tr.speedIx <= 0 || !tr.route.length) continue;
      if (tr.dir > 0) {
        for (i = 0; i < tr.route.length; i++) {
          var a = tr.route[i], bd = a.d0 + a.len;
          if (bd < tr.p) continue;
          if (bd - tr.p >= 3 * stepLen) break;
          var n = exitN(a), key = t + ':' + n + ':' + Math.round(bd) + ':' + bumps[t];
          if (decided[key] || !S.isFacing(g, n, a.edge)) continue;
          if (bd - tr.p < stepLen) { decided[key] = 1; continue; }     // already locked
          out.push({ n: n, key: key });
        }
      } else {
        var lo = tr.p - tr.cars * S.SPACING_W;
        for (i = tr.route.length - 1; i >= 0; i--) {
          var c = tr.route[i], bd2 = c.d0;
          if (bd2 > lo) continue;
          if (lo - bd2 >= 3 * stepLen) break;
          var n2 = entryN(c), key2 = t + ':' + n2 + ':' + Math.round(bd2) + ':r' + bumps[t];
          if (decided[key2] || !S.isFacing(g, n2, c.edge)) continue;
          if (lo - bd2 < stepLen) { decided[key2] = 1; continue; }
          out.push({ n: n2, key: key2 });
        }
      }
    }
    return out;
  }
  var found = [], st = base;
  function go(bound, decided, path) {
    for (;;) {
      if (found.length >= CAP) return;
      var pd = pending(st, decided);
      if (pd.length) {
        var d = pd[0]; decided[d.key] = 1;
        var sn = snap(st, decided), cur = g.junctions[d.n].lever;
        if (st.flips < bound) {                                              // throw it (first, so early answers come first)
          g.junctions[d.n].lever = cur ? 0 : 1; st.flips++;
          var pj = g.junctions[d.n].link !== undefined ? g.junctions[g.junctions[d.n].link] : null;
          if (pj) pj.lever = pj.lever ? 0 : 1;                               // a linked partner goes with it, as flipLever does
          go(bound, decided, path.concat([{ t: +st.t.toFixed(3), piece: g.junctions[d.n].piece, to: cur ? 0 : 1 }]));
          decided = restore(st, sn);
        }
        go(bound, decided, path);                                           // leave it
        restore(st, sn);
        return;
      }
      var evs = S.stepSim(st, dt), e;
      for (e = 0; e < evs.length; e++) if (evs[e].t === 'bump') bumps[st.trains.indexOf(evs[e].train)]++;
      if (st.collided || st.everStopped) return;
      if (st.won) { found.push({ flips: st.flips, at: st.wonAt, path: path }); return; }
      if (st.t > TMAX) return;
    }
  }
  var start = snap(base, {}), b;
  for (b = 0; b <= MAXB; b++) {
    found = []; restore(st, start);
    go(b, {}, []);
    if (found.length) {
      /* an answer's SHAPE is which levers go which way, in order; two timings of one shape are one answer */
      /* two ends of one linked lever are ONE lever: name a throw by the lower piece of its pair,
         or a throw decided at either end reads as two different answers */
      var canon = {}, lk = pz.links || [], q;
      for (q = 0; q < lk.length; q++) { canon[lk[q][0]] = Math.min(lk[q][0], lk[q][1]); canon[lk[q][1]] = Math.min(lk[q][0], lk[q][1]); }
      var shapes = {}, best = found[0], f;
      for (f = 0; f < found.length; f++) {
        shapes[found[f].path.map(function (x) { return (canon[x.piece] !== undefined ? canon[x.piece] : x.piece) + '>' + x.to; }).join(' ')] = 1;
        if (found[f].at < best.at) best = found[f];
      }
      return { par: b, count: found.length, capped: found.length >= CAP, shapes: Object.keys(shapes), witness: best };
    }
  }
  return { par: -1 };
}
/* ---- the window a child gets for each flip ----
   A flip is only thinkable once the train before has passed that switch, and only
   useful until the next decisive arrival. Replaying the fastest answer, the window
   of a flip is the time from the last engine to cross that switch to the flip's own
   decision. A flip with no earlier passage can be made before the whistle and has
   all the time in the world. Four Stations' first draft had a window of 0.8 s,
   which its own written answer missed by a twentieth of a second: that is the
   fault this measures. */
var WINDOW_MIN_S = 1.0;
function flipWindows(pz, path) {
  var st = S.makePuzzle(pz), dt = 1 / S.CONFIG.SIM_HZ, done = [], k, f;
  for (k = 0; k < st.trains.length; k++) S.setSpeed(st, st.trains[k], 2);
  var js = {}, near = {}, passes = [];
  for (k in st.g.junctions) js[k] = st.g.nodes[st.g.junctions[k].node];
  var script = path.map(function (x) { return { atS: x.t - 0.02, piece: x.piece, to: x.to }; });
  for (f = 0; f < 60 * S.CONFIG.SIM_HZ && !st.won && !st.collided; f++) {
    for (k = 0; k < script.length; k++) {
      if (done[k] || st.t < script[k].atS) continue;
      var nid = S.junctionNodeOf(st.g, script[k].piece);
      if (st.g.junctions[nid].lever !== script[k].to) S.flipLever(st, nid);
      done[k] = 1;
    }
    S.stepSim(st, dt);
    for (k = 0; k < st.trains.length; k++) {
      var b = S.bodyPose(st.g, st.trains[k], 0), j;
      for (j in js) {
        var d = S.len2(b.x - js[j].x, b.y - js[j].y) / S.U, key = k + ':' + j;
        if (d < 0.15 && !near[key]) { near[key] = 1; passes.push({ t: st.t, piece: st.g.junctions[j].piece }); }
        if (d > 0.6) near[key] = 0;
      }
    }
  }
  /* a linked lever's window closes on a train at EITHER of its switches: a throw
     before the partner's train goes by sends that train too */
  var mates = {}, lk = pz.links || [], q;
  for (q = 0; q < lk.length; q++) { mates[lk[q][0]] = lk[q][1]; mates[lk[q][1]] = lk[q][0]; }
  return path.map(function (x) {
    var from = -1, i;
    for (i = 0; i < passes.length; i++) {
      if ((passes[i].piece === x.piece || passes[i].piece === mates[x.piece]) && passes[i].t < x.t - 0.05) from = passes[i].t;
    }
    return { piece: x.piece, from: from, to: x.t, w: from < 0 ? Infinity : x.t - from };
  });
}
function runPar(name) {
  var i, bad = 0;
  console.log('  puzzle                  written par  searched par  answers  tightest window   the fastest (lever -> setting at time)');
  for (i = 0; i < S.PUZZLES.length; i++) {
    var pz = S.PUZZLES[i];
    if (name && name !== true && pz.name !== name) continue;
    var r = parSearch(pz);
    var w = r.par < 0 ? 'NO THREE STAR WIN IN 60 s' : r.witness.path.map(function (x) { return x.t.toFixed(2) + 's #' + x.piece + '->' + x.to; }).join(' ') + (r.par ? '' : '(none)') + '  home ' + r.witness.at.toFixed(2) + ' s';
    var tight = Infinity;
    if (r.par > 0) flipWindows(pz, r.witness.path).forEach(function (x) { if (x.w < tight) tight = x.w; });
    var line = '  ' + pz.name.padEnd(24) + String(pz.par).padStart(11) + String(r.par).padStart(14)
      + String(r.par < 0 ? '-' : (r.shapes.length + (r.capped ? '+' : ''))).padStart(9)
      + (tight === Infinity ? 'before whistle' : tight.toFixed(2) + ' s').padStart(17) + '   ' + w;
    if (tight < WINDOW_MIN_S) { line += '   A FLIP HAS UNDER ' + WINDOW_MIN_S + ' s'; bad++; }
    if (r.par >= 0 && process.argv.indexOf('--shapes') >= 0) line += '\n      shapes: ' + r.shapes.join(' | ');
    if (r.par !== pz.par) { line += '   PAR IS WRONG'; bad++; }
    console.log(line);
  }
  if (bad) { console.log('\n' + bad + ' PAR PROBLEM(S)'); process.exit(1); }
  console.log('\nWHISTLESTOP PAR OK');
}

var a = process.argv.slice(2);
if (a.indexOf('--test') >= 0) runTests();
else if (a.indexOf('--solve') >= 0) runSolve();
else if (a.indexOf('--race') >= 0) runRace();
else if (a.some(function (x) { return x.indexOf('--par') === 0; })) runPar(argOf('par') || true);
else if (argOf('lap')) runLap(parseInt(argOf('lap'), 10) || 20);
else {
  console.log('usage: --test | --solve | --lap=N | --race | --par[=NAME] [--over=KEY=VAL]');
  process.exit(2);
}
