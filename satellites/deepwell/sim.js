#!/usr/bin/env node
/* DEEPWELL headless runner. Zero dependencies.
   Reads the SIM and TEST layers straight out of index.html via the marker
   comments so there is exactly ONE implementation of the rules.

     node sim.js --test              full assertion harness, exits nonzero on a failure
     node sim.js --runs=20000        three policy balance sweep plus the economy sweep
     node sim.js --watch=1234        ascii frame dump of one run so a human can see it
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

var EXPORTS = ['CONFIG', 'makeRNG', 'seedFromString', 'mixSeed', 'dailySeedFor', 'ORES', 'ORE_BY_KEY',
  'STRATA', 'bandAt', 'hazardRateAt', 'SHRINES', 'SHRINE_BY_ID', 'HAZARDS',
  'genColumn', 'newColumn', 'ensureNodes', 'genNode',
  'newRun', 'cloneState', 'ascentCost', 'ascentCostAt', 'descendCost', 'nextNode', 'currentNode',
  'nodeType', 'tickCost', 'veinTicks', 'veinHaul', 'canMine', 'mineBlockedReason', 'actions', 'step',
  'runOver', 'visibleNodes', 'currentReveal', 'sessionSeconds', 'capsFor', 'emptyUpg',
  'cargoValue', 'cargoWeight', 'upgradeCost', 'fullClearCost', 'shopBuy', 'defaultSave', 'migrate',
  'loadSave', 'commitSave', 'memStorage', 'POLICIES', 'playRun', 'airCum', 'lampCum',
  'shrineAcceptable', 'spillSet', 'shrineText', 'TEST'];

var factory = new Function(SIM_SRC + '\n' + TEST_SRC + '\nreturn {' +
  EXPORTS.map(function (n) { return n + ':typeof ' + n + '!=="undefined"?' + n + ':undefined'; }).join(',') + '};');
var S = factory();

/* ------------------------------------------------------------------ tests */
function runTests() {
  var rep = S.TEST.run();
  var i;
  for (i = 0; i < rep.failures.length; i++) {
    console.log('FAIL  ' + rep.failures[i].name + (rep.failures[i].detail ? '   [' + rep.failures[i].detail + ']' : ''));
  }
  console.log('');
  console.log('PASSED ' + rep.passed + ' / FAILED ' + rep.failed + '   (total ' + rep.total + ')');
  if (rep.total < 80) {
    console.log('ASSERTION FLOOR MISSED: ' + rep.total + ' assertions, the floor is 80.');
    process.exit(3);
  }
  process.exit(rep.failed ? 1 : 0);
}

/* ------------------------------------------------------------------ sweep */
function pct(a, b) { return b ? (100 * a / b) : 0; }
function percentile(arr, p) {
  if (!arr.length) return 0;
  var a = arr.slice().sort(function (x, y) { return x - y; });
  var i = Math.min(a.length - 1, Math.max(0, Math.round((p / 100) * (a.length - 1))));
  return a[i];
}
function pad(s, n, right) {
  s = String(s);
  while (s.length < n) s = right ? s + ' ' : ' ' + s;
  return s;
}
var MID = { tank: 2, lamp: 2, pack: 2, brace: 1, drill: 1, assay: 1 };
var FULL = { tank: 5, lamp: 5, pack: 5, brace: 3, drill: 5, assay: 5 };

