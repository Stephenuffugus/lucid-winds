#!/usr/bin/env node
/* FATHOM headless runner. Zero dependencies.
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
var SIM_SRC = extract(HTML, '// ---- SIM_EXPORT_START ----', '// ---- SIM_EXPORT_END ----');
var TEST_SRC = extract(HTML, '// ---- TEST_EXPORT_START ----', '// ---- TEST_EXPORT_END ----');

var EXPORTS = ['CONFIG', 'makeRNG', 'seedFromString', 'mixSeed', 'dailySeedFor',
  'LEVELS', 'SOLVE', 'gridToSegments', 'buildHash', 'segsNear', 'nearestOnSeg',
  'rayHit', 'gridScan', 'bfsPath', 'bfsField', 'caveGrid', 'gridOpen',
  'pushOut', 'nearestWallDist', 'distOf', 'newRipple', 'heardAt',
  'newRun', 'throwStone', 'doHum', 'update', 'starsFor', 'snapshot',
  'solveScript', 'solveStep', 'TEST'];

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
  var rep = S.TEST.run({ simSrc: SIM_SRC });
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
  console.log('FATHOM TEST OK');
}

/* ------------------------------------------------------------------ solve */
/* The bot walks the shortest tile path and throws the cave's authored script.
   It proves three things a human cannot prove by playing once: the exit can be
   reached, the stone budget covers the route, and nothing eats you on the way.
   Watch it fail by moving a cave's X one tile into rock. */
/* FIVE SEEDS PER CAVE. A lurker drifts on the seed, so one seed proves that one
   run was survivable and nothing more. Five say the cave is survivable. Fewer
   than that and the gate is a coin the morning reader would have believed. */
var SOLVE_SEEDS = [1001, 2002, 3003, 4004, 5005];
function runSolve() {
  var C = S.CONFIG, bad = 0, i, sIdx;
  var TRACE = process.argv.indexOf('--trace') >= 0;
  var ONLY = argOf('only') === null ? -1 : parseInt(argOf('only'), 10) - 1;
  var SEEDS = argOf('seed') ? [parseInt(argOf('seed'), 10)] : SOLVE_SEEDS;
  for (i = 0; i < S.LEVELS.length; i++) {
    if (ONLY >= 0 && i !== ONLY) continue;
    var clean = 0, worst = '', bestLine = '';
    for (sIdx = 0; sIdx < SEEDS.length; sIdx++) {
    var st;
    try { st = S.newRun({ mode: 'campaign', level: i, seed: SEEDS[sIdx] }); }
    catch (err) { worst = 'seed ' + SEEDS[sIdx] + ': ' + err.message; continue; }
    var plan = S.solveScript(st, S.SOLVE[i].throws);
    if (!plan.path) {
      console.log('FAIL  cave ' + (i + 1) + ' ' + S.LEVELS[i].name + ': there is no way from the start to the exit');
      bad++; break;
    }
    var steps = 0, minStones = st.stones, maxSteps = 90 * 60;
    var lastTrace = -1;
    while (!st.over && steps < maxSteps) {
      S.solveStep(st, plan, C.STEP);
      if (st.stones < minStones) minStones = st.stones;
      steps++;
      if (TRACE && Math.floor(st.now / 500) !== lastTrace) {
        lastTrace = Math.floor(st.now / 500);
        var row = '    ' + (st.now / 1000).toFixed(1).padStart(5) + 's  bot ' +
          (st.p.x / C.TILE).toFixed(1) + ',' + (st.p.y / C.TILE).toFixed(1) +
          '  stones ' + st.stones;
        for (var q = 0; q < st.lurkers.length; q++) {
          var L = st.lurkers[q];
          row += '   L' + q + ' ' + (L.x / C.TILE).toFixed(1) + ',' + (L.y / C.TILE).toFixed(1) +
            ' ' + L.state.padEnd(6) + ' d=' + (S.distOf(L.x, L.y, st.p.x, st.p.y) / C.TILE).toFixed(1);
        }
        console.log(row);
      }
    }
    var secs = (steps * C.STEP).toFixed(1);
    if (st.over !== 'clear') {
      worst = 'seed ' + SEEDS[sIdx] + ': the bot ended ' +
        (st.over || 'still walking after ' + secs + 's') + ' at tile ' +
        Math.floor(st.p.x / C.TILE) + ',' + Math.floor(st.p.y / C.TILE) +
        ' (node ' + plan.i + ' of ' + plan.path.length + ')';
      continue;
    }
    if (minStones < 0) { worst = 'seed ' + SEEDS[sIdx] + ': the stone count went negative'; continue; }
    if (st.caughtCount > 0) { worst = 'seed ' + SEEDS[sIdx] + ': the bot was caught'; continue; }
    if (plan.throws.length > 0 && st.throwCount === 0) { worst = 'seed ' + SEEDS[sIdx] + ': the script threw nothing'; continue; }
    clean++;
    bestLine = secs.padStart(6) + 's  ' + plan.path.length.toString().padStart(3) + ' tiles  ' +
      st.throwCount + ' thrown  ' + st.stones + ' left  ' +
      st.pearlsGot + '/' + st.pearlsTotal + ' pearls  ' + S.starsFor(st) + ' stars';
    }
    if (clean < SEEDS.length) {
      console.log('FAIL  cave ' + (i + 1) + ' ' + S.LEVELS[i].name + ': ' + clean + ' of ' +
        SEEDS.length + ' seeds got through. ' + worst);
      bad++;
    } else {
      console.log('  cave ' + (i + 1) + '  ' + S.LEVELS[i].name.padEnd(20) + bestLine +
        '  ' + clean + '/' + SEEDS.length + ' seeds');
    }
  }
  if (bad) { console.log('\n' + bad + ' CAVE(S) FAILED'); process.exit(1); }
  console.log('\nFATHOM SOLVE OK');
}

