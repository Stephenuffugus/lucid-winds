#!/usr/bin/env node
/* WARDIAN headless runner. Zero dependencies.
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

var EXPORTS = ['CONFIG', 'makeRNG', 'seedFromString', 'mixSeed', 'clamp',
  'FLORA', 'FLORA_ORDER', 'FAUNA', 'FAUNA_ORDER',
  'clockFromMs', 'seasonOf', 'phaseOf', 'lightOf', 'hourWord', 'moonPhase', 'isFullMoon',
  'newGrid', 'mist', 'envTick', 'mossCover', 'surfaceMoist', 'totalWater', 'newPlant', 'rootMoist', 'growPlant', 'spreadMoss', 'segCount',
  'addAgents', 'fauna', 'arrivals', 'rareCheck', 'newJar', 'tick', 'catchUp', 'census',
  'snapshot', 'findNaN', 'POLICIES', 'runDays', 'maxGenOf', 'TEST'];

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
  console.log('WARDIAN TEST OK');
}

/* the census, day by day, under a policy, for a person to read */
function runCensus(spec) {
  var parts = String(spec).split(',');
  var days = parseInt(parts[0], 10) || 14;
  var pol = parts[1] || 'twoDay';
  var run = S.runDays(days, pol, 4242);
  console.log('a jar under "' + pol + '" mist, ' + days + ' days, from the first of April');
  console.log('  day   segs  moss  bugs  dorm  surf  water  species');
  var i;
  for (i = 0; i < run.log.length; i++) {
    var c = run.log[i].c, sp = Object.keys(c.species).sort().join(' ');
    console.log('  ' + String(run.log[i].day).padStart(3) + '   ' + String(c.segments).padStart(4) +
      '  ' + String(c.moss).padStart(4) + '  ' + String(c.agents).padStart(4) +
      '  ' + String(c.dormant).padStart(4) + '  ' + c.surf.toFixed(2).padStart(5) +
      '  ' + c.water.toFixed(1).padStart(5) + '  ' + sp);
  }
  console.log('\nspores ' + run.state.spores.toFixed(1) + ', journal ' + run.state.journal.length +
    ' entries, humidity ' + run.state.humidity.toFixed(2));
  console.log('WARDIAN CENSUS OK');
}
function runCatchup(days) {
  var start = Date.UTC(2026, 3, 1, 6, 0, 0);
  var s = S.newJar(4242, 'north');
  s.lastSeen = start; s.startMs = start;
  var res = S.catchUp(s, start + days * 86400000);
  console.log('away ' + days + ' days: ' + res.ticks + ' ticks run (the cap is ' +
    (S.CONFIG.CATCHUP_CAP_DAYS * 1440 / S.CONFIG.TICK_MIN) + '), ' + s.nights + ' nights passed');
  console.log('  before ' + JSON.stringify(res.before.species) + '  segments ' + res.before.segments);
  console.log('  after  ' + JSON.stringify(res.after.species) + '  segments ' + res.after.segments);
  console.log('WARDIAN CATCHUP OK');
}

var a = process.argv.slice(2);
if (a.indexOf('--test') >= 0) runTests();
else if (argOf('days')) runCensus(argOf('days'));
else if (argOf('catchup')) runCatchup(parseInt(argOf('catchup'), 10) || 30);
else {
  console.log('usage: --test | --days=N[,policy] | --catchup=DAYS [--over=KEY=VAL]');
  process.exit(2);
}