function sweep(runs, seed0) {
  var policies = ['greedy', 'cautious', 'optimal'];
  var rows = {}, i, p;
  for (p = 0; p < policies.length; p++) {
    var name = policies[p], lost = 0, collapsed = 0, banks = [], depths = [], secs = [], reach200 = 0;
    for (i = 0; i < runs; i++) {
      var st = S.playRun(seed0 + i, MID, name);
      if (st.over.reason !== 'surfaced') lost++;
      if (st.over.reason === 'collapse') collapsed++;
      banks.push(st.over.banked);
      depths.push(st.maxDepth);
      secs.push(S.sessionSeconds(st));
      if (st.maxDepth >= 200) reach200++;
    }
    rows[name] = {
      lostPct: pct(lost, runs), collapsePct: pct(collapsed, runs),
      p10: percentile(banks, 10), p50: percentile(banks, 50), p90: percentile(banks, 90),
      mean: banks.reduce(function (a, b) { return a + b; }, 0) / runs,
      depth50: percentile(depths, 50), depth90: percentile(depths, 90),
      sec50: percentile(secs, 50), reach200: pct(reach200, runs), banks: banks
    };
  }
  /* does cautious ever beat optimal on the same shaft */
  var wins = 0;
  for (i = 0; i < runs; i++) if (rows.cautious.banks[i] > rows.optimal.banks[i]) wins++;

  /* depth 200 reach, measured with a dedicated depth run policy: no mining,
     dive until the air is gone. This is the depth record playstyle and the
     only honest way to ask whether the gear can get you there. */
  var diveN = Math.min(runs, 20000), fullReach = 0, bareReach = 0;
  for (i = 0; i < diveN; i++) {
    if (S.playRun(seed0 + i, FULL, 'diver').maxDepth >= 200) fullReach++;
    if (S.playRun(seed0 + i, S.emptyUpg(), 'diver').maxDepth >= 200) bareReach++;
  }

  var out = [];
  out.push('DEEPWELL BALANCE SWEEP   runs=' + runs + ' per policy   seed0=' + seed0);
  out.push('loadout for the three policies: ' + JSON.stringify(MID) + ' (a mid game digger)');
  out.push('time model: ' + S.CONFIG.SEC_PER_DECISION + 's per decision plus ' +
           S.CONFIG.SEC_PER_DEPTH_TRAVELLED + 's per meter travelled, stated so it is arguable');
  out.push('');
  out.push(pad('POLICY', 10, true) + pad('LOSTCARGO', 11) + pad('COLLAPSE', 10) + pad('BANK p10', 10) +
           pad('p50', 8) + pad('p90', 8) + pad('MEAN', 8) + pad('DEPTH p50', 11) + pad('p90', 7) + pad('MIN p50', 9) + pad('200m', 7));
  out.push(new Array(100).join('-'));
  for (p = 0; p < policies.length; p++) {
    var r = rows[policies[p]];
    out.push(pad(policies[p], 10, true) + pad(r.lostPct.toFixed(1) + '%', 11) + pad(r.collapsePct.toFixed(1) + '%', 10) +
      pad(Math.round(r.p10), 10) + pad(Math.round(r.p50), 8) + pad(Math.round(r.p90), 8) + pad(r.mean.toFixed(0), 8) +
      pad(r.depth50, 11) + pad(r.depth90, 7) + pad((r.sec50 / 60).toFixed(1), 9) + pad(r.reach200.toFixed(1) + '%', 7));
  }
  out.push('');
  out.push('cautious banks ' + (100 * rows.cautious.mean / rows.optimal.mean).toFixed(1) + '% of optimal   (bound 35 to 50)');
  out.push('cautious beats optimal on ' + pct(wins, runs).toFixed(1) + '% of identical shafts   (bound: above zero)');
  out.push('greedy loses cargo ' + rows.greedy.lostPct.toFixed(1) + '%   (bound 55 to 70)');
  out.push('cautious loses cargo ' + rows.cautious.lostPct.toFixed(1) + '%   (bound under 8)');
  out.push('depth 200 reached by a full kit on a depth run: ' + pct(fullReach, diveN).toFixed(1) + '%   (bound over 60)');
  out.push('depth 200 reached with no upgrades on a depth run: ' + pct(bareReach, diveN).toFixed(1) + '%   (bound under 3)');
  out.push('median session, optimal: ' + (rows.optimal.sec50 / 60).toFixed(1) + ' minutes   (bound 4 to 8)');

  /* economy: how many runs does a median player need to clear the shop */
  var econ = economy(seed0, 400);
  out.push('');
  out.push('ECONOMY   full clear costs ' + S.fullClearCost() + ' cash');
  out.push('runs to full clear, cautious player: ' + econ.cautious + '   (target about 25)');
  out.push('runs to full clear, optimal player: ' + econ.optimal);
  return { text: out.join('\n'), rows: rows, fullReach: pct(fullReach, diveN), bareReach: pct(bareReach, diveN), econ: econ, cWins: pct(wins, runs) };
}

function economy(seed0, cap) {
  var res = {};
  ['cautious', 'optimal'].forEach(function (pol) {
    var save = S.defaultSave(), runs = 0, i;
    var target = S.fullClearCost();
    var spent = 0;
    while (runs < cap) {
      var st = S.playRun(seed0 + runs * 31 + 5, save.upg, pol);
      save.cash += st.over.banked;
      runs++;
      /* buy the cheapest affordable upgrade, repeatedly */
      var bought = true;
      while (bought) {
        bought = false;
        var best = null, bestCost = Infinity, k;
        for (k = 0; k < S.CONFIG.SHOP_ORDER.length; k++) {
          var t = S.CONFIG.SHOP_ORDER[k];
          var c = S.upgradeCost(t, save.upg[t] || 0);
          if (isFinite(c) && c <= save.cash && c < bestCost) { bestCost = c; best = t; }
        }
        if (best) { S.shopBuy(save, best); spent += bestCost; bought = true; }
      }
      if (spent >= target) break;
    }
    res[pol] = runs;
  });
  return res;
}

