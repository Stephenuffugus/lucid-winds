#!/usr/bin/env node
/* STRATA headless runner. Zero dependencies.
   Reads the SIM and TEST layers straight out of index.html through the marker
   comments, so there is exactly ONE implementation of the rules and the bot
   runs the same railway the thumb does.

     node sim.js --test            the assertion harness, nonzero on a failure
     node sim.js --species=SEED    one animal, printed: its plan, its bones, its
                                   name, its era and its one line of history
     node sim.js --census=N        N animals as a table of what the grammar is
                                   actually producing, which is the number the
                                   variety sheet is judged beside
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
var HTML_PATH = process.env.STRATA_HTML || path.join(__dirname, 'index.html');
var HTML = fs.readFileSync(HTML_PATH, 'utf8');
var SIM_SRC = extract(HTML, '// ---- SIM_EXPORT_START ----', '// ---- SIM_EXPORT_END ----');
var TEST_SRC = extract(HTML, '// ---- TEST_EXPORT_START ----', '// ---- TEST_EXPORT_END ----');

var EXPORTS = ['CONFIG', 'makeRNG', 'seedFromString', 'mixSeed', 'clamp',
  'DEG', 'DPI', 'DHALF_PI', 'dsin', 'dcos', 'datan2', 'len2', 'angDiff',
  'PLANS', 'SIZES', 'SKULLS', 'ORNAMENTS', 'pickW', 'ri', 'rf',
  'species', 'spineOf', 'vertR', 'boxPoly', 'taperPoly', 'bones', 'boneBounds', 'armatureOk',
  'GEN_A', 'GEN_B', 'GEN_C', 'SPECIES_W', 'ERA_WORD', 'EPOCH', 'BAND_PREFIX',
  'HAB', 'HAB2', 'PART', 'DIETS', 'dietOf', 'cleanName', 'epithetFor', 'identity',
  'bandLines', 'bandAt', 'rotatePt', 'placeSpecimen', 'bonesInside', 'makeSite',
  'TEST'];

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
  console.log('STRATA TEST OK');
}

function runSpecies(seed) {
  var era = seed % S.CONFIG.BANDS;
  var sp = S.species(seed, era);
  var bs = S.bones(sp);
  var id = S.identity(sp, seed, '');
  console.log('  seed        ' + seed);
  console.log('  name        ' + id.binomial);
  console.log('  era         ' + id.eraName + ', ' + id.epoch + ' (band ' + sp.era + ')');
  console.log('  plan        ' + sp.plan + ', ' + sp.sizeKey + ', ' + id.diet);
  console.log('  skull       ' + sp.skull + ' at ' + sp.skullScale.toFixed(2));
  console.log('  spine       ' + sp.nNeck + ' neck, ' + sp.nTrunk + ' trunk, ' + sp.nTail
    + ' tail, ' + sp.tail);
  console.log('  ornament    ' + sp.ornament + (sp.ornCount ? ' x' + sp.ornCount : ''));
  console.log('  bones       ' + bs.length);
  console.log('  history     ' + id.history);
  console.log('');
  console.log('STRATA SPECIES OK');
}
/* what the grammar is actually making, as a table, because a generator that
   makes one animal ninety percent of the time passes every other gate */
function runCensus(n) {
  var plans = {}, sizes = {}, skulls = {}, orns = {}, i, bonesLo = 1e9, bonesHi = 0, bonesSum = 0;
  for (i = 0; i < n; i++) {
    var seed = S.mixSeed(20260906, i);
    var sp = S.species(seed, i % S.CONFIG.BANDS);
    var bs = S.bones(sp);
    plans[sp.plan] = (plans[sp.plan] || 0) + 1;
    sizes[sp.sizeKey] = (sizes[sp.sizeKey] || 0) + 1;
    skulls[sp.skull] = (skulls[sp.skull] || 0) + 1;
    orns[sp.ornament] = (orns[sp.ornament] || 0) + 1;
    bonesLo = Math.min(bonesLo, bs.length);
    bonesHi = Math.max(bonesHi, bs.length);
    bonesSum += bs.length;
  }
  function row(name, o) {
    var keys = Object.keys(o).sort(), i2, line = '  ' + name.padEnd(11);
    for (i2 = 0; i2 < keys.length; i2++) {
      line += (keys[i2] + ' ' + (o[keys[i2]] / n * 100).toFixed(1) + '%').padEnd(20);
    }
    console.log(line);
  }
  console.log('  ' + n + ' animals');
  row('plan', plans);
  row('size', sizes);
  row('skull', skulls);
  row('ornament', orns);
  console.log('  bones       ' + bonesLo + ' to ' + bonesHi + ', mean ' + (bonesSum / n).toFixed(1));
  var worst = 0, k;
  for (k in plans) worst = Math.max(worst, plans[k] / n);
  for (k in sizes) worst = Math.max(worst, sizes[k] / n);
  for (k in skulls) worst = Math.max(worst, skulls[k] / n);
  if (worst > 0.6) { console.log('\nONE CHOICE TAKES ' + (worst * 100).toFixed(0) + ' PERCENT OF THE GRAMMAR'); process.exit(1); }
  console.log('');
  console.log('STRATA CENSUS OK');
}
var a = process.argv.slice(2);
if (a.indexOf('--test') >= 0) runTests();
else if (argOf('species')) runSpecies(parseInt(argOf('species'), 10) || 1);
else if (argOf('census')) runCensus(parseInt(argOf('census'), 10) || 2000);
else {
  console.log('usage: --test | --species=SEED | --census=N [--over=KEY=VAL]');
  process.exit(2);
}