/* ---------------------------------------------------------------- endless */
function runEndless(n) {
  var C = S.CONFIG, bad = 0, i, worstSeg = 0, minOpen = 1e9, maxFrac = 0, minRoute = 1e9;
  for (i = 0; i < n; i++) {
    var depth = 1 + (i % 10);
    var seed = 7000 + i * 131;
    var rows = S.caveGrid(seed, depth);
    var scan = S.gridScan(rows);
    var why = null;
    if (!scan.start || !scan.exit) why = 'no start or no exit';
    else if (!S.bfsPath(rows, scan.start.tx, scan.start.ty, scan.exit.tx, scan.exit.ty)) why = 'the exit is walled off';
    if (!why) {
      var segs = S.gridToSegments(rows);
      worstSeg = Math.max(worstSeg, segs.length);
      if (segs.length > C.MAX_SEGMENTS) why = segs.length + ' segments, the budget is ' + C.MAX_SEGMENTS;
    }
    if (!why) {
      var reachable = 0, k;
      for (k = 0; k < scan.caches.length; k++) {
        if (S.bfsPath(rows, scan.start.tx, scan.start.ty, scan.caches[k].tx, scan.caches[k].ty)) reachable++;
      }
      if (scan.caches.length && !reachable) why = 'no cache can be reached';
      if (!scan.caches.length) why = 'no caches at all';
    }
    if (!why) {
      for (var L = 0; L < scan.lurkers.length; L++) {
        var cheb = Math.max(Math.abs(scan.lurkers[L].tx - scan.start.tx), Math.abs(scan.lurkers[L].ty - scan.start.ty));
        if (cheb < C.ENDLESS_SPAWN_CLEAR) { why = 'a lurker spawns ' + cheb + ' tiles from the start'; break; }
      }
      if (scan.lurkers.length > C.MAX_LURKERS) why = scan.lurkers.length + ' lurkers, the budget is ' + C.MAX_LURKERS;
    }
    if (!why) {
      var open = rows.join('').split('').filter(function (c) { return c !== '#'; }).length;
      var frac = open / (C.GRID_W * C.GRID_H);
      minOpen = Math.min(minOpen, open);
      maxFrac = Math.max(maxFrac, frac);
      if (open < 200) why = 'only ' + open + ' open tiles, that is a crack not a cave';
      /* THE BOX GATE. With the plan's first numbers every deep cave came out 78
         percent open with the rock only at the border, and every other check
         here was green on it: connected, inside the segment budget, caches
         reachable. A cave you can see across is not a cave. */
      else if (frac > C.ENDLESS_MAX_OPEN) why = (frac * 100).toFixed(0) + ' percent open, that is a room not a cave';
      else {
        var route = S.bfsPath(rows, scan.start.tx, scan.start.ty, scan.exit.tx, scan.exit.ty);
        minRoute = Math.min(minRoute, route.length);
        if (route.length < C.ENDLESS_MIN_ROUTE) why = 'the exit is only ' + route.length + ' tiles from the start';
      }
    }
    if (why) { console.log('FAIL  deep seed ' + seed + ' depth ' + depth + ': ' + why); bad++; }
  }
  console.log('\n' + n + ' deep caves: worst segment count ' + worstSeg + ' of ' + C.MAX_SEGMENTS +
    ', smallest cave ' + minOpen + ' open tiles, most open ' + (maxFrac * 100).toFixed(0) +
    ' percent of the grid, shortest route ' + (minRoute === 1e9 ? 'none' : minRoute + ' tiles'));
  if (bad) { console.log(bad + ' DEEP CAVE(S) FAILED'); process.exit(1); }
  console.log('FATHOM DEEP OK');
}

/* ------------------------------------------------------------------ watch */
function runWatch(seed) {
  var depth = parseInt(argOf('depth') || '3', 10);
  var rows = S.caveGrid(seed, depth);
  console.log('deep cave, seed ' + seed + ', depth ' + depth);
  console.log(rows.join('\n'));
  var segs = S.gridToSegments(rows);
  var scan = S.gridScan(rows);
  var p = S.bfsPath(rows, scan.start.tx, scan.start.ty, scan.exit.tx, scan.exit.ty);
  console.log('\n' + segs.length + ' wall segments, ' + (p ? p.length + ' tiles from the start to the exit' : 'NO WAY THROUGH'));
  console.log(scan.caches.length + ' caches, ' + scan.pearls.length + ' pearls, ' + scan.lurkers.length + ' lurkers');
}

var a = process.argv.slice(2);
if (a.indexOf('--test') >= 0) runTests();
else if (a.indexOf('--solve') >= 0) runSolve();
else if (argOf('endless')) runEndless(parseInt(argOf('endless'), 10) || 50);
else if (argOf('watch')) runWatch(parseInt(argOf('watch'), 10) || 1);
else {
  console.log('usage: --test | --solve | --endless=N | --watch=SEED [--depth=N] [--over=KEY=VAL]');
  process.exit(2);
}
