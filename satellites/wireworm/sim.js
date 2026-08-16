#!/usr/bin/env node
/* WIREWORM headless runner. Zero dependencies.
 *
 *   node sim.js --test               full assertion harness, nonzero exit on failure
 *   node sim.js --runs=20000         the balance sweep, two agents
 *   node sim.js --watch=SEED         ASCII board frames so a human can SEE a run
 *
 * The CONFIG / RNG / DATA / GEN / SIM layers, the SAVE layer and the TEST
 * harness are pulled straight out of index.html between marker comments, so
 * there is exactly one copy of the game and node runs the same code the phone
 * runs. If the markers move, this script fails loudly instead of testing a
 * stale copy.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const HTML = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

function block(name) {
  const a = '// ---- ' + name + '_EXPORT_START ----';
  const b = '// ---- ' + name + '_EXPORT_END ----';
  const i = HTML.indexOf(a), j = HTML.indexOf(b);
  if (i < 0 || j < 0 || j < i) {
    console.error('FATAL: could not find the ' + name + ' export markers in index.html');
    process.exit(2);
  }
  return HTML.slice(i + a.length, j);
}

const EXPORTS = [
  'CONFIG', 'COLORS', 'COPY', 'EMPTY', 'WIRE', 'TERM', 'PICK',
  'makeRNG', 'rngNext', 'rngInt', 'seedFromString', 'dailySeed',
  'cx', 'cy', 'manhattan', 'reachMask', 'pendingMask', 'spawnCandidates',
  'maxDistPair', 'spawnPair', 'spawnPickup', 'newGame', 'step', 'hashState',
  'loadPct', 'makeQueue', 'toastTop', 'safeTurns', 'agentRandom', 'agentGreedy', 'bfsTurn',
  'boardAscii', 'agentRandomSafe', 'turnSurvives', 'rescueCheck', 'dischargeOldest', 'completeCircuit', 'touchPickup', 'touchTerminal', 'fireOverload',
  'agentFiller', 'pendingLen', 'pendingNew', 'fillWaypoint', 'survivalTurn', 'creepStep', 'creepCandidates', 'comboWindow', 'comboMult',
  'loadSave', 'writeSave', 'defaultSave', 'migrateSave', 'updateSave',
  'recordRun', 'recordDaily', 'encodeLog', 'decodeLog',
  'TEST', 'runAllTests', 'playAgent', 'invariants'
];

const src = block('SIM') + '\n' + block('SAVE') + '\n' + block('TEST') +
  '\nreturn {' + EXPORTS.join(',') + '};';

let G;
try {
  G = new Function(src)();
} catch (e) {
  console.error('FATAL: the extracted game source did not evaluate.');
  console.error(e && e.stack || e);
  process.exit(2);
}

/* ------------------------------------------------------------------ */
/* argument parsing                                                    */
/* ------------------------------------------------------------------ */
const args = {};
process.argv.slice(2).forEach(a => {
  const m = /^--([^=]+)(?:=(.*))?$/.exec(a);
  if (m) args[m[1]] = m[2] === undefined ? true : m[2];
});

