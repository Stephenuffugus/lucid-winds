#!/usr/bin/env node
/* GERPLUNK headless runner. Zero dependencies.
   Reads the SIM and TEST layers straight out of index.html through the marker
   comments, so there is exactly ONE implementation of the rules and the sweep
   measures the same physics the thumb throws.

     node sim.js --test                      the assertion harness, nonzero on a failure
     node sim.js --throw=12,20,1,skimmer     every skip's time, distance and interval
     node sim.js --sweep                     re derive the tuned constants from scratch
     node sim.js --stones                    the whole stone table off one perfect flick
     node sim.js --test --over=LOSS0=0.12    any run against an overridden CONFIG without
                                             editing the game, so a tuning pass is one
                                             command and the shipped numbers stay shipped

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

var EXPORTS = ['CONFIG', 'makeRNG', 'seedFromString', 'mixSeed', 'dailySeedFor',
  'STONES', 'stoneById', 'liftOf', 'stabOf', 'waterFactor', 'windowFor',
  'newThrow', 'runThrow', 'TEST'];

/* A SIM built against an overridden CONFIG. The override is a SOURCE level
   substitution of the numeric literal, not a mutation, because CONFIG is frozen
   on purpose and a tuning pass must never be able to leak into a shipped run.
   Throws on a key it did not find, so a typo in a sweep can never silently
   measure the shipped numbers and call them tuned. */
