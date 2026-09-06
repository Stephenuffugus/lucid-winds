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

var a = process.argv.slice(2);
if (a.indexOf('--test') >= 0) runTests();
else if (a.indexOf('--solve') >= 0) runSolve();
else if (a.indexOf('--race') >= 0) runRace();
else if (argOf('lap')) runLap(parseInt(argOf('lap'), 10) || 20);
else {
  console.log('usage: --test | --solve | --lap=N | --race [--over=KEY=VAL]');
  process.exit(2);
}