/* ------------------------------------------------------------------ watch */
function watch(seed, polName) {
  var pol = S.POLICIES[polName || 'optimal'];
  var st = S.newRun(S.makeRNG(seed), MID, null);
  var frames = [], guard = 400;
  function bar(v, max, w) {
    var n = Math.max(0, Math.min(w, Math.round(w * v / max))), s = '', i;
    for (i = 0; i < w; i++) s += i < n ? '#' : '.';
    return s;
  }
  function frame(label) {
    var c = S.ascentCost(st), b = S.bandAt(st.depth);
    var vis = S.visibleNodes(st), i, ahead = '';
    for (i = 0; i < Math.min(4, vis.length); i++) {
      ahead += ' ' + (vis[i].level === 'hidden' ? '?' : vis[i].type.charAt(0).toUpperCase()) + vis[i].node.depth;
    }
    var lines = [];
    lines.push('+----------------------------------------------------------+');
    lines.push('| ' + pad(label, 20, true) + pad('DEPTH ' + st.depth + 'm', 18) + pad(b.name, 18) + ' |');
    lines.push('| AIR  ' + bar(st.air, st.caps.air, 24) + ' ' + pad(Math.round(st.air), 4) + '/' + pad(st.caps.air, 3, true) + '        |');
    lines.push('| LAMP ' + bar(st.lamp, st.caps.lamp, 24) + ' ' + pad(Math.round(st.lamp), 4) + '/' + pad(st.caps.lamp, 3, true) + '        |');
    lines.push('| PACK ' + bar(st.weight, st.caps.pack, 24) + ' ' + pad(Math.round(st.weight), 4) + '/' + pad(st.caps.pack, 3, true) + '        |');
    lines.push('| OUT  ' + pad(Math.ceil(c.air) + ' air of ' + Math.round(st.air) + ' left', 30, true) +
               'braces ' + st.integrity + '        |');
    lines.push('| BAG  ' + pad(st.cargo.length + ' ore worth ' + S.cargoValue(st.cargo) + ', cash ' + st.cash, 50, true) + ' |');
    lines.push('| NEXT ' + pad(ahead, 50, true) + ' |');
    lines.push('+----------------------------------------------------------+');
    return lines.join('\n');
  }
  frames.push(frame('START'));
  var n = 0;
  while (!st.over && guard-- > 0) {
    var a = pol(st);
    var before = st.steps;
    S.step(st, a);
    if (st.steps === before) S.step(st, 'ascend');
    n++;
    if (n % 3 === 0 || st.over) frames.push(frame(a.toUpperCase()));
  }
  console.log('DEEPWELL watch   seed ' + seed + '   policy ' + (polName || 'optimal'));
  console.log(frames.join('\n'));
  console.log('');
  console.log('ENDED: ' + st.over.reason + '   deepest ' + st.maxDepth + 'm   banked ' + st.over.banked +
              '   lost ' + st.over.lostValue + '   decisions ' + st.steps +
              '   session ' + (S.sessionSeconds(st) / 60).toFixed(1) + ' minutes');
  if (st.over.lostCargo.length) {
    var man = {}, i;
    for (i = 0; i < st.over.lostCargo.length; i++) man[st.over.lostCargo[i].name] = (man[st.over.lostCargo[i].name] || 0) + 1;
    console.log('LOST MANIFEST: ' + Object.keys(man).map(function (k) { return man[k] + ' ' + k; }).join(', '));
  }
  if (st.log.length) console.log('LOG: ' + st.log.map(function (l) { return l.s; }).join(' | '));
}

/* ------------------------------------------------------------------- main */
var args = process.argv.slice(2);
var opt = {};
args.forEach(function (a) {
  var m = /^--([^=]+)(?:=(.*))?$/.exec(a);
  if (m) opt[m[1]] = m[2] === undefined ? true : m[2];
});
if (opt.test) runTests();
else if (opt.watch) watch(parseInt(opt.watch, 10) || 1, opt.policy);
else if (opt.runs) console.log(sweep(parseInt(opt.runs, 10) || 1000, parseInt(opt.seed, 10) || 1).text);
else {
  console.log('usage: node sim.js --test | --runs=N [--seed=S] | --watch=SEED [--policy=greedy]');
  process.exit(2);
}