function build(over, withTest) {
  var src = SIM_SRC, k;
  if (over) for (k in over) {
    var re = new RegExp('(\\b' + k + '\\s*:\\s*)(-?[0-9]*\\.?[0-9]+)', 'g');
    if (!re.test(src)) throw new Error('override key not found in CONFIG: ' + k);
    re.lastIndex = 0;
    src = src.replace(re, '$1' + over[k]);
  }
  var body = src + (withTest === false ? '' : '\n' + TEST_SRC);
  var f = new Function(body + '\nreturn {' +
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
var has = function (name) { return process.argv.indexOf('--' + name) >= 0; };
var S = build(parseOver(argOf('over')));
var ASSERTION_FLOOR = 60;

/* ------------------------------------------------------------------ tests */
function runTests() {
  var rep = S.TEST.run();
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
  console.log('GERPLUNK TEST OK');
}

/* ----------------------------------------------------------------- throw */
function runOne(spec) {
  var p = String(spec).split(',');
  var v = parseFloat(p[0]), th = parseFloat(p[1]), sp = parseFloat(p[2]);
  var stone = (p[3] || 'skimmer').trim();
  var water = (p[4] || 'glass').trim();
  var seed = p[5] === undefined ? 99 : parseInt(p[5], 10);
  var r = S.runThrow(S.newThrow({ v: v, theta: th, spin: sp, stone: stone, seed: seed }), { water: water });
  var win = S.windowFor(S.stoneById(stone), water);
  console.log(stone + ' on ' + water + ', thrown at ' + v + ' m/s, ' + th + ' degrees, spin ' + sp);
  console.log('  its angle window is ' + win.lo.toFixed(2) + ' to ' + win.hi.toFixed(2) + ' degrees');
  console.log('');
  console.log('  skip      t        x        interval      vx     theta');
  r.events.forEach(function (e, i) {
    console.log('  ' + String(i + 1).padStart(4) + '  ' + e.t.toFixed(3).padStart(7) + 's '
      + e.x.toFixed(2).padStart(8) + 'm ' + e.interval.toFixed(3).padStart(11) + 's '
      + e.vx.toFixed(2).padStart(8) + ' ' + e.theta.toFixed(2).padStart(9));
  });
  console.log('');
  console.log('  ' + r.skips + ' skips, ' + r.distance.toFixed(2) + ' m, ' + r.time.toFixed(2)
    + ' s, and it ended: ' + r.ended);
  console.log('GERPLUNK THROW OK');
}

/* ---------------------------------------------------------------- stones */
function runStones() {
  console.log('every stone off one perfect flick, 12 m/s at the magic angle with full spin, on glass');
  console.log('');
  console.log('  stone            rarity      skips     dist      time   first leap   ended');
  S.STONES.forEach(function (st) {
    var r = S.runThrow(S.newThrow({ v: 12, theta: S.CONFIG.MAGIC_DEG, spin: 1, stone: st.id, seed: 99 }), {});
    var leap = r.events.length > 1 ? r.events[1].x - r.events[0].x : 0;
    console.log('  ' + st.name.padEnd(17) + st.rarity.padEnd(11) + String(r.skips).padStart(4)
      + (r.distance.toFixed(1) + 'm').padStart(9) + (r.time.toFixed(2) + 's').padStart(10)
      + (leap.toFixed(2) + 'm').padStart(12) + '   ' + r.ended);
  });
  console.log('GERPLUNK STONES OK');
}

/* ----------------------------------------------------------------- sweep */
/* ⛔ THE CONSTANTS ARE A MEASUREMENT AND THIS IS THE MEASUREMENT. The plan
   proposed LOSS0 0.12 and SPIN_DECAY 0.06; at those a perfect throw reached ten
   skips against a gate that asks for fifteen, so the tuned values had to be
   found rather than argued. This rebuilds the SIM against every point of the
   grid and reports which points satisfy EVERY P0 assertion at once. It is kept
   in the shipped tool, not in a scratch file, so the next person can disagree
   with the numbers by rerunning them instead of by trusting a comment. */
var GRID = {
  SPIN_DECAY: [0.010, 0.015, 0.020, 0.025],
  LOSS0: [0.070, 0.075, 0.080, 0.085],
  MASS_LIFT_P: [0.95, 1.05, 1.15],
  IRREG: [20, 24, 28, 32]
};
function judge(M) {
  var why = [];
  var T = function (o, env) {
    var t = { v: 12, theta: M.CONFIG.MAGIC_DEG, spin: 1, seed: 99, stone: 'skimmer' }, k;
    for (k in o) t[k] = o[k];
    return M.runThrow(M.newThrow(t), env || {});
  };
  var sk = T({}), sk0 = T({ spin: 0 }), hf = T({ stone: 'heavyflat' });
  var leap = function (r) { return r.events.length > 1 ? r.events[1].x - r.events[0].x : 0; };
  if (sk.skips < 15) why.push('A1 perfect ' + sk.skips + ' < 15');
  if (sk0.skips > 3) why.push('A2 no spin ' + sk0.skips + ' > 3');
  if (hf.skips >= sk.skips) why.push('A3a heavy ' + hf.skips + ' >= skimmer ' + sk.skips);
  if (leap(hf) <= leap(sk)) why.push('A3b heavy leap ' + leap(hf).toFixed(2) + ' <= ' + leap(sk).toFixed(2));
  var i, gmax = 0;
  for (i = 0; i < 200; i++) {
    var r = M.runThrow(M.newThrow({
      v: 4 + 10 * (i % 20) / 19,
      theta: M.CONFIG.WINDOW_LO_DEG + (M.CONFIG.WINDOW_HI_DEG - M.CONFIG.WINDOW_LO_DEG) * ((i * 7) % 20) / 19,
      spin: ((i * 13) % 21) / 20, stone: 'granite', seed: 1000 + i
    }));
    if (r.skips > gmax) gmax = r.skips;
  }
  if (gmax > 4) why.push('A4 granite ' + gmax + ' > 4');
  for (i = 0; i < 200; i++) {
    var st = M.STONES[i % M.STONES.length].id;
    var r2 = M.runThrow(M.newThrow({
      v: 3 + 11 * (i % 25) / 24,
      theta: 5 + 32 * ((i * 11) % 25) / 24,
      spin: ((i * 17) % 21) / 20, stone: st, seed: 3000 + i
    }));
    if (r2.ended === 'timeout') { why.push('A5 a ' + st + ' never came down'); break; }
  }
  var e = sk.events, mono = true;
  for (i = e.length - 4; i < e.length; i++) if (!(e[i].interval < e[i - 1].interval)) mono = false;
  if (!mono) why.push('A6 the last five do not shorten');
  if (T({}, { water: 'chop' }).skips >= sk.skips) why.push('A7 chop costs nothing');
  return { ok: why.length === 0, why: why, n: { sk: sk.skips, sk0: sk0.skips, hf: hf.skips,
    g: gmax, dist: sk.distance, leapSk: leap(sk), leapHf: leap(hf) } };
}
function runSweep() {
  var keys = Object.keys(GRID), pass = [], tried = 0, sig = {};
  var walk = function (i, over) {
    if (i === keys.length) {
      tried++;
      var M, v;
      try { M = build(over, false); } catch (e) { return; }
      try { v = judge(M); } catch (e) { return; }
      if (v.ok) pass.push({ over: JSON.parse(JSON.stringify(over)), n: v.n });
      else { var k = v.why.map(function (w) { return w.split(' ')[0]; }).join(','); sig[k] = (sig[k] || 0) + 1; }
      return;
    }
    GRID[keys[i]].forEach(function (val) {
      over[keys[i]] = val;
      walk(i + 1, over);
    });
  };
  walk(0, {});
  console.log('swept ' + tried + ' points of ' + keys.join(', '));
  console.log(pass.length + ' of them satisfy every P0 assertion at once');
  console.log('');
  if (!pass.length) {
    console.log('the assertions that blocked the grid, most common first:');
    Object.keys(sig).sort(function (a, b) { return sig[b] - sig[a]; }).slice(0, 6).forEach(function (k) {
      console.log('  ' + String(sig[k]).padStart(4) + 'x  ' + k);
    });
    console.log('GERPLUNK SWEEP FOUND NOTHING');
    process.exit(1);
  }
  pass.slice(0, 12).forEach(function (p) {
    console.log('  ' + keys.map(function (k) { return k + ' ' + p.over[k]; }).join('  '));
    console.log('      perfect ' + p.n.sk + ' skips over ' + p.n.dist.toFixed(1) + ' m, no spin '
      + p.n.sk0 + ', heavy ' + p.n.hf + ' with a ' + p.n.leapHf.toFixed(2)
      + ' m leap against ' + p.n.leapSk.toFixed(2) + ', chunk tops out at ' + p.n.g);
  });
  /* the shipped point has to be one of them, or the comment in CONFIG is a lie */
  var shipped = {}, k;
  for (k in GRID) shipped[k] = S.CONFIG[k];
  var found = pass.some(function (p) {
    return Object.keys(GRID).every(function (kk) { return Math.abs(p.over[kk] - shipped[kk]) < 1e-9; });
  });
  console.log('');
  console.log('the shipped constants (' + Object.keys(GRID).map(function (kk) { return kk + ' ' + shipped[kk]; }).join(', ') + ')');
  if (!found) {
    console.log('ARE NOT IN THE PASSING SET. Either the grid moved or the game did.');
    process.exit(2);
  }
  console.log('are in the passing set.');
  console.log('GERPLUNK SWEEP OK');
}

if (has('test')) runTests();
else if (argOf('throw')) runOne(argOf('throw'));
else if (has('sweep')) runSweep();
else if (has('stones')) runStones();
else {
  console.log('usage: --test | --throw=<v>,<deg>,<spin>[,<stone>[,<water>[,<seed>]]] | --sweep | --stones');
  console.log('       any of them with --over=KEY=VALUE,KEY=VALUE');
  process.exit(1);
}
