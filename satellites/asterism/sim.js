#!/usr/bin/env node
/* ASTERISM headless runner. Zero dependencies.
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
var SIM_SRC = extract(HTML, '// ---- ASTRO_EXPORT_START ----', '// ---- ASTRO_EXPORT_END ----');
var TEST_SRC = extract(HTML, '// ---- TEST_EXPORT_START ----', '// ---- TEST_EXPORT_END ----');

var EXPORTS = ['CONFIG', 'makeRNG', 'seedFromString', 'mixSeed', 'dailySeedFor',
  'jd', 'gmstHours', 'lstHours', 'altAz', 'altAzToRaDec', 'sunRaDec', 'sunAlt', 'sunLambda',
  'moon', 'moonLonLat', 'galToEq', 'project', 'unproject', 'angSep', 'galacticBand', 'wellPlacedMonth',
  'buildCatalogue', 'pickable', 'starName', 'starsOf', 'CON_NAMES', 'CON_PLAIN', 'CITIES', 'PROMPTS',
  'features', 'archetype', 'mythFor', 'rollName', 'wordCount', 'shapeGeometry',
  'ORIGIN_OPEN', 'ARCH_NOUN', 'DEED', 'SHAPE', 'FALL', 'PLACED', 'OMEN', 'STAR_HOOK',
  'REGION_HOOK', 'PLACE_HOOK', 'NAME_ADJ', 'NAME_NOUN', 'NAME_TAIL', 'MONTHS', 'TEST'];

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
var CAT = S.buildCatalogue(JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'hyg-asterism.json'), 'utf8')));

/* ------------------------------------------------------------------ tests */
function runTests() {
  var rep = S.TEST.run({ cat: CAT, src: SIM_SRC });
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
  console.log('ASTERISM TEST OK');
}

/* ------------------------------------------------------------------ myths */
/* The corpus gate. Read the output as well as the counts: a myth that passes
   every rule and still reads like a machine is a myth that failed. */
function runMyth(n) {
  var tri = [
    { ra: 18.6156, dec: 38.784, mag: 0.03, proper: 'Vega', con: 'Lyr' },
    { ra: 20.6905, dec: 45.28, mag: 1.25, proper: 'Deneb', con: 'Cyg' },
    { ra: 19.8464, dec: 8.868, mag: 0.76, proper: 'Altair', con: 'Aql' }
  ];
  var shapes = [
    { s: tri, e: [[0, 1], [1, 2], [2, 0]], what: 'a closed triangle' },
    { s: tri.slice(0, 2).concat([{ ra: 19.5, dec: 27.9, mag: 3.9, proper: '', con: 'Vul' },
        { ra: 19.1, dec: 13.9, mag: 4.4, proper: '', con: 'Aql' },
        { ra: 20.2, dec: 30.2, mag: 3.8, proper: '', con: 'Cyg' },
        { ra: 20.8, dec: 33.9, mag: 2.5, proper: 'Sadr', con: 'Cyg' }]),
      e: [[0, 2], [2, 3], [3, 4], [4, 5], [5, 1]], what: 'a chain of six' },
    { s: tri.concat([{ ra: 19.5, dec: 27.9, mag: 3.9, proper: '', con: 'Vul' },
        { ra: 18.9, dec: 43.9, mag: 3.2, proper: '', con: 'Lyr' }]),
      e: [[0, 1], [0, 2], [0, 3], [0, 4]], what: 'a four way fork' },
    { s: [{ ra: 3.79, dec: 24.1, mag: 2.9, proper: 'Alcyone', con: 'Tau' },
        { ra: 3.77, dec: 24.05, mag: 3.6, proper: 'Atlas', con: 'Tau' },
        { ra: 3.74, dec: 24.4, mag: 3.7, proper: 'Electra', con: 'Tau' }],
      e: [[0, 1], [1, 2]], what: 'a compact cluster' }
  ];
  var i, k, bad = 0, seen = {}, slotHits = {}, minW = 999, maxW = 0;
  var lists = { ORIGIN_OPEN: S.ORIGIN_OPEN, FALL: S.FALL, PLACED: S.PLACED, OMEN: S.OMEN,
    STAR_HOOK: S.STAR_HOOK, REGION_HOOK: S.REGION_HOOK };
  for (k in S.ARCH_NOUN) lists['ARCH_NOUN.' + k] = S.ARCH_NOUN[k];
  for (k in S.DEED) lists['DEED.' + k] = S.DEED[k];
  for (k in S.SHAPE) lists['SHAPE.' + k] = S.SHAPE[k];
  for (k in lists) { slotHits[k] = {}; }
  var show = Math.min(6, n);
  for (i = 0; i < n; i++) {
    var sh = shapes[i % shapes.length];
    var f = S.features(sh.s, sh.e);
    var m = S.mythFor(f, S.mixSeed(90210, i));
    var w = S.wordCount(m);
    minW = Math.min(minW, w); maxW = Math.max(maxW, w);
    if (w < S.CONFIG.MYTH_MIN_WORDS || w > S.CONFIG.MYTH_MAX_WORDS) {
      console.log('FAIL  ' + w + ' words on seed ' + i + ': ' + m); bad++;
    }
    if (/[-\u2010-\u2015\u2212]/.test(m)) { console.log('FAIL  a dash on seed ' + i); bad++; }
    if (m.indexOf('!') >= 0) { console.log('FAIL  an exclamation point on seed ' + i); bad++; }
    if (/\b(always|never|forever)\b/i.test(m)) { console.log('FAIL  an absolute on seed ' + i + ': ' + m); bad++; }
    if (f.brightName && m.indexOf(f.brightName) < 0) { console.log('FAIL  seed ' + i + ' forgot ' + f.brightName); bad++; }
    if (m.indexOf('{') >= 0) { console.log('FAIL  an unfilled slot on seed ' + i + ': ' + m); bad++; }
    seen[m] = 1;
    for (k in lists) {
      for (var q = 0; q < lists[k].length; q++) {
        /* the LONGEST literal run in the fragment, not the part before the
           first slot: a fragment that STARTS with {N} has an empty prefix, and
           four whole SHAPE lists read as unreachable because of it. */
        var runs = lists[k][q].split(/\{[A-Z]+\}/), frag = '', z2;
        for (z2 = 0; z2 < runs.length; z2++) if (runs[z2].length > frag.length) frag = runs[z2];
        if (frag.length > 8 && m.indexOf(frag) >= 0) slotHits[k][q] = (slotHits[k][q] || 0) + 1;
      }
    }
    if (i < show) console.log('\n--- seed ' + i + ', ' + sh.what + ' ---\n' + m);
  }
  var distinct = Object.keys(seen).length;
  console.log('\n' + n + ' myths: ' + distinct + ' distinct, ' + minW + ' to ' + maxW + ' words');
  /* every fragment reachable, and none of them swallowing its slot.
     ⛔ NOT AT A SMALL N. Three hundred seeds over four shapes leaves about
     thirty seeds per archetype, and a twelve fragment list will legitimately
     miss one; the gate would then be red on correct code. It says when it is
     skipping rather than skipping quietly. */
  if (n < 2000) {
    console.log('\nSKIPPED the reachability and share checks: they need 2000 seeds or more, this run had ' + n + '.');
  }
  for (k in (n < 2000 ? {} : lists)) {
    var used = Object.keys(slotHits[k]).length, worst = 0, worstI = -1;
    for (var z in slotHits[k]) if (slotHits[k][z] > worst) { worst = slotHits[k][z]; worstI = z; }
    var share = worst / n;
    if (used < lists[k].length) {
      console.log('FAIL  ' + k + ': only ' + used + ' of ' + lists[k].length + ' fragments were ever reached'); bad++;
    }
    if (share > 0.6) {
      console.log('FAIL  ' + k + ' fragment ' + worstI + ' swallowed the slot, ' + (share * 100).toFixed(0) + ' percent'); bad++;
    }
  }
  if (n >= 5000 && distinct < n * 0.8) { console.log('FAIL  only ' + distinct + ' distinct myths out of ' + n); bad++; }
  if (bad) { console.log('\n' + bad + ' MYTH FAILURE(S)'); process.exit(1); }
  console.log('ASTERISM MYTH OK');
}

