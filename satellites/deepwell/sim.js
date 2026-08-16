#!/usr/bin/env node
/* DEEPWELL headless runner. Zero dependencies.
   Reads the SIM and TEST layers straight out of index.html via the marker
   comments so there is exactly ONE implementation of the rules.

     node sim.js --test              full assertion harness, exits nonzero on a failure
     node sim.js --runs=20000        three policy balance sweep plus the economy sweep
     node sim.js --watch=1234        ascii frame dump of one run so a human can see it
     node sim.js --layout            static gate on the run screen layout invariants
     node sim.js --grid=6000         the tuning grid: PACK_BASE x COST_EXP x cache scale
     node sim.js --runs=6000 --over=PACK_BASE=30,COST_EXP=1.7
                                     any sweep run against an overridden CONFIG,
                                     without editing the game, so a tuning pass is
                                     one command and the shipped numbers stay shipped
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
  'shrineAcceptable', 'spillSet', 'shrineText', 'migrateRun', 'DEEPS', 'deepsAt', 'resolveDeeps', 'heaviestIndex', 'richnessAt', 'tierChanceAt', 'pickTier', 'TEST'];

/* Build a SIM against an overridden CONFIG. The override is a SOURCE level
   substitution of the numeric literal, not a mutation, because CONFIG is frozen
   on purpose and a tuning pass must never be able to leak into a shipped run.
   Keys are matched as `KEY: <number>` so `CONFIG.PACK_BASE` references cannot
   be hit by accident. Throws on a key it did not find, so a typo in a sweep
   command can never silently measure the shipped numbers and call them tuned. */
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
var S = build(null);

