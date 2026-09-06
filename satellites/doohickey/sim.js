#!/usr/bin/env node
/* DOOHICKEY headless runner. Zero dependencies.
   Reads the SIM and TEST layers straight out of index.html through the marker
   comments, so there is exactly ONE implementation of the rules and the bot
   plays the same game the thumb does.

     node sim.js --test            the assertion harness, nonzero on a failure
     node sim.js --solve           every level's own solution has to win
     node sim.js --replay=100      the same machine 100 times, one hash
     node sim.js --dominoes=100    the heartbeat, per spacing, as a table
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
var HTML_PATH = process.env.DOOHICKEY_HTML || path.join(__dirname, 'index.html');
var HTML = fs.readFileSync(HTML_PATH, 'utf8');
var SIM_SRC = extract(HTML, '// ---- SIM_EXPORT_START ----', '// ---- SIM_EXPORT_END ----');
var TEST_SRC = extract(HTML, '// ---- TEST_EXPORT_START ----', '// ---- TEST_EXPORT_END ----');

var EXPORTS = ['CONFIG', 'makeRNG', 'seedFromString', 'mixSeed', 'clamp', 'DEG',
  'dsin', 'dcos', 'datan', 'datan2', 'len2',
  'v', 'vadd', 'vsub', 'vmul', 'vdot', 'vlen', 'vnorm', 'vrot',
  'PHYS', 'PinJoint', 'Rope', 'fanForce', 'buoyancy', 'stateHash',
  'PARTS', 'PART_ORDER', 'newMachine', 'cloneMachine', 'packMachine', 'unpackMachine',
  'detentIndex', 'detentAngle', 'LEVELS', 'buildWorld', 'runMachine', 'bellRung',
  'starsFor', 'machineFromSolution', 'dominoTrial', 'dominoSweep', 'TEST'];

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
  console.log('DOOHICKEY TEST OK');
}

/* every level's own solution, run to the end */
function runSolve() {
  var bad = 0, i;
  console.log('  level                    parts  par   goal at   stars  bonus');
  for (i = 0; i < S.LEVELS.length; i++) {
    var lv = S.LEVELS[i];
    var m = S.machineFromSolution(lv);
    var res = S.runMachine(lv, m);
    var stars = S.starsFor(lv, m, res);
    var empty = S.runMachine(lv, S.newMachine());
    var line = '  ' + lv.name.padEnd(24) + String(m.parts.length).padStart(5)
      + String(lv.par).padStart(5) + (res.goal ? (res.goalAt.toFixed(2) + 's').padStart(10) : '      never')
      + String(stars).padStart(7) + '  ' + res.bonus.join(',');
    if (!res.goal) { line += '   NO GOAL'; bad++; }
    if (m.parts.length > lv.par) { line += '   OVER PAR'; bad++; }
    if (empty.goal) { line += '   WINS ITSELF'; bad++; }
    if (!res.allBonus) { line += '   BONUS UNREACHED'; bad++; }
    console.log(line);
  }
  if (bad) { console.log('\n' + bad + ' LEVEL PROBLEM(S)'); process.exit(1); }
  console.log('\nDOOHICKEY SOLVE OK');
}

/* the same machine, N times, one hash or the determinism law is broken */
function runReplay(n) {
  var lv = S.LEVELS[5], m = S.machineFromSolution(lv), seen = {}, first = null, i;
  for (i = 0; i < n; i++) {
    var h = S.runMachine(lv, m, 6).hash;
    if (!first) first = h;
    seen[h] = (seen[h] || 0) + 1;
  }
  var keys = Object.keys(seen);
  console.log(n + ' runs of a ' + m.parts.length + ' part machine');
  for (i = 0; i < keys.length; i++) console.log('  ' + keys[i] + '  x' + seen[keys[i]]);
  if (keys.length !== 1) { console.log('\nDETERMINISM BROKEN: ' + keys.length + ' different hashes'); process.exit(1); }
  console.log('\nDOOHICKEY REPLAY OK');
}

/* the heartbeat, as a table a person can read */
function runDominoes(trials) {
  var ratios = [0.55, 0.65, 0.75], i, bad = 0;
  console.log('  spacing   trials   all fell   worst last fall');
  for (i = 0; i < ratios.length; i++) {
    var r = S.dominoSweep(ratios[i], trials);
    var line = '  ' + String(ratios[i]).padEnd(9) + String(r.of).padStart(6)
      + String(r.ok).padStart(11) + (r.worst.toFixed(2) + 's').padStart(17);
    if (r.ok !== r.of) { line += '   ' + r.fails.join(' | '); bad++; }
    console.log(line);
  }
  if (bad) { console.log('\n' + bad + ' SPACING(S) NOT AT 100 PERCENT'); process.exit(1); }
  console.log('\nDOOHICKEY DOMINO OK');
}

var a = process.argv.slice(2);
if (a.indexOf('--test') >= 0) runTests();
else if (a.indexOf('--solve') >= 0) runSolve();
else if (argOf('replay')) runReplay(parseInt(argOf('replay'), 10) || 100);
else if (argOf('dominoes')) runDominoes(parseInt(argOf('dominoes'), 10) || 100);
else {
  console.log('usage: --test | --solve | --replay=N | --dominoes=TRIALS [--over=KEY=VAL]');
  process.exit(2);
}