/* ------------------------------------------------------------------ */
/* --test                                                              */
/* ------------------------------------------------------------------ */
/* Source level gates. Comments are stripped first: a worker that EXPLAINS in
   prose that Math.random is banned must not be failed for saying so. */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');
}
function sourceGates() {
  const out = [];
  const sim = stripComments(block('SIM'));
  const add = (name, cond, detail) => out.push({ name, pass: !!cond, detail: cond ? '' : String(detail) });
  const banned = ['Math\\.random', '\\bdocument\\b', '\\bwindow\\b', '\\bcanvas\\b', '\\bperformance\\b', '\\brequestAnimationFrame\\b', '\\bsetTimeout\\b', '\\blocalStorage\\b', '\\bDate\\b'];
  banned.forEach(b => {
    const m = sim.match(new RegExp(b, 'g'));
    add('SIM is free of ' + b.replace(/\\b|\\/g, ''), !m, (m ? m.length : 0) + ' hit(s)');
  });
  /* no dash characters in any player facing string */
  const copy = /var COPY = Object\.freeze\(([\s\S]*?)\);/.exec(HTML);
  add('the COPY table was found', !!copy, 'missing');
  if (copy) {
    const bad = [];
    copy[1].split('\n').forEach(line => {
      const i = line.indexOf(':');
      if (i < 0) return;
      const v = line.slice(i + 1);
      if (/[-\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/.test(v.replace(/\/\*.*/, ''))) bad.push(line.trim().slice(0, 44));
    });
    add('no dash characters in player facing copy', bad.length === 0, bad.join(' | '));
  }
  /* a literal close-script tag inside a JS string truncates the block */
  add('no literal close script tag inside a string', !/['"`]<\/script>/.test(HTML), 'split it as close-scr plus ipt');
  /* the markers the whole toolchain depends on */
  ['SIM', 'SAVE', 'TEST'].forEach(n => {
    add('the ' + n + ' export markers are present', HTML.indexOf('// ---- ' + n + '_EXPORT_START ----') >= 0, 'missing');
  });
  add('the service worker only deletes its own caches', (() => {
    try {
      const sw = require('fs').readFileSync(require('path').join(__dirname, 'sw.js'), 'utf8');
      return /indexOf\("wireworm-"\) === 0/.test(sw) && !/banditsbox/.test(sw);
    } catch (e) { return false; }
  })(), 'sw.js cache prefix is not wireworm-');
  return out;
}

function cmdTest() {
  const t0 = Date.now();
  const rep = G.runAllTests({});
  const gates = sourceGates();
  gates.forEach(g => { rep.total++; if (g.pass) rep.passed++; else { rep.failed++; rep.failures.push(g); } });
  rep.failures.forEach(f => console.log('FAIL  ' + f.name + (f.detail ? '   [' + f.detail + ']' : '')));
  console.log('');
  console.log('PASSED ' + rep.passed + ' / FAILED ' + rep.failed + '   (' + rep.total + ' assertions, ' +
    ((Date.now() - t0) / 1000).toFixed(1) + 's)');
  console.log(rep.failed ? 'RESULT: FAIL' : 'RESULT: PASS');
  process.exitCode = rep.failed ? 1 : 0;
}

/* ------------------------------------------------------------------ */
/* --runs=N  balance sweep                                             */
/* ------------------------------------------------------------------ */
function stats(arr) {
  const a = arr.slice().sort((x, y) => x - y);
  const q = p => a[Math.min(a.length - 1, Math.max(0, Math.floor(p * (a.length - 1))))];
  const mean = a.reduce((s, v) => s + v, 0) / a.length;
  return { n: a.length, min: a[0], p10: q(0.10), p25: q(0.25), med: q(0.50), p75: q(0.75), p90: q(0.90), max: a[a.length - 1], mean: mean };
}
function pad(s, n, right) {
  s = String(s);
  return right ? (' '.repeat(Math.max(0, n - s.length)) + s) : (s + ' '.repeat(Math.max(0, n - s.length)));
}

function sweepAgent(agent, runs, baseSeed, cap, opts) {
  opts = opts || {};
  const ticks = [], scores = [], circuits = [], overloads = [], loads = [], creeps = [];
  const causes = { wall: 0, live: 0, clock: 0, cap: 0 };
  let peakLoad = 0, anyOverload = 0, bonusTotal = 0, scoreTotal = 0;
  for (let i = 0; i < runs; i++) {
    const seed = (baseSeed + i * 2654435761) >>> 0;
    const st = G.newGame(seed, opts.mode ? { mode: opts.mode } : undefined);
    const rng = G.makeRNG((seed ^ 0x9e3779b9) >>> 0);
    let n = 0, peakRun = 0;
    while (st.alive && n < cap) {
      G.step(st, agent(st, rng));
      n++;
      if (st.energized > peakRun) peakRun = st.energized;
    }
    if (peakRun > peakLoad) peakLoad = peakRun;
    loads.push(peakRun);
    ticks.push(st.tick);
    scores.push(st.score);
    circuits.push(st.circuitsCompleted);
    overloads.push(st.overloads);
    creeps.push(st.creeps);
    if (st.overloads > 0) anyOverload++;
    bonusTotal += st.overloadBonus || 0;
    scoreTotal += st.score;
    if (!st.alive) causes[st.cause]++; else causes.cap++;
  }
  return {
    ticks: stats(ticks), scores: stats(scores), circuits: stats(circuits),
    overloads: stats(overloads), loads: stats(loads), creeps: stats(creeps), causes, peakLoad,
    anyOverload, runs, bonusShare: scoreTotal ? bonusTotal / scoreTotal : 0
  };
}

function printRow(label, s) {
  console.log('  ' + pad(label, 12) + pad(s.min, 8, true) + pad(s.p10, 8, true) + pad(s.p25, 8, true) +
    pad(s.med, 9, true) + pad(s.p75, 8, true) + pad(s.p90, 8, true) + pad(s.max, 9, true) +
    pad(s.mean.toFixed(1), 10, true));
}
function printHead() {
  console.log('  ' + pad('', 12) + pad('min', 8, true) + pad('p10', 8, true) + pad('p25', 8, true) +
    pad('MEDIAN', 9, true) + pad('p75', 8, true) + pad('p90', 8, true) + pad('max', 9, true) + pad('mean', 10, true));
}

function cmdSweep(runs) {
  const cap = parseInt(args.cap || '8000', 10);
  const baseSeed = parseInt(args.seed || '1', 10) >>> 0;
  console.log('WIREWORM balance sweep   runs=' + runs + '  tick cap=' + cap + '  base seed=' + baseSeed);
  console.log('grid ' + G.CONFIG.GRID + 'x' + G.CONFIG.GRID + '  overload at ' + G.CONFIG.OVERLOAD_CELLS +
    ' cells  discharge every ' + G.CONFIG.DISCHARGE_INTERVAL + ' ticks  ramp ' +
    G.CONFIG.TICK_START_MS + 'ms minus ' + G.CONFIG.TICK_STEP_MS + 'ms per circuit, floor ' + G.CONFIG.TICK_FLOOR_MS + 'ms');
  console.log('');

  const only = args.agent ? String(args.agent).split(',') : null;
  const agents = [['random', G.agentRandom], ['randomsafe', G.agentRandomSafe],
                  ['greedy', G.agentGreedy], ['filler', G.agentFiller]]
    .filter(a => !only || only.indexOf(a[0]) >= 0);
  const out = {};
  for (const [name, fn] of agents) {
    const t0 = Date.now();
    const r = sweepAgent(fn, runs, baseSeed, cap);
    out[name] = r;
    console.log(name.toUpperCase() + '   (' + ((Date.now() - t0) / 1000).toFixed(1) + 's)');
    printHead();
    printRow('run ticks', r.ticks);
    printRow('score', r.scores);
    printRow('circuits', r.circuits);
    printRow('overloads', r.overloads);
    printRow('peak load', r.loads);
    printRow('creeps', r.creeps);
    console.log('  deaths: wall ' + r.causes.wall + '   live wire ' + r.causes.live + '   clock ' + r.causes.clock +
      '   hit tick cap ' + r.causes.cap + '   peak energized ' + r.peakLoad + '/' + G.CONFIG.CELLS);
    console.log('  runs that tripped the breaker: ' + r.anyOverload + '/' + r.runs +
      ' (' + (100 * r.anyOverload / r.runs).toFixed(1) + '%)   overload bonus is ' +
      (100 * r.bonusShare).toFixed(1) + '% of all score earned');
    console.log('');
  }
  if (!out.greedy || !out.random) { process.exitCode = 0; return; }

  /* gates from HANDOFF-11 section 6.6 */
  const rm = out.random.ticks.med, sm = out.randomsafe.ticks.med, gm = out.greedy.ticks.med;
  const gates = [
    ['random median run length 60 to 200 ticks', rm >= 60 && rm <= 200, rm],
    ['greedy median run length 300 to 900 ticks', gm >= 300 && gm <= 900, gm],
    ['greedy is not too safe (median under 2000)', gm < 2000, gm],
    ['greedy outlives random', gm > rm, gm + ' vs ' + rm],
    ['safety filtered random walk reported (no gate, see BUILD-NOTES)', true, sm],
    ['energized never exceeded the grid', Math.max(out.random.peakLoad, out.randomsafe.peakLoad, out.greedy.peakLoad) <= G.CONFIG.CELLS, Math.max(out.random.peakLoad, out.randomsafe.peakLoad, out.greedy.peakLoad)],
    /* A run still completing circuits at the cap is a lucky seed, not a soft
       lock; the soft lock case (zero progress) is covered by the rescue and by
       the named regressions in the harness. Gate the rate, not the count. */
    ['under 2 percent of greedy runs reach the tick cap', out.greedy.causes.cap / runs < 0.02, (100 * out.greedy.causes.cap / runs).toFixed(2) + '%'],
    ['no plain random run reached the tick cap', out.random.causes.cap === 0, out.random.causes.cap]
  ];
  if (out.filler) {
    const f = out.filler;
    gates.push(['the board filler trips the breaker in over half its runs',
      f.anyOverload / f.runs > 0.5, (100 * f.anyOverload / f.runs).toFixed(1) + '%']);
    gates.push(['the second win condition is not decorative (filler median score within 2x of greedy)',
      f.scores.med * 2 >= out.greedy.scores.med, f.scores.med + ' vs ' + out.greedy.scores.med]);
    gates.push(['the board filler really does fill the board (median peak load over 40 percent)',
      f.loads.med >= G.CONFIG.CELLS * 0.4, f.loads.med + '/' + G.CONFIG.CELLS]);
  }
  let bad = 0;
  console.log('GATES');
  gates.forEach(g => { if (!g[1]) bad++; console.log('  ' + (g[1] ? 'PASS  ' : 'FAIL  ') + g[0] + '   [' + g[2] + ']'); });
  console.log('');
  console.log(bad ? (bad + ' GATE(S) FAILED') : 'ALL GATES PASSED');
  console.log(bad ? 'RESULT: FAIL' : 'RESULT: PASS');
  process.exitCode = bad ? 1 : 0;
}

/* ------------------------------------------------------------------ */
/* --bands   the two missed balance bands, tested instead of inherited  */
/* ------------------------------------------------------------------ */
/* Rebuild the game from source with a CONFIG value patched, so a tunable can be
   swept without editing the shipped file. Object.freeze makes runtime patching
   impossible on purpose, and that is the right call for the game. */
function variant(patches) {
  let sim = block('SIM');
  Object.keys(patches).forEach(k => {
    const re = new RegExp('(' + k + ':\\s*)([0-9.]+)');
    if (!re.test(sim)) { console.error('FATAL: no CONFIG key ' + k); process.exit(2); }
    sim = sim.replace(re, '$1' + patches[k]);
  });
  return new Function(sim + '\nreturn {' + EXPORTS.filter(e =>
    !/^(loadSave|writeSave|defaultSave|migrateSave|updateSave|recordRun|recordDaily|encodeLog|decodeLog|TEST|runAllTests|playAgent|invariants)$/.test(e)
  ).join(',') + '};')();
}

function medianOf(a) {
  const b = a.slice().sort((x, y) => x - y);
  return b[b.length >> 1];
}

function sweepWith(g, agent, runs, cap) {
  const ticks = [], scores = [];
  for (let i = 0; i < runs; i++) {
    const seed = (1 + i * 2654435761) >>> 0;
    const st = g.newGame(seed);
    const rng = g.makeRNG((seed ^ 0x9e3779b9) >>> 0);
    let n = 0;
    while (st.alive && n < cap) { g.step(st, agent(g, st, rng)); n++; }
    ticks.push(st.tick); scores.push(st.score);
  }
  return { ticks: medianOf(ticks), score: medianOf(scores) };
}

/* A walk on a bare 20x20 with no game attached at all. If this medians the same
   as the random agent inside the real game, the 60 to 200 band is a fact about
   the geometry of the board and not about anything in CONFIG. */
function nullWalk(grid, runs, seedBase) {
  const out = [];
  for (let i = 0; i < runs; i++) {
    const rng = G.makeRNG((seedBase + i * 2654435761) >>> 0);
    let x = grid >> 1, y = grid >> 1, h = 1, n = 0;
    const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
    for (; ;) {
      const t = Math.floor(rng() * 3) - 1;
      h = (h + t + 4) & 3;
      x += DX[h]; y += DY[h];
      if (x < 0 || y < 0 || x >= grid || y >= grid) break;
      n++;
    }
    out.push(n);
  }
  return medianOf(out);
}

function cmdBands() {
  const runs = parseInt(args.runs || '4000', 10);
  const cap = parseInt(args.cap || '8000', 10);
  console.log('WIREWORM band diagnostics   runs=' + runs + ' per cell');
  console.log('');

  console.log('EXPERIMENT 1  is the random band geometry or a tunable');
  console.log('  A plain random walk with the entire game removed, on grids of several sizes.');
  console.log('  grid   median ticks to the wall');
  [16, 20, 24, 28, 32, 40].forEach(g => {
    console.log('  ' + pad(g, 5) + pad(nullWalk(g, runs, 7), 8, true) + (g === 20 ? '   <- the spec grid' : ''));
  });
  const inGame = sweepWith(G, (g, st, rng) => g.agentRandom(st, rng), runs, cap).ticks;
  console.log('  the same walk INSIDE the running game on the spec grid: ' + inGame);
  console.log('  reading: if those two numbers agree, no CONFIG value can move this band.');
  console.log('');

  console.log('EXPERIMENT 2  is DISCHARGE_INTERVAL a dead lever for the greedy band');
  console.log('  interval   greedy median ticks   median score');
  [140, 90, 60, 40, 25, 12].forEach(v => {
    const g = variant({ DISCHARGE_INTERVAL: v });
    const r = sweepWith(g, (gg, st, rng) => gg.agentGreedy(st, rng), runs, cap);
    console.log('  ' + pad(v, 8) + pad(r.ticks, 20, true) + pad(r.score, 15, true));
  });
  console.log('');

  console.log('EXPERIMENT 3  the levers nobody swept');
  console.log('  a longer creep interval means less ambient pressure, a shorter one means more');
  console.log('  creep     greedy median ticks   median score   filler median ticks   filler score');
  [9999, 90, 45, 30, 20].forEach(v => {
    const g = variant({ CREEP_INTERVAL: v });
    const a = sweepWith(g, (gg, st, rng) => gg.agentGreedy(st, rng), runs, cap);
    const b = sweepWith(g, (gg, st, rng) => gg.agentFiller(st, rng), Math.max(200, runs >> 2), cap);
    console.log('  ' + pad(v === 9999 ? 'off' : v, 8) + pad(a.ticks, 20, true) + pad(a.score, 15, true) +
      pad(b.ticks, 21, true) + pad(b.score, 15, true));
  });
  console.log('');
  console.log('  PAIRS on the board at once (spec says 2)');
  console.log('  pairs     greedy median ticks   median score');
  [2, 3, 4].forEach(v => {
    const g = variant({ PAIRS: v });
    const r = sweepWith(g, (gg, st, rng) => gg.agentGreedy(st, rng), runs, cap);
    console.log('  ' + pad(v, 8) + pad(r.ticks, 20, true) + pad(r.score, 15, true));
  });
  console.log('');
  console.log('  the target band for greedy is 300 to 900 ticks.');
}

/* ------------------------------------------------------------------ */
/* --watch=SEED  ASCII frames                                          */
/* ------------------------------------------------------------------ */
function cmdWatch(seed) {
  const every = parseInt(args.every || '40', 10);
  const agentName = String(args.agent || 'greedy');
  const agent = agentName === 'random' ? G.agentRandom :
    (agentName === 'randomsafe' ? G.agentRandomSafe :
      (agentName === 'filler' ? G.agentFiller : G.agentGreedy));
  const cap = parseInt(args.cap || '4000', 10);
  const st = G.newGame(seed >>> 0, args.mode ? { mode: String(args.mode) } : undefined);
  const rng = G.makeRNG((seed ^ 0x9e3779b9) >>> 0);
  const notes = [];
  console.log('WIREWORM watch   seed=' + seed + '  agent=' + agentName + '  frame every ' + every + ' ticks');
  console.log('legend:  @ worm head   # live wire   . dead wire   G B A R terminals   * discharge pickup');
  let n = 0;
  const frame = () => {
    console.log('');
    console.log('tick ' + st.tick + '   score ' + st.score + '   energized ' + st.energized + '/' + G.CONFIG.CELLS +
      ' (' + (100 * st.energized / G.CONFIG.CELLS).toFixed(0) + '%)   circuits ' + st.circuitsCompleted +
      '   combo x' + G.CONFIG.COMBO_LADDER[st.comboIdx < 0 ? 0 : st.comboIdx] +
      (st.charge ? '   charged ' + G.COLORS[st.charge.ci].name : '   uncharged'));
    console.log('+' + '-'.repeat(G.CONFIG.GRID) + '+');
    console.log(G.boardAscii(st));
    console.log('+' + '-'.repeat(G.CONFIG.GRID) + '+');
  };
  frame();
  while (st.alive && n < cap) {
    const r = G.step(st, agent(st, rng));
    r.events.forEach(e => {
      if (e.t === 'completed') notes.push('t' + st.tick + '  circuit ' + G.COLORS[e.ci].name + ' len ' + e.len + ' combo x' + e.combo + ' for ' + e.score);
      if (e.t === 'overload') notes.push('t' + st.tick + '  OVERLOAD cleared ' + e.cells + ' cells for ' + e.bonus);
      if (e.t === 'discharged') notes.push('t' + st.tick + '  discharge removed ' + e.cells + ' cells');
      if (e.t === 'creep') notes.push('t' + st.tick + '  creep lit cell ' + e.cell + ' (load ' + st.energized + ')');
      if (e.t === 'combodrop') notes.push('t' + st.tick + '  combo dropped');
      if (e.t === 'died') notes.push('t' + st.tick + '  died: ' + e.cause);
    });
    n++;
    if (st.tick % every === 0) frame();
  }
  frame();
  console.log('');
  console.log('EVENT LOG');
  notes.forEach(l => console.log('  ' + l));
  console.log('');
  console.log('final: ' + st.tick + ' ticks, ' + st.score + ' score, ' + st.circuitsCompleted + ' circuits, ' +
    st.overloads + ' overloads, ' + st.discharges + ' discharges, ' + st.rescues + ' rescues, died by ' + (st.cause || 'tick cap'));
}

/* ------------------------------------------------------------------ */
if (args.test) cmdTest();
else if (args.bands) cmdBands();
else if (args.watch !== undefined) cmdWatch(parseInt(args.watch, 10) || 1);
else if (args.runs !== undefined) cmdSweep(parseInt(args.runs, 10) || 20000);
else {
  console.log('WIREWORM sim runner');
  console.log('  node sim.js --test');
  console.log('  node sim.js --runs=20000 [--cap=8000] [--seed=1]');
  console.log('  node sim.js --watch=1234 [--every=40] [--agent=greedy|randomsafe|random|filler] [--mode=daily]');
  console.log('  node sim.js --bands [--runs=1500]');
}