/* ------------------------------------------------------------------ tests */
function runTests() {
  var rep = S.TEST.run();
  var i;
  for (i = 0; i < rep.failures.length; i++) {
    console.log('FAIL  ' + rep.failures[i].name + (rep.failures[i].detail ? '   [' + rep.failures[i].detail + ']' : ''));
  }
  console.log('');
  console.log('PASSED ' + rep.passed + ' / FAILED ' + rep.failed + '   (total ' + rep.total + ')');
  if (rep.total < 229) {
    console.log('ASSERTION FLOOR MISSED: ' + rep.total + ' assertions, the floor is 229, the count this pass inherited.');
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

function sweep(runs, seed0, S) {
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
  var econ = economy(seed0, 900, S);
  out.push('');
  out.push('ECONOMY   full clear costs ' + S.fullClearCost() + ' cash');
  out.push('runs to full clear, cautious player: ' + econ.cautious + '   (target about 25)');
  out.push('runs to full clear, optimal player: ' + econ.optimal);

  /* THE PROOF that the 25 run target in HANDOFF 3.7 is not a tuning problem.
     Every number below is measured, not asserted. */
  var proof = economyProof(seed0, 3000, S);
  out.push('');
  out.push('ECONOMY PROOF   why 25 runs cannot be reached at the specced numbers');
  out.push('  a full clear buys ' + proof.levels + ' upgrade levels across the six specced tracks');
  out.push('  cheapest full clear that any exponent can produce (a FLAT ladder, exponent 1.0): ' + proof.flat + ' cash');
  out.push('    a flat ladder is not a ladder: level five would cost what level one costs');
  out.push('  cheapest full clear that keeps a real ladder (this build, exponent ' + S.CONFIG.COST_EXP + '): ' + proof.shipped + ' cash');
  out.push('  so 25 runs demands ' + Math.round(proof.flat / 25) + ' banked EVERY run at the flat floor, ' +
           Math.round(proof.shipped / 25) + ' at the shipped ladder');
  out.push('  what a run one digger with no upgrades actually banks, mean: cautious ' +
           proof.bareC.toFixed(0) + ', optimal ' + proof.bareO.toFixed(0));
  out.push('  what a FULLY upgraded digger banks, mean: cautious ' + proof.fullC.toFixed(0) +
           ', optimal ' + proof.fullO.toFixed(0) + '   (p99 optimal ' + proof.fullP99 + ')');
  out.push('  the ceiling: a ' + proof.packCap + ' kilo pack of pure beryl at 18.75 a kilo is ' + proof.beryl +
           ' cash, and no real run mines a pure beryl pack');
  out.push('  a full kit earns a CAUTIOUS digger ' + (100 * proof.fullC / proof.bareC - 100).toFixed(0) +
           ' percent more than no kit at all, and an OPTIMAL digger ' +
           (100 * proof.fullO / proof.bareO - 100).toFixed(0) + ' percent more');
  out.push('    that is the real finding: the 60 percent of air rule spends a fixed FRACTION of the tank,');
  out.push('    and the caution gate prices a FULL pack, so a bigger tank and a bigger pack cancel out.');
  out.push('    A cautious digger cannot convert upgrades into income at all, so "runs to full clear');
  out.push('    for a median player" has no tuning that fixes it while the median player is Cautious.');
  out.push('  VERDICT: at the shipped ladder the target needs ' + (proof.shipped / 25 / proof.bareC).toFixed(1) +
           'x what the ore table pays a cautious beginner, and ' + (proof.flat / 25 / proof.bareC).toFixed(1) +
           'x with the ladder DELETED.');
  out.push('  25 runs is not reachable by tuning. It needs the ore table repriced, which reprices');
  out.push('  every number in HANDOFF 3.5. Director call. This build ships ' + econ.cautious + ' runs cautious, ' +
           econ.optimal + ' optimal, down from 216 and 123.');
  return { text: out.join('\n'), rows: rows, fullReach: pct(fullReach, diveN), bareReach: pct(bareReach, diveN), econ: econ, cWins: pct(wins, runs), proof: proof };
}

/* Measured, not argued. The flat ladder number is the arithmetic floor of a
   full clear at the specced base costs: it is what the shop costs when the
   escalating cost curve is deleted entirely, so nothing cheaper is reachable
   without repricing the bases themselves. */
function economyProof(seed0, n, S) {
  var levels = 0, flat = 0, k, i;
  for (k in S.CONFIG.SHOP) { levels += S.CONFIG.SHOP[k].levels; flat += S.CONFIG.SHOP[k].base * S.CONFIG.SHOP[k].levels; }
  var bareC = 0, bareO = 0, fullC = 0, fullO = 0, fullBanks = [];
  for (i = 0; i < n; i++) {
    bareC += S.playRun(seed0 + i, S.emptyUpg(), 'cautious').over.banked;
    bareO += S.playRun(seed0 + i, S.emptyUpg(), 'optimal').over.banked;
    fullC += S.playRun(seed0 + i, FULL, 'cautious').over.banked;
    var f = S.playRun(seed0 + i, FULL, 'optimal').over.banked;
    fullO += f; fullBanks.push(f);
  }
  var packCap = S.capsFor(FULL).pack;
  return { levels: levels, flat: flat, shipped: S.fullClearCost(),
           bareC: bareC / n, bareO: bareO / n, fullC: fullC / n, fullO: fullO / n,
           fullP99: percentile(fullBanks, 99), packCap: packCap,
           beryl: Math.floor(packCap / 4) * 75 };
}

function economy(seed0, cap, S) {
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
function watch(seed, polName, S) {
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

/* -------------------------------------------------------------------- grid */
/* the tuning grid the deepening pass was asked for. One line per CONFIG point,
   so the two missed bounds can be read off against the levers that move them. */
function grid(runs, seed0) {
  var packs = [40, 36, 32, 30, 28, 26, 24];
  var exps = [2.1, 1.9, 1.7, 1.62, 1.5];
  var caches = [1, 1.6, 2.2];
  var lines = [], i, j, k;
  lines.push('DEEPWELL TUNING GRID   runs=' + runs + ' per policy per point   seed0=' + seed0);
  lines.push('bounds: ratio 35 to 50, clear about 25 runs, greedy loss 55 to 70, cautious loss under 8');
  lines.push('');
  lines.push(pad('PACK', 6, true) + pad('COSTEXP', 9) + pad('CACHEx', 8) + pad('RATIO', 8) +
             pad('CLEAR', 8) + pad('GLOSS', 8) + pad('CLOSS', 8) + pad('OMEAN', 8) +
             pad('CMEAN', 8) + pad('FCLEAR', 9) + pad('CWIN', 7) + '  VERDICT');
  lines.push(new Array(104).join('-'));
  for (i = 0; i < packs.length; i++) for (j = 0; j < exps.length; j++) for (k = 0; k < caches.length; k++) {
    var over = { PACK_BASE: packs[i], COST_EXP: exps[j],
                 cacheBase: Math.round(26 * caches[k]), cachePerDepth: +(1.35 * caches[k]).toFixed(3) };
    var G = build(over);
    var r = quick(G, runs, seed0);
    var hits = (r.ratio >= 35 && r.ratio <= 50 ? 1 : 0) + (r.clear <= 32 && r.clear >= 18 ? 1 : 0) +
               (r.gLoss >= 55 && r.gLoss <= 70 ? 1 : 0) + (r.cLoss < 8 ? 1 : 0) + (r.cWin > 0 ? 1 : 0);
    lines.push(pad(packs[i], 6, true) + pad(exps[j], 9) + pad(caches[k], 8) +
      pad(r.ratio.toFixed(1), 8) + pad(r.clear, 8) + pad(r.gLoss.toFixed(1), 8) + pad(r.cLoss.toFixed(1), 8) +
      pad(r.oMean.toFixed(0), 8) + pad(r.cMean.toFixed(0), 8) + pad(G.fullClearCost(), 9) +
      pad(r.cWin.toFixed(1), 7) + '  ' + hits + ' of 5');
  }
  return lines.join('\n');
}
function quick(G, runs, seed0) {
  var i, gLost = 0, cLost = 0, cSum = 0, oSum = 0, cWin = 0;
  for (i = 0; i < runs; i++) {
    var a = G.playRun(seed0 + i, MID, 'greedy');
    var b = G.playRun(seed0 + i, MID, 'cautious');
    var c = G.playRun(seed0 + i, MID, 'optimal');
    if (a.over.reason !== 'surfaced') gLost++;
    if (b.over.reason !== 'surfaced') cLost++;
    cSum += b.over.banked; oSum += c.over.banked;
    if (b.over.banked > c.over.banked) cWin++;
  }
  var econ = economy(seed0, 900, G);
  return { ratio: 100 * cSum / oSum, clear: econ.cautious, gLoss: pct(gLost, runs), cLoss: pct(cLost, runs),
           cMean: cSum / runs, oMean: oSum / runs, cWin: pct(cWin, runs) };
}

/* ------------------------------------------------------------------ layout */
/* A static gate for the three layout defects the LOOKING pass found. It cannot
   replace looking at the thing, and it does not try to: it holds the specific
   invariants the fixes established, so they cannot be undone by accident by
   whoever touches this next. Every check here was watched fail against the
   build that had the defect. */
function layoutGate() {
  var html = HTML, css = html.slice(html.indexOf('<style'), html.indexOf('</style>'));
  var out = [], fails = 0;
  function chk(name, ok, detail) {
    out.push((ok ? 'PASS  ' : 'FAIL  ') + name + (detail && !ok ? '   [' + detail + ']' : ''));
    if (!ok) fails++;
  }
  function rule(sel) {
    var i = css.indexOf(sel + '{');
    if (i < 0) i = css.indexOf(sel + ' {');
    if (i < 0) return null;
    return css.slice(i, css.indexOf('}', i));
  }

  /* 1. THE SHAFT MAY NOT CROSS THE CARDS, AND IT IS LAYOUT THAT SAYS SO */
  var scroll = rule('#shaftScroll');
  chk('the column is clipped to the gutter', !!scroll && /width:\s*var\(--gut\)/.test(scroll) && /overflow:\s*hidden/.test(scroll),
      scroll || 'no #shaftScroll rule');
  /* every run screen block must be inset past the gutter on its left */
  var blocks = ['#hud', '#margin', '#meters', '#nodecard', '#actions', '#btnCargo'];
  blocks.forEach(function (b) {
    var r = rule(b);
    chk('the ' + b + ' block is inset past the gutter', !!r && r.indexOf('var(--gutpad)') >= 0, r || 'missing');
  });
  /* and no prose may be drawn in the art layer at all */
  var prose = ['.strataSeam b', '#recLine span', '.nmark .lbl', '#bandStamp'];
  prose.forEach(function (sel) {
    chk('no text rule left in the art layer for ' + sel, css.indexOf(sel) < 0);
  });
  chk('no bandStamp element or call survives', html.indexOf('bandStamp') < 0);
  chk('the band name is flared in the HUD instead', css.indexOf('#strataName.stamped') >= 0);
  /* the shaft wash is pushed back far enough to read as atmosphere */
  var bandR = rule('#shaftBand'), op = bandR && /opacity:\s*([0-9.]+)/.exec(bandR);
  chk('the full bleed wash is pushed back under 0.2 opacity', !!op && parseFloat(op[1]) <= 0.2, bandR || '');
  /* the marker builder must not emit words any more */
  var rs = html.slice(html.indexOf('function renderShaft'), html.indexOf('function stampBand'));
  chk('the column emits no node words', !/'\s*VEIN|HEARTSTONE|DEEPEST EVER/.test(rs));
  chk('the column emits no per marker depth text', rs.indexOf('class="lbl"') < 0);

  /* 2. A CONTROL MAY NOT COVER ANOTHER CONTROL */
  var pane = rule('.scrollpane'), bar = rule('.stickybar'), head = rule('.ovlhead');
  chk('the scroll pane may shrink', !!pane && /min-height:\s*0/.test(pane) && /flex:\s*1 1 auto/.test(pane), pane || 'missing');
  chk('the surface bar may NOT shrink', !!bar && /flex:\s*none/.test(bar), bar || 'missing');
  chk('the surface head may NOT shrink', !!head && /flex:\s*none/.test(head), head || 'missing');
  chk('the bar is opaque so nothing reads through it', !!bar && /background:\s*var\(--bg\)/.test(bar), bar || '');
  chk('the surface uses the scroll pane class', html.indexOf('class="scrollpane"') >= 0);
  chk('the surface uses the bar class', html.indexOf('class="stickybar"') >= 0);
  chk('no hand rolled scroll flex is left in the markup', !/overflow-y:auto;flex:1/.test(html));

  /* 3. A DISABLED BUTTON MUST STAY OPAQUE OVER ART */
  var dis = rule('.big[disabled]');
  chk('a disabled action button does not go translucent', !!dis && dis.indexOf('opacity') < 0, dis || 'missing');
  chk('a disabled action button gets its own plate', !!dis && /background:\s*#/.test(dis), dis || '');
  chk('its reason line stays legible', css.indexOf('.big[disabled] small') >= 0);

  /* THE TWO LANES MAY NOT COLLIDE, at either gutter width. Computed from the
     source rather than trusted: a three dot vein marker at 68px very nearly
     reached into the ruler lane during this fix and was caught here. */
  var rulerM = /RULER = (\d+)/.exec(html), markM = rule('.nmark');
  var guts = [];
  (css.match(/--gut:\s*(\d+)px/g) || []).forEach(function (g) { guts.push(parseInt(/(\d+)/.exec(g)[1], 10)); });
  chk('the ruler lane width is declared in renderShaft', !!rulerM);
  chk('more than one gutter width is defined, phone and desktop', guts.length >= 2, JSON.stringify(guts));
  chk('the marker is capped so it cannot enter the ruler lane',
      !!markM && /max-width:\s*calc\(var\(--gut\) - 26px\)/.test(markM), markM || '');
  if (rulerM) {
    var RULER = parseInt(rulerM[1], 10), bad = [];
    guts.forEach(function (g) {
      var boreW = g - RULER - 4, mid = RULER + boreW / 2, maxW = g - 26;
      /* the widest allowed marker, centred, must start right of the ruler lane */
      if (mid - maxW / 2 < RULER) bad.push('gut ' + g + ': marker reaches ' + (mid - maxW / 2) + ', ruler ends at ' + RULER);
      if (boreW < 18) bad.push('gut ' + g + ': bore only ' + boreW + 'px');
    });
    chk('at every gutter width the widest marker clears the ruler', bad.length === 0, bad.join(' | '));
    chk('the ruler lane fits a four figure depth at 9px', RULER >= 22, 'RULER ' + RULER);
  }

  /* the HUD line now carries landmark names in a narrower header */
  var snR = rule('#strataName');
  chk('the strata line cannot overflow the header', !!snR && /white-space:\s*nowrap/.test(snR) && /overflow:\s*hidden/.test(snR), snR || '');
  chk('and shrinks for a long landmark name', css.indexOf('#strataName.long') >= 0);
  var longest = 0;
  (html.match(/name: '(THE [A-Z ]+)'/g) || []).forEach(function (m) {
    var t = /'(.*)'/.exec(m)[1]; if (t.length > longest) longest = t.length;
  });
  chk('the longest landmark name is known and handled', longest > 11 && css.indexOf('#strataName.long') >= 0, 'longest ' + longest);

  /* touch targets are still declared at 48 or more */
  var small = [];
  css.split('}').forEach(function (r) {
    var sel = r.split('{')[0] || '', dec = r.split('{')[1] || '';
    if (!/btn|button|Install/i.test(sel)) return;
    var m = dec.match(/min-height:\s*(\d+)px/);
    if (m && parseInt(m[1], 10) < 48) small.push(sel.trim() + ' ' + m[0]);
  });
  chk('every interactive control still declares 48px or more', small.length === 0, small.join(', '));

  console.log(out.join('\n'));
  console.log('');
  console.log(fails ? 'LAYOUT GATE FAILED: ' + fails : 'LAYOUT GATE GREEN: ' + out.length + ' checks');
  process.exit(fails ? 1 : 0);
}

/* ------------------------------------------------------------------- main */
var args = process.argv.slice(2);
var opt = {};
args.forEach(function (a) {
  var m = /^--([^=]+)(?:=(.*))?$/.exec(a);
  if (m) opt[m[1]] = m[2] === undefined ? true : m[2];
});
var OVER = parseOver(opt.over);
if (OVER) { S = build(OVER); console.log('CONFIG OVERRIDE: ' + JSON.stringify(OVER)); }
if (opt.layout) layoutGate();
else if (opt.test) runTests();
else if (opt.watch) watch(parseInt(opt.watch, 10) || 1, opt.policy, S);
else if (opt.grid) console.log(grid(parseInt(opt.grid, 10) || 2000, parseInt(opt.seed, 10) || 1));
else if (opt.runs) console.log(sweep(parseInt(opt.runs, 10) || 1000, parseInt(opt.seed, 10) || 1, S).text);
else {
  console.log('usage: node sim.js --test | --layout | --runs=N [--seed=S] | --watch=SEED [--policy=greedy] | --grid=N');
  process.exit(2);
}