/* -------------------------------------------------------------------- sky */
/* Twenty stars with their altitude and azimuth, so a person can hold a phone
   with a planetarium app beside this listing and check the whole layer at once. */
function runSky(spec) {
  var parts = String(spec).split(',');
  var lat = parseFloat(parts[0]), lon = parseFloat(parts[1]);
  var iso = parts.slice(2).join(',');
  var J = S.jd(Date.parse(iso));
  console.log('the sky from ' + lat.toFixed(2) + ', ' + lon.toFixed(2) + ' at ' + iso);
  console.log('JD ' + J.toFixed(5) + '   LST ' + S.lstHours(J, lon).toFixed(4) + ' h   sun altitude ' + S.sunAlt(J, lat, lon).toFixed(1));
  var m = S.moon(J);
  var ma = S.altAz(m.ra, m.dec, lat, lon, J);
  console.log('moon: phase ' + m.phase.toFixed(3) + ' (' + (m.lit * 100).toFixed(0) + ' percent lit)  alt ' +
    ma.alt.toFixed(1) + '  az ' + ma.az.toFixed(1));
  var up = [], i;
  for (i = 0; i < CAT.n; i++) {
    var p = S.altAz(CAT.ra[i], CAT.dec[i], lat, lon, J);
    if (p.alt > 0) up.push({ i: i, alt: p.alt, az: p.az, mag: CAT.mag[i] });
  }
  up.sort(function (a2, b2) { return a2.mag - b2.mag; });
  console.log('\n' + up.length + ' stars above the horizon. The twenty brightest:');
  console.log('  name                 mag     alt      az');
  for (i = 0; i < Math.min(20, up.length); i++) {
    var u = up[i];
    console.log('  ' + (S.starName(CAT, u.i) + '                    ').slice(0, 20) +
      ' ' + u.mag.toFixed(2).padStart(5) + ' ' + u.alt.toFixed(1).padStart(7) + ' ' + u.az.toFixed(1).padStart(7));
  }
  console.log('\nASTERISM SKY OK');
}

var a = process.argv.slice(2);
if (a.indexOf('--test') >= 0) runTests();
else if (argOf('myth')) runMyth(parseInt(argOf('myth'), 10) || 200);
else if (argOf('sky')) runSky(argOf('sky'));
else {
  console.log('usage: --test | --myth=N | --sky=LAT,LON,ISO [--over=KEY=VAL]');
  process.exit(2);
}
